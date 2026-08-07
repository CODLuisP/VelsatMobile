import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
  View,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  TextInput,
  Keyboard,
} from 'react-native';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Calendar,
  MapPin,
  Route,
  Clock,
  Flag,
  CarFront,
  FileX,
  Maximize,
  Eye,
  EyeOff,
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
import {
  formatDuration,
  minutesBetween,
  shortTime,
} from '../../../utils/reportUtils';
import { useAuthStore } from '../../../store/authStore';
import LinearGradient from 'react-native-linear-gradient';
import ModalAlert from '../../../components/ModalAlert';
import { Text } from '../../../components/ScaledComponents';

interface RoutePoint {
  date: string;
  time: string;
  speed: number;
  longitude: number;
  latitude: number;
}

/** Escala de velocidad de los puntos: rojo, amarillo, verde y azul. */
const COLOR_IDLE = '#ef4444'; // 0 km/h
const COLOR_SLOW = '#eab308'; // 1 - 10 km/h
const COLOR_NORMAL = '#22c55e'; // 11 - 59 km/h
const COLOR_FAST = '#3b82f6'; // 60+ km/h

/** Colores de marca, para el trazo y los pines de inicio/fin. */
const NAVY = '#1e3a8a';
const ORANGE = '#e36414';

/** Los mismos íconos de lucide, en SVG, para los pines del WebView Android. */
const carSvg = (color: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21 8-2 2-1.5-3.7A2 2 0 0 0 15.646 5H8.4a2 2 0 0 0-1.903 1.257L5 10 3 8"/><path d="M7 14h.01"/><path d="M17 14h.01"/><rect width="18" height="8" x="3" y="10" rx="2"/><path d="M5 18v2"/><path d="M19 18v2"/></svg>`;

const flagSvg = (color: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="${color}" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10a1 1 0 0 1-.4.8A6 6 0 0 1 16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528"/></svg>`;

const getSpeedColor = (speed: number): string => {
  if (speed === 0) return COLOR_IDLE;
  if (speed < 11) return COLOR_SLOW;
  if (speed < 60) return COLOR_NORMAL;
  return COLOR_FAST;
};

const TourReport = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user, server } = useAuthStore();

  const route = useRoute<RouteProp<RootStackParamList, 'TourReport'>>();
  const { unit, startDate, endDate } = route.params;

  const [routeData, setRouteData] = useState<RoutePoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<string>('');
  const [focusedPoint, setFocusedPoint] = useState<number | null>(null);
  const [sheetOpen, setSheetOpen] = useState(true);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [showPoints, setShowPoints] = useState(true);

  const mapRef = useRef<MapView>(null);
  const webViewRef = useRef<WebView>(null);
  // Refs de cada marcador de iOS, para poder abrir su globo al navegar.
  const markerRefs = useRef<Array<InstanceType<typeof Marker> | null>>([]);
  // Timer del globo: si quedan varios pendientes, uno viejo abre el globo de
  // otro punto y MapKit desplaza el mapa para mostrarlo (queda descentrado).
  const calloutTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelPendingCallout = () => {
    if (calloutTimer.current) {
      clearTimeout(calloutTimer.current);
      calloutTimer.current = null;
    }
  };

  useEffect(() => cancelPendingCallout, []);

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

  // En iOS sube solo el panel; en Android lo resuelve el adjustResize del sistema.
  useEffect(() => {
    if (Platform.OS !== 'ios') return;

    const show = Keyboard.addListener('keyboardWillShow', event => {
      setKeyboardHeight(
        Math.max(event.endCoordinates.height - bottomSpace, 0),
      );
    });
    const hide = Keyboard.addListener('keyboardWillHide', () => {
      setKeyboardHeight(0);
    });

    return () => {
      show.remove();
      hide.remove();
    };
  }, [bottomSpace]);

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

  const handleGoBack = () => {
    navigation.goBack();
  };

  const stats = useMemo(() => {
    if (routeData.length === 0) {
      return { points: 0, minutes: null as number | null };
    }

    const first = routeData[0];
    const last = routeData[routeData.length - 1];

    return {
      points: routeData.length,
      minutes: minutesBetween(first.date, first.time, last.date, last.time),
    };
  }, [routeData]);

  const focusOnPoint = (pointIndex: number) => {
    if (pointIndex < 0 || pointIndex >= routeData.length) {
      handleShowAlert('Error', 'Punto no válido', '#e36414');
      return;
    }

    setFocusedPoint(pointIndex);
    const point = routeData[pointIndex];

    if (Platform.OS === 'ios') {
      cancelPendingCallout();

      // Cierra el globo anterior antes de mover la cámara.
      if (focusedPoint !== null && focusedPoint !== pointIndex) {
        markerRefs.current[focusedPoint]?.hideCallout();
      }

      // setCamera y no animateCamera: la animación se cortaba a medias en cada
      // salto y el acercamiento iba quedando distinto punto a punto. Así cae
      // siempre a la misma altura. MapKit usa `altitude` en metros; `zoom` solo
      // lo lee Google Maps (Android).
      mapRef.current?.setCamera({
        center: {
          latitude: point.latitude,
          longitude: point.longitude,
        },
        altitude: 500,
        zoom: 17,
      });

      // El globo, una vez que la cámara ya está en su sitio.
      calloutTimer.current = setTimeout(() => {
        markerRefs.current[pointIndex]?.showCallout();
        calloutTimer.current = null;
      }, 250);
    } else {
      const jsCode = `
        (function() {
          try {
            if (typeof map !== 'undefined' && map && typeof markers !== 'undefined') {
              map.setView([${point.latitude}, ${point.longitude}], 17, {
                animate: true,
                duration: 1
              });

              if (typeof highlightPoint === 'function') {
                highlightPoint(${pointIndex});
              }

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
    const pointNum = parseInt(selectedPoint.trim(), 10);

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

    Keyboard.dismiss();
    focusOnPoint(pointNum - 1);
    setSelectedPoint('');
  };

  /** Aleja el mapa hasta que entre todo el recorrido. */
  const fitWholeRoute = (animated: boolean = true) => {
    Keyboard.dismiss();

    if (routeData.length === 0) return;

    // Vuelve al estado inicial: sin punto seleccionado, para que la siguiente
    // flecha arranque otra vez desde el punto 1.
    cancelPendingCallout();
    if (focusedPoint !== null) {
      markerRefs.current[focusedPoint]?.hideCallout();
    }
    setFocusedPoint(null);
    setSelectedPoint('');

    if (Platform.OS === 'ios') {
      mapRef.current?.fitToCoordinates(
        routeData.map(p => ({
          latitude: p.latitude,
          longitude: p.longitude,
        })),
        {
          // Deja aire para la barra de resumen y el panel inferior.
          edgePadding: { top: 70, right: 40, bottom: 240, left: 40 },
          animated,
        },
      );
    } else {
      webViewRef.current?.injectJavaScript(`
        (function() {
          try {
            if (map && map.closePopup) { map.closePopup(); }
            if (typeof clearHighlight === 'function') { clearHighlight(); }
            if (typeof fitRoute === 'function') { fitRoute(${animated}); }
          } catch(e) {}
        })();
        true;
      `);
    }
  };

  /** Muestra u oculta los puntos para dejar solo el trazo del recorrido. */
  const togglePoints = () => {
    const next = !showPoints;
    setShowPoints(next);

    if (!next) {
      cancelPendingCallout();
      if (focusedPoint !== null) {
        markerRefs.current[focusedPoint]?.hideCallout();
      }
      setFocusedPoint(null);
      setSelectedPoint('');
    }

    if (Platform.OS !== 'ios') {
      webViewRef.current?.injectJavaScript(`
        (function() {
          try {
            if (map && map.closePopup) { map.closePopup(); }
            if (typeof clearHighlight === 'function') { clearHighlight(); }
            if (typeof togglePoints === 'function') { togglePoints(${next}); }
          } catch(e) {}
        })();
        true;
      `);
    }
  };

  const step = (delta: number) => {
    Keyboard.dismiss();
    const current = focusedPoint ?? -1;
    focusOnPoint(current + delta);
  };

  /**
   * Android (Leaflet): los puntos intermedios son circleMarker sobre canvas —
   * mucho más liviano que un divIcon numerado por punto. Solo inicio, fin y el
   * punto enfocado llevan pin.
   */
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
        body { margin: 0; padding: 0; overflow: hidden; background: #eef1f6; }
        #map { height: 100vh; width: 100vw; }

        .edge-pin {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ffffff;
          border: 3px solid;
          box-shadow: 0 3px 10px rgba(15,27,61,0.3);
        }

        .leaflet-top.leaflet-left {
          left: auto !important;
          right: 8px !important;
          top: 60px !important;
        }
        .leaflet-control-attribution { display: none; }
        .leaflet-popup-content { font-family: -apple-system, Roboto, Arial, sans-serif; font-size: 12px; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var routeData = ${JSON.stringify(routeData)};
        var map;
        var markers = [];
        var highlighted = null;

        function simplifyRoute(points, tolerance) {
          if (points.length <= 2) return points;

          function getPerpendicularDistance(point, lineStart, lineEnd) {
            var dx = lineEnd.longitude - lineStart.longitude;
            var dy = lineEnd.latitude - lineStart.latitude;
            var mag = Math.sqrt(dx * dx + dy * dy);
            if (mag > 0.0) {
              var u = ((point.longitude - lineStart.longitude) * dx +
                       (point.latitude - lineStart.latitude) * dy) / (mag * mag);
              var ix = lineStart.longitude + u * dx;
              var iy = lineStart.latitude + u * dy;
              return Math.sqrt(Math.pow(point.longitude - ix, 2) + Math.pow(point.latitude - iy, 2));
            }
            return Math.sqrt(Math.pow(point.longitude - lineStart.longitude, 2) +
                             Math.pow(point.latitude - lineStart.latitude, 2));
          }

          function douglasPeucker(points, first, last, tolerance, simplified) {
            var maxDistance = 0, index = 0;
            for (var i = first + 1; i < last; i++) {
              var distance = getPerpendicularDistance(points[i], points[first], points[last]);
              if (distance > maxDistance) { maxDistance = distance; index = i; }
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
          if (speed === 0) return '${COLOR_IDLE}';
          if (speed < 11) return '${COLOR_SLOW}';
          if (speed < 60) return '${COLOR_NORMAL}';
          return '${COLOR_FAST}';
        }

        window.clearHighlight = function() {
          if (highlighted !== null && markers[highlighted] && markers[highlighted].setStyle) {
            markers[highlighted].setStyle({ radius: 5, weight: 1.5 });
          }
          highlighted = null;
        };

        function highlightPoint(index) {
          if (highlighted !== null && markers[highlighted] && markers[highlighted].setStyle) {
            markers[highlighted].setStyle({ radius: 5, weight: 1.5 });
          }
          if (markers[index] && markers[index].setStyle) {
            markers[index].setStyle({ radius: 9, weight: 3 });
            highlighted = index;
          }
        }

        function edgeIcon(color, svg) {
          return L.divIcon({
            html: '<div class="edge-pin" style="border-color:' + color + ';">' + svg + '</div>',
            iconSize: [36, 36],
            iconAnchor: [18, 18],
            popupAnchor: [0, -21],
            className: ''
          });
        }

        if (routeData.length === 0) {
          document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:Arial;color:#8d97a8;">No hay datos de ruta</div>';
        } else {
          var firstPoint = routeData[0];
          var lastPoint = routeData[routeData.length - 1];

          map = L.map('map', {
            preferCanvas: true,
            renderer: L.canvas({ padding: 0.5, tolerance: 10 }),
            zoomControl: true,
            attributionControl: false,
            zoomAnimation: true,
            fadeAnimation: false,
            markerZoomAnimation: false
          }).setView([firstPoint.latitude, firstPoint.longitude], 15);

          L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
            maxZoom: 20,
            updateWhenIdle: true,
            updateWhenZooming: false,
            keepBuffer: 2,
            minZoom: 3
          }).addTo(map);

          var simplifiedRoute = routeData.length > 200
            ? simplifyRoute(routeData, 0.00008)
            : routeData;

          var polyline = L.polyline(
            simplifiedRoute.map(function(p) { return [p.latitude, p.longitude]; }),
            { color: '${ORANGE}', weight: 4, opacity: 1, smoothFactor: 3, interactive: false }
          ).addTo(map);

          // Los puntos van en su propia capa para poder ocultarlos de golpe.
          var pointsLayer = L.layerGroup().addTo(map);

          window.togglePoints = function(show) {
            if (show) {
              pointsLayer.addTo(map);
            } else {
              map.removeLayer(pointsLayer);
            }
          };

          // Puntos como círculos en canvas: soporta miles sin trabarse.
          for (var i = 0; i < routeData.length; i++) {
            var p = routeData[i];
            var marker = L.circleMarker([p.latitude, p.longitude], {
              radius: 5,
              color: '#ffffff',
              weight: 1.5,
              fillColor: getSpeedColor(p.speed),
              fillOpacity: 1
            }).bindPopup(
              '<b>Punto ' + (i + 1) + ' de ' + routeData.length + '</b><br>' +
              p.date + ' ' + p.time + '<br>' +
              (p.speed === 0 ? 'Detenido' : p.speed.toFixed(0) + ' km/h'),
              { autoPan: false, closeButton: true }
            );
            marker.addTo(pointsLayer);
            markers.push(marker);
          }

          L.marker([firstPoint.latitude, firstPoint.longitude], {
            icon: edgeIcon('${ORANGE}', ${JSON.stringify(carSvg(ORANGE))}),
            zIndexOffset: 1000
          }).bindPopup('<b>Inicio del recorrido</b><br>' + firstPoint.date + ' ' + firstPoint.time).addTo(map);

          L.marker([lastPoint.latitude, lastPoint.longitude], {
            icon: edgeIcon('${NAVY}', ${JSON.stringify(flagSvg(NAVY))}),
            zIndexOffset: 1000
          }).bindPopup('<b>Fin del recorrido</b><br>' + lastPoint.date + ' ' + lastPoint.time).addTo(map);

          // Deja aire abajo para que la ruta no quede tapada por el panel.
          window.fitRoute = function(animated) {
            map.fitBounds(polyline.getBounds(), {
              paddingTopLeft: [40, 70],
              paddingBottomRight: [40, 230],
              animate: animated !== false
            });
          };

          fitRoute(false);
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
          <FileX size={54} color="#c3cbd8" />
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

      const latitudes = routeData.map(p => p.latitude);
      const longitudes = routeData.map(p => p.longitude);

      const minLat = Math.min(...latitudes);
      const maxLat = Math.max(...latitudes);
      const minLng = Math.min(...longitudes);
      const maxLng = Math.max(...longitudes);

      // Aproxima el encuadre de fitWholeRoute para que el primer frame ya salga
      // casi en su sitio: más zoom out y el centro corrido al sur, porque el
      // panel inferior tapa parte del mapa.
      const latitudeDelta = Math.max((maxLat - minLat) * 1.9, 0.01);
      const longitudeDelta = Math.max((maxLng - minLng) * 1.4, 0.01);

      const initialRegion = {
        latitude: (minLat + maxLat) / 2 - latitudeDelta * 0.14,
        longitude: (minLng + maxLng) / 2,
        latitudeDelta,
        longitudeDelta,
      };

      const lastIndex = routeData.length - 1;

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
          // Mismo encuadre que el botón, pero sin animación: entra ya centrado.
          onMapReady={() => setTimeout(() => fitWholeRoute(false), 60)}
        >
          <Polyline
            coordinates={coordinates}
            strokeColor={ORANGE}
            strokeWidth={4}
          />

          {routeData.map((point, index) => {
            const isEdge = index === 0 || index === lastIndex;
            const isFocused = focusedPoint === index;
            const color = getSpeedColor(point.speed);

            // Con los puntos ocultos solo quedan inicio y fin: se ve el trazo.
            if (!showPoints && !isEdge) return null;

            return (
              <Marker
                key={`marker-${index}`}
                ref={ref => {
                  markerRefs.current[index] = ref;
                }}
                coordinate={{
                  latitude: point.latitude,
                  longitude: point.longitude,
                }}
                title={
                  index === 0
                    ? 'Inicio del recorrido'
                    : index === lastIndex
                    ? 'Fin del recorrido'
                    : `Punto ${index + 1} de ${routeData.length}`
                }
                description={`${point.date} ${point.time} · ${
                  point.speed === 0 ? 'Detenido' : `${point.speed} km/h`
                }`}
                anchor={{ x: 0.5, y: 0.5 }}
                tracksViewChanges={false}
                zIndex={isEdge || isFocused ? 10 : 1}
                onPress={() => setFocusedPoint(index)}
              >
                {isEdge ? (
                  <View
                    style={[
                      styles.edgePin,
                      { borderColor: index === 0 ? ORANGE : NAVY },
                    ]}
                  >
                    {index === 0 ? (
                      <CarFront size={18} color={ORANGE} />
                    ) : (
                      <Flag size={17} color={NAVY} fill={NAVY} />
                    )}
                  </View>
                ) : (
                  <View
                    style={{
                      width: isFocused ? 20 : 12,
                      height: isFocused ? 20 : 12,
                      borderRadius: 10,
                      backgroundColor: color,
                      borderWidth: isFocused ? 3 : 1.5,
                      borderColor: '#fff',
                    }}
                  />
                )}
              </Marker>
            );
          })}
        </MapView>
      );
    }

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
  };

  const current = focusedPoint !== null ? routeData[focusedPoint] : null;
  const hasData = !loading && !error && routeData.length > 0;
  const topSpace = Platform.OS === 'ios' ? insets.top - 5 : insets.top + 5;

  return (
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

          {hasData && (
            <>
              {/* Resumen flotante sobre el mapa */}
              <View style={styles.statsBar} pointerEvents="box-none">
                <View style={styles.statPill} pointerEvents="none">
                  <Route size={12} color="#1e3a8a" />
                  <Text style={styles.statPillText}>{stats.points} puntos</Text>
                </View>
                {stats.minutes !== null && (
                  <View style={styles.statPill} pointerEvents="none">
                    <Clock size={12} color="#1e3a8a" />
                    <Text style={styles.statPillText}>
                      {formatDuration(stats.minutes)}
                    </Text>
                  </View>
                )}
                <TouchableOpacity
                  style={[styles.statPill, !showPoints && styles.statPillOff]}
                  onPress={togglePoints}
                  activeOpacity={0.7}
                  accessibilityLabel={
                    showPoints ? 'Ocultar los puntos' : 'Mostrar los puntos'
                  }
                >
                  {showPoints ? (
                    <Eye size={12} color="#1e3a8a" />
                  ) : (
                    <EyeOff size={12} color="#ffffff" />
                  )}
                  <Text
                    style={[
                      styles.statPillText,
                      !showPoints && styles.statPillTextOff,
                    ]}
                  >
                    Puntos
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.fitButton}
                  onPress={() => fitWholeRoute(true)}
                  activeOpacity={0.7}
                  accessibilityLabel="Ver todo el recorrido"
                >
                  <Maximize size={15} color="#1e3a8a" />
                </TouchableOpacity>
              </View>

              {/* Panel inferior */}
              <View
                style={[
                  styles.sheet,
                  // Crece hacia abajo en vez de despegarse: el blanco sigue
                  // hasta el borde y el contenido queda sobre el teclado.
                  { paddingBottom: 14 + keyboardHeight },
                ]}
              >
                <TouchableOpacity
                  style={styles.sheetHandleArea}
                  onPress={() => setSheetOpen(!sheetOpen)}
                  activeOpacity={0.7}
                >
                  <View style={styles.sheetHandle} />
                </TouchableOpacity>

                <View style={styles.pointCard}>
                  {current ? (
                    <>
                      <View
                        style={[
                          styles.pointDot,
                          { backgroundColor: getSpeedColor(current.speed) },
                        ]}
                      >
                        <MapPin size={15} color="#fff" />
                      </View>
                      <View style={styles.pointInfo}>
                        <Text style={styles.pointTitle}>
                          Punto {(focusedPoint ?? 0) + 1} de {routeData.length}
                        </Text>
                        <Text style={styles.pointMeta}>
                          {current.date} · {shortTime(current.time)}
                        </Text>
                      </View>
                      <Text style={styles.pointSpeed}>
                        {current.speed === 0 ? (
                          <Text style={styles.pointSpeedUnit}>Detenido</Text>
                        ) : (
                          <>
                            {current.speed}
                            <Text style={styles.pointSpeedUnit}> km/h</Text>
                          </>
                        )}
                      </Text>
                    </>
                  ) : (
                    <>
                      <View
                        style={[
                          styles.pointDot,
                          { backgroundColor: '#e8edf5' },
                        ]}
                      >
                        <MapPin size={15} color="#8d97a8" />
                      </View>
                      <Text style={styles.pointEmpty}>
                        Toca un punto del mapa o usa las flechas para recorrer
                        la ruta
                      </Text>
                    </>
                  )}
                </View>

                {sheetOpen && (
                  <>
                    <View style={styles.navRow}>
                      <TouchableOpacity
                        style={[
                          styles.navButton,
                          (focusedPoint === null || focusedPoint === 0) &&
                            styles.navButtonDisabled,
                        ]}
                        onPress={() => step(-1)}
                        disabled={focusedPoint === null || focusedPoint === 0}
                        activeOpacity={0.7}
                      >
                        <ChevronLeft size={18} color="#0f1b3d" />
                      </TouchableOpacity>

                      <TextInput
                        style={styles.navInput}
                        placeholder={`1 - ${routeData.length}`}
                        placeholderTextColor="#aab3c2"
                        keyboardType="number-pad"
                        value={selectedPoint}
                        onChangeText={setSelectedPoint}
                        onSubmitEditing={handlePointInput}
                        allowFontScaling={false}
                        returnKeyType="go"
                        // Sin esto iOS muestra la barra de AutoFill sobre el teclado
                        textContentType="none"
                        autoComplete="off"
                        autoCorrect={false}
                        spellCheck={false}
                        importantForAutofill="no"
                      />

                      <TouchableOpacity
                        style={styles.goButton}
                        onPress={handlePointInput}
                        activeOpacity={0.85}
                      >
                        <MapPin size={14} color="#fff" />
                        <Text style={styles.goButtonText}>IR</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.navButton,
                          focusedPoint === routeData.length - 1 &&
                            styles.navButtonDisabled,
                        ]}
                        onPress={() => step(1)}
                        disabled={focusedPoint === routeData.length - 1}
                        activeOpacity={0.7}
                      >
                        <ChevronRight size={18} color="#0f1b3d" />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.legendRow}>
                      <View style={styles.legendItem}>
                        <View
                          style={[
                            styles.legendDot,
                            { backgroundColor: COLOR_IDLE },
                          ]}
                        />
                        <Text style={styles.legendText}>0 km/h</Text>
                      </View>
                      <View style={styles.legendItem}>
                        <View
                          style={[
                            styles.legendDot,
                            { backgroundColor: COLOR_SLOW },
                          ]}
                        />
                        <Text style={styles.legendText}>1 - 10 km/h</Text>
                      </View>
                      <View style={styles.legendItem}>
                        <View
                          style={[
                            styles.legendDot,
                            { backgroundColor: COLOR_NORMAL },
                          ]}
                        />
                        <Text style={styles.legendText}>11 - 59 km/h</Text>
                      </View>
                      <View style={styles.legendItem}>
                        <View
                          style={[
                            styles.legendDot,
                            { backgroundColor: COLOR_FAST },
                          ]}
                        />
                        <Text style={styles.legendText}>60+ km/h</Text>
                      </View>
                      <View style={styles.legendItem}>
                        <CarFront size={11} color={ORANGE} />
                        <Text style={styles.legendText}>Inicio</Text>
                      </View>
                      <View style={styles.legendItem}>
                        <Flag size={10} color={NAVY} fill={NAVY} />
                        <Text style={styles.legendText}>Meta</Text>
                      </View>
                    </View>
                  </>
                )}

                <TouchableOpacity
                  style={{ alignItems: 'center', paddingTop: 8 }}
                  onPress={() => setSheetOpen(!sheetOpen)}
                  activeOpacity={0.7}
                >
                  {sheetOpen ? (
                    <ChevronDown size={16} color="#c3cbd8" />
                  ) : (
                    <ChevronUp size={16} color="#c3cbd8" />
                  )}
                </TouchableOpacity>
              </View>
            </>
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
  );
};

export default TourReport;
