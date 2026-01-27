import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL_PUT = 'https://do.velsat.pe:2053/api/Aplicativo/UpdateTramaDevice';
const API_URL_POST = 'https://do.velsat.pe:2053/api/Aplicativo/InsertarTrama';
const GEOCODING_URL = 'http://63.251.107.133:90/nominatim/reverse.php';
const DEVICE_ID = 'M2L777';
const ACCOUNT_ID = 'M2L777';
const COD_SERVICIO = 'movilbus';

const OFFLINE_QUEUE_KEY = '@offline_tramas_queue';
const POST_INTERVAL = 30000; // 30 segundos

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
      console.log(`📦 Cola offline cargada: ${offlineQueue.length} tramas pendientes`);
    }
  } catch (error) {
    console.error('❌ Error cargando cola offline:', error);
  }
};

const saveOfflineQueue = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(offlineQueue));
  } catch (error) {
    console.error('Error guardando cola offline:', error);
  }
};

const addToOfflineQueue = (trama: TramaPost): void => {
  offlineQueue.push(trama);
  console.log(`Trama agregada a cola offline (${offlineQueue.length} pendientes)`);
  saveOfflineQueue();
};

const clearOfflineQueue = async (): Promise<void> => {
  offlineQueue = [];
  try {
    await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
    console.log('Cola offline limpiada');
  } catch (error) {
    console.error('Error limpiando cola offline:', error);
  }
};


