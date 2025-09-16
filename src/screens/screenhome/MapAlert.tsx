import { View, Text, TouchableOpacity, Platform, PermissionsAndroid } from 'react-native';
import React, { useEffect, useState } from 'react';
import { 
  ChevronLeft, 
  Battery, 
  Zap, 
  Power, 
  AlertTriangle,
  MapPin,
  Clock,
  Smartphone
} from 'lucide-react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { WebView } from 'react-native-webview';
import { NavigationProp, useNavigation, RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../../App';
import { styles } from '../../styles/mapalert';

// Interfaz para los parámetros de la ruta
interface MapAlertRouteParams {
  notificationData: {
    id: number;
    type: string;
    title: string;
    device: string;
    timestamp: string;
    iconName: string;
  };
}

const MapAlert = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<{ params: MapAlertRouteParams }, 'params'>>();
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  
  // Obtener los datos de la notificación desde los parámetros de navegación
  const notificationData = route.params?.notificationData;

  // Coordenadas de ejemplo (deberías obtenerlas de tus datos)
  const latitude = -12.0464;
  const longitude = -77.0428;

  // ✅ FUNCIÓN PARA PEDIR PERMISOS DE UBICACIÓN
  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Permiso de Ubicación',
            message: 'Esta app necesita acceso a tu ubicación para mostrar el mapa',
            buttonNeutral: 'Preguntar después',
            buttonNegative: 'Cancelar',
            buttonPositive: 'OK',
          }
        );
        
        setHasLocationPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
      } catch (err) {
        console.warn(err);
        setHasLocationPermission(false);
      }
    } else {
      // iOS usa Apple Maps nativo
      setHasLocationPermission(true);
    }
  };

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const handleGoBack = () => {
    navigation.goBack();
  };

  // Función para obtener el icono correcto basado en el tipo
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Battery':
        return Battery;
      case 'Zap':
        return Zap;
      case 'Power':
        return Power;
      case 'AlertTriangle':
        return AlertTriangle;
      default:
        return AlertTriangle;
    }
  };

  // Función para obtener el color basado en el tipo
  const getAlertColor = (type: string) => {
    switch (type) {
      case 'battery':
        return '#fb8500'; // Amarillo para batería
      case 'motor':
        return '#10b981'; // Verde para encendido
      case 'motor-off':
        return '#6b7280'; // Gris para apagado
      case 'panic':
        return '#ef4444'; // Rojo para pánico
      default:
        return '#6b7280';
    }
  };

  const IconComponent = notificationData ? getIcon(notificationData.iconName) : AlertTriangle;
  const alertColor = notificationData ? getAlertColor(notificationData.type) : '#6b7280';

  // ✅ HTML CON LEAFLET PARA ANDROID
  const leafletHTML = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <title>Mapa de Alerta</title>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
            integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
            crossorigin=""/>
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
            integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
            crossorigin=""></script>
        <style>
            body { 
                margin: 0; 
                padding: 0; 
                overflow: hidden;
            }
            #map { 
                height: 100vh; 
                width: 100vw;
                z-index: 0;
            }
        </style>
    </head>
    <body>
        <div id="map"></div>
        <script>
            // Inicializar el mapa
            var map = L.map('map', {
                zoomControl: true,
                scrollWheelZoom: true,
                doubleClickZoom: true,
                touchZoom: true
            }).setView([${latitude}, ${longitude}], 15);

            // Agregar capa de OpenStreetMap (GRATUITO)
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 19
            }).addTo(map);

            // Crear icono personalizado con color de alerta
            var alertIcon = L.divIcon({
                html: '<div style="background-color: ${alertColor}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3);"></div>',
                iconSize: [26, 26],
                iconAnchor: [13, 13],
                className: 'custom-div-icon'
            });

            // Agregar marcador de alerta
            var marker = L.marker([${latitude}, ${longitude}], {icon: alertIcon}).addTo(map);
            
            // Agregar popup con información
            marker.bindPopup(\`
                <div style="text-align: center; font-family: Arial, sans-serif;">
                    <h3 style="margin: 5px 0; color: ${alertColor};">${notificationData?.title || 'Alerta'}</h3>
                    <p style="margin: 3px 0;"><strong>Dispositivo:</strong> ${notificationData?.device || 'Sin información'}</p>
                    <p style="margin: 3px 0;"><strong>ID:</strong> ${notificationData?.id || 'N/A'}</p>
                    <p style="margin: 3px 0;"><strong>Fecha:</strong> ${notificationData?.timestamp || 'Sin fecha'}</p>
                </div>
            \`).openPopup();

            // Agregar ubicación del usuario si hay permisos
            ${hasLocationPermission ? `
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(position) {
                    var userLat = position.coords.latitude;
                    var userLng = position.coords.longitude;
                    
                    var userIcon = L.divIcon({
                        html: '<div style="background-color: #3b82f6; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(59,130,246,0.5);"></div>',
                        iconSize: [16, 16],
                        iconAnchor: [8, 8],
                        className: 'user-location-icon'
                    });
                    
                    L.marker([userLat, userLng], {icon: userIcon})
                        .addTo(map)
                        .bindPopup('<div style="text-align: center;"><strong>Tu ubicación</strong></div>');
                }, function(error) {
                    console.log('Error obteniendo ubicación:', error);
                });
            }` : ''}

            // Evitar scroll en el contenedor padre
            map.on('focus', function() { 
                map.scrollWheelZoom.enable(); 
            });
            map.on('blur', function() { 
                map.scrollWheelZoom.disable(); 
            });
        </script>
    </body>
    </html>
  `;

  // ✅ FUNCIÓN PARA RENDERIZAR EL MAPA SEGÚN LA PLATAFORMA
  const renderMap = () => {
    if (Platform.OS === 'ios') {
      // ✅ APPLE MAPS PARA iOS
      return (
        <MapView
          provider={PROVIDER_DEFAULT} // Apple Maps
          style={styles.map}
          initialRegion={{
            latitude: latitude,
            longitude: longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation={hasLocationPermission}
          showsMyLocationButton={hasLocationPermission}
        >
          <Marker
            coordinate={{
              latitude: latitude,
              longitude: longitude,
            }}
            title={notificationData?.title || 'Alerta'}
            description={`${notificationData?.device || 'Dispositivo'} - ${notificationData?.timestamp || ''}`}
            pinColor={alertColor}
          />
        </MapView>
      );
    } else {
      // ✅ LEAFLET PARA ANDROID
      return (
        <WebView
          source={{ html: leafletHTML }}
          style={styles.map}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
          mixedContentMode="compatibility"
          geolocationEnabled={hasLocationPermission}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.warn('WebView error: ', nativeEvent);
          }}
        />
      );
    }
  };

  if (!notificationData) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <ChevronLeft size={26} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalle de Alerta</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No se encontraron datos de la alerta</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <ChevronLeft size={26} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalle de Alerta</Text>
        </View>
        
        {/* Información de la alerta en el header */}
        <View style={styles.headerAlertInfo}>
          <View style={styles.headerAlertRow}>
            <View style={[styles.headerIconContainer, { backgroundColor: alertColor }]}>
              <IconComponent size={20} color="#fff" />
            </View>
            <View style={styles.headerAlertDetails}>
              <Text style={styles.headerAlertTitle}>{notificationData.title}</Text>
              <Text style={styles.headerAlertSubtitle}>
                {notificationData.device} • ID: {notificationData.id}
              </Text>
              <Text style={styles.headerAlertTimestamp}>{notificationData.timestamp}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        {/* Map Container */}
        <View style={styles.mapContainer}>
          {renderMap()}
        </View>
      </View>
    </View>
  );
};

export default MapAlert;