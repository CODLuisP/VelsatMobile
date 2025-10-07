import 'react-native-url-polyfill/auto';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  Image,
  ScrollView,
  Linking,
  ActivityIndicator,
} from 'react-native';
import {
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  Navigation,
  Clock,
  MapPin,
  Eye,
  Forward,
  ChevronRight,
} from 'lucide-react-native';
import MapView, { Callout, Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { WebView } from 'react-native-webview';
import {
  NavigationProp,
  useNavigation,
  RouteProp,
  useRoute,
} from '@react-navigation/native';
import { RootStackParamList } from '../../../../App';
import { styles } from '../../../styles/detaildevice';
import * as signalR from '@microsoft/signalr';
import NavigationBarColor from 'react-native-navigation-bar-color';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  getBottomSpace,
  useNavigationMode,
} from '../../../hooks/useNavigationMode';
import { useAuthStore } from '../../../store/authStore';
import { obtenerDireccion } from '../../../utils/obtenerDireccion';
import { toUpperCaseText } from '../../../utils/textUtils';
import RadarDot from '../../../components/login/RadarDot';
import { DIRECTION_IMAGES, getDirectionImageData } from '../../../styles/directionImages';


type DetailDeviceRouteProp = RouteProp<RootStackParamList, 'DetailDevice'>;


interface VehicleData {
  deviceId: string;
  lastGPSTimestamp: number;
  lastValidLatitude: number;
  lastValidLongitude: number;
  lastValidHeading: number;
  lastValidSpeed: number;
  lastOdometerKM: number;
  odometerini: number | null;
  kmini: number | null;
  descripcion: string | null;
  direccion: string;
  codgeoact: string | null;
  rutaact: string | null;
  servicio: string | null;
  datosGeocercausu: any | null;
}


interface SignalRData {
  fechaActual: string;
  vehiculo: VehicleData;
}




