import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Animated,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import {
  NavigationProp,
  useNavigation,
  useFocusEffect,
} from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  MapPin,
  Building,
  Compass,
  Gauge,
  CreditCard,
  Square,
  Play,
} from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import NavigationBarColor from 'react-native-navigation-bar-color';
import Geolocation from '@react-native-community/geolocation';
import { Text } from '../../components/ScaledComponents';
import { RootStackParamList } from '../../../App';
import { rastreoMobileStyles } from '../../styles/rastreoMobile';
import { useAuthStore } from '../../store/authStore';
import {
  getBottomSpace,
  useNavigationMode,
} from '../../hooks/useNavigationMode';
import {
  sendLocationToApi,
  initializeApiService,
  stopApiService,
  resetApiStats,
} from '../../services/ApiService';
import BackgroundLocationService from '../screenhomedp/rastreamientoGps/BackgroundLocationService';

interface LocationData {
  latitude: number;
  longitude: number;
  direccion: string;
  orientacion: number;
  velocidad: number;
  placa: string;
}

const UNIDADES_MAP: { [key: string]: string } = {
  r16: 'r16-bzc449',
  r17: 'r17-bzl372',
  r22: 'r22-bzm596',
  r23: 'r23-bzn007',
  r25: 'r25-bxz612',
  r26: 'r26-bze523',
  r27: 'r27-cam103',
  r31: 'r31-cth371',
  r32: 'r32-cue153',
  r33: 'r33-cue070',
  r34: 'r34-cud687',
  r35: 'r35-cue674',
  r36: 'r36-cun619',
  r37: 'r37-cuo624',
};

