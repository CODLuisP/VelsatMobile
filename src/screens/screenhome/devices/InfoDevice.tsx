import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Share,
  Platform,
} from 'react-native';
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Navigation,
  Gauge,
  Calendar,
  Share as ShareIcon,
  SatelliteDish,
  TriangleAlert,
  Crosshair,
  Activity,
} from 'lucide-react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import {
  RouteProp,
  useRoute,
  useNavigation,
  NavigationProp,
  useFocusEffect,
} from '@react-navigation/native';
import { RootStackParamList } from '../../../../App';
import { styles } from '../../../styles/infodevice';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import {
  getBottomSpace,
  useNavigationMode,
} from '../../../hooks/useNavigationMode';
import NavigationBarColor from 'react-native-navigation-bar-color';
import { useAuthStore } from '../../../store/authStore';
import axios from 'axios';
import { obtenerDireccion } from '../../../utils/obtenerDireccion';
import LinearGradient from 'react-native-linear-gradient';
import ModalAlert from '../../../components/ModalAlert';
import { Text } from '../../../components/ScaledComponents';

type InfoDeviceRouteProp = RouteProp<RootStackParamList, 'InfoDevice'>;

interface VehiculoData {
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
  datosGeocercausu: string | null;
}

interface ApiResponse {
  fechaActual: string;
  vehiculo: VehiculoData;
}

