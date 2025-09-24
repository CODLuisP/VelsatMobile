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
} from 'react-native';
import { NavigationProp, useFocusEffect, useNavigation } from '@react-navigation/native';
import Geolocation from '@react-native-community/geolocation';
import { useAuthStore } from '../store/authStore';
import { homeStyles } from '../styles/home';
import { RootStackParamList } from '../../App';
import NavigationBarColor from 'react-native-navigation-bar-color';

import { EdgeInsets, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
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
  LogOut,
} from 'lucide-react-native';

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


const getBottomSpace = (insets: EdgeInsets) => {
  if (Platform.OS === 'android') {
    const screen = Dimensions.get('screen');
    const window = Dimensions.get('window');
    
    const navBarHeight = screen.height - window.height;
    return navBarHeight > 0 ? navBarHeight + 30 : 70;
  }
  
  return Math.max(insets.bottom, 20);
};

const Home: React.FC = () => {
  const { user, logout, server } = useAuthStore();
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


  const insets = useSafeAreaInsets();
const bottomSpace = getBottomSpace(insets);

useFocusEffect(
  React.useCallback(() => {
    NavigationBarColor('#1e3a8a', false);
  }, [])
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

  // Función para obtener el saludo según la hora
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

  // Función para obtener el ícono del clima
  const obtenerIconoClima = (
    weatherCode: number | null,
    isDay: number | null,
    temperature: number | null,
  ): React.ReactElement => {
    const size = 20;
    const color = '#FFD700';

    // Si no hay datos, usar sol por defecto
    if (!weatherCode && !temperature) {
      return <Sun size={size} color={color} />;
    }

    // WMO Weather interpretation codes
    // 0: Clear sky
    if (weatherCode === 0) {
      return isDay === 1 ? (
        <Sun size={size} color={color} />
      ) : (
        <Moon size={size} color="#E6E6FA" />
      );
    }

    // 1-3: Mainly clear, partly cloudy, and overcast
    if (weatherCode && weatherCode >= 1 && weatherCode <= 3) {
      return <Cloud size={size} color="#87CEEB" />;
    }

    // 45, 48: Fog
    if (weatherCode === 45 || weatherCode === 48) {
      return <Cloud size={size} color="#B0C4DE" />;
    }

    // 51-67: Rain (various intensities)
    if (
      weatherCode &&
      ((weatherCode >= 51 && weatherCode <= 67) ||
        (weatherCode >= 80 && weatherCode <= 82))
    ) {
      return <CloudRain size={size} color="#4682B4" />;
    }

    // 71-77, 85-86: Snow
    if (
      weatherCode &&
      ((weatherCode >= 71 && weatherCode <= 77) ||
        weatherCode === 85 ||
        weatherCode === 86)
    ) {
      return <CloudSnow size={size} color="#F0F8FF" />;
    }

    // 95-99: Thunderstorm
    if (weatherCode && weatherCode >= 95 && weatherCode <= 99) {
      return <CloudRain size={size} color="#bde0fe" />;
    }

    // Por defecto basado en la hora
    return isDay === 1 ? (
      <Sun size={size} color={color} />
    ) : (
      <Moon size={size} color="#E6E6FA" />
    );
  };

  // Función para obtener el clima
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
      console.error('Error al obtener clima:', error);
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
    console.log('INICIO obtenerDireccion:', { lat, lng });

    setDireccionCoordenadas('Validando coordenadas...');

    if (!lat || !lng || lat === 'null' || lng === 'null') {
      console.log('Coordenadas inválidas:', { lat, lng });
      setDireccionCoordenadas('Coordenadas no válidas');
      return;
    }

    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);

    if (isNaN(latNum) || isNaN(lngNum)) {
      console.log('Coordenadas no son números válidos:', { lat, lng });
      setDireccionCoordenadas('Coordenadas no válidas (NaN)');
      return;
    }

    if (latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
      console.log('Coordenadas fuera de rango:', {
        lat: latNum,
        lng: lngNum,
      });
      setDireccionCoordenadas('Coordenadas fuera de rango');
      return;
    }

    try {
      const url = `http://63.251.107.133:90/nominatim/reverse.php?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;
      console.log('📡 URL de consulta:', url);

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

      console.log('Parseando JSON...');
      const data = await response.json();

      if (data && data.display_name) {
        setDireccionCoordenadas(data.display_name);
      } else if (data && data.error) {
        setDireccionCoordenadas('Error API: ' + data.error);
      } else {
        setDireccionCoordenadas('Sin dirección disponible');
      }
    } catch (error) {
      console.log('ERROR COMPLETO en obtenerDireccion:', error);

      if (error instanceof Error) {
        console.log('Error name:', error.name);
        console.log('Error message:', error.message);

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
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const obtenerUbicacion = async (): Promise<void> => {
    const tienePermiso = await solicitarPermisosUbicacion();

    if (!tienePermiso) {
      console.log('❌ UBICACIÓN: Sin permisos GPS');
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

    let locationObtained = false;

    const tryPreciseLocationAsBackup = () => {
      console.log('🔄 Intentando método de respaldo con GPS...');

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
              console.log('Obteniendo dirección en respaldo con coordenadas:', {
                lat,
                lng,
              });
              await obtenerDireccion(lat, lng);
              console.log('Dirección obtenida exitosamente en respaldo');
            } catch (dirError) {
              console.log('Error obteniendo dirección en respaldo:', dirError);
              setDireccionCoordenadas('No hay dirección disponible');
            }

            setLocation(prev => ({
              ...prev,
              loading: false,
            }));
          } catch (backupError) {
            console.log('Error en método de respaldo:', backupError);
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
          console.log('Error final GPS:', backupError.message);
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
          timeout: 10000,
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
                    } catch (error) {
                      console.log(
                        'Error actualizando dirección precisa:',
                        error,
                      );
                    }
                  } else {
                    console.log(
                      'Coordenadas precisas similares a las iniciales, no es necesario actualizar',
                    );
                  }
                } catch (error) {
                  console.log('Error procesando ubicación precisa:', error);
                }
              },
              error => {
                console.log('No se pudo mejorar la precisión:', error.message);
              },
              {
                enableHighAccuracy: true,
                timeout: 8000,
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
  };

  // Obtener ubicación  clima al cargar el componente
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
    <View style={{ flex: 1, backgroundColor: '#1a237e' }}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#1a237e"
        translucent={false}
      />
      <SafeAreaView style={homeStyles.container}>
        <View style={homeStyles.header}>
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
              {user?.username
                ? user.username.charAt(0).toUpperCase() + user.username.slice(1)
                : ''}
              {server && ` - ${server}`}
              {/* Agregar coordenadas para debug */}
              {location.latitude && location.longitude && (
                <Text style={{ fontSize: 10, color: '#fff' }}>
                  {`\nLat: ${location.latitude}, Lng: ${location.longitude}`}
                </Text>
              )}
            </Text>

            <View style={homeStyles.locationContainer}>
              <MapPin size={25} color="#FFF" />
              <View>
                <Text style={homeStyles.locationLabel}>
                  Tu ubicación actual es:{' '}
                </Text>

                <Text style={homeStyles.locationLabel}>
                   {direccionCoordenadas}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <ScrollView
  style={[
    homeStyles.content,
    { paddingBottom: bottomSpace }
  ]}
  showsVerticalScrollIndicator={false}
        >
          <Text style={homeStyles.sectionTitle}>¿Qué haremos hoy?</Text>

          {/* Grid de opciones principales */}
          <View style={homeStyles.optionsGrid}>
            <TouchableOpacity
              style={homeStyles.optionCard}
              onPress={handleNavigateToProfile}
            >
              <View style={homeStyles.optionIcon}>
                <User size={24} color="#e36414" />
              </View>
              <Text style={homeStyles.optionTitle}>Perfil</Text>
              <Text style={homeStyles.optionSubtitle}>
                Revisa tu información personal, actualiza tus datos y
                credenciales y personaliza tus marcadores.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={homeStyles.optionCard}
              onPress={handleNavigateToDevice}
            >
              <View style={homeStyles.optionIcon}>
                <Car size={24} color="#e36414" />
              </View>
              <Text style={homeStyles.optionTitle}>Unidades</Text>
              <Text style={homeStyles.optionSubtitle}>
                Rastrea tus unidades, conoce su última ubicación, velocidad,
                dirección y estado.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={homeStyles.optionCard}
              onPress={handleNavigateToReports}
            >
              <View style={homeStyles.optionIcon}>
                <BarChart3 size={24} color="#e36414" />
              </View>
              <Text style={homeStyles.optionTitle}>Reportes</Text>
              <Text style={homeStyles.optionSubtitle}>
                Genera reportes de tus unidades, general, velocidad,
                kilometraje, paradas y detalle de recorrido.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={homeStyles.optionCard}
              onPress={handleNavigateToSecurity}
            >
              <View style={homeStyles.optionIcon}>
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
            <TouchableOpacity style={homeStyles.customerCareCard}>
              <View style={homeStyles.customerCareIcon}>
                <Headphones size={24} color="#e36414" />
              </View>
              <Text style={homeStyles.customerCareTitle}>
                Atención al Cliente
              </Text>
              <Text style={homeStyles.customerCareSubtitle}>
                Conoce nuestros números telefónicos, llámanos a la central de
                monitoreo, escríbenos al Whatsapp, revisa las preguntas
                frecuentes y visualiza tutoriales útiles.
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default Home;
