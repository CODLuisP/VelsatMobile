import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import {
  ChevronLeft,
  Calendar,
  Car,
  MapPin,
  AlertCircle,
  FileX,
} from 'lucide-react-native';
import {
  NavigationProp,
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import axios from 'axios';
import { styles } from '../../../styles/mileagereport';
import { RootStackParamList } from '../../../../App';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  getBottomSpace,
  useNavigationMode,
} from '../../../hooks/useNavigationMode';
import NavigationBarColor from 'react-native-navigation-bar-color';
import { formatDate } from '../../../utils/converUtils';
import { useAuthStore } from '../../../store/authStore';

interface VehicleReport {
  id: string;
  itemNumber: number;
  unitName: string;
  mileage: number;
  carImage: any;
}

const MileageReport = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'MileageReport'>>();
  const { unit, startDate, endDate } = route.params;

  const isAllUnits = unit === 'all';

  const insets = useSafeAreaInsets();
  const navigationDetection = useNavigationMode();
  const bottomSpace = getBottomSpace(
    insets,
    navigationDetection.hasNavigationBar,
  );
  const { user, server } = useAuthStore();

  const [vehicleData, setVehicleData] = useState<VehicleReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      NavigationBarColor('#1e3a8a', false);
    }, []),
  );

  useEffect(() => {
    fetchReportData();
  }, []);

const fetchReportData = async () => {
  try {
    setLoading(true);
    setError(null);

    const username = user?.username;

    // Función para formatear fecha a ISO string
    const formatDateForAPI = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');

      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    // Formatear las fechas para la API
    const formattedStartDate = encodeURIComponent(formatDateForAPI(startDate));
    const formattedEndDate = encodeURIComponent(formatDateForAPI(endDate));

    // Construir URL según si es "all" o una unidad específica
    let url = '';
    
    if (isAllUnits) {
      // API para todas las unidades
      url = `${server}/api/Kilometer/kilometerall/${formattedStartDate}/${formattedEndDate}/${username}`;
    } else {
      // API para una unidad específica
      const plate = unit.plate;
      url = `${server}/api/Kilometer/kilometer/${formattedStartDate}/${formattedEndDate}/${plate}/${username}`;
    }

    console.log('API URL:', url);

    const response = await axios.get(url);

    if (response.data && response.data.result && response.data.result.listaKilometros) {
      const transformedData: VehicleReport[] = response.data.result.listaKilometros.map(
        (item: any) => ({
          id: item.item.toString(),
          itemNumber: item.item,
          unitName: item.deviceId,
          mileage: parseFloat(item.kilometros.toFixed(2)),
          carImage: require('../../../../assets/Car.jpg'),
        })
      );

      setVehicleData(transformedData);
    } else {
      setError('No se encontraron datos');
    }
  } catch (err) {
    console.error('Error fetching report data:', err);
    setError('Error al cargar los datos del reporte');
  } finally {
    setLoading(false);
  }
};

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleVehiclePress = (vehicle: VehicleReport) => {
    console.log('Clicked on vehicle:', vehicle);
  };

  const renderVehicleItem = ({ item }: { item: VehicleReport }) => (
    <TouchableOpacity
      style={styles.vehicleCard}
      onPress={() => handleVehiclePress(item)}
      activeOpacity={0.8}
    >
      {/* Header combinado: Todo en una línea */}
      <View style={styles.itemHeader}>
        <View style={styles.itemBadge}>
          <Text style={styles.itemBadgeText}>ITEM #{item.itemNumber} </Text>
        </View>
        <View style={styles.unitHeaderInfo}>
          <Text style={styles.unitCompleteText}>Unidad: {item.unitName}</Text>
        </View>
      </View>

      {/* Contenido principal simplificado */}
      <View style={styles.cardContent}>
        {/* Sección izquierda - Solo imagen del carro */}
        <View style={styles.leftSection}>
          <View style={styles.carImageWrapper}>
            <Image
              source={item.carImage}
              style={styles.carImage}
              defaultSource={require('../../../../assets/Car.jpg')}
            />
          </View>
        </View>

        {/* Sección derecha - Kilometraje */}
        <View style={styles.rightSection}>
          <Text style={styles.mileageValue}>{item.mileage}</Text>
          <View style={styles.mileageLabel}>
            <MapPin size={12} color="#ff8c00" />
            <Text style={styles.mileageLabelText}>Km recorridos</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const topSpace = insets.top + 5;

  return (
    <View style={[styles.container, { paddingBottom: bottomSpace }]}>
      <View style={[styles.header, { paddingTop: topSpace }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
              <ChevronLeft size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Reporte de Kilometraje</Text>
              <Text style={styles.dateText}>
                {isAllUnits ? 'Todas las unidades' : `Unidad: ${unit.plate}`}
              </Text>
              <View style={styles.dateContainer}>
                <View style={styles.dateWrapper}>
                  <Calendar size={16} color="#fff" opacity={0.9} />
                  <Text style={styles.dateText}>
                    {formatDate(startDate)} - {formatDate(endDate)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Contenedor wrapper con borde redondeado */}
      <View style={styles.listWrapper}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1e3a8a" />
            <Text style={styles.loadingText}>Cargando...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <View style={styles.errorIconContainer}>
              <AlertCircle size={40} color="#FF4444" />
            </View>
            <Text style={styles.errorTitle}>Error al cargar datos</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : vehicleData.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <FileX size={70} color="#94a3b8" />
            </View>
            <Text style={styles.emptyTitle}>Sin datos</Text>
            <Text style={styles.emptyText}>
              No hay datos disponibles para el rango de fechas seleccionado
            </Text>
          </View>
        ) : (
          <FlatList
            data={vehicleData}
            keyExtractor={item => item.id}
            renderItem={renderVehicleItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}
      </View>
    </View>
  );
};

export default MileageReport;