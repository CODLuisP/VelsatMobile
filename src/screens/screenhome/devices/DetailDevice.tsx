import 'react-native-url-polyfill/auto';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  Image,
  AppState,
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
import NavigationBarColor from 'react-native-navigation-bar-color';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  getBottomSpace,
  useNavigationMode,
} from '../../../hooks/useNavigationMode';
import { useAuthStore } from '../../../store/authStore';
import { obtenerDireccion } from '../../../utils/obtenerDireccion';
import { 
  formatDateTime, 
  formatThreeDecimals, 
  openGoogleMaps, 
  toUpperCaseText 
} from '../../../utils/textUtils';
import RadarDot from '../../../components/login/RadarDot';
import {
  DIRECTION_IMAGES,
  getDirectionImage,
  getDirectionImageData,
} from '../../../styles/directionImages';
import { generateLeafletHTML } from './leafletMapTemplate';
import CoordinatesModal from './Coordinatesmodal';
import { NavigationModal } from '../../../components/NavigationModal';

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

const DetailDevice = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<DetailDeviceRouteProp>();
  const [isInfoExpanded, setIsInfoExpanded] = useState(true);
  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const { device } = route.params;

  const [modalVisible, setModalVisible] = useState(false);
  const [navigationCoords, setNavigationCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [isModalVisible, setIsModalVisible] = useState(false);
const [connectionStatus, setConnectionStatus] = useState<  // ✅ Agregado 
    'connecting' | 'connected' | 'disconnected' | 'error'
  >('connecting');

  const [isWebViewReady, setIsWebViewReady] = useState(false);

  const { user, server, selectedVehiclePin } = useAuthStore();

  const insets = useSafeAreaInsets();
  const navigationDetection = useNavigationMode();
  const bottomSpace = getBottomSpace(
    insets,
    navigationDetection.hasNavigationBar,
  );
  const [mapType, setMapType] = useState<'standard' | 'satellite' | 'hybrid'>('standard');
  const [hasShownInitialCallout, setHasShownInitialCallout] = useState(false);

  const [radarPulse, setRadarPulse] = useState({
    wave1: 0,
    wave2: 0.25,
    wave3: 0.5,
    wave4: 0.75,
  });

  const isMountedRef = useRef(true);
const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPollingRef = useRef(false);

  useFocusEffect(
    React.useCallback(() => {
      NavigationBarColor('#00296b', false);
    }, []),
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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

  const fetchVehicleData = async () => {
    if (isPollingRef.current) return;
    
    const username = user?.username;
    const placa = device;

    if (!username || !placa || !server) {
      setConnectionStatus('error');
      return;
    }

    isPollingRef.current = true;

    try {
      let serverUrl = server?.trim() || '';
      
      if (serverUrl && !serverUrl.startsWith('http://') && !serverUrl.startsWith('https://')) {
        serverUrl = `https://${serverUrl}`;
      }
      
      serverUrl = serverUrl.replace(/\/$/, '');

      const encodedUsername = encodeURIComponent(username);
      const encodedPlaca = encodeURIComponent(placa);
      const apiUrl = `${serverUrl}/api/Aplicativo/vehiculo/${encodedUsername}/${encodedPlaca}`;
      
      console.log('Fetching vehicle data from:', apiUrl);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'ReactNativeApp',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!isMountedRef.current) return;

      if (data?.vehiculo) {
        setVehicleData(data.vehiculo);
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('error');
      }

    } catch (error) {
      if (!isMountedRef.current) return;
      
      console.error('Error fetching vehicle data:', error);
      setConnectionStatus('error');
    } finally {
      isPollingRef.current = false;
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    
    fetchVehicleData();
    
    pollingIntervalRef.current = setInterval(() => {
      if (isMountedRef.current) {
        fetchVehicleData();
      }
    }, 10000);

    return () => {
      isMountedRef.current = false;
      
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [device, user?.username, server]);

// ✅ ESTO ESTÁ BIEN
useEffect(() => {
  const handleAppStateChange = (nextAppState: string) => {
    if (nextAppState === 'active') {
      if (!pollingIntervalRef.current && isMountedRef.current) {
        fetchVehicleData();
        pollingIntervalRef.current = setInterval(() => {
          if (isMountedRef.current) {
            fetchVehicleData();
          }
        }, 10000);
      }
    } else {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }
  };

  const subscription = AppState.addEventListener('change', handleAppStateChange);

  return () => {
    subscription.remove();
  };
}, []);

  // ✅ Handlers
  const handleOpenMaps = () => {
    if (!vehicleData) return;
    
    const result = openGoogleMaps(latitude, longitude);
    
    if (result) {
      setNavigationCoords({ latitude, longitude });
      setModalVisible(true);
    }
  };

  const handleOpenCoordinatesModal = () => {
    setIsModalVisible(true);
  };

  const handleCloseCoordinatesModal = () => {
    setIsModalVisible(false);
  };

  const handleInfiDevice = () => {
    navigation.navigate('InfoDevice', {
      deviceName: device,
    });
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const toggleInfo = () => {
    setIsInfoExpanded(!isInfoExpanded);
  };

  // ✅ Variables derivadas
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

  // ✅ useEffect para WebView (Android)
  useEffect(() => {
    if (
      Platform.OS === 'android' &&
      webViewRef.current &&
      vehicleData &&
      isWebViewReady
    ) {
      setTimeout(() => {
        const script = `window.updateMarkerPosition(${latitude}, ${longitude}, ${heading}, ${speed}, '${status}', '${device}', '${device}'); true;`;
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

  // ✅ useEffect para animación de cámara (iOS)
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

  // ✅ useEffect para mostrar callout inicial (iOS)
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

  // ✅ Render del mapa
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
                  key={device}
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
                        {toUpperCaseText(device)}
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
              console.error('WebView error:', nativeEvent);
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
    <View style={[styles.container, { paddingBottom: bottomSpace - 2 }]}>
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
            height: isInfoExpanded ? 260 : 50,
            backgroundColor: '#1e3a8a',
          },
        ]}
      >
        <TouchableOpacity style={styles.panelHeader} onPress={toggleInfo}>
          <View style={styles.panelHeaderContent}>
            <View style={styles.deviceHeaderInfo}>
              <Text style={styles.deviceName}>
                {toUpperCaseText(device)}
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
            <View style={styles.scrollContent}>
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

                <View style={styles.dateContainerGPS}>
                  <TouchableOpacity
                    style={[
                      styles.locationButton,
                      { opacity: vehicleData ? 1 : 0.5 },
                    ]}
                    onPress={handleOpenMaps}
                    disabled={!vehicleData}
                  >
                    <MapPin size={15} color="#fff" />
                  </TouchableOpacity>
                  
                  <Text style={styles.lastReportTextGps}>¿Cómo llegar?</Text>
                </View>
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

              <View style={styles.streetViewRow}>
                <View style={styles.streetViewContainer}>
                  {vehicleData ? (
                    <TouchableOpacity
                      onPress={handleOpenCoordinatesModal}
                      activeOpacity={0.8}
                      disabled={!vehicleData}
                    >
                      <Image
                        source={{ uri: 'https://res.cloudinary.com/dyc4ik1ko/image/upload/v1761544460/mapacamino_z9yics.jpg' }}
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
                  <Text style={styles.locationTitle} numberOfLines={3}>{address}</Text>
                  <Text style={styles.locationSubtitle}>Ubicación actual</Text>
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
            </View>
          </View>
        )}
      </View>

      {navigationCoords && (
        <NavigationModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          latitude={navigationCoords.latitude}
          longitude={navigationCoords.longitude}
        />
      )}

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