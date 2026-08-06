import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  TouchableOpacity,
  SectionList,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import {
  ChevronLeft,
  MapPin,
  Calendar,
  AlertCircle,
  FileX,
  ParkingCircle,
  TimerOff,
  Timer,
  Hourglass,
  Search,
  ChevronDown,
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
import { bodyStyles } from '../../../styles/reportbody';
import { RootStackParamList } from '../../../../App';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  getBottomSpace,
  useNavigationMode,
} from '../../../hooks/useNavigationMode';
import NavigationBarColor from 'react-native-navigation-bar-color';
import { formatDate } from '../../../utils/converUtils';
import {
  compactDuration,
  formatDayTitle,
  formatDuration,
  formatShortDate,
  minutesBetween,
  parseDuration,
  shortTime,
} from '../../../utils/reportUtils';
import { useAuthStore } from '../../../store/authStore';
import LinearGradient from 'react-native-linear-gradient';
import { Text } from '../../../components/ScaledComponents';

interface ReportItem {
  id: string;
  number: number;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  totalTime: string;
  location: string;
  latitude: number;
  longitude: number;
}

/** Parada con su duración ya resuelta en minutos. */
type Stop = ReportItem & { minutes: number | null };

type Filter = 'all' | 'long' | 'veryLong';

const LONG_STOP = 15; // minutos
const VERY_LONG_STOP = 60; // minutos

