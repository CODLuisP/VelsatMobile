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
} from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import Geolocation from '@react-native-community/geolocation';
import { useAuthStore } from '../store/authStore';
import { homeStyles } from '../styles/home';
import { RootStackParamList } from '../../App'; 

import { SafeAreaView } from 'react-native-safe-area-context';
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
  LogOut
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
  address: string | null;
  loading: boolean;
  error: string | null;
}

interface CoordinatesType {
  latitude: string;
  longitude: string;
  displayName: string;
}

// Constante para las coordenadas de Lima por defecto
const LIMA_COORDINATES: CoordinatesType = {
  latitude: '-12.046374',
  longitude: '-77.042793',
  displayName: 'Lima, Perú'
};

const Home: React.FC = () => {
  const { user, logout, server } = useAuthStore();
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [weather, setWeather] = useState<WeatherState>({
    temperature: null,
    weatherCode: null,
    isDay: null,
    loading: true,
    error: null
  });
  const [location, setLocation] = useState<LocationState>({
    latitude: null,
    longitude: null,
    address: null,
    loading: true,
    error: null
  });

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

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
  const obtenerIconoClima = (weatherCode: number | null, isDay: number | null, temperature: number | null): React.ReactElement => {
    const size = 20;
    const color = "#FFD700";

    // Si no hay datos, usar sol por defecto
    if (!weatherCode && !temperature) {
      return <Sun size={size} color={color} />;
    }

    // WMO Weather interpretation codes
    // 0: Clear sky
    if (weatherCode === 0) {
      return isDay === 1 ? <Sun size={size} color={color} /> : <Moon size={size} color="#E6E6FA" />;
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
    if (weatherCode && ((weatherCode >= 51 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 82))) {
      return <CloudRain size={size} color="#4682B4" />;
    }

    // 71-77, 85-86: Snow
    if (weatherCode && ((weatherCode >= 71 && weatherCode <= 77) || weatherCode === 85 || weatherCode === 86)) {
      return <CloudSnow size={size} color="#F0F8FF" />;
    }

    // 95-99: Thunderstorm
    if (weatherCode && weatherCode >= 95 && weatherCode <= 99) {
      return <CloudRain size={size} color="#2F4F4F" />;
    }

    // Por defecto basado en la hora
    return isDay === 1 ? <Sun size={size} color={color} /> : <Moon size={size} color="#E6E6FA" />;
  };

  // Función para obtener el clima
  const obtenerClima = async (lat: string, lon: string): Promise<void> => {
    try {
      setWeather(prev => ({ ...prev, loading: true }));

      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=celsius`
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
        error: null
      });
    } catch (error) {
      console.error('Error al obtener clima:', error);
      setWeather({
        temperature: 25, // Temperatura por defecto
        weatherCode: 0, // Cielo despejado por defecto
        isDay: 1,
        loading: false,
        error: 'Error al obtener clima'
      });
    }
  };

  // Función para obtener dirección usando reverse geocoding
const obtenerDireccion = async (lat: string, lng: string): Promise<string> => {
  try {
    const response = await fetch(
      `http://63.251.107.133:90/nominatim/reverse.php?lat=${lat}&lon=${lng}&format=json&addressdetails=1`
    );
    const data = await response.json();

    if (data.error) {
      console.log('Error en geocoding:', data.error);
      return LIMA_COORDINATES.displayName;
    }

    // CAMBIO: Usar display_name en lugar de address29
    if (data.display_name) {
      return data.display_name;
    }

    // Fallback a Lima, Perú si no hay display_name
    return LIMA_COORDINATES.displayName;
  } catch (error) {
    console.log('Error al obtener dirección:', error);
    return LIMA_COORDINATES.displayName;
  }
};

  // Función para solicitar permisos en Android
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
          }
        );

        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true; // iOS maneja permisos automáticamente
  };

  // Función para obtener ubicación
  const obtenerUbicacion = async (): Promise<void> => {
    const tienePermiso = await solicitarPermisosUbicacion();

    if (!tienePermiso) {
      // Sin permisos, usar coordenadas de Lima
      setLocation({
        latitude: LIMA_COORDINATES.latitude,
        longitude: LIMA_COORDINATES.longitude,
        address: LIMA_COORDINATES.displayName,
        loading: false,
        error: 'Permiso de ubicación denegado'
      });

      // Obtener clima de Lima
      obtenerClima(LIMA_COORDINATES.latitude, LIMA_COORDINATES.longitude);
      return;
    }

    Geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const lat = latitude.toFixed(6);
        const lng = longitude.toFixed(6);

        // Obtener la dirección
        const direccion = await obtenerDireccion(lat, lng);

        setLocation({
          latitude: lat,
          longitude: lng,
          address: direccion,
          loading: false,
          error: null
        });

        // Obtener clima con coordenadas actuales
        obtenerClima(lat, lng);
      },
      (error) => {
        console.log('Error GPS:', error);

        // Error de GPS, usar coordenadas de Lima
        setLocation({
          latitude: LIMA_COORDINATES.latitude,
          longitude: LIMA_COORDINATES.longitude,
          address: LIMA_COORDINATES.displayName,
          loading: false,
          error: 'Error al obtener ubicación'
        });

        // Obtener clima de Lima
        obtenerClima(LIMA_COORDINATES.latitude, LIMA_COORDINATES.longitude);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000
      }
    );
  };

  // Obtener ubicación y clima al cargar el componente
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

  // Función para renderizar el texto de ubicación
  const renderLocationText = (): React.ReactElement => {
    if (location.loading) {
      return <Text style={homeStyles.locationText}>Obteniendo ubicación...</Text>;
    }

    // Mostrar la dirección obtenida o Lima por defecto
    return (
      <Text style={homeStyles.locationText}>
        {location.address || LIMA_COORDINATES.displayName}
      </Text>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#1a237e' }}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#1a237e"
        translucent={false}
      />
      <SafeAreaView style={homeStyles.container}>
        {/* Header con efecto satelite */}
        <View style={homeStyles.header}>
          {/* Imagen de fondo con transparencia azul */}
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
                      {obtenerIconoClima(weather.weatherCode, weather.isDay, weather.temperature)}
                      <Text style={homeStyles.temperature}>
                        {weather.temperature || '--'}°
                      </Text>
                    </>
                  )}
                </View>
              </View>
              <View style={homeStyles.profileContainer}>
                <TouchableOpacity style={homeStyles.profileImage} onPress={toggleDropdown}>
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
  {user?.username ? user.username.charAt(0).toUpperCase() + user.username.slice(1) : ''}
  {server && ` - ${server}`}
  {/* Agregar coordenadas para debug */}
  {location.latitude && location.longitude && (
    <Text style={{fontSize: 10, color: '#fff'}}>
      {`\nLat: ${location.latitude}, Lng: ${location.longitude}`}
    </Text>
  )}
