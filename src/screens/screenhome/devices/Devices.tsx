import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import {
  ChevronLeft,
  Search,
  BatteryFull,
  MapPinned,
  SearchX,
} from 'lucide-react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { styles } from '../../../styles/devices';
import { RootStackParamList } from '../../../../App';
import NavigationBarColor from 'react-native-navigation-bar-color';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  getBottomSpace,
  useNavigationMode,
} from '../../../hooks/useNavigationMode';
import { useAuthStore } from '../../../store/authStore';
import axios from 'axios';

interface Device {
  id: string;
  name: string;
  status: 'Detenido' | 'Movimiento';
  speed: number;
  location: string;
  isOnline: boolean;
  latitude?: number;
  longitude?: number;
}

interface ApiDevice {
  deviceId: string;
  lastValidLatitude: number;
  lastValidLongitude: number;
  lastValidSpeed: number;
  direccion: string;
}

const Devices = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [searchText, setSearchText] = useState('');
  const { user, logout, server, tipo } = useAuthStore();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDetailDevice = (device: Device) => {
    navigation.navigate('DetailDevice', { device });
  };

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

  // Función para obtener los dispositivos de la API
  const fetchDevices = async (showLoading: boolean = false) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      setError(null);
      
      const username = user?.username || 'cgacela';
      const response = await axios.get<ApiDevice[]>(
        `${server}/api/DeviceList/simplified/${username}`
      );

      const transformedDevices: Device[] = response.data.map((apiDevice) => ({
        id: apiDevice.deviceId,
        name: apiDevice.deviceId,
        status: apiDevice.lastValidSpeed === 0 ? 'Detenido' : 'Movimiento',
        speed: Math.round(apiDevice.lastValidSpeed),
        location: apiDevice.direccion,
        isOnline: true,
        latitude: apiDevice.lastValidLatitude,
        longitude: apiDevice.lastValidLongitude,
      }));

      setDevices(transformedDevices);
    } catch (err) {
      console.error('Error al obtener dispositivos:', err);
      setError('Error al cargar los dispositivos');
    } finally {
      if (showLoading) {
        setLoading(false);
      }
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchDevices(false);
  };

  useEffect(() => {
    fetchDevices(true);

    const interval = setInterval(() => {
      fetchDevices(false);
    }, 10000); 

    return () => clearInterval(interval);
  }, [user?.username, server]);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const getStatusColor = (speed: number, status: string) => {
    // velocidad 0: rojo
    if (status === 'Detenido' || speed === 0) return '#FF4444';
    // velocidad >= 1 and velocidad <= 20: amarillo
    if (speed >= 1 && speed <= 20) return '#FFA500';
    // velocidad > 20 and <= 45: verde
    if (speed > 20 && speed <= 45) return '#00AA00';
    // mayor que 45: azul
    return '#0066FF';
  };

  const getSpeedColor = (speed: number, status: string) => {
    // velocidad 0: rojo
    if (status === 'Detenido' || speed === 0) return '#FF4444';
    // velocidad >= 1 and velocidad <= 20: amarillo
    if (speed >= 1 && speed <= 20) return '#FFA500';
    // velocidad > 20 and <= 45: verde
    if (speed > 20 && speed <= 45) return '#00AA00';
    // mayor que 45: azul
    return '#0066FF';
  };

  const filteredDevices = devices.filter(device =>
    device.name.toLowerCase().includes(searchText.toLowerCase()),
  );

  const renderDeviceItem = ({
    item,
    index,
  }: {
    item: Device;
    index: number;
  }) => {
    const isFirst = index === 0;
    const isLast = index === filteredDevices.length - 1;

    return (
      <TouchableOpacity
        style={[
          styles.deviceItem,
          isFirst && styles.deviceItemFirst,
          isLast && styles.deviceItemLast,
        ]}
        onPress={() => handleDetailDevice(item)}
      >
        <View style={styles.deviceContent}>
          {/* Imagen del vehículo */}
          <View style={styles.vehicleImageContainer}>
            <View style={styles.vehicleImage}>
              <Image
                source={require('../../../../assets/Car.jpg')}
                style={styles.carImage}
              />
            </View>
            {/* Indicador de velocidad */}
            <View
              style={[
                styles.speedIndicator,
                { backgroundColor: getSpeedColor(item.speed, item.status) },
              ]}
            >
              <Text style={styles.speedText}>{item.speed} Km/h</Text>
            </View>
          </View>

          {/* Información del dispositivo */}
          <View style={styles.deviceInfo}>
            <View style={styles.deviceHeader}>
              <Text style={styles.deviceName}>{item.name}</Text>
              <View style={styles.deviceBadges}>
                {/* Badge de temperatura */}
                <View style={styles.temperatureBadge}>
                  <Text style={styles.temperatureText}>
                    <BatteryFull size={12} color="#2E7D32" />
                  </Text>
                </View>
                {/* Badge de combustible */}
                <View style={styles.fuelBadge}>
                  <Text style={styles.fuelIcon}>
                    <MapPinned size={12} color="#2E7D32" />
                  </Text>
                </View>
                {/* Badge online */}
                <View style={styles.onlineBadge}>
                  <Text style={styles.onlineText}>◉ Online</Text>
                </View>
              </View>
            </View>

            <View style={styles.statusContainer}>
              <View style={styles.statusIndicator}>
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor: getStatusColor(item.speed, item.status),
                    },
                  ]}
                />
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>

            <Text style={styles.locationLabel}>Ubicación más reciente:</Text>
            <Text style={styles.locationText}>{item.location}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyComponent = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#1e3a8a" />
          <Text style={styles.emptyTitle}>Cargando unidades...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <SearchX size={64} color="#FF4444" />
          </View>
          <Text style={styles.emptyTitle}>{error}</Text>
          <TouchableOpacity
            onPress={() => fetchDevices(true)}
            style={{
              backgroundColor: '#1e3a8a',
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 8,
              marginTop: 16,
            }}
          >
            <Text style={{
              color: '#fff',
              fontSize: 16,
              fontWeight: '600',
            }}>
              Reintentar
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (searchText) {
      return (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <SearchX size={64} color="#CBD5E0" />
          </View>
          <Text style={styles.emptyTitle}>No se encontró la unidad</Text>
          <Text style={styles.emptySubtitle}>
            No hay vehículos que coincidan con "{searchText}"
          </Text>
          <Text style={styles.emptyHint}>Intenta con otro término de búsqueda</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <SearchX size={64} color="#CBD5E0" />
        </View>
        <Text style={styles.emptyTitle}>No hay unidades disponibles</Text>
      </View>
    );
  };

  const topSpace = insets.top + 5;

  return (
    <View style={[styles.container, { paddingBottom: bottomSpace }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topSpace }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <ChevronLeft size={26} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Lista de Unidades</Text>
            <Text style={styles.headerSubtitle}>
              {loading ? 'Cargando...' : `${devices.length} unid.`}
            </Text>
          </View>
        </View>

        {/* Buscador dentro del header */}
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar unidad"
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
            editable={!loading}
          />
        </View>
      </View>

      {/* Lista de dispositivos */}
      <FlatList
        data={filteredDevices}
        keyExtractor={item => item.id}
        renderItem={({ item, index }) => renderDeviceItem({ item, index })}
        style={styles.devicesList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.devicesListContent}
        ListEmptyComponent={renderEmptyComponent}
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
      />
    </View>
  );
};

export default Devices;