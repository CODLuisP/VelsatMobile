import React, { useEffect, useState, useRef } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Alert,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import {
  ChevronLeft,
  Calendar,
  ChevronRight,
  MapPin,
} from 'lucide-react-native';
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
import LinearGradient from 'react-native-linear-gradient';
import ModalAlert from '../../../components/ModalAlert';

interface RoutePoint {
  date: string;
  time: string;
  speed: number;
  longitude: number;
  latitude: number;
}

// Marcador simple y optimizado - sin animaciones pesadas
const SimpleMarker = React.memo(
  ({ children }: { children: React.ReactNode }) => {
    return <View>{children}</View>;
  },
);

const TourReport = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user, server } = useAuthStore();

  const route = useRoute<RouteProp<RootStackParamList, 'TourReport'>>();
  const { unit, startDate, endDate } = route.params;

  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [sidebarCompact, setSidebarCompact] = useState(false);
  const [routeData, setRouteData] = useState<RoutePoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<string>('');
  const [focusedPoint, setFocusedPoint] = useState<number | null>(null);

  const mapRef = useRef<MapView>(null);
  const webViewRef = useRef<WebView>(null);

  const insets = useSafeAreaInsets();
  const navigationDetection = useNavigationMode();
  const bottomSpace = getBottomSpace(
    insets,
    navigationDetection.hasNavigationBar,
  );

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

  useFocusEffect(
    React.useCallback(() => {
      NavigationBarColor('#00296b', false);
    }, []),
  );

  useEffect(() => {
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

      const formattedStartDate = encodeURIComponent(
        formatDateForAPI(startDate),
      );
      const formattedEndDate = encodeURIComponent(formatDateForAPI(endDate));

      const url = `${server}/api/Reporting/details/${formattedStartDate}/${formattedEndDate}/${plate}/${username}`;


      const response = await axios.get(url);

      if (response.data && response.data.result) {
        setRouteData(response.data.result);
      } else {
        setError('No se encontraron datos de ruta');
      }
    } catch (err) {
      setError('Error al cargar los datos de la ruta');
    } finally {
      setLoading(false);
    }
  };

  const getSpeedColor = (speed: number): string => {
    if (speed === 0) return '#ef4444';
    if (speed > 0 && speed < 11) return '#eab308';
    if (speed >= 11 && speed < 60) return '#22c55e';
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

  const focusOnPoint = (pointIndex: number) => {
    if (pointIndex < 0 || pointIndex >= routeData.length) {
      handleShowAlert('Error', 'Punto no válido', '#e36414');
      return;
    }

    setFocusedPoint(pointIndex);
    const point = routeData[pointIndex];

    if (Platform.OS === 'ios') {
      // Para iOS con MapView
      setTimeout(() => {
        mapRef.current?.animateToRegion(
          {
            latitude: point.latitude,
            longitude: point.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          },
          1000,
        );
      }, 100);
    } else {
      // Para Android con WebView/Leaflet
      const jsCode = `
        (function() {
          try {
            if (typeof map !== 'undefined' && map) {
              
              map.setView([${point.latitude}, ${point.longitude}], 17, {
                animate: true,
                duration: 1
              });
              
              // Buscar el marcador y abrir su popup
              map.eachLayer(function(layer) {
                if (layer instanceof L.Marker) {
                  var popup = layer.getPopup();
                  if (popup && popup.getContent().includes('Punto ${
                    pointIndex + 1
                  }<')) {
                    layer.openPopup();
                  }
                }
              });
              
            } else {
            }
          } catch(e) {
          }
        })();
        true;
      `;
      webViewRef.current?.injectJavaScript(jsCode);
    }
  };

  const handlePointInput = () => {
    const pointNum = parseInt(selectedPoint.trim());

    if (selectedPoint.trim() === '') {
      handleShowAlert(
        'Error',
        'Por favor ingrese un número de punto',
        '#e36414',
      );

      return;
    }

    if (isNaN(pointNum)) {
      handleShowAlert('Error', 'Por favor ingrese un número válido', '#e36414');

      return;
    }

    if (pointNum < 1 || pointNum > routeData.length) {
      handleShowAlert(
        'Error',
        'Por favor ingrese un número entre 1 y ${routeData.length}',
        '#e36414',
      );

      return;
    }

    const arrayIndex = pointNum - 1;

    focusOnPoint(arrayIndex);
    setSelectedPoint('');
  };

  const leafletHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <title>Reporte de Recorrido</title>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin=""/>
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" crossorigin=""></script>
      <style>
        body { margin: 0; padding: 0; overflow: hidden; }
        #map { height: 100vh; width: 100vw; }
        
        /* Marcador GPS optimizado sin animaciones */
        .gps-marker-container {
          position: relative;
          width: 70px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          flex-direction: column;
        }

        /* Círculo principal del marcador GPS */
        .gps-marker-pin {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 11px;
          color: white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
          margin-top: 10px;
          z-index: 10;
          position: relative;
        }

        /* Punta del marcador GPS */
        .gps-marker-tip {
          width: 0;
          height: 0;
          border-left: 9px solid transparent;
          border-right: 9px solid transparent;
          border-top: 12px solid;
          margin-top: -3px;
          z-index: 10;
        }

        .leaflet-top.leaflet-left {
          left: auto !important;
          right: 5px !important;
          top: 25px !important;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var routeData = ${JSON.stringify(routeData)};
        var map;
        var markers = [];
        
        if (routeData.length === 0) {
          document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:Arial;">No hay datos de ruta</div>';
        } else {
          var firstPoint = routeData[0];
          map = L.map('map').setView([firstPoint.latitude, firstPoint.longitude], 15);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
          
          function getSpeedColor(speed) {
            if (speed === 0) return '#ef4444';
            if (speed > 0 && speed < 11) return '#eab308';
            if (speed >= 11 && speed < 60) return '#22c55e';
            return '#3b82f6';
          }
          
          var latlngs = routeData.map(p => [p.latitude, p.longitude]);
          var polyline = L.polyline(latlngs, { color: '#1e3a8a', weight: 4, opacity: 0.7 }).addTo(map);
          
          routeData.forEach((p, i) => {
            var color = getSpeedColor(p.speed);
            
            // Crear el HTML del marcador GPS sin radar
            var markerHTML = 
              '<div class="gps-marker-container">' +
                '<div class="gps-marker-pin" style="background-color: ' + color + ';">' +
                  (i + 1) +
                '</div>' +
                '<div class="gps-marker-tip" style="border-top-color: ' + color + ';"></div>' +
              '</div>';
            
            var customIcon = L.divIcon({
              html: markerHTML,
              iconSize: [70, 80],
              iconAnchor: [35, 55],
              popupAnchor: [0, -50],
              className: 'custom-gps-icon'
            });
            
            var marker = L.marker([p.latitude, p.longitude], { icon: customIcon })
              .bindPopup('<b>Punto ' + (i+1) + '</b><br>Fecha: ' + p.date + ' ' + p.time + '<br>Velocidad: ' + p.speed.toFixed(0) + ' km/h')
              .addTo(map);
            
            markers.push(marker);
          });
          
          map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
          
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

    // --- iOS: Marcadores optimizados sin animaciones pesadas ---
    if (Platform.OS === 'ios') {
      const coordinates = routeData.map(point => ({
        latitude: point.latitude,
        longitude: point.longitude,
      }));

      // Calcular los límites de todos los puntos para mostrar vista general
      const latitudes = routeData.map(p => p.latitude);
      const longitudes = routeData.map(p => p.longitude);

      const minLat = Math.min(...latitudes);
      const maxLat = Math.max(...latitudes);
      const minLng = Math.min(...longitudes);
      const maxLng = Math.max(...longitudes);

      const centerLat = (minLat + maxLat) / 2;
      const centerLng = (minLng + maxLng) / 2;
      const deltaLat = (maxLat - minLat) * 1.3;
      const deltaLng = (maxLng - minLng) * 1.3;

      const initialRegion =
        routeData.length > 0
          ? {
              latitude: centerLat,
              longitude: centerLng,
              latitudeDelta: Math.max(deltaLat, 0.01),
              longitudeDelta: Math.max(deltaLng, 0.01),
            }
          : {
              latitude: -12.0464,
              longitude: -77.0428,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            };

      return (
        <MapView
          ref={mapRef}
          provider={PROVIDER_DEFAULT}
          style={styles.map}
          initialRegion={initialRegion}
          maxZoomLevel={19}
          loadingEnabled={true}
          loadingIndicatorColor="#1e3a8a"
          loadingBackgroundColor="#ffffff"
        >
          <Polyline
            coordinates={coordinates}
            strokeColor="#1e3a8a"
            strokeWidth={4}
          />
          {routeData.map((point, index) => (
            <Marker
              key={`marker-${index}`}
              coordinate={{
                latitude: point.latitude,
                longitude: point.longitude,
              }}
              title={`Punto ${index + 1}`}
              description={`Fecha: ${point.date} ${point.time} - ${point.speed} km/h`}
              centerOffset={{ x: 0, y: -12 }}
              tracksViewChanges={false}
            >
              <SimpleMarker>
                <View
                  style={{
                    width: 70,
                    height: 80,
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                  }}
                >
                  <View
                    style={{
                      width: 34,
                      height: 34,
                      backgroundColor: getSpeedColor(point.speed),
                      borderRadius: 17,
                      alignItems: 'center',
                      justifyContent: 'center',
                      shadowColor: '#000',
                      shadowOpacity: 0.4,
                      shadowRadius: 6,
                      shadowOffset: { width: 0, height: 2 },
                      elevation: 8,
                      marginTop: 10,
                 
                    }}
                  >
                    <Text
                      style={{
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: 11,
                      }}
                    >
                      {index + 1}
                    </Text>
                  </View>

                  <View
                    style={{
                      width: 0,
                      height: 0,
                      backgroundColor: 'transparent',
                      borderStyle: 'solid',
                      borderLeftWidth: 9,
                      borderRightWidth: 9,
                      borderTopWidth: 12,
                      borderLeftColor: 'transparent',
                      borderRightColor: 'transparent',
                      borderTopColor: getSpeedColor(point.speed),
                      marginTop: -3,
                    }}
                  />
                </View>
              </SimpleMarker>
            </Marker>
          ))}
        </MapView>
      );
    } else {
      return (
        <WebView
          ref={webViewRef}
          source={{ html: leafletHTML }}
          style={styles.map}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
          mixedContentMode="compatibility"
        />
      );
    }
  };

const topSpace = Platform.OS === 'ios' ? insets.top -5 : insets.top + 5;


  return (
  <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
  >
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <LinearGradient
        colors={['#021e4bff', '#183890ff', '#032660ff']}
        style={[styles.container, { paddingBottom: bottomSpace - 2 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <View style={[styles.header, { paddingTop: topSpace }]}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              onPress={handleGoBack}
              style={styles.backButton}
              activeOpacity={0.7}
            >
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
            <View
              style={[styles.sidebar, sidebarCompact && styles.sidebarCompact]}
            >
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
                <ScrollView
                  style={styles.sidebarContent}
                  keyboardShouldPersistTaps="handled"
                >
                  <View style={styles.sidebarSection}>
                    <Text style={styles.sidebarSectionTitle}>UNIDAD</Text>
                    <Text style={styles.sidebarText}>{unit.plate}</Text>
                  </View>

                  {/* SECCIÓN: IR A PUNTO */}
                  {routeData.length > 0 && (
                    <View style={styles.sidebarSection}>
                      <Text style={styles.sidebarSectionTitle}>IR A PUNTO</Text>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          marginTop: 8,
                        }}
                      >
                        <TextInput
                          style={{
                            flex: 1,
                            backgroundColor: '#fcefdeff',
                            borderRadius: 6,
                            paddingHorizontal: 12,
                            paddingVertical: 8,
                            color: '#1e3a8a',
                            fontSize: 14,
                            marginRight: 8,
                            fontWeight: '600',
                          }}
                          placeholder={`1-${routeData.length}`}
                          keyboardType="numeric"
                          value={selectedPoint}
                          onChangeText={setSelectedPoint}
                          onSubmitEditing={handlePointInput}
                          
                        />
                        <TouchableOpacity
                          style={{
                            backgroundColor: '#e36414',
                            borderRadius: 6,
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                            flexDirection: 'row',
                            alignItems: 'center',
                          }}
                          onPress={handlePointInput}
                        >
                          <MapPin size={16} color="#fff" />
                          <Text
                            style={{
                              color: '#fff',
                              fontWeight: 'bold',
                              marginLeft: 4,
                            }}
                          >
                            IR
                          </Text>
                        </TouchableOpacity>
                      </View>
                      <Text
                        style={{
                          color: '#94a3b8',
                          fontSize: 11,
                          marginTop: 4,
                          fontStyle: 'italic',
                        }}
                      >
                        Ingresa un número de punto y presiona IR
                      </Text>
                    </View>
                  )}

                  <View style={styles.sidebarSection}>
                    <Text style={styles.sidebarSectionTitle}>
                      RANGO VELOCIDAD
                    </Text>
                    <View style={styles.sidebarRago}>
                      <View style={styles.legendItem}>
                        <View
                          style={[
                            styles.legendDot,
                            { backgroundColor: '#ef4444' },
                          ]}
                        />
                        <Text style={styles.legendText}>0 km/h</Text>
                      </View>
                      <View style={styles.legendItem}>
                        <View
                          style={[
                            styles.legendDot,
                            { backgroundColor: '#eab308' },
                          ]}
                        />
                        <Text style={styles.legendText}>1 - 10 km/h</Text>
                      </View>
                      <View style={styles.legendItem}>
                        <View
                          style={[
                            styles.legendDot,
                            { backgroundColor: '#22c55e' },
                          ]}
                        />
                        <Text style={styles.legendText}>11 - 59 km/h</Text>
                      </View>
                      <View style={styles.legendItem}>
                        <View
                          style={[
                            styles.legendDot,
                            { backgroundColor: '#3b82f6' },
                          ]}
                        />
                        <Text style={styles.legendText}>&gt;= 60 km/h</Text>
                      </View>
                    </View>
                  </View>

                  {routeData.length > 0 && (
                    <View style={styles.sidebarSection}>
                      <Text style={styles.sidebarSectionTitle}>
                        PUNTOS DE RUTA
                      </Text>
                      <Text style={styles.sidebarText}>
                        Total: {routeData.length} puntos
                      </Text>
                    </View>
                  )}
                </ScrollView>
              )}
            </View>
          )}
        </View>

        <ModalAlert
          isVisible={modalAlertVisible}
          onClose={() => setModalAlertVisible(false)}
          title={alertConfig.title}
          message={alertConfig.message}
          color={alertConfig.color}
        />
      </LinearGradient>
    </TouchableWithoutFeedback>
  </KeyboardAvoidingView>
);



};

export default TourReport;