const getAddressFromCoordinates = async (
  latitude: number,
  longitude: number
): Promise<{address: string; rawResponse: string; url: string}> => {
  console.log('\n ═══ INICIO GEOCODIFICACIÓN ═══');
  console.log(`Coordenadas: ${latitude}, ${longitude}`);
  
  const url = `${GEOCODING_URL}?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`;
  
  try {
    const cacheKey = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
    
    const cached = geocodingCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      console.log('Dirección desde CACHE:', cached.direccion);
      return {
        address: cached.direccion,
        rawResponse: 'Desde cache',
        url: url
      };
    }

    console.log('URL Nominatim:', url);
    console.log('Esperando respuesta del servidor...');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log('TIMEOUT después de 8 segundos');
      controller.abort();
    }, 8000);

    const startTime = Date.now();
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'GPSTrackerApp/1.0',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const elapsed = Date.now() - startTime;

    console.log(`Respuesta recibida en ${elapsed}ms`);
    console.log(`Status: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const responseText = await response.text();
      console.log('\n ═══ RESPUESTA RAW DE NOMINATIM ═══');
      console.log(responseText);
      console.log('═══════════════════════════════════════\n');
      
      if (!responseText || responseText.trim().length === 0) {
        console.error('❌ Respuesta vacía del servidor');
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
        console.log('JSON parseado correctamente');
      } catch (parseError: any) {
        console.error('Error parseando JSON:', parseError.message);
        const fallbackAddress = `Coordenadas ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        return {
          address: fallbackAddress,
          rawResponse: responseText.substring(0, 200),
          url: url
        };
      }
      
      const direccion = data.display_name || '';
      
      console.log('\n ═══ RESULTADO GEOCODIFICACIÓN ═══');
      if (direccion) {
        console.log(`Display_name encontrado: "${direccion}"`);
        
        geocodingCache.set(cacheKey, {
          direccion,
          timestamp: Date.now()
        });
        
        console.log('Guardado en cache');
        
        if (geocodingCache.size > 100) {
          const oldestKey = Array.from(geocodingCache.entries())
            .sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0];
          geocodingCache.delete(oldestKey);
          console.log('🧹 Cache limpiado (>100 entradas)');
        }
        
        console.log('═══════════════════════════════════════\n');
        return {
          address: direccion,
          rawResponse: responseText.substring(0, 200) + '...',
          url: url
        };
      } else {
        console.warn('⚠️ display_name NO encontrado en la respuesta');
        
        if (data.address) {
          const parts = [];
          if (data.address.road) parts.push(data.address.road);
          if (data.address.city) parts.push(data.address.city);
          if (data.address.state) parts.push(data.address.state);
          if (data.address.country) parts.push(data.address.country);
          
          if (parts.length > 0) {
            const constructedAddress = parts.join(', ');
            console.log(`Dirección construida: "${constructedAddress}"`);
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
      console.error('\n ═══ ERROR HTTP ═══');
      console.error(`   Status: ${response.status}`);
      console.error(`   Respuesta: ${errorText}`);
      const fallbackAddress = `Coordenadas ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      return {
        address: fallbackAddress,
        rawResponse: `Error HTTP ${response.status}: ${errorText.substring(0, 100)}`,
        url: url
      };
    }
  } catch (error: any) {
    console.error('\n ═══ EXCEPCIÓN EN GEOCODIFICACIÓN ═══');
    let errorMsg = '';
    if (error.name === 'AbortError') {
      console.error('Timeout después de 8 segundos');
      errorMsg = 'Timeout (8s)';
    } else {
      console.error(`   Tipo: ${error.name}`);
      console.error(`   Mensaje: ${error.message}`);
      errorMsg = error.message;
    }
    console.error('═══════════════════════════════════════\n');
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
    fecha: new Date().toISOString(),
    codservicio: COD_SERVICIO,
    accountID: ACCOUNT_ID,
    latitude: tramaData.lastValidLatitude,
    longitude: tramaData.lastValidLongitude,
    sepeedKPH: tramaData.lastValidSpeed,
    heading: tramaData.lastValidHeading,
    address: direccion,
  };

  console.log('\n╔═══════════════════════════════════════════════════════╗');
  console.log('║       📮 ENVÍO POST A InsertarTrama                 ║');
  console.log('╚═══════════════════════════════════════════════════════╝');
  console.log('🌐 Endpoint:', API_URL_POST);
  console.log('📦 Trama:');
  console.log(JSON.stringify([trama], null, 2));
  console.log('───────────────────────────────────────────────────────');

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

    console.log('📥 Respuesta POST:');
    console.log(`   Status: ${response.status} ${response.statusText}`);

    if (response.ok) {
      postExitosos++;
      const responseData = await response.text();
      console.log('POST EXITOSO! Respuesta:');
      console.log(responseData);
      console.log(`\n POST Stats: ${postExitosos}/${totalPost} exitosos (${((postExitosos/totalPost)*100).toFixed(1)}%)`);
      
      const wasOffline = !isOnline;
      isOnline = true;
      
      if (wasOffline && offlineQueue.length > 0) {
        console.log(`\n CONEXIÓN RECUPERADA! Enviando ${offlineQueue.length} tramas offline...`);
        await sendOfflineQueue();
      }
      
    } else {
      postFallidos++;
      const errorText = await response.text().catch(() => 'Sin respuesta');
      console.error('ERROR POST:');
      console.error(`Status: ${response.status}`);
      console.error(`Mensaje: ${errorText}`);
      console.error(`\n POST Stats: ${postFallidos}/${totalPost} fallidos`);
      
      isOnline = false;
      addToOfflineQueue(trama);
    }
  } catch (error: any) {
    postFallidos++;
    console.error('\n ═══ ERROR EN POST ═══');
    console.error(`   Tipo: ${error.name}`);
    console.error(`   Mensaje: ${error.message}`);
    console.error(`\n POST Stats: ${postFallidos}/${totalPost} fallidos`);
    
   
    isOnline = false;
    addToOfflineQueue(trama);
  }
  
  console.log('═══════════════════════════════════════════════════════\n');
};


const sendOfflineQueue = async (): Promise<void> => {
  if (offlineQueue.length === 0) return;

  const queueToSend = [...offlineQueue]; 
  const queueSize = queueToSend.length;

  console.log('\n╔═══════════════════════════════════════════════════════╗');
  console.log(`║   📤 ENVIANDO ${queueSize} TRAMAS OFFLINE              ║`);
  console.log('╚═══════════════════════════════════════════════════════╝');

  try {
    const response = await fetch(API_URL_POST, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(queueToSend),
    });

    console.log('📥 Respuesta POST (offline queue):');
    console.log(`   Status: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const responseData = await response.text();
      console.log(`✅ ${queueSize} TRAMAS OFFLINE ENVIADAS EXITOSAMENTE!`);
      console.log(responseData);
      
    
      postFallidos -= queueSize;
      postExitosos += queueSize;  
      
      // Evitar números negativos
      if (postFallidos < 0) postFallidos = 0;
      
      console.log(`\n POST Stats Actualizados: ${postExitosos}/${totalPost} exitosos (${((postExitosos/totalPost)*100).toFixed(1)}%)`);
      
      // Limpiar cola
      await clearOfflineQueue();
      
      console.log('Cola offline completamente enviada y limpiada');
      
    } else {
      const errorText = await response.text().catch(() => 'Sin respuesta');
      console.error(' ERROR ENVIANDO COLA OFFLINE:');
      console.error(`   Status: ${response.status}`);
      console.error(`   Mensaje: ${errorText}`);
      console.log('💾 Cola offline mantenida para próximo intento');
      // NO modificar isOnline, se volverá a intentar en el siguiente timer
    }
  } catch (error: any) {
    console.error('\n ═══ ERROR ENVIANDO COLA OFFLINE ═══');
    console.error(`   Tipo: ${error.name}`);
    console.error(`   Mensaje: ${error.message}`);
    console.log('💾 Cola offline mantenida para próximo intento');
  }
  
  console.log('═══════════════════════════════════════════════════════\n');
};


