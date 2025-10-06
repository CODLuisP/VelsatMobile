import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import {
  ChevronLeft,
  Battery,
  Zap,
  Power,
  AlertTriangle,
} from 'lucide-react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { WebView } from 'react-native-webview';
import {
  NavigationProp,
  useNavigation,
  RouteProp,
  useRoute,
  useFocusEffect,
} from '@react-navigation/native';
import { RootStackParamList } from '../../../../App';
import { styles } from '../../../styles/mapalert';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  getBottomSpace,
  useNavigationMode,
} from '../../../hooks/useNavigationMode';
import NavigationBarColor from 'react-native-navigation-bar-color';

interface MapAlertRouteParams {
  notificationData: {
    id: number;
    type: string;
    title: string;
    device: string;
    timestamp: string;
    iconName: string;
    accountID: string;
    deviceID: string;
    unixTimestamp: number;
    statusCode: number;
    latitude: number;
    longitude: number;
    speedKPH: number;
  };
}

const MapEvent = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route =
    useRoute<RouteProp<{ params: MapAlertRouteParams }, 'params'>>();
  const [hasLocationPermission, setHasLocationPermission] = useState(false);

  const notificationData = route.params?.notificationData;

  // Usar las coordenadas reales del evento
  const latitude = notificationData?.latitude || -12.0464;
  const longitude = notificationData?.longitude || -77.0428;

  const insets = useSafeAreaInsets();
  const navigationDetection = useNavigationMode();
  const bottomSpace = getBottomSpace(
    insets,
    navigationDetection.hasNavigationBar,
  );

  useFocusEffect(
    React.useCallback(() => {
      NavigationBarColor('#1e3a8a', false);
    }, []),
  );

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Permiso de Ubicación',
            message:
              'Esta app necesita acceso a tu ubicación para mostrar el mapa',
            buttonNeutral: 'Preguntar después',
            buttonNegative: 'Cancelar',
            buttonPositive: 'OK',
          },
        );

        setHasLocationPermission(
          granted === PermissionsAndroid.RESULTS.GRANTED,
        );
      } catch (err) {
        console.warn(err);
        setHasLocationPermission(false);
      }
    } else {
      setHasLocationPermission(true);
    }
  };

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const handleGoBack = () => {
    navigation.goBack();
  };

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

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'battery':
        return '#fb8500';
      case 'motor':
        return '#10b981';
      case 'motor-off':
        return '#6b7280';
      case 'panic':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const IconComponent = notificationData
    ? getIcon(notificationData.iconName)
    : AlertTriangle;
  const alertColor = notificationData
    ? getAlertColor(notificationData.type)
    : '#6b7280';

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
            var map = L.map('map', {
                zoomControl: true,
                scrollWheelZoom: true,
                doubleClickZoom: true,
                touchZoom: true
            }).setView([${latitude}, ${longitude}], 15);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 19
            }).addTo(map);

            // Crear icono personalizado con la imagen
            var alertIcon = L.icon({
                iconUrl: 'https://res.cloudinary.com/dyc4ik1ko/image/upload/v1759594553/UnidadK_v4eru0.png',
                iconSize: [60, 40],
                iconAnchor: [20, 40],
                popupAnchor: [15, -40]
            });

            var marker = L.marker([${latitude}, ${longitude}], {icon: alertIcon}).addTo(map);
            
            marker.bindPopup(\`
                <div style="text-align: center; font-family: Arial, sans-serif;">
                    <h3 style="margin: 5px 0; color: ${alertColor};">${
    notificationData?.title || 'Alerta'
  }</h3>
                    <p style="margin: 3px 0;"><strong>Dispositivo:</strong> ${
                      notificationData?.device || 'Sin información'
                    }</p>
                    <p style="margin: 3px 0;"><strong>Velocidad:</strong> ${
                      notificationData?.speedKPH?.toFixed(2) || '0'
                    } km/h</p>
                    <p style="margin: 3px 0;"><strong>Coordenadas:</strong> ${latitude.toFixed(
                      6,
                    )}, ${longitude.toFixed(6)}</p>
                    <p style="margin: 3px 0;"><strong>Fecha:</strong> ${
                      notificationData?.timestamp || 'Sin fecha'
                    }</p>
                </div>
            \`).openPopup();

            ${
              hasLocationPermission
                ? `
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
            }`
                : ''
            }

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

  const renderMap = () => {
    if (Platform.OS === 'ios') {
      return (
        <MapView
          provider={PROVIDER_DEFAULT}
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
            description={`${notificationData?.device || 'Dispositivo'} - ${
              notificationData?.timestamp || ''
            }`}
            image={{
              uri: 'https://res.cloudinary.com/dyc4ik1ko/image/upload/v1759594553/UnidadK_v4eru0.png',
            }}
          />
        </MapView>
      );
    } else {
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
          onError={syntheticEvent => {
            const { nativeEvent } = syntheticEvent;
            console.warn('WebView error: ', nativeEvent);
          }}
        />
      );
    }
  };

  const topSpace = insets.top + 15;

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
          <Text style={styles.errorText}>
            No se encontraron datos de la alerta
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingBottom: bottomSpace }]}>
      <View style={[styles.header, { paddingTop: topSpace }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <ChevronLeft size={26} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalle de Alerta</Text>
        </View>
        
        <View style={styles.headerAlertInfo}>
          <View style={styles.headerAlertRow}>
            <View
              style={[
                styles.headerIconContainer,
                { backgroundColor: alertColor },
              ]}
            >
              <IconComponent size={20} color="#fff" />
            </View>
            <View style={styles.headerAlertDetails}>
              <Text style={styles.headerAlertTitle}>
                {notificationData.title}
              </Text>
              <Text style={styles.headerAlertSubtitle}>
                {notificationData.device} 
              </Text>
           
            </View>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.mapContainer}>{renderMap()}</View>
      </View>
    </View>
  );
};

export default MapEvent;