import 'react-native-url-polyfill/auto';
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
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
  PROVIDER_GOOGLE,
} from 'react-native-maps';
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

import CoordinatesModal from './Coordinatesmodal';
import { NavigationModal } from '../../../components/NavigationModal';
import { Text } from '../../../components/ScaledComponents';
import { getDirectionImage, getDirectionImageData } from '../../../styles/directionImagesGM';

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

const DetailDeviceGM = () => {
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
  const [connectionStatus, setConnectionStatus] = useState< 
    'connecting' | 'connected' | 'disconnected' | 'error'
  >('connecting');

  const { user, server, selectedVehiclePin } = useAuthStore();

  const insets = useSafeAreaInsets();
  const navigationDetection = useNavigationMode();
  const bottomSpace = getBottomSpace(
    insets,
    navigationDetection.hasNavigationBar,
  );
  
  const [mapType, setMapType] = useState<'standard' | 'satellite' | 'hybrid'>('standard');
  const [hasShownInitialCallout, setHasShownInitialCallout] = useState(false);

  // ✅ Estado del radar simplificado (un solo valor)
  const [radarProgress, setRadarProgress] = useState(0);

  const isMountedRef = useRef(true);
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPollingRef = useRef(false);

  const mapRef = useRef<MapView>(null);
  const markerRef = useRef<any>(null);

  useFocusEffect(
    React.useCallback(() => {
      NavigationBarColor('#ffffff', true);
    }, []),
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

 // ✅ Animación del radar con múltiples ondas
useEffect(() => {
  if (vehicleData) {
    const interval = setInterval(() => {
      setRadarProgress(prev => (prev + 0.01) % 1);
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

  const latitude = vehicleData?.lastValidLatitude || -12.0464;
  const longitude = vehicleData?.lastValidLongitude || -77.0428;
  const speed = vehicleData?.lastValidSpeed || 0;
  const address = vehicleData?.direccion || 'Cargando ubicación...';
  const heading = vehicleData?.lastValidHeading || 0;

  const getStatus = () => {
    if (!vehicleData) return 'Cargando...';
    if (speed >= 1) return 'Movimiento';
    return 'Detenido';
  };

  const status = getStatus();

  const pinType = selectedVehiclePin || 's';

// useEffect para ir directo a la ubicación del vehículo
useEffect(() => {
  if (mapRef.current && vehicleData) {
    mapRef.current?.setCamera({
      center: { latitude, longitude },
      zoom: 16,
    });
  }
}, [vehicleData, latitude, longitude]);

  // useEffect para mostrar callout inicial
  useEffect(() => {
    if (
      markerRef.current &&
      vehicleData &&
      !hasShownInitialCallout
    ) {
      setTimeout(() => {
        markerRef.current?.showCallout();
        setHasShownInitialCallout(true);
      }, 500);
    }
  }, [vehicleData, hasShownInitialCallout]);


  // ✅ Actualizar callout cuando cambien los datos
useEffect(() => {
  if (markerRef.current && vehicleData && hasShownInitialCallout) {
    markerRef.current?.hideCallout();
    setTimeout(() => {
      markerRef.current?.showCallout();
    }, 100);
  }
}, [speed, heading, status]); // Se actualiza cuando cambian velocidad, dirección o estado

  const renderMap = () => {
    const imageData = getDirectionImageData(heading);

    const markerImageSize: [number, number] =
      imageData.name === 'up.png' || imageData.name === 'down.png'
        ? (pinType === 'c' ? [35, 90] : imageData.size)
        : (pinType === 'c' ? [90, 50] : imageData.size);

    // ✅ Color del radar según velocidad
    const radarColor =
      speed === 0
        ? '#ef4444'  // ROJO para detenido
        : speed > 0 && speed < 11
          ? '#fbbf24'  // AMARILLO para velocidad baja
          : speed >= 11 && speed < 60
            ? '#10b981'  // VERDE para velocidad media
            : '#3b82f6';  // AZUL para velocidad alta

    // ✅ Calcular radio y opacidad del radar (solo UN pulso)
    const maxRadius = 100;
    const radarRadius = 10 + radarProgress * maxRadius;
    
    // Opacidad que empieza en 0, sube rápido y baja lento
    let radarOpacity = 0;
    if (radarProgress < 0.1) {
      radarOpacity = radarProgress * 3; // Sube rápido
    } else if (radarProgress < 0.7) {
      radarOpacity = 0.3; // Se mantiene
    } else {
      radarOpacity = (1 - radarProgress) * 1.5; // Baja gradualmente
    }

    return (
      <>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          mapType={mapType}
          initialRegion={{
            latitude: latitude,
            longitude: longitude,
            latitudeDelta: 0.008,
            longitudeDelta: 0.008,
          }}
          showsUserLocation={false}
          showsMyLocationButton={false}
          showsCompass={true}
          showsScale={true}
          loadingEnabled={true}
        >
          {vehicleData && (
            <>
       {/* ✅ TRES ondas de radar desfasadas */}
{radarOpacity > 0 && (
  <>
    <Circle
      center={{ latitude, longitude }}
      radius={radarRadius}
      fillColor={`${radarColor}${Math.floor(radarOpacity * 100).toString(16).padStart(2, '0')}`}
      strokeColor={`${radarColor}${Math.floor(radarOpacity * 180).toString(16).padStart(2, '0')}`}
      strokeWidth={2}
    />
    <Circle
      center={{ latitude, longitude }}
      radius={10 + ((radarProgress + 0.33) % 1) * 100}
      fillColor={`${radarColor}${Math.floor((radarProgress + 0.33) % 1 < 0.1 ? ((radarProgress + 0.33) % 1) * 300 : (radarProgress + 0.33) % 1 < 0.7 ? 100 : (1 - (radarProgress + 0.33) % 1) * 150).toString(16).padStart(2, '0')}`}
      strokeColor={`${radarColor}${Math.floor((radarProgress + 0.33) % 1 < 0.1 ? ((radarProgress + 0.33) % 1) * 450 : (radarProgress + 0.33) % 1 < 0.7 ? 180 : (1 - (radarProgress + 0.33) % 1) * 270).toString(16).padStart(2, '0')}`}
      strokeWidth={2}
    />
    <Circle
      center={{ latitude, longitude }}
      radius={10 + ((radarProgress + 0.66) % 1) * 100}
      fillColor={`${radarColor}${Math.floor((radarProgress + 0.66) % 1 < 0.1 ? ((radarProgress + 0.66) % 1) * 300 : (radarProgress + 0.66) % 1 < 0.7 ? 100 : (1 - (radarProgress + 0.66) % 1) * 150).toString(16).padStart(2, '0')}`}
      strokeColor={`${radarColor}${Math.floor((radarProgress + 0.66) % 1 < 0.1 ? ((radarProgress + 0.66) % 1) * 450 : (radarProgress + 0.66) % 1 < 0.7 ? 180 : (1 - (radarProgress + 0.66) % 1) * 270).toString(16).padStart(2, '0')}`}
      strokeWidth={2}
    />
  </>
)}

           <Marker
  ref={markerRef}
  key={`marker-${device}-${heading}`}  
  anchor={{ x: 0.5, y: 0.5 }}
  coordinate={{ latitude, longitude }}
>
                <Image
                  source={getDirectionImage(heading, pinType)}
                  style={{
                    width: markerImageSize[0],
                    height: markerImageSize[1],
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

        {/* Selector de tipo de mapa */}
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

        {/* Overlay de carga */}
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

        {/* Botón de regresar */}
        <TouchableOpacity
          style={[styles.floatingBackButton, { top: insets.top + 10 }]}
          onPress={handleGoBack}
          activeOpacity={0.7}
        >
          <ChevronLeft size={26} color="#ffffffff" />
        </TouchableOpacity>
      </View>

      {/* Panel de información */}
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
                      ({formatThreeDecimals(speed.toFixed(0))} Km/h)
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
                        source={require('../../../../assets/mapacamino.jpg')}
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

      {/* Modales */}
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

export default DetailDeviceGM;