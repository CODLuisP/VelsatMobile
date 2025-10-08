import React, { useEffect, useState, useRef } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Animated,
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

// Componente animado para el radar
const RadarPulse = ({ color, delay = 0 }: { color: string; delay?: number }) => {
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 2.5,
          duration: 3000,
          delay: delay,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 3000,
          delay: delay,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 10,
        width: 34,
        height: 34,
        backgroundColor: color,
        borderRadius: 17,
        transform: [{ scale: scaleAnim }],
        opacity: opacityAnim,
      }}
    />
  );
};

// Componente animado para el marcador con entrada desde arriba (todos al mismo tiempo)
const AnimatedMarker = ({ 
  children, 
}: { 
  children: React.ReactNode; 
}) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        transform: [
          { translateY },
          { scale: scaleAnim },
        ],
      }}
    >
      {children}
    </Animated.View>
  );
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
  const [showRadar, setShowRadar] = useState(false);

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

  const getSpeedColor = (speed: number): string => {
    if (speed === 0) return '#ef4444'; // ROJO
    if (speed > 0 && speed < 11) return '#eab308'; // AMARILLO
    if (speed >= 11 && speed < 60) return '#22c55e'; // VERDE
    return '#3b82f6'; // AZUL
  };

  const getSpeedColorLight = (speed: number): string => {
    if (speed === 0) return 'rgba(239, 68, 68, 0.2)'; // ROJO
    if (speed > 0 && speed < 11) return 'rgba(234, 179, 8, 0.2)'; // AMARILLO
    if (speed >= 11 && speed < 60) return 'rgba(34, 197, 94, 0.2)'; // VERDE
    return 'rgba(59, 130, 246, 0.2)'; // AZUL
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
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin=""/>
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" crossorigin=""></script>
      <style>
        body { margin: 0; padding: 0; overflow: hidden; }
        #map { height: 100vh; width: 100vw; }
        
        /* Marcador GPS con radar animado */
        .gps-marker-container {
          position: relative;
          width: 70px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          flex-direction: column;
        }

        /* Ondas de radar - centradas con el marcador */
        .radar-pulse {
          position: absolute;
          top: 10px;
          left: 50%;
          transform: translateX(-50%) scale(0.5);
          width: 34px;
          height: 34px;
          border-radius: 50%;
          animation: radar-animation 3s infinite;
          pointer-events: none;
          display: none; /* Oculto por defecto */
        }

        .radar-pulse:nth-child(2) {
          animation-delay: 1s;
        }

        .radar-pulse:nth-child(3) {
          animation-delay: 2s;
        }

        @keyframes radar-animation {
          0% {
            transform: translateX(-50%) scale(0.5);
            opacity: 0.8;
          }
          100% {
            transform: translateX(-50%) scale(2.5);
            opacity: 0;
          }
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
        
        if (routeData.length === 0) {
          document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:Arial;">No hay datos de ruta</div>';
        } else {
          var firstPoint = routeData[0];
          var map = L.map('map').setView([firstPoint.latitude, firstPoint.longitude], 15);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
          
          function getSpeedColor(speed) {
            if (speed === 0) return '#ef4444';
            if (speed > 0 && speed < 11) return '#eab308';
            if (speed >= 11 && speed < 60) return '#22c55e';
            return '#3b82f6';
          }

          function getSpeedColorLight(speed) {
            if (speed === 0) return 'rgba(239, 68, 68, 0.2)';
            if (speed > 0 && speed < 11) return 'rgba(234, 179, 8, 0.2)';
            if (speed >= 11 && speed < 60) return 'rgba(34, 197, 94, 0.2)';
            return 'rgba(59, 130, 246, 0.2)';
          }

          // Función para mostrar/ocultar radar según zoom
          function updateRadarVisibility() {
            var currentZoom = map.getZoom();
            var radars = document.querySelectorAll('.radar-pulse');
            
            radars.forEach(function(radar) {
              if (currentZoom >= 15) {
                radar.style.display = 'block';
              } else {
                radar.style.display = 'none';
              }
            });
          }

          // Escuchar cambios de zoom
          map.on('zoomend', updateRadarVisibility);
          
          var latlngs = routeData.map(p => [p.latitude, p.longitude]);
          var polyline = L.polyline(latlngs, { color: '#1e3a8a', weight: 4, opacity: 0.7 }).addTo(map);
          
          routeData.forEach((p, i) => {
            var color = getSpeedColor(p.speed);
            var colorLight = getSpeedColorLight(p.speed);
            
            // Crear el HTML del marcador GPS con radar
            var markerHTML = 
              '<div class="gps-marker-container">' +
                '<div class="radar-pulse" style="background-color: ' + colorLight + ';"></div>' +
                '<div class="radar-pulse" style="background-color: ' + colorLight + ';"></div>' +
                '<div class="radar-pulse" style="background-color: ' + colorLight + ';"></div>' +
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
            
            L.marker([p.latitude, p.longitude], { icon: customIcon })
              .bindPopup('<b>Punto ' + (i+1) + '</b><br>Fecha: ' + p.date + ' ' + p.time + '<br>Velocidad: ' + p.speed + ' km/h')
              .addTo(map);
          });
          
          map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
          
          // Verificar visibilidad inicial de radares
          updateRadarVisibility();
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

    // --- iOS: Marcadores personalizados con forma de GPS y efecto radar animado ---
    if (Platform.OS === 'ios') {
      const coordinates = routeData.map(point => ({
        latitude: point.latitude,
        longitude: point.longitude,
      }));

      const initialRegion =
        routeData.length > 0
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
          onRegionChangeComplete={(region) => {
            // Mostrar radar solo cuando latitudeDelta es menor (más zoom)
            setShowRadar(region.latitudeDelta < 0.01);
          }}
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
              description={`Fecha: ${point.date} ${point.time} - ${point.speed} km/h`}
            >
              {/* Marcador profesional con efecto radar animado - todos aparecen al mismo tiempo */}
              <AnimatedMarker>
                <View
                  pointerEvents="box-none"
                  style={{
                    width: 70,
                    height: 80,
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                  }}
                >
                  {/* Ondas de radar animadas (3 ondas con diferentes delays) - NO son clickeables */}
                  {showRadar && <RadarPulse color={getSpeedColorLight(point.speed)} delay={0} />}
                  {showRadar && <RadarPulse color={getSpeedColorLight(point.speed)} delay={1000} />}
                  {showRadar && <RadarPulse color={getSpeedColorLight(point.speed)} delay={2000} />}

                  {/* Pin de GPS - círculo principal - SOLO ESTE es clickeable */}
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
                      zIndex: 10,
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

                  {/* Punta del marcador GPS sin bordes */}
                  <View style={{ position: 'relative', zIndex: 10 }}>
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
                </View>
              </AnimatedMarker>
            </Marker>
          ))}
        </MapView>
      );
    } else {
      // --- Android: usar Leaflet en WebView con marcadores GPS animados ---
      return (
        <WebView
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
                        style={[styles.legendDot, { backgroundColor: '#eab308' }]}
                      />
                      <Text style={styles.legendText}>1 - 10 km/h</Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View
                        style={[styles.legendDot, { backgroundColor: '#22c55e' }]}
                      />
                      <Text style={styles.legendText}>11 - 59 km/h</Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View
                        style={[styles.legendDot, { backgroundColor: '#3b82f6' }]}
                      />
                      <Text style={styles.legendText}>&gt;= 60 km/h</Text>
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