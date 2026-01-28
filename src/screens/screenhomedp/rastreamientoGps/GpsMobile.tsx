import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import SimpleLocationView from './SimpleLocationView';
import BackgroundLocationService from './BackgroundLocationService';
import { sendLocationToApi, initializeApiService, stopApiService } from '../../../services/ApiService';

const GpsMobile = () => {
  const [ubicacion, setUbicacion] = useState<{
    lat: number;
    lon: number;
    speed: number | null;
    heading: number | null;
  } | null>(null);
  
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rastreando, setRastreando] = useState(false);
  
  const watchIdRef = useRef<number | null>(null);

  const [modalAlertVisible, setModalAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    color: '',
  });

  const [modalConfirmVisible, setModalConfirmVisible] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({
    title: '',
    message: '',
    color: '',
    onConfirm: () => {},
    confirmText: '',
    cancelText: '',
  });

  const handleShowAlert = (title: string, message: string, color?: string) => {
    setAlertConfig({ title, message, color: color || '' });
    setModalAlertVisible(true);
  };

  const handleShowConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    color?: string,
    confirmText?: string,
    cancelText?: string,
  ) => {
    setConfirmConfig({
      title,
      message,
      color: color || '#FFA726',
      onConfirm,
      confirmText: confirmText || 'Aceptar',
      cancelText: cancelText || 'Cancelar',
    });
    setModalConfirmVisible(true);
  };

  const solicitarPermisosUbicacion = async (): Promise<boolean> => {
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

        // 🔥 Permisos de ubicación en segundo plano (Android 10+)
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

  const verificarYActivarGPS = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') {
      return true;
    }

    try {
      const RNAndroidLocationEnabler = require('react-native-android-location-enabler');

      await RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({
        interval: 10000,
      });

      return true;
    } catch (error: any) {
      if (error.message && error.message.includes('AndroidLocationEnabler')) {
        return true;
      }

      if (error.code === 'ERR00') {
        handleShowConfirm(
          'GPS Desactivado',
          'Para usar esta función, necesitas activar el GPS. ¿Deseas activarlo ahora?',
          async () => {
            try {
              const RNAndroidLocationEnabler = require('react-native-android-location-enabler');
              await RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({
                interval: 10000,
              });
            } catch (err) {}
          },
          '#FFA726',
          'Activar GPS',
          'Cancelar',
        );
        return false;
      } else if (error.code === 'ERR01') {
        handleShowAlert(
          'GPS No Disponible',
          'Los servicios de ubicación están deshabilitados en tu dispositivo',
          '#e36414',
        );
        return false;
      } else if (error.code === 'ERR02') {
        return false;
      }

      return false;
    }
  };

  const detenerRastreo = async () => {
    if (watchIdRef.current !== null) {
      Geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    
    setRastreando(false);
    setCargando(false);

    // 🔥 Detener servicios de fondo
    try {
      await BackgroundLocationService.stop();
      await stopApiService();
      console.log('✅ Servicios de fondo detenidos');
    } catch (error) {
      console.error('Error deteniendo servicios:', error);
    }
  };

  const convertirVelocidad = (speedMs: number | null): number => {
    if (speedMs === null || speedMs < 0) return 0;
    return parseFloat((speedMs * 3.6).toFixed(2));
  };

  const obtenerDireccionCardinal = (heading: number | null): string => {
    if (heading === null || heading < 0) return 'N/A';
    
    const direcciones = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
    const index = Math.round(heading / 45) % 8;
    return direcciones[index];
  };

  const obtenerUbicacion = async (): Promise<void> => {
    try {
      setCargando(true);
      setError(null);

      const tienePermiso = await solicitarPermisosUbicacion();

      if (!tienePermiso) {
        setError('Permiso de ubicación denegado');
        setCargando(false);
        return;
      }

      const gpsActivado = await verificarYActivarGPS();

      if (!gpsActivado) {
        setError('GPS desactivado. Por favor activa el GPS.');
        setCargando(false);
        return;
      }

      // 🔥 Inicializar servicios de API y segundo plano
      try {
        await initializeApiService();
        await BackgroundLocationService.initialize();
        await BackgroundLocationService.start();
        console.log('✅ Servicios de fondo iniciados');
      } catch (error) {
        console.error('Error iniciando servicios:', error);
      }

      // 🚀 PASO 1: Obtener ubicación RÁPIDA primero
      Geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, speed, heading } = position.coords;

          const nuevaUbicacion = {
            lat: parseFloat(latitude.toFixed(6)),
            lon: parseFloat(longitude.toFixed(6)),
            speed: speed,
            heading: heading,
          };

          setUbicacion(nuevaUbicacion);
          setCargando(false);
          setRastreando(true);

          // 🔥 Enviar primera ubicación a la API
          sendLocationToApi({
            lastValidLatitude: latitude,
            lastValidLongitude: longitude,
            lastValidHeading: heading || 0,
            lastValidSpeed: speed || 0,
          });

          // 🚀 PASO 2: Activar rastreo continuo DESPUÉS de la primera ubicación
          watchIdRef.current = Geolocation.watchPosition(
            (watchPosition) => {
              const { latitude: lat, longitude: lon, speed: spd, heading: hdg } = watchPosition.coords;

              const ubicacionActualizada = {
                lat: parseFloat(lat.toFixed(6)),
                lon: parseFloat(lon.toFixed(6)),
                speed: spd,
                heading: hdg,
              };

              setUbicacion(ubicacionActualizada);

              // 🔥 Enviar ubicación a la API en cada actualización
              sendLocationToApi({
                lastValidLatitude: lat,
                lastValidLongitude: lon,
                lastValidHeading: hdg || 0,
                lastValidSpeed: spd || 0,
              });
            },
            (error) => {
              console.error('Error watchPosition:', error);
            },
            {
              enableHighAccuracy: true,
              distanceFilter: 2, // 🔥 Cambié a 2 metros como el segundo archivo
              interval: 1000, // 🔥 Más frecuente para mejor tracking
              fastestInterval: 500,
            }
          );
        },
        (error) => {
          console.error('Error getCurrentPosition:', error);
          setError(`Error: ${error.message}`);
          setCargando(false);
        },
        {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 60000,
        }
      );

    } catch (error) {
      setError('Error al obtener ubicación');
      setCargando(false);
      setRastreando(false);
    }
  };

  // 🔥 useEffect para configurar Geolocation al montar
  useEffect(() => {
    Geolocation.setRNConfiguration({
      skipPermissionRequests: false,
      authorizationLevel: 'always',
    });

    // 🔥 Cleanup al desmontar (opcional, depende de tu necesidad)
    return () => {
      // Si quieres que continúe en segundo plano, NO descomentar esto:
      // detenerRastreo();
    };
  }, []);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.boton, cargando && styles.disabled]}
        onPress={rastreando ? detenerRastreo : obtenerUbicacion}
        disabled={cargando && !rastreando}
      >
        <Text style={styles.texto}>
          {cargando && !rastreando
            ? 'Obteniendo ubicación…'
            : rastreando
            ? '⏹ Detener rastreo'
            : '📍 Obtener ubicación'}
        </Text>
      </TouchableOpacity>

      {rastreando && (
        <View style={styles.statusBox}>
          <Text style={styles.statusText}>🟢 Rastreando en tiempo real</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>❌ {error}</Text>
        </View>
      )}

      {ubicacion && (
        <View style={styles.box}>
          <Text style={styles.title}>📍 Ubicación actual</Text>
          
          <Text style={styles.coord}>Lat: {ubicacion.lat}</Text>
          <Text style={styles.coord}>Lon: {ubicacion.lon}</Text>
          
          <View style={styles.separator} />
          
          <Text style={styles.coord}>
            🚗 Velocidad: {convertirVelocidad(ubicacion.speed)} km/h
          </Text>
          
          <Text style={styles.coord}>
            🧭 Rumbo: {ubicacion.heading !== null && ubicacion.heading >= 0 
              ? `${ubicacion.heading.toFixed(0)}° (${obtenerDireccionCardinal(ubicacion.heading)})`
              : 'N/A'}
          </Text>

          <View style={styles.separator} />
          
          {/* 🔥 SimpleLocationView con datos actualizados */}
          <SimpleLocationView 
            latitude={ubicacion.lat} 
            longitude={ubicacion.lon}
            speed={ubicacion.speed || 0}
            heading={ubicacion.heading || 0}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  boton: {
    backgroundColor: '#0A7AFF',
    padding: 16,
    borderRadius: 10,
    minWidth: 200,
  },
  disabled: {
    backgroundColor: '#999',
  },
  texto: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  box: {
    marginTop: 30,
    padding: 20,
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    width: '85%',
  },
  errorBox: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#ffe6e6',
    borderRadius: 10,
    width: '85%',
  },
  errorText: {
    color: '#cc0000',
    fontWeight: 'bold',
  },
  statusBox: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#e6ffe6',
    borderRadius: 8,
  },
  statusText: {
    color: '#00aa00',
    fontWeight: 'bold',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 10,
    fontSize: 16,
  },
  coord: {
    fontFamily: 'monospace',
    marginVertical: 3,
  },
  separator: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 10,
  },
});

export default GpsMobile;