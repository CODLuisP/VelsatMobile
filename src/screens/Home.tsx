import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Image,
  PermissionsAndroid,
  Platform,
  Dimensions,
  ImageBackground,
  Alert,
} from 'react-native';
import {
  NavigationProp,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import Geolocation from '@react-native-community/geolocation';
import { useAuthStore } from '../store/authStore';
import { homeStyles } from '../styles/home';
import { RootStackParamList } from '../../App';
import NavigationBarColor from 'react-native-navigation-bar-color';

import {
  EdgeInsets,
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {
  Headphones,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  CloudSnow,
  MapPin,
  User,
  Car,
  BarChart3,
  Shield,
} from 'lucide-react-native';
import { getBottomSpace, useNavigationMode } from '../hooks/useNavigationMode';
import LinearGradient from 'react-native-linear-gradient';
import ModalConfirm from '../components/ModalConfirm';
import ModalAlert from '../components/ModalAlert';

// Tipos TypeScript
interface WeatherState {
  temperature: number | null;
  weatherCode: number | null;
  isDay: number | null;
  loading: boolean;
  error: string | null;
}

interface LocationState {
  latitude: string | null;
  longitude: string | null;
  loading: boolean;
  error: string | null;
}

interface CoordinatesType {
  latitude: string;
  longitude: string;
  displayName: string;
}

const Home: React.FC = () => {
  const { user, logout, server, tipo, selectedVehiclePin } = useAuthStore();
  const codigo = user?.codigo;

  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [weather, setWeather] = useState<WeatherState>({
    temperature: null,
    weatherCode: null,
    isDay: null,
    loading: true,
    error: null,
  });
  const [location, setLocation] = useState<LocationState>({
    latitude: null,
    longitude: null,
    loading: true,
    error: null,
  });

  const navigationDetection = useNavigationMode();

  const insets = useSafeAreaInsets();
  const bottomSpace = getBottomSpace(
    insets,
    navigationDetection.hasNavigationBar,
  );

  const [modalConfirmVisible, setModalConfirmVisible] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({
    title: '',
    message: '',
    color: '',
    onConfirm: () => {},
    confirmText: '',
    cancelText: '',
  });

  useFocusEffect(
    React.useCallback(() => {
      NavigationBarColor('#00296b', false);
    }, []),
  );

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [direccionCoordenadas, setDireccionCoordenadas] = useState<string>(
    'Obteniendo dirección...',
  );

  const [debugUrl, setDebugUrl] = useState<string>('');

  const handleNavigateToProfile = () => {
    navigation.navigate('Profile');
  };

  const handleNavigateToDevice = () => {
    navigation.navigate('Devices');
  };

  const handleNavigateToReports = () => {
    navigation.navigate('Reports');
  };

  const handleNavigateToSecurity = () => {
    navigation.navigate('Security');
  };

  const handleNavigateToHelp = () => {
    navigation.navigate('Help');
  };

  const obtenerSaludo = (): string => {
    const hora = new Date().getHours();

    if (hora >= 5 && hora < 12) {
      return 'Buenos días';
    } else if (hora >= 12 && hora < 18) {
      return 'Buenas tardes';
    } else {
      return 'Buenas noches';
    }
  };

  const [modalAlertVisible, setModalAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    color: '',
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

  // Función para obtener el ícono del clima
  const obtenerIconoClima = (
    weatherCode: number | null,
    isDay: number | null,
    temperature: number | null,
  ): React.ReactElement => {
    const size = 20;
    const color = '#FFD700';

    if (!weatherCode && !temperature) {
      return <Sun size={size} color={color} />;
    }

    if (weatherCode === 0) {
      return isDay === 1 ? (
        <Sun size={size} color={color} />
      ) : (
        <Moon size={size} color="#E6E6FA" />
      );
    }

    if (weatherCode && weatherCode >= 1 && weatherCode <= 3) {
      return <Cloud size={size} color="#87CEEB" />;
    }

    if (weatherCode === 45 || weatherCode === 48) {
      return <Cloud size={size} color="#B0C4DE" />;
    }

    if (
      weatherCode &&
      ((weatherCode >= 51 && weatherCode <= 67) ||
        (weatherCode >= 80 && weatherCode <= 82))
    ) {
      return <CloudRain size={size} color="#4682B4" />;
    }

    if (
      weatherCode &&
      ((weatherCode >= 71 && weatherCode <= 77) ||
        weatherCode === 85 ||
        weatherCode === 86)
    ) {
      return <CloudSnow size={size} color="#F0F8FF" />;
    }

    if (weatherCode && weatherCode >= 95 && weatherCode <= 99) {
      return <CloudRain size={size} color="#bde0fe" />;
    }

    return isDay === 1 ? (
      <Sun size={size} color={color} />
    ) : (
      <Moon size={size} color="#E6E6FA" />
    );
  };

  const obtenerClima = async (lat: string, lon: string): Promise<void> => {
    try {
      setWeather(prev => ({ ...prev, loading: true }));

      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=celsius`,
      );

      if (!response.ok) {
        throw new Error('Error en la respuesta de la API');
      }

      const data = await response.json();

      setWeather({
        temperature: Math.round(data.current_weather.temperature),
        weatherCode: data.current_weather.weathercode,
        isDay: data.current_weather.is_day,
        loading: false,
        error: null,
      });
    } catch (error) {
      setWeather({
        temperature: 25,
        weatherCode: 0,
        isDay: 1,
        loading: false,
        error: 'Error al obtener clima',
      });
    }
  };

  const obtenerDireccion = async (lat: string, lng: string) => {
    setDireccionCoordenadas('Validando coordenadas...');

    if (!lat || !lng || lat === 'null' || lng === 'null') {
      setDireccionCoordenadas('Coordenadas no válidas');
      return;
    }

    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);

    if (isNaN(latNum) || isNaN(lngNum)) {
      setDireccionCoordenadas('Coordenadas no válidas (NaN)');
      return;
    }

    if (latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
      setDireccionCoordenadas('Coordenadas fuera de rango');
      return;
    }

    try {
      const url = `http://63.251.107.133:90/nominatim/reverse.php?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;

      setDebugUrl(url);
      setDireccionCoordenadas('Consultando servidor...');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 10000);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(
          `HTTP Error: ${response.status} - ${response.statusText}`,
        );
      }

      const data = await response.json();

      if (data && data.display_name) {
        setDireccionCoordenadas(data.display_name);
      } else if (data && data.error) {
        setDireccionCoordenadas('Error API: ' + data.error);
      } else {
        setDireccionCoordenadas('Sin dirección disponible');
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          setDireccionCoordenadas('Timeout - Servidor muy lento');
        } else if (error.message.includes('Network')) {
          setDireccionCoordenadas('Sin conexión a internet');
        } else if (error.message.includes('fetch')) {
          setDireccionCoordenadas('Error conectando al servidor');
        } else {
          setDireccionCoordenadas(`Error: ${error.message}`);
        }
      } else {
        setDireccionCoordenadas(`Error desconocido: ${String(error)}`);
      }
    }
  };

  const solicitarPermisosUbicacion = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Permiso de Ubicación',
            message: 'Esta app necesita acceso a tu ubicación',
            buttonNeutral: 'Preguntar Después',
            buttonNegative: 'Cancelar',
            buttonPositive: 'OK',
          },
        );

        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        return false;
      }
    }
    return true;
  };

  // NUEVA FUNCIÓN: Verificar y activar GPS automáticamente
  const verificarYActivarGPS = async (): Promise<boolean> => {
    // SOLO ejecutar en Android
    if (Platform.OS !== 'android') {
      return true;
    }

    try {
      // Importación dinámica solo para Android
      const RNAndroidLocationEnabler = require('react-native-android-location-enabler');

      const result =
        await RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({
          interval: 10000,
        });

      return true;
    } catch (error: any) {
      // Si falla la importación del módulo, retornar true (iOS u otro error)
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
            } catch (err) {
            }
          },
          '#FFA726', // Naranja
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

  // FUNCIÓN MODIFICADA: obtenerUbicacion con GPS auto-activación
  const obtenerUbicacion = async (): Promise<void> => {
    try {
      const tienePermiso = await solicitarPermisosUbicacion();

      if (!tienePermiso) {
        setLocation({
          latitude: null,
          longitude: null,
          loading: false,
          error: 'Permiso de ubicación denegado',
        });
        setWeather({
          temperature: null,
          weatherCode: null,
          isDay: 1,
          loading: false,
          error: null,
        });
        return;
      }

      const gpsActivado = await verificarYActivarGPS();

      if (!gpsActivado) {
        setLocation({
          latitude: null,
          longitude: null,
          loading: false,
          error: 'GPS desactivado. Por favor activa el GPS.',
        });
        setWeather({
          temperature: null,
          weatherCode: null,
          isDay: 1,
          loading: false,
          error: null,
        });
        return;
      }

      let locationObtained = false;

      const tryPreciseLocationAsBackup = () => {
        Geolocation.getCurrentPosition(
          async position => {
            if (locationObtained) return;
            locationObtained = true;

            try {
              const { latitude, longitude } = position.coords;
              const lat = latitude.toFixed(6);
              const lng = longitude.toFixed(6);

              setLocation({
                latitude: lat,
                longitude: lng,
                loading: true,
                error: null,
              });

              obtenerClima(lat, lng);

              try {
                await obtenerDireccion(lat, lng);
              } catch (dirError) {
                setDireccionCoordenadas('No hay dirección disponible');
              }

              setLocation(prev => ({
                ...prev,
                loading: false,
              }));
            } catch (backupError) {
              setLocation({
                latitude: null,
                longitude: null,
                loading: false,
                error: 'Error al obtener ubicación GPS',
              });
              setWeather({
                temperature: null,
                weatherCode: null,
                isDay: 1,
                loading: false,
                error: null,
              });
            }
          },
          backupError => {
            if (!locationObtained) {
              locationObtained = true;
              setLocation({
                latitude: null,
                longitude: null,
                loading: false,
                error: 'Error al obtener ubicación GPS',
              });
              setWeather({
                temperature: null,
                weatherCode: null,
                isDay: 1,
                loading: false,
                error: null,
              });
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0,
          },
        );
      };

      Geolocation.getCurrentPosition(
        async position => {
          if (locationObtained) return;
          locationObtained = true;

          try {
            const { latitude, longitude } = position.coords;
            const lat = latitude.toFixed(6);
            const lng = longitude.toFixed(6);

            setLocation({
              latitude: lat,
              longitude: lng,
              loading: true,
              error: null,
            });

            obtenerClima(lat, lng);

            try {
              await obtenerDireccion(lat, lng);
            } catch (dirError) {
              setDireccionCoordenadas('No hay dirección disponible');
            }

            setLocation(prev => ({
              ...prev,
              loading: false,
            }));

            setTimeout(() => {
              Geolocation.getCurrentPosition(
                async precisePosition => {
                  try {
                    const { latitude: precLat, longitude: precLng } =
                      precisePosition.coords;
                    const preciseLat = precLat.toFixed(6);
                    const preciseLng = precLng.toFixed(6);

                    const latDiff = Math.abs(parseFloat(lat) - precLat);
                    const lngDiff = Math.abs(parseFloat(lng) - precLng);

                    if (latDiff > 0.0001 || lngDiff > 0.0001) {
                      setLocation(prev => ({
                        ...prev,
                        latitude: preciseLat,
                        longitude: preciseLng,
                      }));

                      obtenerClima(preciseLat, preciseLng);

                      try {
                        await obtenerDireccion(preciseLat, preciseLng);
                      } catch (error) {}
                    }
                  } catch (error) {}
                },
                error => {},
                {
                  enableHighAccuracy: true,
                  timeout: 10000,
                  maximumAge: 0,
                },
              );
            }, 3000);
          } catch (error) {
            locationObtained = false;
            tryPreciseLocationAsBackup();
          }
        },
        error => {
          if (!locationObtained) {
            tryPreciseLocationAsBackup();
          }
        },
        {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 60000,
        },
      );
    } catch (error) {
      setLocation({
        latitude: null,
        longitude: null,
        loading: false,
        error: 'Error al obtener ubicación',
      });
      setWeather({
        temperature: null,
        weatherCode: null,
        isDay: 1,
        loading: false,
        error: null,
      });
    }
  };

  useEffect(() => {
    obtenerUbicacion();
  }, []);

  const handleLogout = (): void => {
    logout();
  };

  const toggleDropdown = (): void => {
    setShowDropdown(!showDropdown);
  };

  const handleDropdownLogout = (): void => {
    setShowDropdown(false);
    logout();
  };

  return (
    <LinearGradient
      colors={['#021e4bff', '#00296b', '#00296b']}
      style={[homeStyles.container]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <SafeAreaView style={homeStyles.container}>
        <StatusBar translucent backgroundColor="transparent" />
        <View
          style={[
            homeStyles.header,
            { marginTop: -insets.top },
            { paddingTop: insets.top - 10 },
          ]}
        >
          <Image
            source={require('../../assets/fondo3.png')}
            style={homeStyles.backgroundImage}
          />
          <View style={homeStyles.backgroundOverlay} />
          <View style={homeStyles.headerContent}>
            <View style={homeStyles.topRow}>
              <View>
                <Text style={homeStyles.greeting}>{obtenerSaludo()}</Text>
                <View style={homeStyles.weatherContainer}>
                  {weather.loading ? (
                    <>
                      <Sun size={20} color="#FFD700" />
                      <Text style={homeStyles.temperature}>--°</Text>
                    </>
                  ) : location.error && location.error.includes('GPS') ? (
                    <>
                      <Sun size={20} color="#FFD700" />
                      <Text style={[homeStyles.temperature, { fontSize: 10 }]}>
                        Active GPS
                      </Text>
                    </>
                  ) : (
                    <>
                      {obtenerIconoClima(
                        weather.weatherCode,
                        weather.isDay,
                        weather.temperature,
                      )}
                      <Text style={homeStyles.temperature}>
                        {weather.temperature || '--'}°
                      </Text>
                    </>
                  )}
                </View>
              </View>
              <View style={homeStyles.profileContainer}>
                <TouchableOpacity
                  style={homeStyles.profileImage}
                  onPress={toggleDropdown}
                >
                  <Image
                    source={require('../../assets/usuario.jpeg')}
                    style={homeStyles.logoImage}
                    resizeMode="contain"
                  />
                </TouchableOpacity>

                {showDropdown && (
                  <View style={homeStyles.dropdown}>
                    <TouchableOpacity
                      style={homeStyles.dropdownItem}
                      onPress={handleDropdownLogout}
                    >
                      <Text style={homeStyles.dropdownText}>Cerrar Sesión</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>

            <Text style={homeStyles.companyName}>
              {user?.description || (user?.username && `${user.username}`)}
            </Text>

            <View style={homeStyles.locationContainer}>
              <MapPin size={25} color="#FFF" />
              <View>
                <Text style={homeStyles.locationLabel}>
                  Tu ubicación actual es:
                </Text>

                <Text style={homeStyles.locationLabel}>
                  {location.error && location.error.includes('GPS')
                    ? 'Active su GPS para obtener su dirección exacta'
                    : direccionCoordenadas}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <ScrollView
          style={[homeStyles.content, { paddingBottom: bottomSpace }]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={homeStyles.sectionTitle}>¿Qué haremos hoy?</Text>

          <View style={homeStyles.optionsGrid}>
            <TouchableOpacity
              style={[homeStyles.optionCard]}
              onPress={handleNavigateToProfile}
              activeOpacity={0.7}
            >
              {/* Fondo degradado */}
              <LinearGradient
                colors={['#FFFFFF', '#F1F5F9', '#E2E8F0']}
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                }}
              />

              <View
                style={[homeStyles.optionIcon, homeStyles.optionContentAbove]}
              >
                <User size={24} color="#e36414" />
              </View>

              <Text style={homeStyles.optionTitle}>Perfil</Text>

              <Text style={homeStyles.optionSubtitle}>
                Revisa tu información personal, actualiza tus datos y
                credenciales y personaliza tus marcadores.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[homeStyles.optionCard]}
              onPress={handleNavigateToDevice}
              activeOpacity={0.95}
            >
              {/* Fondo degradado */}
              <LinearGradient
                colors={['#FFFFFF', '#F1F5F9', '#E2E8F0']}
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                }}
              />

              <View
                style={[homeStyles.optionIcon, homeStyles.optionContentAbove]}
              >
                <Car size={24} color="#e36414" />
              </View>

              <Text style={homeStyles.optionTitle}>Unidades</Text>

              <Text style={homeStyles.optionSubtitle}>
                Rastrea tus unidades, conoce su última ubicación, velocidad,
                dirección y estado.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[homeStyles.optionCard]}
              onPress={handleNavigateToReports}
              activeOpacity={0.95}
            >
              {/* Fondo degradado */}
              <LinearGradient
                colors={['#FFFFFF', '#F1F5F9', '#E2E8F0']}
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                }}
              />

              <View
                style={[homeStyles.optionIcon, homeStyles.optionContentAbove]}
              >
                <BarChart3 size={24} color="#e36414" />
              </View>

              <Text style={homeStyles.optionTitle}>Reportes</Text>

              <Text style={homeStyles.optionSubtitle}>
                Genera reportes de tus unidades, general, velocidad,
                kilometraje, paradas y detalle de recorrido.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[homeStyles.optionCard]}
              onPress={handleNavigateToSecurity}
              activeOpacity={0.95}
            >
              {/* Fondo degradado */}
              <LinearGradient
                colors={['#FFFFFF', '#F1F5F9', '#E2E8F0']}
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                }}
              />

              <View
                style={[homeStyles.optionIcon, homeStyles.optionContentAbove]}
              >
                <Shield size={24} color="#e36414" />
              </View>

              <Text style={homeStyles.optionTitle}>Seguridad</Text>

              <Text style={homeStyles.optionSubtitle}>
                Activa la autenticación con datos biométricos y habilita o
                deshabilita las notificaciones.
              </Text>
            </TouchableOpacity>
          </View>

          <View style={homeStyles.customerCareContainer}>
            <TouchableOpacity
              style={[homeStyles.customerCareCard]}
              onPress={handleNavigateToHelp}
              activeOpacity={0.95}
            >
              {/* Fondo degradado */}
              <LinearGradient
                colors={['#FFFFFF', '#F1F5F9', '#E2E8F0']}
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                  borderRadius: 15,
                }}
              />

              <View
                style={[
                  homeStyles.customerCareIcon,
                  homeStyles.optionContentAbove,
                ]}
              >
                <Headphones size={24} color="#e36414" />
              </View>

              <Text
                style={[
                  homeStyles.customerCareTitle,
                  homeStyles.optionContentAbove,
                ]}
              >
                Ayuda
              </Text>

              <Text
                style={[
                  homeStyles.customerCareSubtitle,
                  homeStyles.optionContentAbove,
                ]}
              >
                Conoce nuestros números telefónicos, llámanos a la central de
                monitoreo, escríbenos al Whatsapp, revisa las preguntas
                frecuentes y visualiza tutoriales útiles.
              </Text>
            </TouchableOpacity>
          </View>

          <ModalAlert
            isVisible={modalAlertVisible}
            onClose={() => setModalAlertVisible(false)}
            title={alertConfig.title}
            message={alertConfig.message}
            color={alertConfig.color}
          />

          <ModalConfirm
            isVisible={modalConfirmVisible}
            onClose={() => setModalConfirmVisible(false)}
            onConfirm={() => {
              confirmConfig.onConfirm();
              setModalConfirmVisible(false);
            }}
            title={confirmConfig.title}
            message={confirmConfig.message}
            color={confirmConfig.color}
            confirmText={confirmConfig.confirmText}
            cancelText={confirmConfig.cancelText}
          />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default Home;
