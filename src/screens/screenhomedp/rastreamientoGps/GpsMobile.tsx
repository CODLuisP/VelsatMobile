import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import BackgroundLocationService from './BackgroundLocationService';
import {sendLocationToApi, initializeApiService, stopApiService} from '../../../services/ApiService';
import SimpleLocationView from './SimpleLocationView';

interface LocationData {
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
}

// ⭐ VARIABLES GLOBALES para mantener el estado entre montajes
let globalLocation: LocationData | null = null;
let isInitialized = false;
let globalWatchId: number | null = null;

const GpsMobile: React.FC = () => {
  const [location, setLocation] = useState<LocationData | null>(globalLocation);
  const [isGettingLocation, setIsGettingLocation] = useState<boolean>(!isInitialized);
  const [hasError, setHasError] = useState<boolean>(false);
  const watchIdRef = useRef<number | null>(globalWatchId);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousLocationRef = useRef<{latitude: number; longitude: number} | null>(null);
  const currentHeadingRef = useRef<number>(0);

  const calculateHeading = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const lat1Rad = lat1 * Math.PI / 180;
    const lat2Rad = lat2 * Math.PI / 180;

    const y = Math.sin(dLon) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
              Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);

    let heading = Math.atan2(y, x) * 180 / Math.PI;
    heading = (heading + 360) % 360;

    return heading;
  };

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const requestLocationPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        ]);

        const fineLocationGranted = 
          granted['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED;

        if (!fineLocationGranted) {
          return false;
        }

        if (Platform.Version >= 29) {
          await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
          );
        }

        return true;
      } catch (err) {
        console.error('Error requesting permissions:', err);
        return false;
      }
    }
    return true;
  };

  const startLocationTracking = () => {
    // Si ya hay un watch activo, no crear otro
    if (globalWatchId !== null) {
      console.log('⚠️ Ya hay un watch activo, usando el existente');
      return;
    }

    timeoutRef.current = setTimeout(() => {
      if (!globalLocation) {
        console.log('⏱️ Timeout - obteniendo ubicación rápida');
        Geolocation.getCurrentPosition(
          position => {
            const {latitude, longitude, speed, heading} = position.coords;
            const initialHeading = heading && heading >= 0 ? heading : 0;
            currentHeadingRef.current = initialHeading;
            
            const newLocation = {
              latitude, 
              longitude, 
              speed: speed || 0,
              heading: initialHeading
            };
            
            setLocation(newLocation);
            globalLocation = newLocation;
            setIsGettingLocation(false);
            isInitialized = true;
            
            previousLocationRef.current = {latitude, longitude};

            sendLocationToApi({
              lastValidLatitude: latitude,
              lastValidLongitude: longitude,
              lastValidHeading: initialHeading,
              lastValidSpeed: speed || 0,
            });
          },
          error => {
            console.error('Error en ubicación rápida:', error);
            setHasError(true);
            setIsGettingLocation(false);
          },
          {
            enableHighAccuracy: false,
            timeout: 5000,
            maximumAge: 10000,
          }
        );
      }
    }, 3000);

    globalWatchId = Geolocation.watchPosition(
      position => {
        const {latitude, longitude, speed, heading: gpsHeading} = position.coords;
        
        let finalHeading = currentHeadingRef.current;

        if (previousLocationRef.current) {
          const distance = calculateDistance(
            previousLocationRef.current.latitude,
            previousLocationRef.current.longitude,
            latitude,
            longitude
          );

          if (distance >= 2) {
            if (gpsHeading !== null && gpsHeading !== undefined && gpsHeading >= 0) {
              finalHeading = gpsHeading;
            } else {
              finalHeading = calculateHeading(
                previousLocationRef.current.latitude,
                previousLocationRef.current.longitude,
                latitude,
                longitude
              );
            }
            
            currentHeadingRef.current = finalHeading;
          }
        }

        if (!globalLocation) {
          setIsGettingLocation(false);
          isInitialized = true;
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
        }
        
        const newLocation = {
          latitude,
          longitude,
          speed: speed || 0,
          heading: finalHeading
        };
        
        setLocation(newLocation);
        globalLocation = newLocation;

        previousLocationRef.current = {latitude, longitude};

        sendLocationToApi({
          lastValidLatitude: latitude,
          lastValidLongitude: longitude,
          lastValidHeading: finalHeading,
          lastValidSpeed: speed || 0,
        });
      },
      error => {
        console.error('Error en watchPosition:', error);
        setHasError(true);
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 2,
        interval: 1000,
        fastestInterval: 500,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    watchIdRef.current = globalWatchId;
  };

  const initializeApp = async () => {
    // Si ya está inicializado, no volver a inicializar
    if (isInitialized) {
      console.log('✅ GPS ya inicializado, usando datos existentes');
      return;
    }

    try {
      Geolocation.setRNConfiguration({
        skipPermissionRequests: false,
        authorizationLevel: 'always',
      });

      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        setIsGettingLocation(false);
        setHasError(true);
        return;
      }

      await initializeApiService();

      startLocationTracking();

      BackgroundLocationService.initialize()
        .then(() => BackgroundLocationService.start())
        .catch(e => console.error('Error servicio segundo plano:', e));

    } catch (e) {
      console.error('Error inicializando app:', e);
      setIsGettingLocation(false);
      setHasError(true);
    }
  };

  useEffect(() => {
    initializeApp();

    // NO limpiar el watch cuando se desmonta
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      // NO detener el servicio de fondo ni el API service
    };
  }, []);

  return (
    <View style={styles.container}>
      {isGettingLocation ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#FF6B35" />
          <Text style={styles.loadingText}>Obteniendo GPS...</Text>
        </View>
      ) : location ? (
        <View style={styles.gpsInfo}>
          <View style={styles.statusIndicator}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>GPS Activo</Text>
          </View>
          <Text style={styles.coordText}>
            📍 {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
          </Text>
          <Text style={styles.speedText}>
            🚗 {(location.speed * 3.6).toFixed(1)} km/h
          </Text>

              <SimpleLocationView 
              latitude={location.latitude} 
              longitude={location.longitude}
              speed={location.speed}
              heading={location.heading}
            />
        </View>
      ) : (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {hasError ? '❌ Error al obtener GPS' : '⏳ Esperando GPS...'}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
  gpsInfo: {
    gap: 6,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
    marginRight: 6,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  coordText: {
    fontSize: 12,
    color: '#333',
    fontFamily: 'monospace',
  },
  speedText: {
    fontSize: 12,
    color: '#666',
  },
  errorContainer: {
    padding: 8,
    backgroundColor: '#ffe0e0',
    borderRadius: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#d32f2f',
  },
});

export default GpsMobile;