const RastreoMobile: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user } = useAuthStore();

  const [isTransmitting, setIsTransmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  const [codigoUsuario, setCodigoUsuario] = useState<string>('mitsubishi');
  const [unidad, setUnidad] = useState<string>('');
  const [placaCompleta, setPlacaCompleta] = useState<string>('');

  const [ubicacionReal, setUbicacionReal] = useState<{
    lat: number;
    lon: number;
    speed: number | null;
    heading: number | null;
  } | null>(null);

  const watchIdRef = useRef<number | null>(null);

  const [location, setLocation] = useState<LocationData>({
    latitude: 0,
    longitude: 0,
    direccion: 'Esperando ubicación...',
    orientacion: 0,
    velocidad: 0,
    placa: '',
  });

  const pulseAnim1 = useRef(new Animated.Value(1)).current;
  const pulseAnim2 = useRef(new Animated.Value(1)).current;
  const pulseAnim3 = useRef(new Animated.Value(1)).current;
  const opacityAnim1 = useRef(new Animated.Value(0.8)).current;
  const opacityAnim2 = useRef(new Animated.Value(0.8)).current;
  const opacityAnim3 = useRef(new Animated.Value(0.8)).current;

  const insets = useSafeAreaInsets();
  const navigationDetection = useNavigationMode();
  const bottomSpace = getBottomSpace(
    insets,
    navigationDetection.hasNavigationBar,
  );
  const topSpace = insets.top + 5;

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

  const obtenerPlacaCompleta = (userCodigo: string): string => {
    const codigoNormalizado = userCodigo.toLowerCase().trim();
    const placaEncontrada = UNIDADES_MAP[codigoNormalizado];

    if (placaEncontrada) {
      return placaEncontrada;
    }

    return 'NO-ASIGNADA';
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
      return false;
    }
  };

  useEffect(() => {
    setCodigoUsuario('mitsubishi');

    if (user?.username) {
      const userPrefix = user.username.toLowerCase().trim();
      setUnidad(userPrefix);

      const placa = obtenerPlacaCompleta(userPrefix);
      setPlacaCompleta(placa);

      setLocation(prev => ({
        ...prev,
        placa: placa,
      }));
    }
  }, [user]);

  useEffect(() => {
    Geolocation.setRNConfiguration({
      skipPermissionRequests: false,
      authorizationLevel: 'always',
    });

    return () => {
      if (watchIdRef.current !== null) {
        Geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      NavigationBarColor('#ffffff', true);
    }, []),
  );

  useEffect(() => {
    if (isTransmitting) {
      const createPulseAnimation = (
        scaleValue: Animated.Value,
        opacityValue: Animated.Value,
        delay: number,
      ) => {
        return Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.parallel([
              Animated.timing(scaleValue, {
                toValue: 2.5,
                duration: 2000,
                useNativeDriver: true,
              }),
              Animated.timing(opacityValue, {
                toValue: 0,
                duration: 2000,
                useNativeDriver: true,
              }),
            ]),
            Animated.parallel([
              Animated.timing(scaleValue, {
                toValue: 1,
                duration: 0,
                useNativeDriver: true,
              }),
              Animated.timing(opacityValue, {
                toValue: 0.8,
                duration: 0,
                useNativeDriver: true,
              }),
            ]),
          ]),
        );
      };

      const anim1 = createPulseAnimation(pulseAnim1, opacityAnim1, 0);
      const anim2 = createPulseAnimation(pulseAnim2, opacityAnim2, 600);
      const anim3 = createPulseAnimation(pulseAnim3, opacityAnim3, 1200);

      anim1.start();
      anim2.start();
      anim3.start();

      return () => {
        anim1.stop();
        anim2.stop();
        anim3.stop();
      };
    } else {
      pulseAnim1.setValue(1);
      pulseAnim2.setValue(1);
      pulseAnim3.setValue(1);
      opacityAnim1.setValue(0.8);
      opacityAnim2.setValue(0.8);
      opacityAnim3.setValue(0.8);
    }
  }, [isTransmitting]);

  const calcularOrientacion = (heading: number): string => {
    const direcciones = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(heading / 45) % 8;
    return direcciones[index];
  };

  const iniciarTransmision = async () => {
    try {
      setLoading(true);

      const tienePermiso = await solicitarPermisosUbicacion();
      if (!tienePermiso) {
        setLoading(false);
        return;
      }

      const gpsActivado = await verificarYActivarGPS();
      if (!gpsActivado) {
        setLoading(false);
        return;
      }

      try {
        await initializeApiService(placaCompleta, codigoUsuario);
        await BackgroundLocationService.initialize();
        await BackgroundLocationService.start();
      } catch (error) {
        // Error manejado silenciosamente
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

          setUbicacionReal(nuevaUbicacion);

          setLocation({
            latitude,
            longitude,
            direccion: 'Ubicación GPS activa',
            orientacion: heading || 0,
            velocidad: convertirVelocidad(speed),
            placa: placaCompleta,
          });

          setLoading(false);
          setIsTransmitting(true);

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
                lat,
                lon,
                speed: spd,
                heading: hdg,
              };

              setUbicacionReal(ubicacionActualizada);

              setLocation({
                latitude: lat,
                longitude: lon,
                direccion: 'Rastreando en tiempo real',
                orientacion: hdg || 0,
                velocidad: convertirVelocidad(spd),
                placa: placaCompleta,
              });

              sendLocationToApi({
                lastValidLatitude: lat,
                lastValidLongitude: lon,
                lastValidHeading: hdg || 0,
                lastValidSpeed: spd || 0,
              });
            },
            error => {
              // Error manejado silenciosamente
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
          setLoading(false);
        },
        {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 60000,
        },
      );
    } catch (error) {
      setLoading(false);
      setIsTransmitting(false);
    }
  };

  const detenerTransmision = async () => {
    if (watchIdRef.current !== null) {
      Geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    setIsTransmitting(false);
    setLoading(false);
    setUbicacionReal(null);

    try {
      await BackgroundLocationService.stop();
      await stopApiService();
      await resetApiStats();
    } catch (error) {
      // Error manejado silenciosamente
    }
  };

  const handleGoBack = () => {
    if (isTransmitting) {
      detenerTransmision();
    }
    navigation.goBack();
  };

  return (
    <LinearGradient
      colors={['#021e4bff', '#183890ff', '#032660ff']}
      style={[rastreoMobileStyles.container, { paddingBottom: bottomSpace }]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <View style={[rastreoMobileStyles.header, { paddingTop: topSpace }]}>
        <View style={rastreoMobileStyles.headerTop}>
          <TouchableOpacity
            onPress={handleGoBack}
            style={rastreoMobileStyles.backButton}
            activeOpacity={0.7}
          >
            <ChevronLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={rastreoMobileStyles.headerMainTitle}>Rastreo GPS</Text>
        </View>
      </View>

      <ScrollView
        style={rastreoMobileStyles.contentList}
        showsVerticalScrollIndicator={false}
      >
        <View style={rastreoMobileStyles.formContainer}>
          <View style={rastreoMobileStyles.statusContainer}>
            <View
              style={[
                rastreoMobileStyles.pulseCircle,
                isTransmitting && rastreoMobileStyles.pulseActive,
              ]}
            >
              {isTransmitting && (
                <>
                  <Animated.View
                    style={[
                      rastreoMobileStyles.pulseRing,
                      {
                        transform: [{ scale: pulseAnim1 }],
                        opacity: opacityAnim1,
                      },
                    ]}
                  />
                  <Animated.View
                    style={[
                      rastreoMobileStyles.pulseRing,
                      {
                        transform: [{ scale: pulseAnim2 }],
                        opacity: opacityAnim2,
                      },
                    ]}
                  />
                  <Animated.View
                    style={[
                      rastreoMobileStyles.pulseRing,
                      {
                        transform: [{ scale: pulseAnim3 }],
                        opacity: opacityAnim3,
                      },
                    ]}
                  />
                </>
              )}

              <View
                style={[
                  rastreoMobileStyles.innerCircle,
                  isTransmitting && rastreoMobileStyles.innerCircleActive,
                ]}
              />
            </View>

            <Text style={rastreoMobileStyles.statusTitle}>
              {isTransmitting ? 'Transmisión Activa' : 'Transmisión Inactiva'}
            </Text>
            <Text style={rastreoMobileStyles.statusSubtitle}>
              {isTransmitting
                ? 'Enviando datos en tiempo real al servidor.'
                : 'Presiona el botón para iniciar el rastreo.'}
            </Text>
          </View>

          {/* Botón de control */}
          <TouchableOpacity
            style={[
              rastreoMobileStyles.controlButton,
              isTransmitting && rastreoMobileStyles.controlButtonActive,
            ]}
            onPress={isTransmitting ? detenerTransmision : iniciarTransmision}
            disabled={loading}
            activeOpacity={0.7}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <>
                {isTransmitting ? (
                  <Square size={20} color="#FFF" fill="#FFF" />
                ) : (
                  <Play size={20} color="#FFF" fill="#FFF" />
                )}
                <Text style={rastreoMobileStyles.controlButtonText}>
                  {isTransmitting ? 'DETENER ENVÍO' : 'INICIAR ENVÍO'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          <View style={rastreoMobileStyles.infoContainer}>
            <Text style={rastreoMobileStyles.infoHeader}>
              DATOS DE UBICACIÓN ACTUAL
            </Text>

            <View style={rastreoMobileStyles.infoRow}>
              <Compass size={20} color="#00296b" />
              <View style={rastreoMobileStyles.infoTextContainer}>
                <Text style={rastreoMobileStyles.infoLabel}>Orientación:</Text>
                <Text style={rastreoMobileStyles.infoValue}>
                  {ubicacionReal
                    ? `${(ubicacionReal.heading || 0).toFixed(
                        0,
                      )}° ${obtenerDireccionCardinal(ubicacionReal.heading)}`
                    : `${location.orientacion.toFixed(
                        0,
                      )}° ${calcularOrientacion(location.orientacion)}`}
                </Text>
              </View>
            </View>

            <View style={rastreoMobileStyles.infoRow}>
              <Gauge size={20} color="#00296b" />
              <View style={rastreoMobileStyles.infoTextContainer}>
                <Text style={rastreoMobileStyles.infoLabel}>
                  Velocidad Actual:
                </Text>
                <Text style={rastreoMobileStyles.infoValue}>
                  {ubicacionReal
                    ? `${convertirVelocidad(ubicacionReal.speed)} km/h`
                    : `${location.velocidad} km/h`}
                </Text>
              </View>
            </View>

            <View style={rastreoMobileStyles.infoRow}>
              <CreditCard size={20} color="#00296b" />
              <View style={rastreoMobileStyles.infoTextContainer}>
                <Text style={rastreoMobileStyles.infoLabel}>Unidad:</Text>
                <View style={rastreoMobileStyles.placaBadge}>
                  <Text style={rastreoMobileStyles.placaText}>
                    {placaCompleta.toUpperCase() || 'NO-ASIGNADA'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default RastreoMobile;
