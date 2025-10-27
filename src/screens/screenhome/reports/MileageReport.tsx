import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {
  ChevronLeft,
  Calendar,
  Car,
  MapPin,
  AlertCircle,
  FileX,
  Navigation,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Target,
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
import LinearGradient from 'react-native-linear-gradient';

interface VehicleReport {
  id: string;
  itemNumber: number;
  unitName: string;
  mileage: number;
  carImage: any;
}

interface Statistics {
  maxMileage: VehicleReport | null;
  minMileage: VehicleReport | null;
  totalMileage: number;
  averageMileage: number;
  totalVehicles: number;
}

const GradientWrapper: React.FC<{
  colors: string[];
  style: any;
  children: React.ReactNode;
}> = ({ colors, style, children }) => {
  if (Platform.OS === 'ios') {
    return <View style={[style, { backgroundColor: colors[0] }]}>{children}</View>;
  }
  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={style}
    >
      {children}
    </LinearGradient>
  );
};

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
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      NavigationBarColor('#00296b', false);
    }, []),
  );

  useEffect(() => {
    fetchReportData();
  }, []);

  const calculateStatistics = (data: VehicleReport[]): Statistics => {
    if (data.length === 0) {
      return {
        maxMileage: null,
        minMileage: null,
        totalMileage: 0,
        averageMileage: 0,
        totalVehicles: 0,
      };
    }

    const maxVehicle = data.reduce((max, vehicle) =>
      vehicle.mileage > max.mileage ? vehicle : max
    );

    const minVehicle = data.reduce((min, vehicle) =>
      vehicle.mileage < min.mileage ? vehicle : min
    );

    const total = data.reduce((sum, vehicle) => sum + vehicle.mileage, 0);
    const average = total / data.length;

    return {
      maxMileage: maxVehicle,
      minMileage: minVehicle,
      totalMileage: parseFloat(total.toFixed(2)),
      averageMileage: parseFloat(average.toFixed(2)),
      totalVehicles: data.length,
    };
  };

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError(null);

      const username = user?.username;

      const formatDateForAPI = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };

      const formattedStartDate = encodeURIComponent(
        formatDateForAPI(startDate),
      );
      const formattedEndDate = encodeURIComponent(formatDateForAPI(endDate));

      let url = '';

      if (isAllUnits) {
        url = `${server}/api/Kilometer/kilometerall/${formattedStartDate}/${formattedEndDate}/${username}`;
      } else {
        const plate = unit.plate;
        url = `${server}/api/Kilometer/kilometer/${formattedStartDate}/${formattedEndDate}/${plate}/${username}`;
      }

      console.log('API URL:', url);

      const response = await axios.get(url);

      if (
        response.data &&
        response.data.result &&
        response.data.result.listaKilometros
      ) {
        const transformedData: VehicleReport[] =
          response.data.result.listaKilometros.map((item: any) => ({
            id: item.item.toString(),
            itemNumber: item.item,
            unitName: item.deviceId,
            mileage: parseFloat(item.kilometros.toFixed(2)),
            carImage: require('../../../../assets/Car.jpg'),
          }));

        setVehicleData(transformedData);

        if (isAllUnits) {
          const stats = calculateStatistics(transformedData);
          setStatistics(stats);
        }
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

  const renderStatistics = () => {
    if (!isAllUnits || !statistics || statistics.totalVehicles === 0) {
      return null;
    }

    return (
      <View style={styles.statisticsContainer}>
   

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <GradientWrapper
              colors={['#10b981', '#059669']}
              style={styles.statGradient}
            >
              <View style={styles.statIconContainer}>
                <TrendingUp size={18} color="#fff" />
              </View>
              <Text style={styles.statLabel}>Mayor Recorrido</Text>
              <Text style={styles.statValue}>
                {statistics.maxMileage?.mileage} km
              </Text>
              <Text style={styles.statSubtext}>
                {statistics.maxMileage?.unitName}
              </Text>
            </GradientWrapper>
          </View>

          <View style={styles.statCard}>
            <GradientWrapper
              colors={['#ff9f1c', '#d97706']}
              style={styles.statGradient}
            >
              <View style={styles.statIconContainer}>
                <TrendingDown size={18} color="#fff" />
              </View>
              <Text style={styles.statLabel}>Menor Recorrido</Text>
              <Text style={styles.statValue}>
                {statistics.minMileage?.mileage} km
              </Text>
              <Text style={styles.statSubtext}>
                {statistics.minMileage?.unitName}
              </Text>
            </GradientWrapper>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <GradientWrapper
              colors={['#4285f4', '#1967d2']}
              style={styles.statGradient}
            >
              <View style={styles.statIconContainer}>
                <Navigation size={18} color="#fff" />
              </View>
              <Text style={styles.statLabel}>Total Recorrido</Text>
              <Text style={styles.statValue}>{statistics.totalMileage} km</Text>
              <Text style={styles.statSubtext}>
                {statistics.totalVehicles} unidades
              </Text>
            </GradientWrapper>
          </View>

          <View style={styles.statCard}>
            <GradientWrapper
              colors={['#8b5cf6', '#7c3aed']}
              style={styles.statGradient}
            >
              <View style={styles.statIconContainer}>
                <Target size={18} color="#fff" />
              </View>
              <Text style={styles.statLabel}>Promedio</Text>
              <Text style={styles.statValue}>
                {statistics.averageMileage} km
              </Text>
              <Text style={styles.statSubtext}>por unidad</Text>
            </GradientWrapper>
          </View>
        </View>

        <View style={styles.statisticsDivider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>Detalle por Unidad</Text>
          <View style={styles.dividerLine} />
        </View>
      </View>
    );
  };

  const renderVehicleItem = ({ item }: { item: VehicleReport }) => (
    <TouchableOpacity
      style={styles.vehicleCard}
      onPress={() => handleVehiclePress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.badgeContainer}>
          <GradientWrapper
            colors={['#ff8c00', '#ff6b00']}
            style={styles.itemBadge}
          >
            <Text style={styles.itemBadgeText}>N° {item.itemNumber}</Text>
          </GradientWrapper>
        </View>

        <View style={styles.unitInfoContainer}>
          <View style={styles.carIconBadge}>
            <Car size={14} color="#4285f4" />
          </View>
          <View style={styles.unitTextContainer}>
            <Text style={styles.unitLabel}>Unidad</Text>
            <Text style={styles.unitName}>{item.unitName}</Text>
          </View>
        </View>
      </View>

      <View style={styles.cardDivider} />

      <View style={styles.cardBody}>
        <View style={styles.vehicleImageSection}>
          <View style={styles.imageContainer}>
            <Image
              source={item.carImage}
              style={styles.vehicleImage}
              defaultSource={require('../../../../assets/Car.jpg')}
            />
          </View>
        </View>

        <View style={styles.mileageSection}>
          <View style={styles.mileageCard}>
           
            <View style={styles.mileageInfo}>
              <Text style={styles.mileageLabel}>Distancia recorrida</Text>
              <View style={styles.mileageValueContainer}>
                <Text style={styles.mileageValue}>{item.mileage}</Text>
                <Text style={styles.mileageUnit}>km</Text>
              </View>
            </View>
          </View>

        </View>
      </View>
    </TouchableOpacity>
  );

  const topSpace = insets.top + 5;

  return (
    <GradientWrapper
      colors={['#021e4bff', '#183890ff', '#032660ff']}
      style={[styles.container, { paddingBottom: bottomSpace - 2 }]}
    >
      <View style={[styles.header, { paddingTop: topSpace }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={handleGoBack} style={styles.backButton} activeOpacity={0.7}>
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
            ListHeaderComponent={renderStatistics}
          />
        )}
      </View>
    </GradientWrapper>
  );
};

export default MileageReport;