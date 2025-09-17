import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Platform, PermissionsAndroid, Animated, Image, ScrollView } from 'react-native';
import { 
  ChevronLeft, 
  ChevronUp,
  ChevronDown,
  Navigation,
  Clock,
  Zap,
  MapPin,
  Signal,
  Eye,
  Forward
} from 'lucide-react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { WebView } from 'react-native-webview';
import { NavigationProp, useNavigation, RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../../../App';
import { styles } from '../../../styles/detaildevice';

// Tipo para los parámetros de la ruta
type DetailDeviceRouteProp = RouteProp<RootStackParamList, 'DetailDevice'>;

const DetailDevice = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<DetailDeviceRouteProp>();
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [isInfoExpanded, setIsInfoExpanded] = useState(true);
  const [animatedHeight] = useState(new Animated.Value(1));

  // Extraer los datos del dispositivo desde los parámetros de la ruta
  const { device } = route.params;

  // Coordenadas de Lima, Perú (ejemplo)
  const latitude = -12.0464;
  const longitude = -77.0428;

  // Tu API Key de Google Maps (reemplaza con tu clave real)
  const GOOGLE_MAPS_API_KEY = 'AIzaSyDjSwibBACnjf7AZXR2sj1yBUEMGq2o1ho';

  // URL para Street View Static API
  const getStreetViewUrl = () => {
    return `https://maps.googleapis.com/maps/api/streetview?size=300x150&location=${latitude},${longitude}&heading=0&pitch=0&key=${GOOGLE_MAPS_API_KEY}`;
  };

  // Función para pedir permisos de ubicación
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
      setHasLocationPermission(true);
    }
  };

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const toggleInfo = () => {
    const toValue = isInfoExpanded ? 0 : 1;
    
    Animated.timing(animatedHeight, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
    
    setIsInfoExpanded(!isInfoExpanded);
  };

  // HTML con Leaflet para Android
  const leafletHTML = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <title>Ubicación del Vehículo</title>
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
            }).setView([${latitude}, ${longitude}], 16);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 19
            }).addTo(map);

            var vehicleIcon = L.divIcon({
                html: '<div style="background: linear-gradient(135deg, #3b82f6, #1e40af); width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 10px rgba(59,130,246,0.4); display: flex; align-items: center; justify-content: center;"><div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div></div>',
                iconSize: [30, 30],
                iconAnchor: [15, 15],
                className: 'vehicle-icon'
            });

            var marker = L.marker([${latitude}, ${longitude}], {icon: vehicleIcon}).addTo(map);
            
            marker.bindPopup(\`
                <div style="text-align: center; font-family: Arial, sans-serif; min-width: 200px;">
                    <h3 style="margin: 8px 0; color: #1e40af; font-size: 16px;">${device.name}</h3>
                    <div style="display: flex; flex-direction: column; gap: 6px; text-align: left;">
                        <div style="display: flex; justify-content: space-between;">
                            <span style="font-weight: 600; color: #374151;">Estado:</span>
                            <span style="color: ${device.status === 'Movimiento' ? '#10b981' : '#ef4444'}; font-weight: 600;">${device.status}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="font-weight: 600; color: #374151;">Velocidad:</span>
                            <span style="color: #6b7280;">${device.speed} Km/h</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="font-weight: 600; color: #374151;">Conexión:</span>
                            <span style="color: ${device.isOnline ? '#10b981' : '#ef4444'}; font-weight: 600;">${device.isOnline ? 'Online' : 'Offline'}</span>
                        </div>
                        <div style="border-top: 1px solid #e5e7eb; padding-top: 6px; margin-top: 4px;">
                            <div style="font-size: 12px; color: #6b7280;">ID: ${device.id}</div>
                        </div>
                    </div>
                </div>
            \`).openPopup();

            ${hasLocationPermission ? `
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(position) {
                    var userLat = position.coords.latitude;
                    var userLng = position.coords.longitude;
                    
                    var userIcon = L.divIcon({
                        html: '<div style="background-color: #10b981; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 8px rgba(16,185,129,0.5);"></div>',
                        iconSize: [18, 18],
                        iconAnchor: [9, 9],
                        className: 'user-location-icon'
                    });
                    
                    L.marker([userLat, userLng], {icon: userIcon})
                        .addTo(map)
                        .bindPopup('<div style="text-align: center; font-family: Arial, sans-serif;"><strong>Tu ubicación</strong></div>');
                }, function(error) {
                    console.log('Error obteniendo ubicación:', error);
                });
            }` : ''}

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

  // Función para renderizar el mapa según la plataforma
  const renderMap = () => {
    if (Platform.OS === 'ios') {
      return (
        <MapView
          provider={PROVIDER_DEFAULT}
          style={styles.map}
          initialRegion={{
            latitude: latitude,
            longitude: longitude,
            latitudeDelta: 0.008,
            longitudeDelta: 0.008,
          }}
          showsUserLocation={hasLocationPermission}
          showsMyLocationButton={hasLocationPermission}
        >
          <Marker
            coordinate={{
              latitude: latitude,
              longitude: longitude,
            }}
            title={device.name}
            description={`${device.status} - ${device.speed} Km/h`}
            pinColor={device.isOnline ? '#3b82f6' : '#6b7280'}
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
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.warn('WebView error: ', nativeEvent);
          }}
        />
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Map Container */}
      <View style={styles.mapContainer}>
        {renderMap()}
        
        {/* Floating Back Button */}
        <TouchableOpacity style={styles.floatingBackButton} onPress={handleGoBack}>
          <ChevronLeft size={26} color="#1f2937" />
        </TouchableOpacity>
      </View>

      {/* Device Info Panel */}
      <Animated.View 
        style={[
          styles.infoPanel,
          {
            height: animatedHeight.interpolate({
              inputRange: [0, 1],
              outputRange: [60, 300],
            }),
          },
        ]}
      >
        {/* Panel Header */}
        <TouchableOpacity style={styles.panelHeader} onPress={toggleInfo}>
          <View style={styles.panelHeaderContent}>
            <View style={styles.deviceHeaderInfo}>
              <Text style={styles.deviceName}>{device.name}</Text>
              <View style={styles.deviceStatusRow}>
                <View style={[styles.statusDot, { backgroundColor: device.isOnline ? '#10b981' : '#ef4444' }]} />
                <Text style={styles.deviceId}>ID: {device.id}</Text>
                <Text style={[styles.onlineStatus, { color: device.isOnline ? '#10b981' : '#ef4444' }]}>
                  {device.isOnline ? 'Online' : 'Offline'}
                </Text>
              </View>
            </View>
            {isInfoExpanded ? <ChevronDown size={24} color="#ffffffff" /> : <ChevronUp size={24} color="#ffffffff" />}
          </View>
        </TouchableOpacity>

        {/* Panel Content */}
        <Animated.View 
          style={[
            styles.panelContent,
            {
              opacity: animatedHeight.interpolate({
  inputRange: [0, 1],
  outputRange: [1, 1],
}),
backgroundColor: animatedHeight.interpolate({
  inputRange: [0, 1],
  outputRange: ['#1e3a8a', '#ffffff'],
}),
            },
          ]}
        >
          <ScrollView 
            showsVerticalScrollIndicator={false}
            style={styles.scrollContent}
          >
            {/* Status and Speed Row */}
            <View style={styles.statusRow}>
              <View style={styles.statusItem}>
                <Navigation size={16} color={device.status === 'Movimiento' ? '#10b981' : '#ef4444'} />
                <Text style={[styles.statusText, { color: device.status === 'Movimiento' ? '#10b981' : '#ef4444' }]}>
                  {device.status}
                </Text>
                <Text style={styles.speedText}>({device.speed} Km/h)</Text>
              </View>
              <View style={styles.dateContainer}>
                <Clock size={14} color="#6b7280" />
                <View>
                  <Text style={styles.dateText}>16/09/2025 16:45:34</Text>
                  <Text style={styles.lastReportText}>Último reporte</Text>
                </View>
              </View>
            </View>

            {/* Distance Info */}
            <View style={styles.distanceInfo}>
              <MapPin size={18} color="#6b7280" />
              <Text style={styles.distanceText}>30 km manejados el día de hoy</Text>
            </View>
            <Text style={styles.startTimeText}>Empezó el día a las 02:55:53 PM</Text>

            {/* Street View Preview */}
            <View style={styles.streetViewRow}>
              <View style={styles.streetViewContainer}>
                <Image 
                  source={{ uri: getStreetViewUrl() }}
                  style={styles.streetViewImage}
                  resizeMode="cover"
                />
                <View style={styles.streetViewOverlay}>
                  <Eye size={12} color="#fff" />
                  <Text style={styles.streetViewText}>View</Text>
                </View>
              </View>
              <View style={styles.locationInfoRight}>
                <Text style={styles.locationTitle}>Jr. Zoilo León 391, Lima, Perú</Text>
                <Text style={styles.locationSubtitle}>Ubicación actual</Text>
                <TouchableOpacity style={styles.locationButton}>
                      <Forward size={15} color="#fff"/>

                </TouchableOpacity>
              </View>
            </View>

            {/* Ver más button */}
            <TouchableOpacity style={styles.verMasButton}>
              <Text style={styles.verMasText}>Ver más</Text>
              <Text style={styles.arrowText}>→</Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

export default DetailDevice;