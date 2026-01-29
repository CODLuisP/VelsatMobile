import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL_PUT = 'https://do.velsat.pe:2053/api/Aplicativo/UpdateTramaDevice';
const API_URL_POST = 'https://do.velsat.pe:2053/api/Aplicativo/InsertarTrama';
const GEOCODING_URL = 'http://63.251.107.133:90/nominatim/reverse.php';
const DEVICE_ID = 'M2L777';
const ACCOUNT_ID = 'M2L777';
const COD_SERVICIO = 'movilbus';

const OFFLINE_QUEUE_KEY = '@offline_tramas_queue';
const POST_INTERVAL = 30000; // 30 segundos

// 🔥 Función para obtener fecha/hora de Perú (UTC-5)
const getPeruDateTime = (): string => {
  const now = new Date();
  const peruTime = new Date(now.getTime() - (5 * 60 * 60 * 1000));
  return peruTime.toISOString();
};

interface TramaData {
  lastValidLatitude: number;
  lastValidLongitude: number;
  lastValidHeading: number;
  lastValidSpeed: number;
}

interface TramaPost {
  deviceID: string;
  fecha: string;
  codservicio: string;
  accountID: string;
  latitude: number;
  longitude: number;
  sepeedKPH: number;
  heading: number;
  address: string;
}

interface GeocodingLog {
  timestamp: string;
  url: string;
  response: string;
  address: string;
  success: boolean;
}

interface PendingLocationData {
  data: TramaData;
  onGeocodingLog?: (log: GeocodingLog) => void;
}

let totalEnvios = 0;
let enviosExitosos = 0;
let enviosFallidos = 0;
let totalPost = 0;
let postExitosos = 0;
let postFallidos = 0;

let processingQueue = false;
let pendingLocation: PendingLocationData | null = null;

let geocodingCache: Map<string, {direccion: string, timestamp: number}> = new Map();
const CACHE_DURATION = 300000;

let lastTramaData: (TramaData & {direccion: string}) | null = null;
let postIntervalId: NodeJS.Timeout | null = null;
let offlineQueue: TramaPost[] = [];
let isOnline = true;


const loadOfflineQueue = async (): Promise<void> => {
  try {
    const stored = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    if (stored) {
      offlineQueue = JSON.parse(stored);
    }
  } catch (error) {
    // Error silencioso
  }
};

const saveOfflineQueue = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(offlineQueue));
  } catch (error) {
    // Error silencioso
  }
};

const addToOfflineQueue = (trama: TramaPost): void => {
  offlineQueue.push(trama);
  saveOfflineQueue();
};

const clearOfflineQueue = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
  } catch (error) {
    // Error silencioso
  }
};


