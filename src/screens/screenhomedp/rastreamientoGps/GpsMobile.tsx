import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  PermissionsAndroid,
  Animated,
  Easing,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';
import SimpleLocationView from './SimpleLocationView';
import BackgroundLocationService from './BackgroundLocationService';
import {
  sendLocationToApi,
  initializeApiService,
  stopApiService,
  resetApiStats,
} from '../../../services/ApiService';
import {
  MapPin,
  Square,
  Loader,
  XCircle,
  Gauge,
  Navigation,
} from 'lucide-react-native';

interface GpsMobileProps {
  placa: string;
  usuario: string;
  codservicio: string;
  unidad: string;
  codconductor: string;
}

const GpsMobile = ({
  placa,
  usuario,
  codservicio,
  unidad,
  codconductor,
}: GpsMobileProps) => {
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
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;

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

  // Animación de spinner
  useEffect(() => {
    if (cargando && !rastreando) {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ).start();
    } else {
      spinValue.setValue(0);
    }
  }, [cargando, rastreando]);

  // Animación de pulso
  useEffect(() => {
    if (rastreando) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseValue, {
            toValue: 1.1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseValue, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      pulseValue.setValue(1);
    }
  }, [rastreando]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
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

  // 🔥 NUEVA FUNCIÓN: Verificar estado del servicio en el backend
  const verificarServicioIniciado = async (): Promise<boolean> => {
    // Si no se proporcionaron los props necesarios, omitir verificación
    if (!codservicio) {
      console.log(
        '⚠️ No se proporcionó codservicio, omitiendo verificación de inicio',
      );
      return false;
    }

    try {
      console.log(
        `🔍 Verificando estado del servicio ${codservicio} en el backend...`,
      );

      const response = await axios.get(
        `https://do.velsat.pe:2053/api/Aplicativo/GetEstadoServicio?codservicio=${codservicio}`,
        {
          timeout: 5000,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      console.log('📡 Respuesta del backend:', response.data);

      // 🔥 CORRECCIÓN: El backend devuelve directamente el número, no un objeto con .status
      if (response.data !== undefined && response.data !== null) {
        const status = response.data.toString();
        const yaIniciado = status === '2' || status === '3';

        console.log(
          `📊 Status del servicio: ${status} - ¿Ya iniciado?: ${yaIniciado}`,
        );
        return yaIniciado;
      }

      return false;
    } catch (error) {
      console.error('❌ Error verificando estado del servicio:', error);
      // En caso de error, asumir que NO está iniciado para intentar iniciarlo
      return false;
    }
  };

  // 🔥 NUEVA FUNCIÓN: Ejecutar APIs del botón "Iniciar" original
  const ejecutarInicioServicio = async (): Promise<boolean> => {
    // Verificar que se proporcionaron todos los props necesarios
    if (!codservicio || !unidad || !codconductor) {
      console.log(
        '⚠️ Faltan props necesarios para ejecutar inicio de servicio',
      );
      return true; // Devolver true para continuar con el rastreo normal
    }

    try {
      console.log('🚀 Ejecutando APIs de inicio de servicio...');

      await axios.post(
        `https://do.velsat.pe:2053/api/Aplicativo/ActualizarFechaInicioServicio?codservicio=${codservicio}`,
        {},
        {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      console.log('✅ API 1/3: Fecha de inicio actualizada');

      await axios.post(
        `https://velsat.pe:2087/api/Aplicativo/ActualizarDeviceServicio?codservicio=${codservicio}&deviceID=${unidad}`,
        {},
        {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      console.log('✅ API 2/3: Device actualizado');

      await axios.post(
        `https://do.velsat.pe:2053/api/Aplicativo/ActualizarTaxiServicio?codservicio=${codservicio}&codtaxi=${codconductor}`,
        {},
        {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      console.log('✅ API 3/3: Taxi actualizado');

      console.log('✨ Todas las APIs de inicio ejecutadas correctamente');
      return true;
    } catch (error) {
      console.error('❌ Error ejecutando APIs de inicio:', error);
      if (axios.isAxiosError(error)) {
        console.error('Detalles del error:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
      }
      return false;
    }
  };

  const solicitarPermisosUbicacion = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        ]);

        const fineLocationGranted =
          granted['android.permission.ACCESS_FINE_LOCATION'] ===
          PermissionsAndroid.RESULTS.GRANTED;

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

    try {
      await BackgroundLocationService.stop();
      await stopApiService();
      console.log('Servicios de fondo detenidos');
    } catch (error) {
      console.error('Error deteniendo servicios:', error);
    } finally {
      await resetApiStats();
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

  // 🔥 FUNCIÓN MODIFICADA: obtenerUbicacion con verificación en backend
  const obtenerUbicacion = async (): Promise<void> => {
    try {
      setCargando(true);
      setError(null);

      // 🔥 PASO 1: Verificar en el backend si el servicio ya está iniciado (solo si se proporcionó codservicio)
      if (codservicio) {
        const yaFueIniciado = await verificarServicioIniciado();

        // 🔥 PASO 2: Si NO está iniciado (status !== '2' y !== '3'), ejecutar las APIs
        if (!yaFueIniciado) {
          console.log('🆕 Servicio no iniciado, ejecutando APIs de inicio...');
          const inicioExitoso = await ejecutarInicioServicio();

          if (!inicioExitoso) {
            setError(
              'Error al iniciar el servicio. Por favor intenta de nuevo.',
            );
            setCargando(false);
            return;
          }

          console.log('✅ Servicio iniciado correctamente');
        } else {
          console.log(
            '♻️ Servicio ya iniciado según backend, continuando con rastreo...',
          );
        }
      }

      // 🔥 PASO 3: Continuar con la lógica normal de rastreo GPS (sin cambios)
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

      try {
        await initializeApiService(placa, usuario);
        await BackgroundLocationService.initialize();
        await BackgroundLocationService.start();
        console.log('Servicios de fondo iniciados');
      } catch (error) {
        console.error('Error iniciando servicios:', error);
      }

      Geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude, speed, heading } = position.coords;

          const nuevaUbicacion = {
            lat: latitude,
            lon: longitude,
            speed: speed,
            heading: heading,
          };

          setUbicacion(nuevaUbicacion);
          setCargando(false);
          setRastreando(true);

          sendLocationToApi({
            lastValidLatitude: latitude,
            lastValidLongitude: longitude,
            lastValidHeading: heading || 0,
            lastValidSpeed: speed || 0,
          });

          watchIdRef.current = Geolocation.watchPosition(
            watchPosition => {
              const {
                latitude: lat,
                longitude: lon,
                speed: spd,
                heading: hdg,
              } = watchPosition.coords;

              const ubicacionActualizada = {
                lat: lat,
                lon: lon,
                speed: spd,
                heading: hdg,
              };

              setUbicacion(ubicacionActualizada);

              sendLocationToApi({
                lastValidLatitude: lat,
                lastValidLongitude: lon,
                lastValidHeading: hdg || 0,
                lastValidSpeed: spd || 0,
              });
            },
            error => {
              console.error('Error watchPosition:', error);
            },
            {
              enableHighAccuracy: true,
              distanceFilter: 2,
              interval: 1000,
              fastestInterval: 500,
            },
          );
        },
        error => {
          console.error('Error getCurrentPosition:', error);
          setError(`Error: ${error.message}`);
          setCargando(false);
        },
        {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 60000,
        },
      );
    } catch (error) {
      console.error('Error general en obtenerUbicacion:', error);
      setError('Error al obtener ubicación');
      setCargando(false);
      setRastreando(false);
    }
  };

  useEffect(() => {
    Geolocation.setRNConfiguration({
      skipPermissionRequests: false,
      authorizationLevel: 'always',
    });

    return () => {};
  }, []);

  return (
    <View style={styles.container}>
      {/* Botones de control mejorados */}
      <View style={styles.buttonContainer}>
        {/* Botón Iniciar */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.startButton,
            rastreando && styles.buttonDisabled,
            cargando && !rastreando && styles.buttonLoading,
          ]}
          onPress={obtenerUbicacion}
          disabled={rastreando || cargando}
          activeOpacity={0.8}
        >
          <View style={styles.buttonContent}>
            {cargando && !rastreando ? (
              <Animated.View style={{ transform: [{ rotate: spin }] }}>
                <Loader size={22} color="#FFFFFF" strokeWidth={2.5} />
              </Animated.View>
            ) : (
              <MapPin size={22} color="#FFFFFF" strokeWidth={2.5} />
            )}
            <Text style={styles.buttonText}>
              {cargando && !rastreando ? 'Iniciando...' : 'Iniciar'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Botón Detener */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.stopButton,
            !rastreando && styles.buttonDisabled,
          ]}
          onPress={detenerRastreo}
          disabled={!rastreando}
          activeOpacity={0.8}
        >
          <View style={styles.buttonContent}>
            <Square
              size={22}
              color="#FFFFFF"
              strokeWidth={2.5}
              fill="#FFFFFF"
            />
            <Text style={styles.buttonText}>Detener Servicio</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Error mejorado */}
      {error && (
        <View style={styles.errorCard}>
          <View style={styles.errorIconContainer}>
            <XCircle size={24} color="#F44336" strokeWidth={2.5} />
          </View>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Información de ubicación mejorada */}
      {ubicacion && (
        <View style={styles.locationCard}>
          {/* Métricas en grid */}
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <View style={styles.metricIconContainer}>
                <Gauge size={22} color="#FF9800" strokeWidth={2.5} />
              </View>
              <Text style={styles.metricValue}>
                {convertirVelocidad(ubicacion.speed)}
              </Text>
              <Text style={styles.metricUnit}>km/h</Text>
              <Text style={styles.metricLabel}>Velocidad</Text>
            </View>

            {/* Rumbo */}
            <View style={styles.metricCard}>
              <View style={styles.metricIconContainer}>
                <Navigation
                  size={22}
                  color="#9C27B0"
                  strokeWidth={2.5}
                  style={{
                    transform: [
                      {
                        rotate:
                          ubicacion.heading !== null && ubicacion.heading >= 0
                            ? `${ubicacion.heading}deg`
                            : '0deg',
                      },
                    ],
                  }}
                />
              </View>
              <Text style={styles.metricValue}>
                {ubicacion.heading !== null && ubicacion.heading >= 0
                  ? ubicacion.heading.toFixed(0)
                  : 'N/A'}
              </Text>
              <Text style={styles.metricUnit}>
                {ubicacion.heading !== null && ubicacion.heading >= 0
                  ? obtenerDireccionCardinal(ubicacion.heading)
                  : '—'}
              </Text>
              <Text style={styles.metricLabel}>Rumbo</Text>
            </View>
          </View>

          {/* SimpleLocationView */}
          {rastreando && (
            <View style={styles.detailsContainer}>
              <SimpleLocationView
                latitude={ubicacion.lat}
                longitude={ubicacion.lon}
                speed={ubicacion.speed || 0}
                heading={ubicacion.heading || 0}
              />
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 8,
    paddingHorizontal: 5,
  },

  // Contenedor de botones
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },

  // Botones de acción
  actionButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },

  startButton: {
    backgroundColor: '#4CAF50',
  },

  stopButton: {
    backgroundColor: '#F44336',
  },

  buttonDisabled: {
    backgroundColor: '#BDBDBD',
    opacity: 0.6,
    shadowOpacity: 0.1,
    elevation: 2,
  },

  buttonLoading: {
    backgroundColor: '#66BB6A',
  },

  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Error card
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    gap: 12,
  },
  errorIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFCDD2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    flex: 1,
    color: '#C62828',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },

  // Location card
  locationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 5,
    marginTop: 10,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  locationHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#212121',
  },

  // Coordenadas
  coordsContainer: {
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 10,
    marginBottom: 20,
    gap: 12,
  },
  coordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  coordLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#757575',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  coordValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#212121',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },

  // Grid de métricas
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  metricIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#212121',
    marginBottom: 2,
  },
  metricUnit: {
    fontSize: 12,
    fontWeight: '600',
    color: '#757575',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9E9E9E',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  detailsContainer: {
    marginTop: 4,
  },
});

export default GpsMobile;