const StopReport = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'StopReport'>>();
  const { unit, startDate, endDate } = route.params;

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
  const [filter, setFilter] = useState<Filter>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

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

      const url = `${server}/api/Reporting/stops/${formattedStartDate}/${formattedEndDate}/${plate}/${username}`;

      const response = await axios.get(url);

      if (response.data && response.data.result) {
        const transformedData: ReportItem[] = response.data.result.map(
          (item: any) => ({
            id: item.item.toString(),
            number: item.item,
            startDate: item.startDate,
            startTime: item.startTime,
            endDate: item.endDate,
            endTime: item.endTime,
            totalTime: item.totalTime,
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
      setError('Error al cargar los datos del reporte');
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const openStreetView = async (item: ReportItem) => {
    const { latitude, longitude } = item;

    const googleMapsUrl = `https://www.google.com/maps/@${latitude},${longitude},3a,75y,0h,90t/data=!3m6!1e1!3m4!1s!2e0!7i16384!8i8192?entry=ttu`;

    const supported = await Linking.canOpenURL(googleMapsUrl);
    if (supported) {
      await Linking.openURL(googleMapsUrl);
    }
  };

  const toggleExpanded = (id: string) => {
    setExpandedId(current => (current === id ? null : id));
  };

  // La duración sale del rango inicio-fin; si el API manda fechas que no se
  // pueden leer, se cae al campo totalTime.
  const stops = useMemo<Stop[]>(
    () =>
      reportData.map(item => ({
        ...item,
        minutes:
          minutesBetween(
            item.startDate,
            item.startTime,
            item.endDate,
            item.endTime,
          ) ?? parseDuration(item.totalTime),
      })),
    [reportData],
  );

  const counts = useMemo(
    () => ({
      all: stops.length,
      long: stops.filter(s => (s.minutes ?? 0) >= LONG_STOP).length,
      veryLong: stops.filter(s => (s.minutes ?? 0) >= VERY_LONG_STOP).length,
    }),
    [stops],
  );

  const stats = useMemo(() => {
    const durations = stops
      .map(s => s.minutes)
      .filter((m): m is number => m !== null);

    const total = durations.reduce((acc, m) => acc + m, 0);

    return {
      total: stops.length,
      idleMinutes: total,
      longest: durations.length > 0 ? Math.max(...durations) : 0,
      average: durations.length > 0 ? total / durations.length : 0,
    };
  }, [stops]);

  const sections = useMemo(() => {
    const threshold =
      filter === 'long' ? LONG_STOP : filter === 'veryLong' ? VERY_LONG_STOP : 0;
    const visible =
      threshold === 0
        ? stops
        : stops.filter(s => (s.minutes ?? 0) >= threshold);

    const byDay = new Map<string, Stop[]>();
    visible.forEach(stop => {
      const list = byDay.get(stop.startDate);
      if (list) {
        list.push(stop);
      } else {
        byDay.set(stop.startDate, [stop]);
      }
    });

    return Array.from(byDay, ([date, data]) => ({
      title: formatDayTitle(date),
      date,
      data,
    }));
  }, [stops, filter]);

  const renderStop = ({ item }: { item: Stop }) => {
    const expanded = expandedId === item.id;
    const isLongest = stats.longest > 0 && item.minutes === stats.longest;
    const crossesDay = item.endDate !== item.startDate;

    return (
      <TouchableOpacity
        style={bodyStyles.row}
        onPress={() => toggleExpanded(item.id)}
        activeOpacity={0.8}
      >
        <View style={bodyStyles.timeCol}>
          <Text style={bodyStyles.time}>{shortTime(item.startTime)}</Text>
        </View>

        <View style={bodyStyles.railCol}>
          <View style={bodyStyles.rail} />
          <View style={[bodyStyles.dot, bodyStyles.dotStop]}>
            <ParkingCircle size={12} color="#fff" />
          </View>
        </View>

        <View style={bodyStyles.content}>
          <View style={bodyStyles.stopCard}>
            <View style={bodyStyles.stopTitleRow}>
              <Text style={bodyStyles.stopTitle}>
                Detenido{' '}
                {item.minutes !== null
                  ? formatDuration(item.minutes)
                  : item.totalTime}
              </Text>
              <Text style={bodyStyles.stopRange}>
                {shortTime(item.startTime)} – {shortTime(item.endTime)}
                {crossesDay ? ` (${formatShortDate(item.endDate)})` : ''}
              </Text>
            </View>

            <Text style={[bodyStyles.address, bodyStyles.addressMuted]}>
              {item.location}
            </Text>

            <View style={bodyStyles.metaRow}>
              {isLongest && (
                <View style={[bodyStyles.badge, bodyStyles.badgeFast]}>
                  <Hourglass size={10} color="#e36414" />
                  <Text style={[bodyStyles.badgeText, bodyStyles.badgeTextFast]}>
                    La más larga
                  </Text>
                </View>
              )}
              <Text style={bodyStyles.metaText}>Parada N° {item.number}</Text>
              <ChevronDown
                size={12}
                color="#c98a55"
                style={{
                  transform: [{ rotate: expanded ? '180deg' : '0deg' }],
                }}
              />
            </View>
          </View>

          {expanded && (
            <View style={bodyStyles.detail}>
              <View style={bodyStyles.detailRow}>
                <Text style={bodyStyles.detailLabel}>Llegada</Text>
                <Text style={bodyStyles.detailValue}>
                  {item.startDate} {shortTime(item.startTime)}
                </Text>
              </View>
              <View style={bodyStyles.detailRow}>
                <Text style={bodyStyles.detailLabel}>Salida</Text>
                <Text style={bodyStyles.detailValue}>
                  {item.endDate} {shortTime(item.endTime)}
                </Text>
              </View>
              <View style={bodyStyles.detailRow}>
                <Text style={bodyStyles.detailLabel}>Tiempo total</Text>
                <Text style={bodyStyles.detailValue}>{item.totalTime}</Text>
              </View>
              <View style={bodyStyles.detailRow}>
                <Text style={bodyStyles.detailLabel}>Coordenadas</Text>
                <Text style={bodyStyles.detailValue}>
                  {item.latitude.toFixed(6)}, {item.longitude.toFixed(6)}
                </Text>
              </View>
              <TouchableOpacity
                style={bodyStyles.mapButton}
                onPress={() => openStreetView(item)}
                activeOpacity={0.85}
              >
                <Search size={13} color="#fff" />
                <Text style={bodyStyles.mapButtonText}>
                  Ver el lugar en 3D
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const idle = compactDuration(stats.idleMinutes);
  const longest = compactDuration(stats.longest);
  const average = compactDuration(stats.average);

  const renderListHeader = () => (
    <>
      <View style={bodyStyles.summaryWrap}>
        <View style={bodyStyles.summaryCard}>
          <View style={bodyStyles.summaryTile}>
            <View
              style={[
                bodyStyles.summaryIcon,
                { backgroundColor: 'rgba(30,58,138,0.10)' },
              ]}
            >
              <ParkingCircle size={14} color="#1e3a8a" />
            </View>
            <Text style={bodyStyles.summaryValue}>{stats.total}</Text>
            <Text style={bodyStyles.summaryLabel}>Paradas</Text>
          </View>

          <View style={bodyStyles.summaryDivider} />

          <View style={bodyStyles.summaryTile}>
            <View
              style={[
                bodyStyles.summaryIcon,
                { backgroundColor: 'rgba(227,100,20,0.12)' },
              ]}
            >
              <TimerOff size={14} color="#e36414" />
            </View>
            <Text style={bodyStyles.summaryValue}>
              {idle.value}
              <Text style={bodyStyles.summaryUnit}>{idle.unit}</Text>
            </Text>
            <Text style={bodyStyles.summaryLabel}>Tiempo detenido</Text>
          </View>

          <View style={bodyStyles.summaryDivider} />

          <View style={bodyStyles.summaryTile}>
            <View
              style={[
                bodyStyles.summaryIcon,
                { backgroundColor: 'rgba(227,100,20,0.12)' },
              ]}
            >
              <Hourglass size={14} color="#e36414" />
            </View>
            <Text style={bodyStyles.summaryValue}>
              {longest.value}
              <Text style={bodyStyles.summaryUnit}>{longest.unit}</Text>
            </Text>
            <Text style={bodyStyles.summaryLabel}>La más larga</Text>
          </View>

          <View style={bodyStyles.summaryDivider} />

          <View style={bodyStyles.summaryTile}>
            <View
              style={[
                bodyStyles.summaryIcon,
                { backgroundColor: 'rgba(30,58,138,0.10)' },
              ]}
            >
              <Timer size={14} color="#1e3a8a" />
            </View>
            <Text style={bodyStyles.summaryValue}>
              {average.value}
              <Text style={bodyStyles.summaryUnit}>{average.unit}</Text>
            </Text>
            <Text style={bodyStyles.summaryLabel}>Promedio</Text>
          </View>
        </View>
      </View>

      <View style={bodyStyles.filterRow}>
        {(
          [
            { key: 'all', label: 'Todas' },
            { key: 'long', label: `Más de ${LONG_STOP} min` },
            { key: 'veryLong', label: 'Más de 1 h' },
          ] as { key: Filter; label: string }[]
        ).map(option => {
          const active = filter === option.key;
          return (
            <TouchableOpacity
              key={option.key}
              style={[bodyStyles.chip, active && bodyStyles.chipActive]}
              onPress={() => setFilter(option.key)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  bodyStyles.chipText,
                  active && bodyStyles.chipTextActive,
                ]}
              >
                {option.label}
              </Text>
              <Text
                style={[
                  bodyStyles.chipCount,
                  active && bodyStyles.chipCountActive,
                ]}
              >
                {counts[option.key]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );

  const topSpace = Platform.OS === 'ios' ? insets.top - 5 : insets.top + 5;

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
          <TouchableOpacity
            onPress={handleGoBack}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <ChevronLeft size={26} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Reporte Paradas</Text>
            <Text style={styles.headerSubtitle}>Unidad: {unit.plate}</Text>
            <View style={styles.headerDateContainer}>
              <Calendar size={16} color="#fff" />
              <Text style={styles.headerDate}>
                {formatDate(startDate)} - {formatDate(endDate)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Cuerpo */}
      <View style={bodyStyles.body}>
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
          <SectionList
            sections={sections}
            keyExtractor={stop => stop.id}
            renderItem={renderStop}
            renderSectionHeader={({ section }) => (
              <View style={bodyStyles.dayHeader}>
                <Text style={bodyStyles.dayTitle}>{section.title}</Text>
                <Text style={bodyStyles.dayCount}>
                  {section.data.length}{' '}
                  {section.data.length === 1 ? 'parada' : 'paradas'}
                </Text>
              </View>
            )}
            ListHeaderComponent={renderListHeader}
            ListEmptyComponent={
              <View style={bodyStyles.filterEmpty}>
                <MapPin size={34} color="#c3cbd8" />
                <Text style={bodyStyles.filterEmptyText}>
                  {filter === 'veryLong'
                    ? 'Ninguna parada superó la hora'
                    : `Ninguna parada superó los ${LONG_STOP} minutos`}
                </Text>
              </View>
            }
            contentContainerStyle={bodyStyles.listContent}
            stickySectionHeadersEnabled
            showsVerticalScrollIndicator={false}
            initialNumToRender={14}
            maxToRenderPerBatch={12}
            windowSize={9}
            removeClippedSubviews={Platform.OS === 'android'}
          />
        )}
      </View>
    </LinearGradient>
  );
};

export default StopReport;