const getAddressFromCoordinates = async (
  latitude: number,
  longitude: number
): Promise<{address: string; rawResponse: string; url: string}> => {
  const url = `${GEOCODING_URL}?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`;
  
  try {
    const cacheKey = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
    
    const cached = geocodingCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      return {
        address: cached.direccion,
        rawResponse: 'Desde cache',
        url: url
      };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 8000);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'GPSTrackerApp/1.0',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const responseText = await response.text();
      
      if (!responseText || responseText.trim().length === 0) {
        const fallbackAddress = `Coordenadas ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        return {
          address: fallbackAddress,
          rawResponse: 'Respuesta vacía',
          url: url
        };
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError: any) {
        const fallbackAddress = `Coordenadas ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        return {
          address: fallbackAddress,
          rawResponse: responseText.substring(0, 200),
          url: url
        };
      }
      
      const direccion = data.display_name || '';
      
      if (direccion) {
        geocodingCache.set(cacheKey, {
          direccion,
          timestamp: Date.now()
        });
        
        if (geocodingCache.size > 100) {
          const oldestKey = Array.from(geocodingCache.entries())
            .sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0];
          geocodingCache.delete(oldestKey);
        }
        
        return {
          address: direccion,
          rawResponse: responseText.substring(0, 200) + '...',
          url: url
        };
      } else {
        if (data.address) {
          const parts = [];
          if (data.address.road) parts.push(data.address.road);
          if (data.address.city) parts.push(data.address.city);
          if (data.address.state) parts.push(data.address.state);
          if (data.address.country) parts.push(data.address.country);
          
          if (parts.length > 0) {
            const constructedAddress = parts.join(', ');
            return {
              address: constructedAddress,
              rawResponse: responseText.substring(0, 200) + '...',
              url: url
            };
          }
        }
        
        const fallbackAddress = `Coordenadas ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        return {
          address: fallbackAddress,
          rawResponse: responseText.substring(0, 200),
          url: url
        };
      }
    } else {
      const errorText = await response.text();
      const fallbackAddress = `Coordenadas ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      return {
        address: fallbackAddress,
        rawResponse: `Error HTTP ${response.status}: ${errorText.substring(0, 100)}`,
        url: url
      };
    }
  } catch (error: any) {
    let errorMsg = '';
    if (error.name === 'AbortError') {
      errorMsg = 'Timeout (8s)';
    } else {
      errorMsg = error.message;
    }
    const fallbackAddress = `Coordenadas ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    return {
      address: fallbackAddress,
      rawResponse: `Error: ${errorMsg}`,
      url: url
    };
  }
};


const sendTramaPost = async (tramaData: TramaData, direccion: string): Promise<void> => {
  const trama: TramaPost = {
    deviceID: DEVICE_ID,
    fecha: getPeruDateTime(), // 🔥 Fecha de Perú (UTC-5)
    codservicio: COD_SERVICIO,
    accountID: ACCOUNT_ID,
    latitude: tramaData.lastValidLatitude,
    longitude: tramaData.lastValidLongitude,
    sepeedKPH: tramaData.lastValidSpeed,
    heading: tramaData.lastValidHeading,
    address: direccion,
  };

  try {
    totalPost++;
    
    const response = await fetch(API_URL_POST, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify([trama]),
    });

    if (response.ok) {
      postExitosos++;
      await response.text();
      
      const wasOffline = !isOnline;
      isOnline = true;
      
      if (wasOffline && offlineQueue.length > 0) {
        await sendOfflineQueue();
      }
      
    } else {
      postFallidos++;
      await response.text().catch(() => 'Sin respuesta');
      
      isOnline = false;
      addToOfflineQueue(trama);
    }
  } catch (error: any) {
    postFallidos++;
    isOnline = false;
    addToOfflineQueue(trama);
  }
};


const sendOfflineQueue = async (): Promise<void> => {
  if (offlineQueue.length === 0) return;

  const queueToSend = [...offlineQueue];
  const queueSize = queueToSend.length;

  try {
    const response = await fetch(API_URL_POST, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(queueToSend),
    });

    if (response.ok) {
      await response.text();
      
      offlineQueue = [];
      
      postFallidos -= queueSize;
      postExitosos += queueSize;
      
      if (postFallidos < 0) postFallidos = 0;
      
      await clearOfflineQueue();
      
    } else {
      await response.text().catch(() => 'Sin respuesta');
    }
  } catch (error: any) {
    // Cola se mantiene
  }
};


const startPostInterval = (): void => {
  if (postIntervalId) {
    clearInterval(postIntervalId);
  }

  postIntervalId = setInterval(() => {
    if (lastTramaData) {
      sendTramaPost(lastTramaData, lastTramaData.direccion);
    }
  }, POST_INTERVAL);
};

const stopPostInterval = (): void => {
  if (postIntervalId) {
    clearInterval(postIntervalId);
    postIntervalId = null;
  }
};

const processLocationQueue = async () => {
  if (processingQueue || !pendingLocation) {
    return;
  }

  processingQueue = true;
  const { data: locationToProcess, onGeocodingLog } = pendingLocation;
  pendingLocation = null;

  try {
    totalEnvios++;
    
    const geocodingResult = await getAddressFromCoordinates(
      locationToProcess.lastValidLatitude,
      locationToProcess.lastValidLongitude
    );
    
    const direccion = geocodingResult.address;
    
    if (onGeocodingLog) {
      onGeocodingLog({
        timestamp: new Date().toLocaleTimeString(),
        url: geocodingResult.url,
        response: geocodingResult.rawResponse,
        address: direccion,
        success: !direccion.includes('Coordenadas')
      });
    }

    lastTramaData = {
      ...locationToProcess,
      direccion: direccion,
    };

    if (pendingLocation) {
      processingQueue = false;
      processLocationQueue();
      return;
    }

    const payload = {
      deviceID: DEVICE_ID,
      accountID: ACCOUNT_ID,
      lastValidLatitude: locationToProcess.lastValidLatitude,
      lastValidLongitude: locationToProcess.lastValidLongitude,
      lastValidHeading: locationToProcess.lastValidHeading,
      lastValidSpeed: locationToProcess.lastValidSpeed,
      lastValidDate: getPeruDateTime(), // 🔥 Fecha de Perú (UTC-5)
      direccion: direccion,
    };

    const response = await fetch(API_URL_PUT, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      enviosExitosos++;
      await response.text();
    } else {
      enviosFallidos++;
      await response.text().catch(() => 'Sin respuesta');
    }
  } catch (error: any) {
    enviosFallidos++;
  } finally {
    processingQueue = false;
    
    if (pendingLocation) {
      processLocationQueue();
    }
  }
};


export const sendLocationToApi = async (
  data: TramaData,
  onGeocodingLog?: (log: GeocodingLog) => void
): Promise<boolean> => {
  pendingLocation = { data, onGeocodingLog };
  
  if (!processingQueue) {
    processLocationQueue();
  }
  
  return true;
};

export const getApiStats = () => ({
  put: {
    total: totalEnvios,
    exitosos: enviosExitosos,
    fallidos: enviosFallidos,
    tasaExito: totalEnvios > 0 ? ((enviosExitosos / totalEnvios) * 100).toFixed(1) : '0.0'
  },
  post: {
    total: totalPost,
    exitosos: postExitosos,
    fallidos: postFallidos,
    tasaExito: totalPost > 0 ? ((postExitosos / totalPost) * 100).toFixed(1) : '0.0'
  },
  offline: {
    pendientes: offlineQueue.length,
    isOnline: isOnline
  }
});

export const resetApiStats = () => {
  totalEnvios = 0;
  enviosExitosos = 0;
  enviosFallidos = 0;
  totalPost = 0;
  postExitosos = 0;
  postFallidos = 0;
  geocodingCache.clear();
  pendingLocation = null;
  lastTramaData = null;
  clearOfflineQueue();
};

export const initializeApiService = async (): Promise<void> => {
  await loadOfflineQueue();
  startPostInterval();
};

export const stopApiService = (): void => {
  stopPostInterval();
};