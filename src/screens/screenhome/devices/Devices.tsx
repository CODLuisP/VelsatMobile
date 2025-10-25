import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import {
  ChevronLeft,
  Search,
  BatteryFull,
  MapPinned,
  SearchX,
  Filter,
  X,
  Check,
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
import LinearGradient from 'react-native-linear-gradient';

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

interface FilterOptions {
  speedRange: '' | 'stopped' | 'slow' | 'medium' | 'fast';
  status: '' | 'stopped' | 'moving';
  location: string;
}

const Devices = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [searchText, setSearchText] = useState('');
  const { user, logout, server, tipo, selectedVehiclePin } = useAuthStore();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    speedRange: '',
    status: '',
    location: '',
  });
  const [tempFilters, setTempFilters] = useState<FilterOptions>(filters);

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
      NavigationBarColor('#00296b', false);
    }, []),
  );

  const fetchDevices = async (showLoading: boolean = false) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      setError(null);

      const username = user?.username;
      const response = await axios.get<ApiDevice[]>(
        `${server}/api/DeviceList/simplified/${username}`,
      );

      const transformedDevices: Device[] = response.data.map(apiDevice => ({
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
    if (status === 'Detenido' || speed === 0) return '#FF4444';
    if (speed > 0 && speed < 11) return '#FFA500';
    if (speed >= 11 && speed < 60) return '#00AA00';
    return '#0066FF';
  };

  const getSpeedColor = (speed: number, status: string) => {
    if (status === 'Detenido' || speed === 0) return '#FF4444';
    if (speed > 0 && speed < 11) return '#FFA500';
    if (speed >= 11 && speed < 60) return '#00AA00';
    return '#0066FF';
  };

  const applyFilters = (device: Device) => {
    // Filtro por búsqueda de texto
    const matchesSearch = device.name
      .toLowerCase()
      .includes(searchText.toLowerCase());

    // Filtro por rango de velocidad
    let matchesSpeed = true;
    if (filters.speedRange !== '') {
      switch (filters.speedRange) {
        case 'stopped':
          matchesSpeed = device.speed === 0;
          break;
        case 'slow':
          matchesSpeed = device.speed > 0 && device.speed < 11;
          break;
        case 'medium':
          matchesSpeed = device.speed >= 11 && device.speed < 60;
          break;
        case 'fast':
          matchesSpeed = device.speed >= 60;
          break;
      }
    }

    // Filtro por estado
    let matchesStatus = true;
    if (filters.status !== '') {
      if (filters.status === 'stopped') {
        matchesStatus = device.status === 'Detenido';
      } else if (filters.status === 'moving') {
        matchesStatus = device.status === 'Movimiento';
      }
    }

    // Filtro por ubicación
    const matchesLocation =
      filters.location === '' ||
      device.location.toLowerCase().includes(filters.location.toLowerCase());

    return matchesSearch && matchesSpeed && matchesStatus && matchesLocation;
  };

  const filteredDevices = devices.filter(applyFilters);

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.speedRange !== '') count++;
    if (filters.status !== '') count++;
    if (filters.location !== '') count++;
    return count;
  };

  const handleOpenFilter = () => {
    setTempFilters(filters);
    setShowFilterModal(true);
  };

  const handleApplyFilters = () => {
    setFilters(tempFilters);
    setShowFilterModal(false);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      speedRange: '' as const,
      status: '' as const,
      location: '',
    };
    setTempFilters(clearedFilters);
    setFilters(clearedFilters);
    setShowFilterModal(false);
  };

  const handleSpeedFilterToggle = (speedValue: 'stopped' | 'slow' | 'medium' | 'fast') => {
    if (tempFilters.speedRange === speedValue) {
      // Si ya está seleccionado, deseleccionar
      setTempFilters({ ...tempFilters, speedRange: '' });
    } else {
      // Si no está seleccionado, seleccionar
      setTempFilters({ ...tempFilters, speedRange: speedValue });
    }
  };

  const handleStatusFilterToggle = (statusValue: 'stopped' | 'moving') => {
    if (tempFilters.status === statusValue) {
      // Si ya está seleccionado, deseleccionar
      setTempFilters({ ...tempFilters, status: '' });
    } else {
      // Si no está seleccionado, seleccionar
      setTempFilters({ ...tempFilters, status: statusValue });
    }
  };

  const renderFilterModal = () => {
    return (
      <Modal
        visible={showFilterModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtrar Unidades</Text>
              <TouchableOpacity
                onPress={() => setShowFilterModal(false)}
                style={styles.modalCloseButton}
              >
                <X size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Filtro por Velocidad */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Velocidad</Text>
                <View style={styles.filterOptions}>
                  <TouchableOpacity
                    style={[
                      styles.filterOption,
                      tempFilters.speedRange === 'stopped' &&
                        styles.filterOptionActive,
                    ]}
                    onPress={() => handleSpeedFilterToggle('stopped')}
                  >
                    <View style={styles.filterOptionContent}>
                      <View
                        style={[
                          styles.speedColorDot,
                          { backgroundColor: '#FF4444' },
                        ]}
                      />
                      <Text
                        style={[
                          styles.filterOptionText,
                          tempFilters.speedRange === 'stopped' &&
                            styles.filterOptionTextActive,
                        ]}
                      >
                        Detenidos (0 km/h)
                      </Text>
                    </View>
                    {tempFilters.speedRange === 'stopped' && (
                      <Check size={16} color="#1e3a8a" />
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.filterOption,
                      tempFilters.speedRange === 'slow' &&
                        styles.filterOptionActive,
                    ]}
                    onPress={() => handleSpeedFilterToggle('slow')}
                  >
                    <View style={styles.filterOptionContent}>
                      <View
                        style={[
                          styles.speedColorDot,
                          { backgroundColor: '#FFA500' },
                        ]}
                      />
                      <Text
                        style={[
                          styles.filterOptionText,
                          tempFilters.speedRange === 'slow' &&
                            styles.filterOptionTextActive,
                        ]}
                      >
                        Lento (1-10 km/h)
                      </Text>
                    </View>
                    {tempFilters.speedRange === 'slow' && (
                      <Check size={16} color="#1e3a8a" />
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.filterOption,
                      tempFilters.speedRange === 'medium' &&
                        styles.filterOptionActive,
                    ]}
                    onPress={() => handleSpeedFilterToggle('medium')}
                  >
                    <View style={styles.filterOptionContent}>
                      <View
                        style={[
                          styles.speedColorDot,
                          { backgroundColor: '#00AA00' },
                        ]}
                      />
                      <Text
                        style={[
                          styles.filterOptionText,
                          tempFilters.speedRange === 'medium' &&
                            styles.filterOptionTextActive,
                        ]}
                      >
                        Medio (11-59 km/h)
                      </Text>
                    </View>
                    {tempFilters.speedRange === 'medium' && (
                      <Check size={16} color="#1e3a8a" />
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.filterOption,
                      tempFilters.speedRange === 'fast' &&
                        styles.filterOptionActive,
                    ]}
                    onPress={() => handleSpeedFilterToggle('fast')}
                  >
                    <View style={styles.filterOptionContent}>
                      <View
                        style={[
                          styles.speedColorDot,
                          { backgroundColor: '#0066FF' },
                        ]}
                      />
                      <Text
                        style={[
                          styles.filterOptionText,
                          tempFilters.speedRange === 'fast' &&
                            styles.filterOptionTextActive,
                        ]}
                      >
                        Rápido (60+ km/h)
                      </Text>
                    </View>
                    {tempFilters.speedRange === 'fast' && (
                      <Check size={16} color="#1e3a8a" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Filtro por Estado */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Estado</Text>
                <View style={styles.filterOptions}>
                  <TouchableOpacity
                    style={[
                      styles.filterOption,
                      tempFilters.status === 'moving' &&
                        styles.filterOptionActive,
                    ]}
                    onPress={() => handleStatusFilterToggle('moving')}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        tempFilters.status === 'moving' &&
                          styles.filterOptionTextActive,
                      ]}
                    >
                      En Movimiento
                    </Text>
                    {tempFilters.status === 'moving' && (
                      <Check size={16} color="#1e3a8a" />
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.filterOption,
                      tempFilters.status === 'stopped' &&
                        styles.filterOptionActive,
                    ]}
                    onPress={() => handleStatusFilterToggle('stopped')}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        tempFilters.status === 'stopped' &&
                          styles.filterOptionTextActive,
                      ]}
                    >
                      Detenidos
                    </Text>
                    {tempFilters.status === 'stopped' && (
                      <Check size={16} color="#1e3a8a" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Filtro por Ubicación */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Ubicación</Text>
                <View style={styles.locationInputContainer}>
                  <MapPinned size={20} color="#999" />
                  <TextInput
                    style={styles.locationInput}
                    placeholder="Ej: Lima, Av. Principal, etc."
                    placeholderTextColor="#999"
                    value={tempFilters.location}
                    onChangeText={text =>
                      setTempFilters({ ...tempFilters, location: text })
                    }
                  />
                  {tempFilters.location !== '' && (
                    <TouchableOpacity
                      onPress={() =>
                        setTempFilters({ ...tempFilters, location: '' })
                      }
                    >
                      <X size={20} color="#999" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={handleClearFilters}
              >
                <Text style={styles.clearButtonText}>Limpiar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={handleApplyFilters}
              >
                <Text style={styles.applyButtonText}>Aplicar Filtros</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

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
        activeOpacity={0.7}
      >
        <View style={styles.deviceContent}>
          {/* Imagen del vehículo */}
          <View style={styles.vehicleImageContainer}>
            <View style={styles.vehicleImage}>
              <Image
                source={{
                  uri:
                    selectedVehiclePin === 's'
                      ? 'https://res.cloudinary.com/dyc4ik1ko/image/upload/v1759966615/Car_nkielr.png'
                      : selectedVehiclePin === 'p'
                        ? 'https://res.cloudinary.com/dyc4ik1ko/image/upload/v1760407171/base_ahivtq.png'
                        : 'https://res.cloudinary.com/dyc4ik1ko/image/upload/v1760407143/base_yhxknp.png',
                }}
                style={styles.carImage}
              />
            </View>
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
            style={styles.retryButton}
          >
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const activeFiltersCount = getActiveFiltersCount();
    if (activeFiltersCount > 0 || searchText) {
      return (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <SearchX size={64} color="#CBD5E0" />
          </View>
          <Text style={styles.emptyTitle}>No se encontraron unidades</Text>
          <Text style={styles.emptySubtitle}>
            {searchText
              ? `No hay vehículos que coincidan con "${searchText}"`
              : 'No hay vehículos con los filtros aplicados'}
          </Text>
          <Text style={styles.emptyHint}>
            Intenta ajustar los filtros o el término de búsqueda
          </Text>
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
  const activeFiltersCount = getActiveFiltersCount();

  return (
    <LinearGradient
      colors={['#021e4bff', '#183890ff', '#032660ff']}
      style={[styles.container, { paddingBottom: bottomSpace - 2 }]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: topSpace }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <ChevronLeft size={26} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Lista de Unidades</Text>
            <Text style={styles.headerSubtitle}>
              {loading
                ? 'Cargando...'
                : `${filteredDevices.length} de ${devices.length} unid.`}
            </Text>
          </View>
        </View>

        {/* Buscador y Filtro */}
        <View style={styles.searchFilterContainer}>
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

          {devices.length > 1 && (
            <TouchableOpacity
              style={styles.filterButton}
              onPress={handleOpenFilter}
            >
              <Filter size={20} color="#1e3a8a" />
              {activeFiltersCount > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>
                    {activeFiltersCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}
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

      {renderFilterModal()}
    </LinearGradient>
  );
};

export default Devices;