</Text>

            <View style={homeStyles.locationContainer}>
              <MapPin size={25} color="#FFF" />
              <View>
                <Text style={homeStyles.locationLabel}>Tu ubicación actual es:</Text>
                {renderLocationText()}
              </View>
            </View>
          </View>
        </View>

        <ScrollView style={homeStyles.content} showsVerticalScrollIndicator={false}>
          <Text style={homeStyles.sectionTitle}>¿Qué haremos hoy?</Text>

          {/* Grid de opciones principales */}
          <View style={homeStyles.optionsGrid}>
            <TouchableOpacity style={homeStyles.optionCard} onPress={handleNavigateToProfile}>
              <View style={homeStyles.optionIcon}>
                <User size={24} color="#e36414" />

              </View>
              <Text style={homeStyles.optionTitle}>Perfil</Text>
              <Text style={homeStyles.optionSubtitle}>
                Revisa tu información personal, actualiza tus datos y credenciales y personaliza tus marcadores.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={homeStyles.optionCard} onPress={handleNavigateToDevice}>
              <View style={homeStyles.optionIcon}>
                <Car size={24} color="#e36414" />
              </View>
              <Text style={homeStyles.optionTitle}>Unidades</Text>
              <Text style={homeStyles.optionSubtitle}>
                Rastrea tus unidades, conoce su última ubicación, velocidad, dirección y estado.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={homeStyles.optionCard} onPress={handleNavigateToReports}>
              <View style={homeStyles.optionIcon}>
                <BarChart3 size={24} color="#e36414" />
              </View>
              <Text style={homeStyles.optionTitle}>Reportes</Text>
              <Text style={homeStyles.optionSubtitle}>
                Genera reportes de tus unidades, general, velocidad, kilometraje, paradas y detalle de recorrido.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={homeStyles.optionCard} onPress={handleNavigateToSecurity}>
              <View style={homeStyles.optionIcon}>
                <Shield size={24} color="#e36414" />
              </View>
              <Text style={homeStyles.optionTitle}>Seguridad</Text>
              <Text style={homeStyles.optionSubtitle}>
                Activa la autenticación con datos biométricos y habilita o deshabilita las notificaciones.
              </Text>
            </TouchableOpacity>
          </View>

          <View style={homeStyles.customerCareContainer}>
            <TouchableOpacity style={homeStyles.customerCareCard}>
              <View style={homeStyles.customerCareIcon}>
                <Headphones size={24} color="#e36414" />
              </View>
              <Text style={homeStyles.customerCareTitle}>Atención al Cliente</Text>
              <Text style={homeStyles.customerCareSubtitle}>
                Conoce nuestros números telefónicos, llámanos a la central de monitoreo, escríbenos al Whatsapp, revisa las preguntas frecuentes y visualiza tutoriales útiles.
              </Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default Home;