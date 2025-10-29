import React, { useState, useEffect, useCallback } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Share,
  Alert,
  Platform,
} from 'react-native';
import {
  ChevronLeft,
  Settings,
  MapPin,
  Navigation,
  Gauge,
  Calendar,
  Share as ShareIcon,
  SatelliteDish,
  BatteryFull,
  TriangleAlert,
} from 'lucide-react-native';
import {
  RouteProp,
  useRoute,
  useNavigation,
  NavigationProp,
  useFocusEffect,
} from '@react-navigation/native';
import { RootStackParamList } from '../../../../App';
import { styles } from '../../../styles/infodevice';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const [loading, setLoading] = useState(true);

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

  const username = user?.username;

  useFocusEffect(
    React.useCallback(() => {
      NavigationBarColor('#00296b', false);
    }, []),
  );

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
💨 *VELOCIDAD:* ${vehiculoData.lastValidSpeed} km/h
🗓️ *FECHA Y HORA:* ${fechaHora}
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
    ? vehiculoData.lastOdometerKM.toFixed(3)
    : '0.000';

  return (
    <LinearGradient
      colors={['#021e4bff', '#183890ff', '#032660ff']}
      style={[styles.container, { paddingBottom: bottomSpace - 2 }]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <View style={[styles.header, { paddingTop: topSpace }]}>
        <TouchableOpacity
          onPress={handleGoBack}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <ChevronLeft size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Unidad: {deviceName}</Text>
          <View style={styles.headerBadges}>
            <View style={styles.fuelBadge}>
              <BatteryFull size={16} color="#ffffffff" />
            </View>
            <View style={styles.settingsBadge}>
              <SatelliteDish size={16} color="#ffffffff" />
            </View>
            <View style={styles.onlineBadge}>
              <Text style={styles.onlineText}>Online</Text>
            </View>
          </View>
        </View>
      </View>
      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Vehicle Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: 'https://res.cloudinary.com/dyc4ik1ko/image/upload/v1759594553/UnidadK_v4eru0.png',
            }}
            style={styles.vehicleImage}
          />
        </View>

        {/* Vehicle Information Section */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Información vehicular</Text>

          {/* Status Item */}
          <View style={styles.infoItem}>
            <View style={styles.iconContainer}>
              <Gauge size={20} color="#666" />
            </View>
            <View style={styles.infoContent}>
              {loading && !vehiculoData ? (
                <ActivityIndicator size="small" color="#666" />
              ) : (
                <>
                  <Text style={styles.infoLabel}>
                    <Text
                      style={
                        estado === 'Detenido'
                          ? styles.statusStopped
                          : styles.statusMoving
                      }
                    >
                      {estado}
                    </Text>
                    <Text style={styles.speedText}>
                      {' '}
                      ({vehiculoData?.lastValidSpeed || 0} km/h)
                    </Text>
                  </Text>
                  <Text style={styles.infoSubtitle}>Estado y velocidad</Text>
                </>
              )}
            </View>
          </View>

          {/* Date and Time Item */}
          <View style={styles.infoItem}>
            <View style={styles.iconContainer}>
              <Calendar size={20} color="#666" />
            </View>
            <View style={styles.infoContent}>
              {loading && !vehiculoData ? (
                <ActivityIndicator size="small" color="#666" />
              ) : (
                <>
                  <Text style={styles.infoValue}>{fechaHora}</Text>
                  <Text style={styles.infoSubtitle}>Fecha y hora</Text>
                </>
              )}
            </View>
          </View>

          {/* Coordinates Item */}
          <View style={styles.infoItem}>
            <View style={styles.iconContainer}>
              <Settings size={20} color="#666" />
            </View>
            <View style={styles.infoContent}>
              {loading && !vehiculoData ? (
                <ActivityIndicator size="small" color="#666" />
              ) : (
                <>
                  <Text style={styles.infoValue}>
                    {vehiculoData?.lastValidLatitude.toFixed(5) || '0.00000'},{' '}
                    {vehiculoData?.lastValidLongitude.toFixed(5) || '0.00000'}
                  </Text>
                  <Text style={styles.infoSubtitle}>Latitud y longitud</Text>
                </>
              )}
            </View>
          </View>

          {/* Location Item */}
          <View style={styles.infoItem}>
            <View style={styles.iconContainer}>
              <MapPin size={20} color="#666" />
            </View>
            <View style={styles.infoContent}>
              {loading && !vehiculoData ? (
                <ActivityIndicator size="small" color="#666" />
              ) : (
                <>
                  <Text style={styles.infoValue}>
                    {vehiculoData?.direccion || 'Cargando ubicación...'}
                  </Text>
                  <Text style={styles.infoSubtitle}>Ubicación actual</Text>
                </>
              )}
            </View>
          </View>

          {/* Direction Item */}
          <View style={styles.infoItem}>
            <View style={styles.iconContainer}>
              <Navigation size={20} color="#666" />
            </View>
            <View style={styles.infoContent}>
              {loading && !vehiculoData ? (
                <ActivityIndicator size="small" color="#666" />
              ) : (
                <>
                  <Text style={styles.infoValue}>{direccion}</Text>
                  <Text style={styles.infoSubtitle}>Dirección</Text>
                </>
              )}
            </View>
          </View>

          {/* Odometer Item */}
          <View style={styles.infoItem}>
            <View style={styles.iconContainer}>
              <Gauge size={20} color="#666" />
            </View>
            <View style={styles.infoContent}>
              {loading && !vehiculoData ? (
                <ActivityIndicator size="small" color="#666" />
              ) : (
                <>
                  <Text style={styles.infoValue}>{kilometraje} Km</Text>
                  <Text style={styles.infoSubtitle}>Kilometraje actual</Text>
                </>
              )}
            </View>
          </View>

          {/* Daily Distance Item */}
          <View style={styles.infoItem}>
            <View style={styles.iconContainer}>
              <SatelliteDish size={20} color="#666" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoValue}>
                Conectado al sistema de rastreo
              </Text>
              <Text style={styles.infoSubtitle}>
                Velsat Mobile - Sistema GPS
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.eventsButton} onPress={handleEvents}>
            <TriangleAlert color="#fff" />
            <Text style={styles.eventsButtonText}>Eventos</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <ShareIcon size={20} color="#fff" />
            <Text style={styles.shareButtonText}>Compartir</Text>
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
    </LinearGradient>
  );
};

export default InfoDevice;
