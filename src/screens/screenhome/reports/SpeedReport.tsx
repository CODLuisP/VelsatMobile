import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import {
  ChevronLeft,
  MapPin,
  Clock,
  Gauge,
  Globe,
  Calendar,
  AlertCircle,
  FileX,
  TrendingUp,
  TrendingDown,
  Activity,
  Info,
  BarChart3,
} from 'lucide-react-native';
import {
  NavigationProp,
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import axios from 'axios';
import { styles } from '../../../styles/generalreport';
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

interface ReportItem {
  id: string;
  number: number;
  date: string;
  time: string;
  speed: number;
  location: string;
  latitude: number;
  longitude: number;
}

interface SpeedStats {
  max: number;
  min: number;
  average: number;
}

const SpeedReport = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'SpeedReport'>>();
  const { unit, startDate, endDate, speed } = route.params;

  const insets = useSafeAreaInsets();
  const navigationDetection = useNavigationMode();
  const bottomSpace = getBottomSpace(
    insets,
    navigationDetection.hasNavigationBar,
  );
  const { user, server } = useAuthStore();

  const [reportData, setReportData] = useState<ReportItem[]>([]);
  const [speedStats, setSpeedStats] = useState<SpeedStats>({
    max: 0,
    min: 0,
    average: 0,
  });
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

  const calculateSpeedStats = (data: ReportItem[]): SpeedStats => {
    if (data.length === 0) {
      return { max: 0, min: 0, average: 0 };
    }

    const speeds = data.map(item => item.speed);
    const max = Math.max(...speeds);
    const min = Math.min(...speeds);
    const sum = speeds.reduce((acc, curr) => acc + curr, 0);
    const average = sum / speeds.length;

    return {
      max,
      min,
      average: parseFloat(average.toFixed(2)),
    };
  };

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError(null);

      const username = user?.username;
      const plate = unit.plate;

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

      const url = `${server}/api/Reporting/speed/${formattedStartDate}/${formattedEndDate}/${plate}/${speed}/${username}`;


      const response = await axios.get(url);

      if (response.data && response.data.result) {
        const transformedData: ReportItem[] = response.data.result.map(
          (item: any) => ({
            id: item.item.toString(),
            number: item.item,
            date: item.date,
            time: item.time,
            speed: item.speedKPH,
            location: item.address,
            latitude: item.latitude,
            longitude: item.longitude,
          }),
        );

        setReportData(transformedData);
        setSpeedStats(calculateSpeedStats(transformedData));
      } else {
        setError('No se encontraron datos');
      }
    } catch (err) {
      setError('Error al cargar los datos del reporte');
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleReportItemPress = (item: ReportItem) => {
    const { latitude, longitude } = item;

    // URL para abrir directamente en Street View 3D
    const googleMapsUrl = `https://www.google.com/maps/@${latitude},${longitude},3a,75y,0h,90t/data=!3m6!1e1!3m4!1s!2e0!7i16384!8i8192?entry=ttu`;
  };

  const getSpeedColor = (speed: number) => {
    if (speed === 0) return '#FF4444';
    if (speed <= 10) return '#fb8500';
    if (speed <= 30) return '#00AA00';
    return '#0066FF';
  };

  const renderReportItem = ({
    item,
    index,
  }: {
    item: ReportItem;
    index: number;
  }) => {
    const isFirst = index === 0;
    const isLast = index === reportData.length - 1;

    return (
      <TouchableOpacity
        style={[
          styles.reportItem,
          isFirst && styles.reportItemFirst,
          isLast && styles.reportItemLast,
        ]}
        onPress={() => handleReportItemPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.reportContent}>
          {/* Número del reporte */}
          <View style={styles.numberContainer}>
            <Text style={styles.numberText}>{item.number}.</Text>
          </View>

          {/* Contenido principal */}
          <View style={styles.mainContent}>
            {/* Fila superior con dos columnas */}
            <View style={styles.topRowContent}>
              {/* Sección izquierda - Fecha y velocidad */}
              <View style={styles.leftSection}>
                <View style={styles.dateTimeContainer}>
                  <Clock size={14} color="#666" />
                  <Text style={styles.sectionLabel}>Fecha y hora</Text>
                </View>
                <Text style={styles.dateTimeText}>
                  {item.date} {item.time}
                </Text>

                <View style={styles.speedContainer}>
                  <Gauge size={14} color="#666" />
                  <Text style={styles.sectionLabel}>Velocidad</Text>
                </View>
                <Text
                  style={[
                    styles.speedText,
                    { color: getSpeedColor(item.speed) },
                  ]}
                >
                  {item.speed} Km/h
                </Text>
              </View>

              {/* Sección derecha - Coordenadas */}
              <View style={styles.rightSection}>
                <View style={styles.coordinatesContainer}>
                  <Globe size={14} color="#666" />
                  <Text style={styles.sectionLabel}>Latitud y Longitud</Text>
                </View>
                <Text style={styles.coordinatesText}>
                  {item.latitude.toFixed(6)}, {item.longitude.toFixed(6)}
                </Text>
              </View>
            </View>

            {/* Fila inferior - Ubicación ocupa todo el ancho */}
            <View style={styles.bottomRowContent}>
              <View style={styles.locationContainer}>
                <MapPin size={14} color="#666" />
                <Text style={styles.sectionLabel}>Ubicación</Text>
              </View>
              <Text style={styles.locationText}>{item.location}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const topSpace = insets.top + 5;

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
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton} activeOpacity={0.7}>
            <ChevronLeft size={26} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Reporte Velocidad</Text>
            <Text style={styles.headerSubtitle}>Unidad: {unit.plate}</Text>
            <Text style={styles.headerSubtitle}>
              Velocidad mayor a: {speed} Km/h
            </Text>
            <View style={styles.headerDateContainer}>
              <Calendar size={16} color="#fff" />
              <Text style={styles.headerDate}>
                {formatDate(startDate)} - {formatDate(endDate)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Contenedor para la lista o estados */}
      <View
        style={{
          flex: 1,
          backgroundColor: 'white',
          borderTopLeftRadius: 25,
          borderTopRightRadius: 25,
        }}
      >
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
        ) : reportData.length === 0 ? (
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
          <>
            {/* Total de Registros - Condicional Android/iOS */}
            {Platform.OS === 'android' ? (
              <LinearGradient
                colors={['#f59e0b', '#d97706']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={inlineStyles.totalCard}
              >
                <View style={inlineStyles.totalIconWrapper}>
                  <BarChart3 size={22} color="#fff" />
                </View>
                <View style={inlineStyles.totalContent}>
                  <Text style={inlineStyles.totalLabel}>Total de Registros</Text>
                  <Text style={inlineStyles.totalValue}>{reportData.length} eventos</Text>
                </View>
              </LinearGradient>
            ) : (
              <View style={[inlineStyles.totalCard, inlineStyles.totalCardIOS]}>
                <View style={inlineStyles.totalIconWrapper}>
                  <BarChart3 size={22} color="#fff" />
                </View>
                <View style={inlineStyles.totalContent}>
                  <Text style={inlineStyles.totalLabel}>Total de Registros</Text>
                  <Text style={inlineStyles.totalValue}>{reportData.length} eventos</Text>
                </View>
              </View>
            )}

            {/* Estadísticas de Velocidad - 3 en una fila Condicional Android/iOS */}
            <View style={inlineStyles.speedStatsRow}>
              {/* Velocidad Máxima */}
              {Platform.OS === 'android' ? (
                <LinearGradient
                  colors={['#ef4444', '#dc2626']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={inlineStyles.speedCard}
                >
                  <View style={inlineStyles.speedIconContainer}>
                    <View style={inlineStyles.speedIcon}>
                      <TrendingUp size={18} color="#fff" />
                    </View>
                  </View>
                  <View style={inlineStyles.speedContent}>
                    <Text style={inlineStyles.speedLabel}>Vel. Máxima</Text>
                    <Text style={inlineStyles.speedValue}>
                      {speedStats.max} km/h
                    </Text>
                    <Text style={inlineStyles.speedUnit}>{unit.plate}</Text>
                  </View>
                </LinearGradient>
              ) : (
                <View style={[inlineStyles.speedCard, inlineStyles.speedCardMaxIOS]}>
                  <View style={inlineStyles.speedIconContainer}>
                    <View style={inlineStyles.speedIcon}>
                      <TrendingUp size={18} color="#fff" />
                    </View>
                  </View>
                  <View style={inlineStyles.speedContent}>
                    <Text style={inlineStyles.speedLabel}>Vel. Máxima</Text>
                    <Text style={inlineStyles.speedValue}>
                      {speedStats.max} km/h
                    </Text>
                    <Text style={inlineStyles.speedUnit}>{unit.plate}</Text>
                  </View>
                </View>
              )}

              {/* Velocidad Mínima */}
              {Platform.OS === 'android' ? (
                <LinearGradient
                  colors={['#3b82f6', '#2563eb']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={inlineStyles.speedCard}
                >
                  <View style={inlineStyles.speedIconContainer}>
                    <View style={inlineStyles.speedIcon}>
                      <TrendingDown size={18} color="#fff" />
                    </View>
                  </View>
                  <View style={inlineStyles.speedContent}>
                    <Text style={inlineStyles.speedLabel}>Vel. Mínima</Text>
                    <Text style={inlineStyles.speedValue}>
                      {speedStats.min} km/h
                    </Text>
                    <Text style={inlineStyles.speedUnit}>{unit.plate}</Text>
                  </View>
                </LinearGradient>
              ) : (
                <View style={[inlineStyles.speedCard, inlineStyles.speedCardMinIOS]}>
                  <View style={inlineStyles.speedIconContainer}>
                    <View style={inlineStyles.speedIcon}>
                      <TrendingDown size={18} color="#fff" />
                    </View>
                  </View>
                  <View style={inlineStyles.speedContent}>
                    <Text style={inlineStyles.speedLabel}>Vel. Mínima</Text>
                    <Text style={inlineStyles.speedValue}>
                      {speedStats.min} km/h
                    </Text>
                    <Text style={inlineStyles.speedUnit}>{unit.plate}</Text>
                  </View>
                </View>
              )}

              {/* Velocidad Promedio */}
              {Platform.OS === 'android' ? (
                <LinearGradient
                  colors={['#10b981', '#059669']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={inlineStyles.speedCard}
                >
                  <View style={inlineStyles.speedIconContainer}>
                    <View style={inlineStyles.speedIcon}>
                      <Activity size={18} color="#fff" />
                    </View>
                  </View>
                  <View style={inlineStyles.speedContent}>
                    <Text style={inlineStyles.speedLabel}>Vel. Promedio</Text>
                    <Text style={inlineStyles.speedValue}>
                      {speedStats.average} km/h
                    </Text>
                    <Text style={inlineStyles.speedUnit}>General</Text>
                  </View>
                </LinearGradient>
              ) : (
                <View style={[inlineStyles.speedCard, inlineStyles.speedCardAvgIOS]}>
                  <View style={inlineStyles.speedIconContainer}>
                    <View style={inlineStyles.speedIcon}>
                      <Activity size={18} color="#fff" />
                    </View>
                  </View>
                  <View style={inlineStyles.speedContent}>
                    <Text style={inlineStyles.speedLabel}>Vel. Promedio</Text>
                    <Text style={inlineStyles.speedValue}>
                      {speedStats.average} km/h
                    </Text>
                    <Text style={inlineStyles.speedUnit}>General</Text>
                  </View>
                </View>
              )}
            </View>

            {/* Card de Consejo */}
            <View style={inlineStyles.tipCard}>
              <View style={inlineStyles.tipIconWrapper}>
                <Info size={18} color="#d57004ff" />
              </View>
              <View style={inlineStyles.tipTextContainer}>
                <Text style={inlineStyles.tipTitle}>Consejo</Text>
                <Text style={inlineStyles.tipText}>
                  Toca cualquier registro para ver la ubicación en vista Street View 3D
                </Text>
              </View>
            </View>

            {/* Lista de reportes */}
            <FlatList
              data={reportData}
              keyExtractor={item => item.id}
              renderItem={({ item, index }) => renderReportItem({ item, index })}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.reportsListContent}
              style={{ paddingHorizontal: 10, paddingVertical: 10 }}
            />
          </>
        )}
      </View>
    </LinearGradient>
  );
};

// Estilos inline para los nuevos componentes
const inlineStyles = {
  // Total de Registros
  totalCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginHorizontal: 15,
    marginTop: 15,
    marginBottom: 10,
    padding: 10,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  totalCardIOS: {
    backgroundColor: '#f59e0b',
  },
  totalIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: 14,
  },
  totalContent: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600' as const,
    marginBottom: 3,
    opacity: 0.95,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
  },

  // Estadísticas de Velocidad
  speedStatsRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    marginHorizontal: 15,
    marginBottom: 10,
    gap: 8,
  },
  speedCard: {
    flex: 1,
    borderRadius: 14,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
  },
  speedCardMaxIOS: {
    backgroundColor: '#ef4444',
  },
  speedCardMinIOS: {
    backgroundColor: '#3b82f6',
  },
  speedCardAvgIOS: {
    backgroundColor: '#10b981',
  },
  speedIconContainer: {
    alignItems: 'center' as const,
    marginBottom: 6,
  },
  speedIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  speedContent: {
    alignItems: 'center' as const,
  },
  speedLabel: {
    fontSize: 9,
    color: '#fff',
    fontWeight: '600' as const,
    textAlign: 'center' as const,
    marginBottom: 2,
    opacity: 0.95,
  },
  speedValue: {
    fontSize: 15,
    fontWeight: '700' as const,
    textAlign: 'center' as const,
    color: '#fff',
    marginBottom: 2,
  },
  speedUnit: {
    fontSize: 8.5,
    color: '#fff',
    fontWeight: '500' as const,
    textAlign: 'center' as const,
    opacity: 0.9,
  },

  // Card de Consejo
  tipCard: {
    flexDirection: 'row' as const,
    marginHorizontal: 15,
    marginBottom: 10,
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#fff6edff',
  },
  tipIconWrapper: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ffd0a0ff',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: 10,
  },
  tipTextContainer: {
    flex: 1,
    justifyContent: 'center' as const,
  },
  tipTitle: {
    fontSize: 10.5,
    fontWeight: '700' as const,
    color: '#d57004ff',
    marginBottom: 2,
  },
  tipText: {
    fontSize: 10.5,
    color: '#d57004ff',
    lineHeight: 14,
    fontWeight: '500' as const,
    opacity: 0.95,
  },
};

export default SpeedReport;