import 'react-native-url-polyfill/auto';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  Image,
  ScrollView,
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
import MapView, {
  Callout,
  Circle,
  Marker,
  PROVIDER_DEFAULT,
} from 'react-native-maps';
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
import { formatDateTime, formatThreeDecimals, openGoogleMaps, toUpperCaseText } from '../../../utils/textUtils';
import RadarDot from '../../../components/login/RadarDot';
import {
  DIRECTION_IMAGES,
  getDirectionImage,
  getDirectionImageData,
} from '../../../styles/directionImages';
import { generateLeafletHTML } from './leafletMapTemplate';
import CoordinatesModal from './Coordinatesmodal';


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


  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleOpenCoordinatesModal = () => {
    setIsModalVisible(true);
  };

  const handleCloseCoordinatesModal = () => {
    setIsModalVisible(false);
  };



  const [connectionStatus, setConnectionStatus] = useState<
    'connecting' | 'connected' | 'disconnected' | 'error'
  >('connecting');
  const [isWebViewReady, setIsWebViewReady] = useState(false);

  const { device } = route.params;
  const { user, logout, server, tipo, selectedVehiclePin } = useAuthStore();

  const insets = useSafeAreaInsets();
  const navigationDetection = useNavigationMode();
  const bottomSpace = getBottomSpace(
    insets,
    navigationDetection.hasNavigationBar,
  );
  const [mapType, setMapType] = useState<'standard' | 'satellite' | 'hybrid'>('standard');
  const [hasShownInitialCallout, setHasShownInitialCallout] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      NavigationBarColor('#00296b', false);
    }, []),
  );


  const [radarPulse, setRadarPulse] = useState({
    wave1: 0,
    wave2: 0.25,
    wave3: 0.5,
    wave4: 0.75,
  });

  useEffect(() => {
    if (Platform.OS === 'ios' && vehicleData) {
      const interval = setInterval(() => {
        setRadarPulse(prev => ({
          wave1: (prev.wave1 + 0.01) % 1,
          wave2: (prev.wave2 + 0.01) % 1,
          wave3: (prev.wave3 + 0.01) % 1,
          wave4: (prev.wave4 + 0.01) % 1,
        }));
      }, 40);

      return () => clearInterval(interval);
    }
  }, [vehicleData]);

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
      console.error('Faltan datos para conectar SignalR');
      setConnectionStatus('error');
      return;
    }

    const hubUrl = `${server}/dataHubVehicle/${username}/${placa}`;
    console.log('Conectando a:', hubUrl);
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
      if (datos.vehiculo) {
        setVehicleData(datos.vehiculo);
        setConnectionStatus('connected');
      }
    });

    newConnection.on('ConectadoExitosamente', data => {
      console.log('Conectado exitosamente:', data);
      setConnectionStatus('connected');
    });

    newConnection.on('Error', msg => {
      console.error('Error desde SignalR:', msg);
      setConnectionStatus('error');
    });

    newConnection.onreconnecting(error => {
      setConnectionStatus('connecting');
    });

    newConnection.onreconnected(connectionId => {
      setConnectionStatus('connected');
    });

    newConnection.onclose(error => {
      console.log('🔌 Conexión cerrada', error);
      setConnectionStatus('disconnected');
    });

    newConnection
      .start()
      .then(() => {
        setConnectionStatus('connected');
      })
      .catch(err => {
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
  const heading = vehicleData?.lastValidHeading || 0;

  const getStatus = () => {
    if (!vehicleData) return 'Cargando...';
    if (speed > 0) return 'Movimiento';
    return 'Detenido';
  };

  const status = getStatus();

  const handleGoBack = () => {
    navigation.goBack();
  };

  const toggleInfo = () => {
    setIsInfoExpanded(!isInfoExpanded);
  };


  const getLeafletTileLayer = (type: 'standard' | 'satellite' | 'hybrid') => {
    switch (type) {
      case 'satellite':
        return {
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          attribution: '&copy; Esri'
        };
      case 'hybrid':
        return {
          baseUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          overlayUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          attribution: '&copy; Esri &copy; OpenStreetMap'
        };
      default:
        return {
          url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          attribution: '&copy; OpenStreetMap contributors'
        };
    }
  };

  const tileConfig = getLeafletTileLayer(mapType);

  const pinType = selectedVehiclePin || 's';


  const iconSizes = pinType === 'c'
    ? {
      vertical: [35, 90] as [number, number],
      horizontal: [90, 45] as [number, number],
    }
    : {
      vertical: [30, 40] as [number, number],
      horizontal: [55, 35] as [number, number],
    };

  const popupOffset = pinType === 'c' ? -50 : -30;


  const leafletHTML = useMemo(() =>
    generateLeafletHTML({
      mapType,
      tileConfig,
      pinType,
      DIRECTION_IMAGES,
      iconSizes,
      popupOffset
    }),
    [mapType, tileConfig, pinType, iconSizes, popupOffset]
  );

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
      setTimeout(() => {
        const script = `window.updateMarkerPosition(${latitude}, ${longitude}, ${heading}, ${speed}, '${status}', '${device.name}', '${device.id}'); true;`;
        webViewRef.current?.injectJavaScript(script);
      }, 100);
    }
  }, [
    latitude,
    longitude,
    heading,
    speed,
    status,
    vehicleData,
    isWebViewReady,
    mapType,
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
    if (
      Platform.OS === 'ios' &&
      markerRef.current &&
      vehicleData &&
      !hasShownInitialCallout
    ) {
      setTimeout(() => {
        markerRef.current?.showCallout();
        setHasShownInitialCallout(true);
      }, 300);
    }
  }, [vehicleData, hasShownInitialCallout]);



  const renderMap = () => {
    if (Platform.OS === 'ios') {
      const imageData = getDirectionImageData(heading);

      const iosImageSize: [number, number] =
        imageData.name === 'up.png' || imageData.name === 'down.png'
          ? (pinType === 'c' ? [35, 90] : imageData.size)
          : (pinType === 'c' ? [90, 50] : imageData.size);

      const radarColor =
        speed === 0
          ? '#ef4444'
          : speed > 0 && speed < 11
            ? '#ff8000'
            : speed >= 11 && speed < 60
              ? '#38b000'
              : '#00509d';

      const wave1Radius = 10 + radarPulse.wave1 * 90;
      const wave2Radius = 10 + radarPulse.wave2 * 90;
      const wave3Radius = 10 + radarPulse.wave3 * 90;
      const wave4Radius = 10 + radarPulse.wave4 * 90;

      const getOpacity = (progress: number) => {
        if (progress < 0.03 || progress > 0.8) return 0;
        if (progress < 0.08) return ((progress - 0.03) / 0.05) * 0.2;
        return (1 - progress) * 0.25;
      };

      const wave1Opacity = getOpacity(radarPulse.wave1);
      const wave2Opacity = getOpacity(radarPulse.wave2);
      const wave3Opacity = getOpacity(radarPulse.wave3);
      const wave4Opacity = getOpacity(radarPulse.wave4);

      return (
        <>
          <MapView
            ref={mapRef}
            provider={PROVIDER_DEFAULT}
            style={styles.map}
            mapType={mapType}
            region={{
              latitude: latitude,
              longitude: longitude,
              latitudeDelta: 0.008,
              longitudeDelta: 0.008,
            }}
          >
            {vehicleData && (
              <>
                {wave1Opacity > 0 && (
                  <Circle
                    center={{ latitude, longitude }}
                    radius={wave1Radius}
                    fillColor={`${radarColor}${Math.floor(wave1Opacity * 255).toString(16).padStart(2, '0')}`}
                    strokeColor={`${radarColor}${Math.floor(wave1Opacity * 200).toString(16).padStart(2, '0')}`}
                    strokeWidth={2}
                  />
                )}
                {wave2Opacity > 0 && (
                  <Circle
                    center={{ latitude, longitude }}
                    radius={wave2Radius}
                    fillColor={`${radarColor}${Math.floor(wave2Opacity * 255).toString(16).padStart(2, '0')}`}
                    strokeColor={`${radarColor}${Math.floor(wave2Opacity * 200).toString(16).padStart(2, '0')}`}
                    strokeWidth={2}
                  />
                )}
                {wave3Opacity > 0 && (
                  <Circle
                    center={{ latitude, longitude }}
                    radius={wave3Radius}
                    fillColor={`${radarColor}${Math.floor(wave3Opacity * 255).toString(16).padStart(2, '0')}`}
                    strokeColor={`${radarColor}${Math.floor(wave3Opacity * 200).toString(16).padStart(2, '0')}`}
                    strokeWidth={2}
                  />
                )}
                {wave4Opacity > 0 && (
                  <Circle
                    center={{ latitude, longitude }}
                    radius={wave4Radius}
                    fillColor={`${radarColor}${Math.floor(wave4Opacity * 255).toString(16).padStart(2, '0')}`}
                    strokeColor={`${radarColor}${Math.floor(wave4Opacity * 200).toString(16).padStart(2, '0')}`}
                    strokeWidth={2}
                  />
                )}

                <Marker
                  ref={markerRef}
                  key={device.id}
                  anchor={{
                    x: imageData.anchor[0] / imageData.size[0],
                    y: imageData.anchor[1] / imageData.size[1],
                  }}
                  coordinate={{ latitude, longitude }}
                >
                  <Image
                    source={getDirectionImage(heading, pinType)}
                    style={{
                      width: iosImageSize[0],
                      height: iosImageSize[1],
                    }}
                    resizeMode="contain"
                  />
                  <Callout>
                    <View style={{ padding: 0, minWidth: 230 }}>
                      <Text style={{ fontWeight: 'bold', fontSize: 14, marginBottom: 5 }}>
                        {toUpperCaseText(device.name)}
                      </Text>
                      <Text style={{ color: '#666' }}>
                        {status} - {formatThreeDecimals(speed)} Km/h - {obtenerDireccion(heading)}
                      </Text>
                    </View>
                  </Callout>
                </Marker>
              </>
            )}
          </MapView>

          <View style={[styles.mapTypeSelector, { top: insets.top + 15 }]}>

            <TouchableOpacity
              style={[styles.mapTypeButton, mapType === 'standard' && styles.mapTypeButtonActive]}
              onPress={() => setMapType('standard')}
            >
              <Text style={[styles.mapTypeButtonText, mapType === 'standard' && styles.mapTypeButtonTextActive]}>
                Calles
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.mapTypeButton, mapType === 'satellite' && styles.mapTypeButtonActive]}
              onPress={() => setMapType('satellite')}
            >
              <Text style={[styles.mapTypeButtonText, mapType === 'satellite' && styles.mapTypeButtonTextActive]}>
                Satélite
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.mapTypeButton, mapType === 'hybrid' && styles.mapTypeButtonActive]}
              onPress={() => setMapType('hybrid')}
            >
              <Text style={[styles.mapTypeButtonText, mapType === 'hybrid' && styles.mapTypeButtonTextActive]}>
                Híbrido
              </Text>
            </TouchableOpacity>
          </View>
        </>
      );
    } else {
      return (
        <>
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

          <View style={[styles.mapTypeSelector, { top: insets.top + 15 }]}>
            <TouchableOpacity
              style={[styles.mapTypeButton, mapType === 'standard' && styles.mapTypeButtonActive]}
              onPress={() => setMapType('standard')}
            >
              <Text style={[styles.mapTypeButtonText, mapType === 'standard' && styles.mapTypeButtonTextActive]}>
                Calles
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.mapTypeButton, mapType === 'satellite' && styles.mapTypeButtonActive]}
              onPress={() => setMapType('satellite')}
            >
              <Text style={[styles.mapTypeButtonText, mapType === 'satellite' && styles.mapTypeButtonTextActive]}>
                Satélite
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.mapTypeButton, mapType === 'hybrid' && styles.mapTypeButtonActive]}
              onPress={() => setMapType('hybrid')}
            >
              <Text style={[styles.mapTypeButtonText, mapType === 'hybrid' && styles.mapTypeButtonTextActive]}>
                Híbrido
              </Text>
            </TouchableOpacity>
          </View>
        </>
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
    <View style={[styles.container, { paddingBottom: bottomSpace-2 }]}>
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
          activeOpacity={0.7}
        >
          <ChevronLeft size={26} color="#ffffffff" />
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.infoPanel,
          {
    bottom: Platform.OS === 'ios' ? bottomSpace : bottomSpace - 2,
            height: isInfoExpanded ? 280 : 50,
            backgroundColor: '#1e3a8a',
          },
        ]}
      >
        <TouchableOpacity style={styles.panelHeader} onPress={toggleInfo}>
          <View style={styles.panelHeaderContent}>
            <View style={styles.deviceHeaderInfo}>
              <Text style={styles.deviceName}>
                {toUpperCaseText(device.name)}
              </Text>
              <View style={styles.deviceStatusRow}>
                <View
                  style={[
                    {
                      backgroundColor: connectionDisplay.color,
                    },
                  ]}
                />
                <RadarDot
                  color={connectionDisplay.color}
                  size={3}
                  pulseCount={3}
                />

                <Text
                  style={[
                    styles.onlineStatus,
                    { color: connectionDisplay.color },
                  ]}
                >
                  {connectionDisplay.text}
                </Text>
                <Text style={styles.deviceId}>
                  Dirección: {obtenerDireccion(heading)}
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
                    <Text style={styles.speedText}>
                      ({formatThreeDecimals(speed)} Km/h)
                    </Text>
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
                    <TouchableOpacity
                      onPress={handleOpenCoordinatesModal}
                      activeOpacity={0.8}
                      disabled={!vehicleData}
                    >
                      <Image
                        source={{ uri: 'https://res.cloudinary.com/dyc4ik1ko/image/upload/v1761452839/camino_gyy3ip.jpg' }}
                        style={styles.streetViewImage}
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
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
                    onPress={() => openGoogleMaps(latitude, longitude)}
                    disabled={!vehicleData}
                  >
                    <MapPin size={15} color="#fff" />
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

      <CoordinatesModal
        visible={isModalVisible}
        onClose={handleCloseCoordinatesModal}
        latitude={latitude}
        longitude={longitude}

      />
    </View>
  );
};

export default DetailDevice;
