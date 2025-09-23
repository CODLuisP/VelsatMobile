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

const obtenerDireccion = async (lat: string, lng: string): Promise<string> => {
  try {
    console.log('🔍 GEOCODING: Iniciando con coordenadas:', { lat, lng });
    
    const url = `http://63.251.107.133:90/nominatim/reverse.php?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;
    console.log('🔍 GEOCODING: URL:', url);
    
    const response = await fetch(url);
    console.log('🔍 GEOCODING: Response status:', response.status);
    console.log('🔍 GEOCODING: Response ok:', response.ok);
    
    const data = await response.json();
    console.log('🔍 GEOCODING: Data recibida:', JSON.stringify(data, null, 2));

    // Verificar si hay un error explícito en la respuesta
    if (data.error) {
      console.log('❌ GEOCODING: Error en respuesta:', data.error);
      return 'No hay dirección disponible';
    }

    // Verificar si existe display_name
    if (data.display_name && data.display_name.trim() !== '') {
      console.log('✅ GEOCODING: Display name encontrado:', data.display_name);
      return data.display_name.trim();
    }

    // Si no hay display_name pero hay address, construir dirección
    if (data.address) {
      console.log('🔧 GEOCODING: No hay display_name, construyendo desde address');
      const address = data.address;
      let direccionCustom = '';
      
      if (address.road) direccionCustom += address.road;
      if (address.city) direccionCustom += (direccionCustom ? ', ' : '') + address.city;
      if (address.region) direccionCustom += (direccionCustom ? ', ' : '') + address.region;
      if (address.country) direccionCustom += (direccionCustom ? ', ' : '') + address.country;
      
      if (direccionCustom.trim() !== '') {
        console.log('✅ GEOCODING: Dirección construida:', direccionCustom);
        return direccionCustom;
      }
    }

    // Si llegamos aquí, no hay data útil
    console.log('❌ GEOCODING: No se pudo obtener dirección válida');
    return 'No hay dirección disponible';

  } catch (error) {
    console.log('❌ GEOCODING: Error de red/parsing:', error);
    return 'No hay dirección disponible';
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


  const obtenerUbicacion = async (): Promise<void> => {
  const tienePermiso = await solicitarPermisosUbicacion();

  if (!tienePermiso) {
    console.log('❌ UBICACIÓN: Sin permisos GPS');
    setLocation({
      latitude: null,
      longitude: null,
      address: 'Permiso de ubicación denegado',
      loading: false,
      error: 'Permiso de ubicación denegado'
    });
    setWeather({
      temperature: null,
      weatherCode: null,
      isDay: 1,
      loading: false,
      error: null
    });
    return;
  }

  console.log('🔍 UBICACIÓN: Iniciando obtención GPS optimizada...');
  
  // Variable para controlar si ya obtuvimos ubicación
  let locationObtained = false;

  // PRIMERA ESTRATEGIA: GPS Rápido con caché
  console.log('🚀 Intentando GPS rápido...');
  
  const watchId = Geolocation.watchPosition(
    async (position) => {
      if (locationObtained) {
        Geolocation.clearWatch(watchId);
        return;
      }
      
      locationObtained = true;
      Geolocation.clearWatch(watchId);
      
      try {
        console.log('✅ GPS: Posición obtenida exitosamente');
        const { latitude, longitude } = position.coords;
        const lat = latitude.toFixed(6);
        const lng = longitude.toFixed(6);

        console.log('📍 Coordenadas:', { lat, lng });

        // Actualizar inmediatamente con coordenadas
        setLocation({
          latitude: lat,
          longitude: lng,
          address: 'Obteniendo dirección...',
          loading: true,
          error: null
        });

        // Obtener clima inmediatamente
        obtenerClima(lat, lng);

        // Obtener dirección en segundo plano
        try {
          const direccion = await obtenerDireccion(lat, lng);
          setLocation(prev => ({
            ...prev,
            address: direccion,
            loading: false
          }));
        } catch (dirError) {
          console.log('⚠️ Error obteniendo dirección:', dirError);
          setLocation(prev => ({
            ...prev,
            address: 'No hay dirección disponible',
            loading: false
          }));
        }

      } catch (error) {
        console.log('❌ Error procesando ubicación:', error);
        setLocation({
          latitude: null,
          longitude: null,
          address: 'Error al procesar ubicación',
          loading: false,
          error: 'Error al procesar ubicación'
        });
        setWeather({
          temperature: null,
          weatherCode: null,
          isDay: 1,
          loading: false,
          error: null
        });
      }
    },
    (error) => {
      console.log('❌ GPS Watch Error:', error.code, error.message);
      
      if (!locationObtained) {
        // Si watchPosition falla, intentar getCurrentPosition como respaldo
        console.log('🔄 Intentando método de respaldo...');
        
        Geolocation.getCurrentPosition(
          async (position) => {
            if (locationObtained) return;
            
            locationObtained = true;
            
            try {
              const { latitude, longitude } = position.coords;
              const lat = latitude.toFixed(6);
              const lng = longitude.toFixed(6);

              setLocation({
                latitude: lat,
                longitude: lng,
                address: 'Obteniendo dirección...',
                loading: true,
                error: null
              });

              obtenerClima(lat, lng);

              const direccion = await obtenerDireccion(lat, lng);
              setLocation(prev => ({
                ...prev,
                address: direccion,
                loading: false
              }));

            } catch (backupError) {
              console.log('❌ Error en método de respaldo:', backupError);
              setLocation({
                latitude: null,
                longitude: null,
                address: 'Error al obtener ubicación GPS',
                loading: false,
                error: 'Error al obtener ubicación GPS'
              });
              setWeather({
                temperature: null,
                weatherCode: null,
                isDay: 1,
                loading: false,
                error: null
              });
            }
          },
          (backupError) => {
            console.log('❌ Error final GPS:', backupError);
            if (!locationObtained) {
              locationObtained = true;
              setLocation({
                latitude: null,
                longitude: null,
                address: 'Error al obtener ubicación GPS',
                loading: false,
                error: 'Error al obtener ubicación GPS'
              });
              setWeather({
                temperature: null,
                weatherCode: null,
                isDay: 1,
                loading: false,
                error: null
              });
            }
          },
          {
            enableHighAccuracy: false, // Usar red/WiFi para ser más rápido
            timeout: 8000,
            maximumAge: 600000 // 10 minutos
          }
        );
      }
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000, // 5 minutos
      distanceFilter: 0 // Obtener la primera lectura disponible
    }
  );

  // Timeout de seguridad para evitar que se quede colgado
  setTimeout(() => {
    if (!locationObtained) {
      console.log('⏰ Timeout de seguridad activado');
      locationObtained = true;
      Geolocation.clearWatch(watchId);
      
      setLocation({
        latitude: null,
        longitude: null,
        address: 'Tiempo de espera agotado para GPS',
        loading: false,
        error: 'Tiempo de espera agotado'
      });
      setWeather({
        temperature: null,
        weatherCode: null,
        isDay: 1,
        loading: false,
        error: null
      });
    }
  }, 15000); // 15 segundos máximo
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

  if (location.error) {
    return <Text style={homeStyles.locationText}>{location.address || 'Sin ubicación'}</Text>;
  }

  return (
    <Text style={homeStyles.locationText}>
      {location.address || 'No hay dirección disponible'}
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