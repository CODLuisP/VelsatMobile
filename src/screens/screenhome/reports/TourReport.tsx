import React, { useEffect, useState } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
  ActivityIndicator,
} from 'react-native';
import { ChevronLeft, Calendar, ChevronRight } from 'lucide-react-native';
import {
  NavigationProp,
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import MapView, { PROVIDER_DEFAULT, Marker, Polyline } from 'react-native-maps';
import { WebView } from 'react-native-webview';
import axios from 'axios';
import { styles } from '../../../styles/tourreport';
import { RootStackParamList } from '../../../../App';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  getBottomSpace,
  useNavigationMode,
} from '../../../hooks/useNavigationMode';
import NavigationBarColor from 'react-native-navigation-bar-color';
import { formatDate } from '../../../utils/converUtils';
import { useAuthStore } from '../../../store/authStore';

interface RoutePoint {
  date: string;
  time: string;
  speed: number;
  longitude: number;
  latitude: number;
}

const TourReport = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user, server } = useAuthStore();

  const route = useRoute<RouteProp<RootStackParamList, 'TourReport'>>();
  const { unit, startDate, endDate } = route.params;

  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [sidebarCompact, setSidebarCompact] = useState(false);
  const [routeData, setRouteData] = useState<RoutePoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    requestLocationPermission();
    fetchRouteData();
  }, []);

  const fetchRouteData = async () => {
    try {
      setLoading(true);
      setError(null);

      const username = user?.username;
      const plate = unit.plate;

      const formatDateForAPI = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };

      const formattedStartDate = encodeURIComponent(formatDateForAPI(startDate));
      const formattedEndDate = encodeURIComponent(formatDateForAPI(endDate));

      const url = `${server}/api/Reporting/details/${formattedStartDate}/${formattedEndDate}/${plate}/${username}`;

      console.log('API URL:', url);

      const response = await axios.get(url);

      if (response.data && response.data.result) {
        setRouteData(response.data.result);
      } else {
        setError('No se encontraron datos de ruta');
      }
    } catch (err) {
      console.error('Error fetching route data:', err);
      setError('Error al cargar los datos de la ruta');
    } finally {
      setLoading(false);
    }
  };

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
          },
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

  const getSpeedColor = (speed: number): string => {
    if (speed === 0) return '#ef4444';
    if (speed <= 10) return '#22c55e';
    if (speed <= 30) return '#eab308';
    return '#3b82f6';
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
    setSidebarCompact(false);
  };

  const toggleSidebarCompact = () => {
    setSidebarCompact(!sidebarCompact);
  };

  const leafletHTML = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <title>Reporte de Recorrido</title>
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
            .leaflet-top.leaflet-left {
                left: auto !important;
                right: 5px !important;
                top: 25px !important;
            }
            .custom-marker {
                background-color: white;
                border: 3px solid;
                border-radius: 50%;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: 12px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            }
            .custom-popup {
                font-family: Arial, sans-serif;
            }
            .popup-title {
                font-weight: bold;
                margin-bottom: 5px;
                color: #1e3a8a;
            }
            .popup-info {
                font-size: 13px;
                line-height: 1.6;
            }
        </style>
    </head>
    <body>
        <div id="map"></div>
        <script>
            var routeData = ${JSON.stringify(routeData)};
            
            if (routeData.length === 0) {
                document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:Arial;">No hay datos de ruta</div>';
            } else {
                var firstPoint = routeData[0];
                var map = L.map('map', {
                    zoomControl: true,
                    scrollWheelZoom: true,
                    doubleClickZoom: true,
                    touchZoom: true
                }).setView([firstPoint.latitude, firstPoint.longitude], 15);

                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; OpenStreetMap contributors',
                    maxZoom: 19
                }).addTo(map);

                function getSpeedColor(speed) {
                    if (speed === 0) return '#ef4444';
                    if (speed <= 10) return '#22c55e';
                    if (speed <= 30) return '#eab308';
                    return '#3b82f6';
                }

                // Dibujar línea de ruta
                var latlngs = routeData.map(point => [point.latitude, point.longitude]);
                var polyline = L.polyline(latlngs, {
                    color: '#1e3a8a',
                    weight: 4,
                    opacity: 0.7,
                    smoothFactor: 1
                }).addTo(map);

                // Agregar marcadores numerados
                routeData.forEach((point, index) => {
                    var color = getSpeedColor(point.speed);
                    var markerNumber = index + 1;
                    
                    var customIcon = L.divIcon({
                        html: '<div class="custom-marker" style="border-color:' + color + '; color:' + color + ';">' + markerNumber + '</div>',
                        iconSize: [30, 30],
                        iconAnchor: [15, 15],
                        popupAnchor: [0, -15],
                        className: 'custom-marker-icon'
                    });
                    
                    var popupContent = '<div class="custom-popup">' +
                        '<div class="popup-title">Punto ' + markerNumber + '</div>' +
                        '<div class="popup-info">' +
                        '<strong>Fecha:</strong> ' + point.date + '<br>' +
                        '<strong>Hora:</strong> ' + point.time + '<br>' +
                        '<strong>Velocidad:</strong> ' + point.speed + ' km/h' +
                        '</div>' +
                        '</div>';
                    
                    L.marker([point.latitude, point.longitude], {icon: customIcon})
                        .addTo(map)
                        .bindPopup(popupContent);
                });

                // Ajustar vista para mostrar toda la ruta
                map.fitBounds(polyline.getBounds(), {padding: [50, 50]});
            }
        </script>
    </body>
    </html>
  `;

  const renderMap = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1e3a8a" />
          <Text style={styles.loadingText}>Cargando ruta...</Text>
        </View>
      );
    }

    if (error || routeData.length === 0) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {error || 'No hay datos de ruta disponibles'}
          </Text>
        </View>
      );
    }

    if (Platform.OS === 'ios') {
      const coordinates = routeData.map(point => ({
        latitude: point.latitude,
        longitude: point.longitude,
      }));

      const initialRegion = routeData.length > 0
        ? {
            latitude: routeData[0].latitude,
            longitude: routeData[0].longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }
        : {
            latitude: -12.0464,
            longitude: -77.0428,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          };

      return (
        <MapView
          provider={PROVIDER_DEFAULT}
          style={styles.map}
          initialRegion={initialRegion}
          showsUserLocation={hasLocationPermission}
          showsMyLocationButton={hasLocationPermission}
        >
          <Polyline
            coordinates={coordinates}
            strokeColor="#1e3a8a"
            strokeWidth={4}
          />
          {routeData.map((point, index) => (
            <Marker
              key={index}
              coordinate={{
                latitude: point.latitude,
                longitude: point.longitude,
              }}
              title={`Punto ${index + 1}`}
              description={`Fecha: ${point.date} ${point.time}\nVelocidad: ${point.speed} km/h`}
              pinColor={getSpeedColor(point.speed)}
            />
          ))}
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

  const topSpace = insets.top + 5;

  return (
    <View style={[styles.container, { paddingBottom: bottomSpace }]}>
      <View style={[styles.header, { paddingTop: topSpace }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <ChevronLeft size={26} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Reporte de Recorrido</Text>
            <Text style={styles.headerSubtitle}>Unidad: {unit.plate}</Text>
            <View style={styles.headerDateContainer}>
              <Calendar size={16} color="#fff" />
              <Text style={styles.headerDate}>
                {formatDate(startDate)} - {formatDate(endDate)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.mapContainer}>{renderMap()}</View>

        {!sidebarVisible && (
          <TouchableOpacity
            style={styles.showSidebarButton}
            onPress={toggleSidebar}
          >
            <ChevronRight size={20} color="#fff" />
          </TouchableOpacity>
        )}

        {sidebarVisible && (
          <View style={[styles.sidebar, sidebarCompact && styles.sidebarCompact]}>
            <View
              style={[
                styles.sidebarHeader,
                sidebarCompact && styles.sidebarCompactHeader,
              ]}
            >
              {!sidebarCompact ? (
                <>
                  <View style={styles.sidebarHeaderContent}>
                    <Text style={styles.sidebarTitle}>LEYENDA</Text>
                  </View>
                  <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity
                      style={styles.hideSidebarButton}
                      onPress={toggleSidebar}
                    >
                      <ChevronLeft size={20} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    style={{ flex: 1 }}
                    onPress={toggleSidebarCompact}
                  >
                    <Text style={styles.sidebarCompactTitle}>L</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.hideSidebarButton}
                    onPress={toggleSidebar}
                  >
                    <ChevronLeft size={16} color="#fff" />
                  </TouchableOpacity>
                </>
              )}
            </View>

            {!sidebarCompact && (
              <View style={styles.sidebarContent}>
                <View style={styles.sidebarSection}>
                  <Text style={styles.sidebarSectionTitle}>UNIDAD</Text>
                  <Text style={styles.sidebarText}>{unit.plate}</Text>
                </View>

                <View style={styles.sidebarSection}>
                  <Text style={styles.sidebarSectionTitle}>RANGO FECHAS</Text>
                  <Text style={styles.sidebarText}>
                    {formatDate(startDate)} - {formatDate(endDate)}
                  </Text>
                </View>

                <View style={styles.sidebarSection}>
                  <Text style={styles.sidebarSectionTitle}>RANGO VELOCIDAD</Text>
                  <View style={styles.sidebarRago}>
                    <View style={styles.legendItem}>
                      <View
                        style={[styles.legendDot, { backgroundColor: '#ef4444' }]}
                      />
                      <Text style={styles.legendText}>0 km/h</Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View
                        style={[styles.legendDot, { backgroundColor: '#22c55e' }]}
                      />
                      <Text style={styles.legendText}>1 - 10 km/h</Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View
                        style={[styles.legendDot, { backgroundColor: '#eab308' }]}
                      />
                      <Text style={styles.legendText}>11 - 30 km/h</Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View
                        style={[styles.legendDot, { backgroundColor: '#3b82f6' }]}
                      />
                      <Text style={styles.legendText}>&gt; 30 km/h</Text>
                    </View>
                  </View>
                </View>

                {routeData.length > 0 && (
                  <View style={styles.sidebarSection}>
                    <Text style={styles.sidebarSectionTitle}>PUNTOS DE RUTA</Text>
                    <Text style={styles.sidebarText}>
                      Total: {routeData.length} puntos
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

export default TourReport;