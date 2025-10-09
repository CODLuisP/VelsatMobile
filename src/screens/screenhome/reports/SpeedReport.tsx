import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Linking,
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

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError(null);

      const username = user?.username;
      const plate = unit.plate;

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
      const formattedStartDate = encodeURIComponent(
        formatDateForAPI(startDate),
      );
      const formattedEndDate = encodeURIComponent(formatDateForAPI(endDate));

      const url = `${server}/api/Reporting/speed/${formattedStartDate}/${formattedEndDate}/${plate}/${speed}/${username}`;

      console.log('API URL:', url);

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

  const handleReportItemPress = (item: ReportItem) => {
    const { latitude, longitude } = item;

    // URL para Google Maps en Street View
    const googleMapsUrl = `https://www.google.com/maps/@${latitude},${longitude},3a,75y,0h,90t/data=!3m7!1e1!3m5!1s!2e0!7i16384!8i8192?entry=ttu`;

    Linking.openURL(googleMapsUrl).catch(err =>
      console.error('Error al abrir Google Maps:', err),
    );
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
      colors={['#00296b', '#1e3a8a', '#00296b']}
      style={[styles.container, { paddingBottom: bottomSpace }]}
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
          <FlatList
            data={reportData}
            keyExtractor={item => item.id}
            renderItem={({ item, index }) => renderReportItem({ item, index })}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.reportsListContent}
            style={{ paddingHorizontal: 10, paddingVertical: 10 }}
          />
        )}
      </View>
    </LinearGradient>
  );
};

export default SpeedReport;