const startPostInterval = (): void => {
  if (postIntervalId) {
    clearInterval(postIntervalId);
  }

  postIntervalId = setInterval(() => {
    if (lastTramaData) {
      console.log('\n ═══ TIMER 30 SEGUNDOS - ENVIANDO POST ═══');
      sendTramaPost(lastTramaData, lastTramaData.direccion);
    } else {
      console.log('\n Timer 30s: No hay datos para enviar aún');
    }
  }, POST_INTERVAL);

  console.log('Timer POST iniciado (cada 30 segundos)');
};

const stopPostInterval = (): void => {
  if (postIntervalId) {
    clearInterval(postIntervalId);
    postIntervalId = null;
    console.log('Timer POST detenido');
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
    
    console.log('\n╔═══════════════════════════════════════════════════════╗');
    console.log(`║       📤 PROCESANDO UBICACIÓN PUT #${totalEnvios.toString().padStart(3, '0')}     ║`);
    console.log('╚═══════════════════════════════════════════════════════╝');
    console.log(`📍 Latitud:  ${locationToProcess.lastValidLatitude}`);
    console.log(`📍 Longitud: ${locationToProcess.lastValidLongitude}`);
    console.log(`🧭 Heading:  ${locationToProcess.lastValidHeading.toFixed(1)}°`);
    console.log(`⚡ Speed:    ${locationToProcess.lastValidSpeed.toFixed(1)} km/h`);
    console.log('───────────────────────────────────────────────────────');
    
    console.log('\n🗺️  PASO 1: Geocodificación (Nominatim)');
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
    
    console.log('✅ PASO 1 COMPLETADO');
    console.log(`📍 Dirección final: "${direccion}"`);
    console.log('───────────────────────────────────────────────────────');


    lastTramaData = {
      ...locationToProcess,
      direccion: direccion,
    };

    if (pendingLocation) {
      console.log('⏭️  Nueva ubicación en cola, procesando la más reciente...\n');
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
      lastValidDate: new Date().toISOString(),
      direccion: direccion,
    };

    console.log('\n📤 PASO 2: Envío PUT a UpdateTramaDevice');
    console.log('═══════════════════════════════════════════════════════');
    console.log('Endpoint:', API_URL_PUT);
    console.log('Payload:');
    console.log(JSON.stringify(payload, null, 2));
    console.log('───────────────────────────────────────────────────────');

    const response = await fetch(API_URL_PUT, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log('Respuesta PUT:');
    console.log(`   Status: ${response.status} ${response.statusText}`);

    if (response.ok) {
      enviosExitosos++;
      const responseData = await response.text();
      console.log('PUT EXITOSO! Respuesta:');
      console.log(responseData);
      console.log(`\n PUT Stats: ${enviosExitosos}/${totalEnvios} exitosos (${((enviosExitosos/totalEnvios)*100).toFixed(1)}%)`);
      console.log('═══════════════════════════════════════════════════════\n');
    } else {
      enviosFallidos++;
      const errorText = await response.text().catch(() => 'Sin respuesta');
      console.error('❌ ERROR PUT:');
      console.error(`   Status: ${response.status}`);
      console.error(`   Mensaje: ${errorText}`);
      console.error(`\n PUT Stats: ${enviosFallidos}/${totalEnvios} fallidos (${((enviosFallidos/totalEnvios)*100).toFixed(1)}%)`);
      console.log('═══════════════════════════════════════════════════════\n');
    }
  } catch (error: any) {
    enviosFallidos++;
    console.error('\n ═══ ERROR EN PROCESO PUT ═══');
    console.error(`   Tipo: ${error.name}`);
    console.error(`   Mensaje: ${error.message}`);
    console.error(`\n PUT Stats: ${enviosFallidos}/${totalEnvios} fallidos (${((enviosFallidos/totalEnvios)*100).toFixed(1)}%)`);
    console.log('═══════════════════════════════════════════════════════\n');
  } finally {
    processingQueue = false;
    
    if (pendingLocation) {
      console.log('Procesando siguiente ubicación...\n');
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
  } else {
    console.log('⏳ Ubicación agregada a cola PUT (se procesará la más reciente)');
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
  console.log('Estadísticas reseteadas');
};

export const initializeApiService = async (): Promise<void> => {
  console.log('\n Inicializando ApiService...');
  await loadOfflineQueue();
  startPostInterval();
  console.log(' ApiService inicializado\n');
};

export const stopApiService = (): void => {
  stopPostInterval();
  console.log('⏹ApiService detenido');
};