const InfoDevice = () => {
  const route = useRoute<InfoDeviceRouteProp>();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user, logout, server, tipo } = useAuthStore();

  const { deviceName } = route.params;
  const insets = useSafeAreaInsets();
  const navigationDetection = useNavigationMode();
  const bottomSpace = getBottomSpace(
    insets,
    navigationDetection.hasNavigationBar,
  );

  const [vehiculoData, setVehiculoData] = useState<VehiculoData | null>(null);
  const [heroHeight, setHeroHeight] = useState(0);
  const [loading, setLoading] = useState(true);

  const [modalAlertVisible, setModalAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    color: '',
  });
  const [fechaHoraActual, setFechaHoraActual] = useState("");


  const handleShowAlert = (title: string, message: string, color?: string) => {
    setAlertConfig({ title, message, color: color || '' });
    setModalAlertVisible(true);
  };

  const username = user?.username;

  useFocusEffect(
    React.useCallback(() => {
      NavigationBarColor('#eef1f6', true);
    }, []),
  );

    useEffect(() => {
    // Obtener la fecha y hora actual de Perú (una sola vez)
    const ahora = new Date();
    const formatoPeru = new Intl.DateTimeFormat("es-PE", {
      timeZone: "America/Lima",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(ahora);

    setFechaHoraActual(formatoPeru);
  }, []);

  const getEstadoMovimiento = useCallback((speed: number) => {
    return speed === 0 ? 'Detenido' : 'Movimiento';
  }, []);

  const formatFechaHora = useCallback((timestamp: number) => {
    const fecha = new Date(timestamp * 1000);
    const day = String(fecha.getDate()).padStart(2, '0');
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const year = fecha.getFullYear();
    const hours = String(fecha.getHours()).padStart(2, '0');
    const minutes = String(fecha.getMinutes()).padStart(2, '0');
    const seconds = String(fecha.getSeconds()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  }, []);

  const fetchVehiculoData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get<ApiResponse>(
        `${server}/api/Aplicativo/vehiculo/${username}/${deviceName}`,
      );
      setVehiculoData(response.data.vehiculo);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }, [username, deviceName]);

  useEffect(() => {
    fetchVehiculoData();
  }, [fetchVehiculoData]);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleEvents = () => {
    navigation.navigate('Events', { deviceName });
  };
  const handleShare = async () => {
    if (!vehiculoData) {
      handleShowAlert(
        'Error',
        'No hay información disponible para compartir',
        '#e36414',
      );
      return;
    }

    const googleMapsLink = `https://www.google.com/maps?q=${vehiculoData.lastValidLatitude},${vehiculoData.lastValidLongitude}`;
    const mensaje = `
    *INFORMACIÓN DEL VEHÍCULO*

🚗 *UNIDAD:* ${deviceName}
📊 *ESTADO:* ${estado}
💨 *VELOCIDAD:* ${vehiculoData.lastValidSpeed.toFixed(0)} km/h
🗓️ *FECHA Y HORA:* ${fechaHoraActual}
🌍 *UBICACIÓN ACTUAL:* ${vehiculoData.direccion}
🧭 *DIRECCIÓN:* ${direccion}
⏲️ *KILOMETRAJE:* ${kilometraje} Km
🗺️ *COORDENADAS:*
Latitud:  ${vehiculoData.lastValidLatitude} - Longitud: ${vehiculoData.lastValidLongitude}
   
*VER EN GOOGLE MAPS:*
${googleMapsLink}

Compartido desde Velsat Mobile
`.trim();

    try {
      await Share.share({
        message: mensaje,
        title: `Ubicación de ${deviceName}`,
      });
    } catch (error) {
      handleShowAlert(
        'Error',
        'No se pudo compartir la información',
        '#e36414',
      );
    }
  };

const topSpace = Platform.OS === 'ios' ? insets.top -5 : insets.top + 5;

  const estado = vehiculoData
    ? getEstadoMovimiento(vehiculoData.lastValidSpeed)
    : 'Cargando...';
  const direccion = vehiculoData
    ? obtenerDireccion(vehiculoData.lastValidHeading)
    : 'Cargando...';
  const fechaHora = vehiculoData
    ? formatFechaHora(vehiculoData.lastGPSTimestamp)
    : 'Cargando...';
  const kilometraje = vehiculoData
    ? vehiculoData.lastOdometerKM.toFixed(0)
    : '0.000';

  const isStopped = estado === 'Detenido';
  const statusColor = isStopped ? '#ef4444' : '#22c55e';
  const BLUE = '#1e3a8a';

  return (
    <SafeAreaView style={[styles.container, { paddingBottom: bottomSpace - 2 }]}>
      {/* Header navy con nombre de unidad */}
      <View
        style={[
          styles.hero,
          { marginTop: -insets.top, paddingTop: insets.top },
        ]}
        onLayout={e => setHeroHeight(e.nativeEvent.layout.height)}
      >
        {/* Imagen de fondo + overlay navy (recortada a las esquinas) */}
        <View style={styles.heroClip}>
          <Image
            source={require('../../../../assets/fondoheader.jpg')}
            style={styles.heroBg}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay} />
        </View>

        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleGoBack}
            style={styles.iconButton}
            activeOpacity={0.7}
          >
            <ChevronLeft size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalle de unidad</Text>
          <TouchableOpacity
            onPress={handleShare}
            style={[styles.iconButton, styles.iconButtonAccent]}
            activeOpacity={0.8}
          >
            <ShareIcon size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.nameBlock}>
          <Text style={styles.vehicleName}>{deviceName}</Text>
        </View>
      </View>

      {/* Carro flotando sobre el borde (por encima del header y del panel) */}
      {heroHeight > 0 && (
        <View
          style={[styles.heroCarWrap, { top: heroHeight - insets.top - 35 }]}
          pointerEvents="none"
        >
          <Image
            source={require('../../../../assets/Car.jpg')}
            style={styles.heroCar}
            resizeMode="contain"
          />
        </View>
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Grid de estado en tiempo real */}
        <View style={styles.statsRow}>
          <View style={styles.statTile}>
            <View style={styles.statIcon}>
              <Activity size={17} color={BLUE} strokeWidth={2.4} />
            </View>
            <Text style={[styles.statValue, { color: statusColor }]} numberOfLines={1}>
              {loading && !vehiculoData ? '—' : estado}
            </Text>
            <Text style={styles.statLabel}>Estado</Text>
          </View>
          <View style={styles.statTile}>
            <View style={styles.statIcon}>
              <Gauge size={17} color={BLUE} strokeWidth={2.4} />
            </View>
            <Text style={styles.statValue} numberOfLines={1}>
              {vehiculoData?.lastValidSpeed.toFixed(0) || 0} km/h
            </Text>
            <Text style={styles.statLabel}>Velocidad</Text>
          </View>
          <View style={styles.statTile}>
            <View style={styles.statIcon}>
              <Navigation size={17} color={BLUE} strokeWidth={2.4} />
            </View>
            <Text style={styles.statValue} numberOfLines={1}>
              {loading && !vehiculoData ? '—' : direccion}
            </Text>
            <Text style={styles.statLabel}>Dirección</Text>
          </View>
        </View>

        {/* Bento grid: información + acciones */}
        <Text style={styles.sectionTitle}>Información</Text>
        <View style={styles.bento}>
          {/* Ubicación - ancho completo */}
          <View style={[styles.bentoTile, styles.bentoFull]}>
            <View style={styles.bentoIcon}>
              <MapPin size={18} color={BLUE} />
            </View>
            <View style={styles.bentoText}>
              <Text style={styles.bentoLabel}>Ubicación actual</Text>
              <Text style={styles.bentoValue}>
                {loading && !vehiculoData
                  ? 'Cargando ubicación...'
                  : vehiculoData?.direccion || 'Sin datos'}
              </Text>
            </View>
          </View>

          {/* Fecha - mitad */}
          <View style={[styles.bentoTile, styles.bentoHalf]}>
            <View style={styles.bentoIcon}>
              <Calendar size={18} color={BLUE} />
            </View>
            <Text style={styles.bentoLabel}>Fecha y hora</Text>
            <Text style={styles.bentoValue}>{fechaHoraActual}</Text>
          </View>

          {/* Coordenadas - mitad */}
          <View style={[styles.bentoTile, styles.bentoHalf]}>
            <View style={styles.bentoIcon}>
              <Crosshair size={18} color={BLUE} />
            </View>
            <Text style={styles.bentoLabel}>Coordenadas</Text>
            <Text style={styles.bentoValue}>
              {vehiculoData?.lastValidLatitude.toFixed(5) || '0.00000'},{'\n'}
              {vehiculoData?.lastValidLongitude.toFixed(5) || '0.00000'}
            </Text>
          </View>

          {/* Mini mapa con la ubicación actual */}
          <View style={[styles.bentoTile, styles.bentoFull, styles.mapTile]}>
            {vehiculoData ? (
              <MapView
                provider={PROVIDER_DEFAULT}
                style={styles.miniMap}
                scrollEnabled={true}
                zoomEnabled={true}
                rotateEnabled={true}
                pitchEnabled={true}
                initialRegion={{
                  latitude: vehiculoData.lastValidLatitude,
                  longitude: vehiculoData.lastValidLongitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
              >
                <Marker
                  coordinate={{
                    latitude: vehiculoData.lastValidLatitude,
                    longitude: vehiculoData.lastValidLongitude,
                  }}
                >
                  <View style={styles.mapMarker}>
                    <Navigation size={14} color="#fff" fill="#fff" />
                  </View>
                </Marker>
              </MapView>
            ) : (
              <View style={styles.miniMapPlaceholder}>
                <SatelliteDish size={20} color="#c2c9d6" />
              </View>
            )}
          </View>

          {/* Eventos - navega a otra pantalla */}
          <TouchableOpacity
            style={[styles.bentoTile, styles.bentoFull, styles.eventsTile]}
            onPress={handleEvents}
            activeOpacity={0.85}
          >
            <View style={styles.eventsIcon}>
              <TriangleAlert size={20} color="#fff" />
            </View>
            <View style={styles.bentoText}>
              <Text style={styles.eventsTitle}>Eventos</Text>
              <Text style={styles.bentoLabel}>
                Alertas y notificaciones de la unidad
              </Text>
            </View>
            <ChevronRight size={22} color="#c2c9d6" />
          </TouchableOpacity>
        </View>

        <ModalAlert
          isVisible={modalAlertVisible}
          onClose={() => setModalAlertVisible(false)}
          title={alertConfig.title}
          message={alertConfig.message}
          color={alertConfig.color}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default InfoDevice;