const DetailDevice = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<DetailDeviceRouteProp>();
  const [isInfoExpanded, setIsInfoExpanded] = useState(true);
  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [connection, setConnection] = useState<signalR.HubConnection | null>(
    null,
  );
  const [connectionStatus, setConnectionStatus] = useState<
    'connecting' | 'connected' | 'disconnected' | 'error'
  >('connecting');
  const [isWebViewReady, setIsWebViewReady] = useState(false);


  const { device } = route.params;
  const { user, logout, server, tipo } = useAuthStore();


  const insets = useSafeAreaInsets();
  const navigationDetection = useNavigationMode();
  const bottomSpace = getBottomSpace(
    insets,
    navigationDetection.hasNavigationBar,
  );

  const [hasShownInitialCallout, setHasShownInitialCallout] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      NavigationBarColor('#1e3a8a', false);

    }, []),
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);


    return () => clearInterval(timer);
  }, []);


  useEffect(() => {
    const username = user?.username;
    const placa = device.name;


    if (!username || !placa) {
      console.error('❌ Faltan datos para conectar SignalR');
      setConnectionStatus('error');
      return;
    }

    const hubUrl = `${server}/dataHubVehicle/${username}/${placa}`;
    console.log('🔗 Conectando a:', hubUrl);
    setConnectionStatus('connecting');

    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        skipNegotiation: false,
        transport:
          signalR.HttpTransportType.WebSockets |
          signalR.HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: retryContext => {
          if (retryContext.previousRetryCount === 0) {
            return 0;
          }
          if (retryContext.previousRetryCount < 3) {
            return 2000;
          }
          if (retryContext.previousRetryCount < 6) {
            return 10000;
          }
          return 30000;
        },
      })
      .configureLogging(signalR.LogLevel.Information)
      .build();


    newConnection.on('ActualizarDatosVehiculo', (datos: SignalRData) => {
      console.log('📡 Datos recibidos:', JSON.stringify(datos, null, 2));
      if (datos.vehiculo) {
        setVehicleData(datos.vehiculo);
        setConnectionStatus('connected');
      }
    });


    newConnection.on('ConectadoExitosamente', data => {
      console.log('✅ Conectado exitosamente:', data);
      setConnectionStatus('connected');
    });


    newConnection.on('Error', msg => {
      console.error('❌ Error desde SignalR:', msg);
      setConnectionStatus('error');
    });


    newConnection.onreconnecting(error => {
      console.log('🔄 Reconectando...', error);
      setConnectionStatus('connecting');
    });


    newConnection.onreconnected(connectionId => {
      console.log('✅ Reconectado con ID:', connectionId);
      setConnectionStatus('connected');
    });


    newConnection.onclose(error => {
      console.log('🔌 Conexión cerrada', error);
      setConnectionStatus('disconnected');
    });


    newConnection
      .start()
      .then(() => {
        console.log('✅ SignalR conectado exitosamente');
        setConnectionStatus('connected');
      })
      .catch(err => {
        console.error('❌ Error al conectar SignalR:', err);
        setConnectionStatus('error');
      });


    setConnection(newConnection);


    return () => {
      if (
        newConnection &&
        newConnection.state === signalR.HubConnectionState.Connected
      ) {
        newConnection.stop().then(() => {
          console.log('🔌 SignalR desconectado correctamente');
        });
      }
    };
  }, [device.name, user?.username]);


  const handleInfiDevice = () => {
    navigation.navigate('InfoDevice', {
      deviceName: device.name,
    });
  };


  const latitude = vehicleData?.lastValidLatitude || -12.0464;
  const longitude = vehicleData?.lastValidLongitude || -77.0428;
  const speed = vehicleData?.lastValidSpeed || 0;
  const address = vehicleData?.direccion || 'Cargando ubicación...';
  const gpsTimestamp = vehicleData?.lastGPSTimestamp || Date.now() / 1000;
  const heading = vehicleData?.lastValidHeading || 0;


  const getStatus = () => {
    if (!vehicleData) return 'Cargando...';
    if (speed > 0) return 'Movimiento';
    return 'Detenido';
  };


  const status = getStatus();
  const GOOGLE_MAPS_API_KEY = 'AIzaSyDjSwibBACnjf7AZXR2sj1yBUEMGq2o1ho';

  const getDirectionImageName = (
    angle: number,
  ): keyof typeof DIRECTION_IMAGES => {
    return getDirectionImageData(angle).name;
  };

  const getDirectionImage = (angle: number) => {
    const imageName = getDirectionImageName(angle);
    return { uri: DIRECTION_IMAGES[imageName] };
  };


  const openGoogleMaps = () => {
    if (!vehicleData) return;


    const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`;


    const nativeUrl = Platform.select({
      ios: `maps://app?daddr=${latitude},${longitude}&dirflg=d`,
      android: `google.navigation:q=${latitude},${longitude}&mode=d`,
      default: webUrl,
    });


    if (nativeUrl) {
      Linking.canOpenURL(nativeUrl)
        .then(supported => {
          if (supported) {
            return Linking.openURL(nativeUrl);
          } else {
            return Linking.openURL(webUrl);
          }
        })
        .catch(err => {
          console.error('Error al abrir Google Maps:', err);
          Linking.openURL(webUrl);
        });
    } else {
      Linking.openURL(webUrl);
    }
  };


  const getStreetViewUrl = () => {
    return `https://maps.googleapis.com/maps/api/streetview?size=300x150&location=${latitude},${longitude}&heading=0&pitch=0&key=${GOOGLE_MAPS_API_KEY}`;
  };


  const handleGoBack = () => {
    navigation.goBack();
  };

  const toggleInfo = () => {
    setIsInfoExpanded(!isInfoExpanded);
  };

  const formatDateTime = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };


  const leafletHTML = useMemo(() => {
    return `
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
           var map = L.map('map', {
               zoomControl: true,
               scrollWheelZoom: true,
               doubleClickZoom: true,
               touchZoom: true
           }).setView([-12.0464, -77.0428], 16);


           L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
               attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
               maxZoom: 19
           }).addTo(map);


           // Guardar todas las URLs de imágenes
              window.imageUrls = {
              up: '${DIRECTION_IMAGES['up.png']}',
              topright: '${DIRECTION_IMAGES['topright.png']}',
              right: '${DIRECTION_IMAGES['right.png']}',
              downright: '${DIRECTION_IMAGES['downright.png']}',
              down: '${DIRECTION_IMAGES['down.png']}',
              downleft: '${DIRECTION_IMAGES['downleft.png']}',
              left: '${DIRECTION_IMAGES['left.png']}',
              topleft: '${DIRECTION_IMAGES['topleft.png']}'
              };
           // Variable para el marcador (se creará cuando lleguen los datos)
           var marker = null;


           map.on('focus', function() {
               map.scrollWheelZoom.enable();
           });
           map.on('blur', function() {
               map.scrollWheelZoom.disable();
           });

           // Función para crear o actualizar el marcador
window.updateMarkerPosition = function(lat, lng, heading, speed, statusText, deviceName, deviceId) {
   // Determinar qué imagen y tamaño usar según el ángulo
   var imageUrl = '';
   var iconSize = [42, 25]; // Tamaño por defecto
  
   if (heading >= 0 && heading <= 22.5) {
       imageUrl = window.imageUrls.up;
       iconSize = [30,40]; // Vertical
   } else if (heading > 22.5 && heading <= 67.5) {
       imageUrl = window.imageUrls.topright;
       iconSize = [55, 35]; // Horizontal
   } else if (heading > 67.5 && heading <= 112.5) {
       imageUrl = window.imageUrls.right;
       iconSize = [55, 35]; // Horizontal
   } else if (heading > 112.5 && heading <= 157.5) {
       imageUrl = window.imageUrls.downright;
       iconSize = [55, 35]; // Horizontal
   } else if (heading > 157.5 && heading <= 202.5) {
       imageUrl = window.imageUrls.down;
       iconSize = [30,40]; // Vertical
   } else if (heading > 202.5 && heading <= 247.5) {
       imageUrl = window.imageUrls.downleft;
       iconSize = [55, 35]; // Horizontal
   } else if (heading > 247.5 && heading <= 292.5) {
       imageUrl = window.imageUrls.left;
       iconSize = [55, 35]; // Horizontal
   } else if (heading > 292.5 && heading <= 337.5) {
       imageUrl = window.imageUrls.topleft;
       iconSize = [55, 35]; // Horizontal
   } else {
       imageUrl = window.imageUrls.up;
       iconSize = [30,40]; // Vertical
   }


   var vehicleIcon = L.icon({
       iconUrl: imageUrl,
       iconSize: iconSize, // Usar tamaño dinámico
       iconAnchor: [iconSize[0] / 2, iconSize[1] / 2], // Centrar dinámicamente
       popupAnchor: [0, -30]
   });


               var statusColor = statusText === 'Movimiento' ? '#38b000' : '#ef4444';

               
               var popupContent = \`
                   <div style="text-align: center; font-family: Arial, sans-serif; min-width: 200px;">
                       <h3 style="margin: 8px 0; color: #f97316; font-size: 14.5px;text-transform: uppercase;font-weight: 800;">\${deviceName}</h3>
                       <div style="display: flex; flex-direction: column; gap: 3px; text-align: left;">
                           <div style="display: flex; justify-content: space-between;">
                               <span style="font-weight: 600; color: #374151;">Estado:</span>
                               <span style="color: \${statusColor}; font-weight: 600;">\${statusText}</span>
                           </div>
                           <div style="display: flex; justify-content: space-between;">
                               <span style="font-weight: 600; color: #374151;">Velocidad:</span>
                               <span style="color: #6b7280;">\${speed} Km/h</span>
                           </div>
                           <div style="display: flex; justify-content: space-between;">
                               <span style="font-weight: 600; color: #374151;">Dirección:</span>
                               <span style="color: #6b7280;">\${heading}°</span>
                           </div>
                           <div style="display: flex; justify-content: space-between;">
                               <span style="font-weight: 600; color: #374151;">Conexión:</span>
                               <span style="color: #38b000; font-weight: 600;">Online</span>
                           </div>
                           <div style="border-top: 1px solid #e5e7eb; padding-top: 6px; margin-top: 4px;">
                               <div style="font-size: 12px; color: #6b7280;">Monitoreo activo</div>
                           </div>
                       </div>
                   </div>
               \`;


               // Si es la primera vez, crear el marcador
               if (marker === null) {
                   marker = L.marker([lat, lng], {
                       icon: vehicleIcon,
                       autoPan: false
                   }).addTo(map);


                   marker.bindPopup(popupContent, {
                       autoPan: false,
                       closeButton: true,
                       autoClose: false,
                       closeOnClick: false
                   }).openPopup();


                   // Centrar el mapa en el marcador
                   map.setView([lat, lng], 16);
               } else {
                   // Actualizar marcador existente
                   marker.setIcon(vehicleIcon);
                   marker.setLatLng([lat, lng]);
                   marker.getPopup().setContent(popupContent);
                  
                   // Centrar el mapa en el marcador
                   map.setView([lat, lng], map.getZoom());
                  
                   // Mantener el popup abierto
                   if (!marker.isPopupOpen()) {
                       marker.openPopup();
                   }
               }
 };


           // ⭐ SOLUCIÓN: Escuchar eventos de visibilidad
           document.addEventListener('visibilitychange', function() {
               if (!document.hidden && map) {
                   setTimeout(function() {
                       console.log('Página visible - invalidando mapa');
                       map.invalidateSize(true);
                      
                       // Forzar redibujado de tiles
                       map.eachLayer(function(layer) {
                           if (layer instanceof L.TileLayer) {
                               layer.redraw();
                           }
                       });
                   }, 250);
               }
           });


           // Para mensajes desde React Native
           document.addEventListener('message', function(event) {
               if (event.data === 'invalidate-size') {
                   if (map) {
                       setTimeout(function() {
                           map.invalidateSize(true);
                       }, 100);
                   }
               }
           });


           window.addEventListener('message', function(event) {
               if (event.data === 'invalidate-size') {
                   if (map) {
                       setTimeout(function() {
                           map.invalidateSize(true);
                       }, 100);
                   }
               }
           });


           // Señalar que el WebView está listo
           window.ReactNativeWebView.postMessage('webview-ready');
       </script>
   </body>
   </html>
 `;
  }, []);


  const webViewRef = useRef<WebView>(null);
  const mapRef = useRef<MapView>(null);
  const markerRef = useRef<any>(null);


  useEffect(() => {
    if (
      Platform.OS === 'android' &&
      webViewRef.current &&
      vehicleData &&
      isWebViewReady
    ) {
      const script = `window.updateMarkerPosition(${latitude}, ${longitude}, ${heading}, ${speed}, '${status}', '${device.name}', '${device.id}'); true;`;
      webViewRef.current.injectJavaScript(script);
    }
  }, [
    latitude,
    longitude,
    heading,
    speed,
    status,
    vehicleData,
    isWebViewReady,
  ]);


  useEffect(() => {
    if (Platform.OS === 'ios' && mapRef.current && vehicleData) {
      setTimeout(() => {
        mapRef.current?.animateCamera({
          center: { latitude, longitude },
          zoom: 16,
        });
      }, 300);
    }
  }, [vehicleData, latitude, longitude]);


  useEffect(() => {
    if (Platform.OS === 'ios' && markerRef.current && vehicleData && !hasShownInitialCallout) {
      setTimeout(() => {
        markerRef.current?.showCallout();
        setHasShownInitialCallout(true);
      }, 300);
    }
  }, [vehicleData, hasShownInitialCallout]);

  const formatThreeDecimals = (num: any) => {
    const number = Number(num);
    if (Number.isInteger(number)) {
      return number.toString();
    }
    return parseFloat(number.toFixed(2)).toString();
  };


  const renderMap = () => {
    if (Platform.OS === 'ios') {

      const imageData = getDirectionImageData(heading);

      return (
        <MapView
          ref={mapRef}
          provider={PROVIDER_DEFAULT}
          style={styles.map}
          region={{
            latitude: latitude,
            longitude: longitude,
            latitudeDelta: 0.008,
            longitudeDelta: 0.008,
          }}

        >
          {vehicleData && (
            <Marker
              ref={markerRef}
              key={device.id}
              anchor={{ x: imageData.anchor[0] / imageData.size[0], y: imageData.anchor[1] / imageData.size[1] }}

              coordinate={{
                latitude: latitude,
                longitude: longitude,
              }}
            >
              <Image
                source={getDirectionImage(heading)}
                style={{ width: imageData.size[0], height: imageData.size[1] }}
                resizeMode="contain"
              />
              <Callout>
                <View style={{ padding: 0, minWidth: 200 }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 14, marginBottom: 5 }}>
                    {toUpperCaseText(device.name)}
                  </Text>
                  <Text style={{ color: '#666' }}>
                    {status} - {formatThreeDecimals(speed)} Km/h - {heading}°
                  </Text>
                </View>
              </Callout>
            </Marker>
          )}
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
          onMessage={event => {
            if (event.nativeEvent.data === 'webview-ready') {
              setIsWebViewReady(true);
            }
          }}
          onError={syntheticEvent => {
            const { nativeEvent } = syntheticEvent;
            console.warn('WebView error: ', nativeEvent);
          }}
        />
      );
    }
  };


  const getConnectionDisplay = () => {
    switch (connectionStatus) {
      case 'connected':
        return { color: '#70e000', text: 'Online' };
      case 'connecting':
        return { color: '#FF9800', text: 'Conectando...' };
      case 'error':
        return { color: '#ef4444', text: 'Error' };
      default:
        return { color: '#6b7280', text: 'Desconectado' };
    }
  };

  const connectionDisplay = getConnectionDisplay();

  return (
    <View style={[styles.container, { paddingBottom: bottomSpace }]}>
      <View style={styles.mapContainer}>
        {renderMap()}


        {!vehicleData && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 10,
            }}
          >
            <View
              style={{
                padding: 24,
                borderRadius: 16,
                alignItems: 'center',
                shadowColor: '#000',
              }}
            >
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text
                style={{
                  color: '#fff',
                  marginTop: 16,
                  fontSize: 16,
                  fontWeight: '600',
                }}
              >
                CARGANDO ...
              </Text>
              <Text style={{ color: '#e9ecef', marginTop: 8, fontSize: 14 }}>
                {connectionStatus === 'connecting'
                  ? 'Conectando al servidor...'
                  : connectionStatus === 'error'
                    ? 'Error de conexión'
                    : 'Esperando datos...'}
              </Text>
            </View>
          </View>
        )}


        <TouchableOpacity
          style={[styles.floatingBackButton, { top: insets.top + 10 }]}
          onPress={handleGoBack}
        >
          <ChevronLeft size={26} color="#1f2937" />
        </TouchableOpacity>
      </View>


      <View
        style={[
          styles.infoPanel,
          {
            bottom: bottomSpace,
            height: isInfoExpanded ? 280 : 50,
            backgroundColor: '#1e3a8a',
          },
        ]}
      >
        <TouchableOpacity style={styles.panelHeader} onPress={toggleInfo}>
          <View style={styles.panelHeaderContent}>
            <View style={styles.deviceHeaderInfo}>
              <Text style={styles.deviceName}>{toUpperCaseText(device.name)}</Text>
              <View style={styles.deviceStatusRow}>
                <View
                  style={[
                    {
                      backgroundColor: connectionDisplay.color,
                    },
                  ]}
                />
                <RadarDot color={connectionDisplay.color} size={3} pulseCount={3} />

                <Text
                  style={[
                    styles.onlineStatus,
                    { color: connectionDisplay.color },
                  ]}
                >
                  {connectionDisplay.text}
                </Text>
                <Text style={styles.deviceId}>Dirección: {obtenerDireccion(heading)}</Text>
              </View>
            </View>
            {isInfoExpanded ? (
              <ChevronDown size={24} color="#ffffffff" />
            ) : (
              <ChevronUp size={24} color="#ffffffff" />
            )}
          </View>
        </TouchableOpacity>


        {isInfoExpanded && (
          <View style={styles.panelContent}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={styles.scrollContent}
            >
              <View style={styles.statusRow}>
                <View style={styles.statusItem}>
                  <Navigation
                    size={16}
                    color={
                      status === 'Movimiento'
                        ? '#38b000'
                        : status === 'Detenido'
                          ? '#ef4444'
                          : '#6b7280'
                    }
                  />
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color:
                          status === 'Movimiento'
                            ? '#38b000'
                            : status === 'Detenido'
                              ? '#ef4444'
                              : '#6b7280',
                      },
                    ]}
                  >
                    {status}
                  </Text>
                  {vehicleData && (
                    <Text style={styles.speedText}>({formatThreeDecimals(speed)} Km/h)</Text>
                  )}
                </View>
                <View style={styles.dateContainer}>
                  <Clock size={14} color="#6b7280" />
                  <View>
                    <Text style={styles.dateText}>
                      {formatDateTime(currentTime)}
                    </Text>
                    <Text style={styles.lastReportText}>Último reporte</Text>
                  </View>
                </View>
              </View>

              <View style={styles.distanceInfo}>
                <MapPin size={18} color="#6b7280" />
                <Text style={styles.distanceText}>
                  {vehicleData?.lastOdometerKM
                    ? `${vehicleData.lastOdometerKM.toFixed(1)} km recorridos`
                    : 'Cargando kilometraje...'}
                </Text>
              </View>
              <Text style={styles.startTimeText}>
                Kilometraje total de su unidad
              </Text>

              <View style={styles.streetViewRow}>
                <View style={styles.streetViewContainer}>
                  {vehicleData ? (
                    <Image
                      source={{ uri: getStreetViewUrl() }}
                      style={styles.streetViewImage}
                      resizeMode="cover"
                      key={`${latitude}-${longitude}`}
                    />
                  ) : (
                    <View
                      style={[
                        styles.streetViewImage,
                        {
                          justifyContent: 'center',
                          alignItems: 'center',
                          backgroundColor: '#334155',
                        },
                      ]}
                    >
                      <ActivityIndicator size="small" color="#3b82f6" />
                    </View>
                  )}
                  <View style={styles.streetViewOverlay}>
                    <Eye size={12} color="#fff" />
                    <Text style={styles.streetViewText}>View</Text>
                  </View>
                </View>
                <View style={styles.locationInfoRight}>
                  <Text style={styles.locationTitle}>{address}</Text>
                  <Text style={styles.locationSubtitle}>Ubicación actual</Text>
                  <TouchableOpacity
                    style={[
                      styles.locationButton,
                      { opacity: vehicleData ? 1 : 0.5 },
                    ]}
                    onPress={openGoogleMaps}
                    disabled={!vehicleData}
                  >
                    <Forward size={15} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={styles.verMasButton}
                onPress={handleInfiDevice}
              >
                <Text style={styles.verMasText}>Ver más</Text>
                <Text style={styles.arrowText}>
                  <ChevronRight size={15} color="#fff" />
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}
      </View>
    </View>
  );
};

export default DetailDevice;