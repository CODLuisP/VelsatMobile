import React, { useState } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
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

interface Device {
  id: string;
  name: string;
  status: 'Detenido' | 'Movimiento';
  speed: number;
  location: string;
  isOnline: boolean;
}

const Devices = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [searchText, setSearchText] = useState('');

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

  const [devices] = useState<Device[]>([
    {
      id: '1',
      name: 'M2L-777',
      status: 'Detenido',
      speed: 0,
      location: 'Av. Miguel de Cervantes Cd. 1',
      isOnline: true,
    },
    {
      id: '2',
      name: 'M2L-777',
      status: 'Movimiento',
      speed: 3,
      location: 'Av. Miguel de Cervantes Cd. 1',
      isOnline: true,
    },
    {
      id: '3',
      name: 'M2L-779',
      status: 'Movimiento',
      speed: 25,
      location: 'Av. Miguel de Cervantes Cd. 1',
      isOnline: true,
    },
    {
      id: '4',
      name: 'M2L-771',
      status: 'Movimiento',
      speed: 75,
      location: 'Av. Miguel de Cervantes Cd. 1',
      isOnline: true,
    },
    {
      id: '5',
      name: 'M2L-767',
      status: 'Detenido',
      speed: 0,
      location: 'Av. Miguel de Cervantes Cd. 1',
      isOnline: true,
    },
    {
      id: '6',
      name: 'M2L-867',
      status: 'Detenido',
      speed: 0,
      location: 'Av. Miguel de Cervantes Cd. 1',
      isOnline: true,
    },
    {
      id: '7',
      name: 'M2L-967',
      status: 'Detenido',
      speed: 0,
      location: 'Av. Miguel de Cervantes Cd. 1',
      isOnline: true,
    },
  ]);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const getStatusColor = (speed: number, status: string) => {
    if (status === 'Detenido' || speed === 0) return '#FF4444';
    if (speed <= 10) return '#FFA500';
    if (speed <= 30) return '#00AA00';
    return '#0066FF';
  };

  const getSpeedColor = (speed: number, status: string) => {
    if (status === 'Detenido' || speed === 0) return '#FF4444';
    if (speed <= 10) return '#FFA500';
    if (speed <= 30) return '#00AA00';
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

  

  const renderEmptyComponent = () => (
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
            <Text style={styles.headerSubtitle}>{devices.length} unid.</Text>
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
        ListEmptyComponent={searchText ? renderEmptyComponent : null}
      />
    </View>
  );
};

export default Devices;
