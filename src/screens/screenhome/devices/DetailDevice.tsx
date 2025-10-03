// DetailDevice.tsx
import 'react-native-url-polyfill/auto';

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
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
} from 'lucide-react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
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
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [isInfoExpanded, setIsInfoExpanded] = useState(true);
  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting');

  const { device } = route.params;
  const { user, logout, server, tipo } = useAuthStore();

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
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
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
        }
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

    newConnection.on('ConectadoExitosamente', (data) => {
      console.log('✅ Conectado exitosamente:', data);
      setConnectionStatus('connected');
    });

    newConnection.on('Error', (msg) => {
      console.error('❌ Error desde SignalR:', msg);
      setConnectionStatus('error');
    });

    newConnection.onreconnecting((error) => {
      console.log('🔄 Reconectando...', error);
      setConnectionStatus('connecting');
    });

    newConnection.onreconnected((connectionId) => {
      console.log('✅ Reconectado con ID:', connectionId);
      setConnectionStatus('connected');
    });

    newConnection.onclose((error) => {
      console.log('🔌 Conexión cerrada', error);
      setConnectionStatus('disconnected');
    });

    newConnection.start()
      .then(() => {
        console.log('✅ SignalR conectado exitosamente');
        setConnectionStatus('connected');
      })
      .catch((err) => {
        console.error('❌ Error al conectar SignalR:', err);
        setConnectionStatus('error');
      });

    setConnection(newConnection);

    return () => {
      if (newConnection && newConnection.state === signalR.HubConnectionState.Connected) {
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

  const getStatus = () => {
    if (!vehicleData) return 'Cargando...';
    if (speed > 0) return 'Movimiento';
    return 'Detenido';
  };

  const status = getStatus();

  const GOOGLE_MAPS_API_KEY = 'AIzaSyDjSwibBACnjf7AZXR2sj1yBUEMGq2o1ho';

  const openGoogleMaps = () => {
    if (!vehicleData) return;
    
    const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`;

    const nativeUrl = Platform.select({
      ios: `maps://app?daddr=${latitude},${longitude}&dirflg=d`,
      android: `google.navigation:q=${latitude},${longitude}&mode=d`,
      default: webUrl
    });

    if (nativeUrl) {
      Linking.canOpenURL(nativeUrl).then(supported => {
        if (supported) {
          return Linking.openURL(nativeUrl);
        } else {
          return Linking.openURL(webUrl);
        }
      }).catch(err => {
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
            
            // Solo mostrar popup si vehicleData existe
            ${vehicleData ? `
            marker.bindPopup(\`
                <div style="text-align: center; font-family: Arial, sans-serif; min-width: 200px;">
                    <h3 style="margin: 8px 0; color: #1e40af; font-size: 16px;">${device.name}</h3>
                    <div style="display: flex; flex-direction: column; gap: 6px; text-align: left;">
                        <div style="display: flex; justify-content: space-between;">
                            <span style="font-weight: 600; color: #374151;">Estado:</span>
                            <span style="color: ${status === 'Movimiento' ? '#10b981' : '#ef4444'}; font-weight: 600;">${status}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="font-weight: 600; color: #374151;">Velocidad:</span>
                            <span style="color: #6b7280;">${speed} Km/h</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="font-weight: 600; color: #374151;">Conexión:</span>
                            <span style="color: ${connectionStatus === 'connected' ? '#10b981' : connectionStatus === 'connecting' ? '#FF9800' : '#f44336'}; font-weight: 600;">${connectionStatus === 'connected' ? 'Online' : connectionStatus === 'connecting' ? 'Conectando...' : 'Offline'}</span>
                        </div>
                        <div style="border-top: 1px solid #e5e7eb; padding-top: 6px; margin-top: 4px;">
                            <div style="font-size: 12px; color: #6b7280;">ID: ${device.id}</div>
                        </div>
                    </div>
                </div>
            \`).openPopup();
            ` : ''}

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

            window.updateMarkerPosition = function(lat, lng) {
                marker.setLatLng([lat, lng]);
                map.setView([lat, lng], 16);
                
                // Agregar popup cuando se actualiza la posición
                marker.bindPopup(\`
                    <div style="text-align: center; font-family: Arial, sans-serif; min-width: 200px;">
                        <h3 style="margin: 8px 0; color: #1e40af; font-size: 16px;">${device.name}</h3>
                        <div style="display: flex; flex-direction: column; gap: 6px; text-align: left;">
                            <div style="display: flex; justify-content: space-between;">
                                <span style="font-weight: 600; color: #374151;">Estado:</span>
                                <span style="color: ${status === 'Movimiento' ? '#10b981' : '#ef4444'}; font-weight: 600;">${status}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span style="font-weight: 600; color: #374151;">Velocidad:</span>
                                <span style="color: #6b7280;">${speed} Km/h</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span style="font-weight: 600; color: #374151;">Conexión:</span>
                                <span style="color: #10b981; font-weight: 600;">Online</span>
                            </div>
                            <div style="border-top: 1px solid #e5e7eb; padding-top: 6px; margin-top: 4px;">
                                <div style="font-size: 12px; color: #6b7280;">ID: ${device.id}</div>
                            </div>
                        </div>
                    </div>
                \`);
            };
        </script>
    </body>
    </html>
  `;

  const webViewRef = React.useRef<WebView>(null);

  useEffect(() => {
    if (Platform.OS === 'android' && webViewRef.current && vehicleData) {
      const script = `window.updateMarkerPosition(${latitude}, ${longitude}); true;`;
      webViewRef.current.injectJavaScript(script);
    }
  }, [latitude, longitude, vehicleData]);

  const renderMap = () => {
    if (Platform.OS === 'ios') {
      return (
        <MapView
          provider={PROVIDER_DEFAULT}
          style={styles.map}
          region={{
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
            description={`${status} - ${speed} Km/h`}
            pinColor="#3b82f6"
          />
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
          geolocationEnabled={hasLocationPermission}
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
        return { color: '#10b981', text: 'Online' };
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
      {/* Map Container */}
      <View style={styles.mapContainer}>
        {renderMap()}

        {/* Overlay SOLO sobre el mapa mientras carga */}
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
              <Text style={{ color: '#fff', marginTop: 16, fontSize: 16, fontWeight: '600' }}>
                CARGANDO ...
              </Text>
              <Text style={{ color: '#e9ecef', marginTop: 8, fontSize: 14 }}>
                {connectionStatus === 'connecting' ? 'Conectando al servidor...' : 
                 connectionStatus === 'error' ? 'Error de conexión' : 'Esperando datos...'}
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

      {/* Panel inferior - SIEMPRE visible */}
      <View 
        style={[
          styles.infoPanel, 
          { 
            bottom: bottomSpace, 
            height: isInfoExpanded ? 280 : 50,
            backgroundColor: '#1e3a8a', 
          }
        ]}
      >
        <TouchableOpacity style={styles.panelHeader} onPress={toggleInfo}>
          <View style={styles.panelHeaderContent}>
            <View style={styles.deviceHeaderInfo}>
              <Text style={styles.deviceName}>{device.name}</Text>
              <View style={styles.deviceStatusRow}>
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor: connectionDisplay.color,
                    },
                  ]}
                />
                <Text style={styles.deviceId}>ID: {device.id}</Text>
                <Text
                  style={[
                    styles.onlineStatus,
                    { color: connectionDisplay.color },
                  ]}
                >
                  {connectionDisplay.text}
                </Text>
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
                    color={status === 'Movimiento' ? '#10b981' : status === 'Detenido' ? '#ef4444' : '#6b7280'}
                  />
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color: status === 'Movimiento' ? '#10b981' : status === 'Detenido' ? '#ef4444' : '#6b7280',
                      },
                    ]}
                  >
                    {status}
                  </Text>
                  {vehicleData && <Text style={styles.speedText}>({speed} Km/h)</Text>}
                </View>
                <View style={styles.dateContainer}>
                  <Clock size={14} color="#6b7280" />
                  <View>
                    <Text style={styles.dateText}>{formatDateTime(currentTime)}</Text>
                    <Text style={styles.lastReportText}>Último reporte</Text>
                  </View>
                </View>
              </View>

              <View style={styles.distanceInfo}>
                <MapPin size={18} color="#6b7280" />
                <Text style={styles.distanceText}>
                  {vehicleData?.lastOdometerKM ? `${vehicleData.lastOdometerKM.toFixed(1)} km recorridos` : 'Cargando kilometraje...'}
                </Text>
              </View>
              <Text style={styles.startTimeText}>
                Empezó el día a las 02:55:53 PM
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
                    <View style={[styles.streetViewImage, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#334155' }]}>
                      <ActivityIndicator size="small" color="#3b82f6" />
                    </View>
                  )}
                  <View style={styles.streetViewOverlay}>
                    <Eye size={12} color="#fff" />
                    <Text style={styles.streetViewText}>View</Text>
                  </View>
                </View>
                <View style={styles.locationInfoRight}>
                  <Text style={styles.locationTitle}>
                    {address}
                  </Text>
                  <Text style={styles.locationSubtitle}>Ubicación actual</Text>
                  <TouchableOpacity 
                    style={[styles.locationButton, { opacity: vehicleData ? 1 : 0.5 }]}  
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
                <Text style={styles.arrowText}>→</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}
      </View>
    </View>

  );
};

export default DetailDevice;