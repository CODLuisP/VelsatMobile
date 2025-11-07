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

// Función para simplificar la ruta usando el algoritmo Ramer-Douglas-Peucker
const simplifyRoute = (points: RoutePoint[], tolerance: number = 0.0001): RoutePoint[] => {
  if (points.length <= 2) return points;

  const getPerpendicularDistance = (
    point: RoutePoint,
    lineStart: RoutePoint,
    lineEnd: RoutePoint
  ): number => {
    const dx = lineEnd.longitude - lineStart.longitude;
    const dy = lineEnd.latitude - lineStart.latitude;
    const mag = Math.sqrt(dx * dx + dy * dy);
    if (mag > 0.0) {
      const u =
        ((point.longitude - lineStart.longitude) * dx +
          (point.latitude - lineStart.latitude) * dy) /
        (mag * mag);
      const intersectionX = lineStart.longitude + u * dx;
      const intersectionY = lineStart.latitude + u * dy;
      const pdx = point.longitude - intersectionX;
      const pdy = point.latitude - intersectionY;
      return Math.sqrt(pdx * pdx + pdy * pdy);
    }
    const pdx = point.longitude - lineStart.longitude;
    const pdy = point.latitude - lineStart.latitude;
    return Math.sqrt(pdx * pdx + pdy * pdy);
  };

  const simplify = (
    points: RoutePoint[],
    first: number,
    last: number,
    tolerance: number,
    simplified: RoutePoint[]
  ) => {
    let maxDistance = 0;
    let index = 0;

    for (let i = first + 1; i < last; i++) {
      const distance = getPerpendicularDistance(
        points[i],
        points[first],
        points[last]
      );
      if (distance > maxDistance) {
        maxDistance = distance;
        index = i;
      }
    }

    if (maxDistance > tolerance) {
      simplify(points, first, index, tolerance, simplified);
      simplified.push(points[index]);
      simplify(points, index, last, tolerance, simplified);
    }
  };

  const simplified: RoutePoint[] = [points[0]];
  simplify(points, 0, points.length - 1, tolerance, simplified);
  simplified.push(points[points.length - 1]);

  return simplified;
};

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
      const jsCode = `
        (function() {
          try {
            if (typeof map !== 'undefined' && map && typeof markers !== 'undefined') {
              // Centrar el mapa en el punto
              map.setView([${point.latitude}, ${point.longitude}], 17, {
                animate: true,
                duration: 1
              });
              
              // Buscar y abrir el popup del marcador específico
              var targetMarker = markers[${pointIndex}];
              if (targetMarker) {
                setTimeout(function() {
                  targetMarker.openPopup();
                }, 500);
              }
            }
          } catch(e) {
            console.error('Error focusing point:', e);
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
        `Por favor ingrese un número entre 1 y ${routeData.length}`,
        '#e36414',
      );
      return;
    }

    const arrayIndex = pointNum - 1;
    focusOnPoint(arrayIndex);
    setSelectedPoint('');
  };

  // HTML optimizado sin clustering - todos los puntos visibles con mejor rendimiento
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
        body { 
          margin: 0; 
          padding: 0; 
          overflow: hidden;
          background: #f0f0f0;
        }
        #map { 
          height: 100vh; 
          width: 100vw; 
        }
        
        /* Marcador GPS optimizado con forma de pin */
        .gps-marker-container {
          position: relative;
          width: 50px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          flex-direction: column;
        }

        .gps-marker-pin {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 10px;
          color: white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          margin-top: 8px;
          z-index: 10;
          position: relative;
        }

        .gps-marker-tip {
          width: 0;
          height: 0;
          border-left: 7px solid transparent;
          border-right: 7px solid transparent;
          border-top: 10px solid;
          margin-top: -2px;
          z-index: 10;
        }

        .leaflet-top.leaflet-left {
          left: auto !important;
          right: 5px !important;
          top: 25px !important;
        }
        
        /* Ocultar algunos controles para mejorar rendimiento */
        .leaflet-control-attribution {
          display: none;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var routeData = ${JSON.stringify(routeData)};
        var map;
        var markers = [];
        var polyline;
        
        // Función para simplificar la ruta (Ramer-Douglas-Peucker) solo para la línea
        function simplifyRoute(points, tolerance) {
          if (points.length <= 2) return points;
          
          function getPerpendicularDistance(point, lineStart, lineEnd) {
            var dx = lineEnd.longitude - lineStart.longitude;
            var dy = lineEnd.latitude - lineStart.latitude;
            var mag = Math.sqrt(dx * dx + dy * dy);
            if (mag > 0.0) {
              var u = ((point.longitude - lineStart.longitude) * dx + 
                       (point.latitude - lineStart.latitude) * dy) / (mag * mag);
              var intersectionX = lineStart.longitude + u * dx;
              var intersectionY = lineStart.latitude + u * dy;
              var pdx = point.longitude - intersectionX;
              var pdy = point.latitude - intersectionY;
              return Math.sqrt(pdx * pdx + pdy * pdy);
            }
            var pdx = point.longitude - lineStart.longitude;
            var pdy = point.latitude - lineStart.latitude;
            return Math.sqrt(pdx * pdx + pdy * pdy);
          }
          
          function douglasPeucker(points, first, last, tolerance, simplified) {
            var maxDistance = 0;
            var index = 0;
            
            for (var i = first + 1; i < last; i++) {
              var distance = getPerpendicularDistance(points[i], points[first], points[last]);
              if (distance > maxDistance) {
                maxDistance = distance;
                index = i;
              }
            }
            
            if (maxDistance > tolerance) {
              douglasPeucker(points, first, index, tolerance, simplified);
              simplified.push(points[index]);
              douglasPeucker(points, index, last, tolerance, simplified);
            }
          }
          
          var simplified = [points[0]];
          douglasPeucker(points, 0, points.length - 1, tolerance, simplified);
          simplified.push(points[points.length - 1]);
          return simplified;
        }
        
        function getSpeedColor(speed) {
          if (speed === 0) return '#ef4444';
          if (speed > 0 && speed < 11) return '#eab308';
          if (speed >= 11 && speed < 60) return '#22c55e';
          return '#3b82f6';
        }
        
        if (routeData.length === 0) {
          document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:Arial;color:#666;">No hay datos de ruta</div>';
        } else {
          var firstPoint = routeData[0];
          
          // Inicializar mapa con configuración super optimizada para Canvas
          map = L.map('map', {
            preferCanvas: true,
            renderer: L.canvas({ 
              padding: 0.5,
              tolerance: 10  // Aumentar tolerancia de click para mejor rendimiento
            }),
            zoomControl: true,
            attributionControl: false,
            zoomAnimation: true,
            fadeAnimation: false,
            markerZoomAnimation: false
          }).setView([firstPoint.latitude, firstPoint.longitude], 15);
          
          // Tiles optimizados
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { 
            maxZoom: 19,
            updateWhenIdle: true,
            updateWhenZooming: false,
            keepBuffer: 2,
            minZoom: 3
          }).addTo(map);
          
          // Simplificar la ruta SOLO para la polilínea (visual)
          var simplifiedRoute = routeData;
          if (routeData.length > 200) {
            simplifiedRoute = simplifyRoute(routeData, 0.00008);
          }
          
          // Dibujar polilínea simplificada
          var latlngs = simplifiedRoute.map(function(p) { 
            return [p.latitude, p.longitude]; 
          });
          
          polyline = L.polyline(latlngs, { 
            color: '#1e3a8a', 
            weight: 2.5, 
            opacity: 0.65,
            smoothFactor: 3,
            interactive: false  // No interactivo = mejor rendimiento
          }).addTo(map);
          
          // Añadir TODOS los marcadores (no simplificados) con carga optimizada
          var batchSize = 100;  // Lotes más grandes
          var currentIndex = 0;
          var frameDelay = 0;  // Sin delay entre frames para carga más rápida
          
          function addMarkersBatch() {
            var startTime = performance.now();
            var endIndex = Math.min(currentIndex + batchSize, routeData.length);
            
            for (var i = currentIndex; i < endIndex; i++) {
              var p = routeData[i];
              var color = getSpeedColor(p.speed);
              
              // Marcador GPS con forma de pin optimizado
              var markerHTML = 
                '<div class="gps-marker-container">' +
                  '<div class="gps-marker-pin" style="background-color: ' + color + ';">' +
                    (i + 1) +
                  '</div>' +
                  '<div class="gps-marker-tip" style="border-top-color: ' + color + ';"></div>' +
                '</div>';
              
              var customIcon = L.divIcon({
                html: markerHTML,
                iconSize: [50, 60],
                iconAnchor: [25, 50],
                popupAnchor: [0, -45],
                className: ''
              });
              
              var marker = L.marker([p.latitude, p.longitude], { 
                icon: customIcon,
                riseOnHover: false,
                bubblingMouseEvents: false
              }).bindPopup(
                '<b>Punto ' + (i + 1) + '</b><br>' +
                'Fecha: ' + p.date + ' ' + p.time + '<br>' +
                'Velocidad: ' + p.speed.toFixed(0) + ' km/h',
                {
                  autoPan: false,
                  closeButton: true
                }
              );
              
              marker.addTo(map);
              markers.push(marker);
              
              // Si el batch toma más de 16ms, pausar para no bloquear UI
              if (performance.now() - startTime > 16 && i < endIndex - 1) {
                currentIndex = i + 1;
                requestAnimationFrame(addMarkersBatch);
                return;
              }
            }
            
            currentIndex = endIndex;
            
            // Si quedan más marcadores, continuar
            if (currentIndex < routeData.length) {
              // Mostrar progreso en consola
              if (currentIndex % 200 === 0) {
                console.log('Cargados ' + currentIndex + ' de ' + routeData.length + ' puntos...');
              }
              requestAnimationFrame(addMarkersBatch);
            } else {
              // Todos los marcadores añadidos
              console.log('Todos los ' + routeData.length + ' puntos cargados!');
              map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
            }
          }
          
          // Iniciar carga de marcadores
          requestAnimationFrame(addMarkersBatch);
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

    // iOS: Mantener implementación actual
    if (Platform.OS === 'ios') {
      const coordinates = routeData.map(point => ({
        latitude: point.latitude,
        longitude: point.longitude,
      }));

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
      // Android: WebView optimizado con clustering
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
          androidLayerType="hardware"
        />
      );
    }
  };

  const topSpace = Platform.OS === 'ios' ? insets.top - 5 : insets.top + 5;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
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
                          placeholderTextColor="#495057"
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
    </KeyboardAvoidingView>
  );
};

export default TourReport;