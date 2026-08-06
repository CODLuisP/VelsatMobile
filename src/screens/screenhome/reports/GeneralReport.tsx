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
  Gauge,
  Calendar,
  AlertCircle,
  FileX,
  Route,
  TimerOff,
  ParkingCircle,
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
  minutesBetween,
  shortTime,
} from '../../../utils/reportUtils';
import { useAuthStore } from '../../../store/authStore';
import LinearGradient from 'react-native-linear-gradient';
import { Text } from '../../../components/ScaledComponents';

interface ReportItem {
  id: string;
  number: number;
  date: string;
  time: string;
  speed: number;
  odometer: number;
  location: string;
  latitude: number;
  longitude: number;
}

/** Un punto en movimiento, o una parada que agrupa varios pings seguidos con velocidad 0. */
type Segment =
  | { kind: 'move'; key: string; date: string; item: ReportItem }
  | {
      kind: 'stop';
      key: string;
      date: string;
      start: ReportItem;
      end: ReportItem;
      count: number;
      minutes: number | null;
    };

type Filter = 'all' | 'move' | 'stop';

const GeneralReport = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'GeneralReport'>>();
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
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

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

      const url = `${server}/api/Reporting/general/${formattedStartDate}/${formattedEndDate}/${plate}/${username}`;

      const response = await axios.get(url);

      if (
        response.data &&
        response.data.result &&
        response.data.result.listaTablas
      ) {
        const transformedData: ReportItem[] =
          response.data.result.listaTablas.map((item: any) => ({
            id: item.item.toString(),
            number: item.item,
            date: item.fecha,
            time: item.hora,
            speed: item.speedKPH,
            odometer: item.odometerKM,
            location: item.address,
            latitude: item.latitude,
            longitude: item.longitude,
          }));

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

  const toggleExpanded = (key: string) => {
    setExpandedKey(current => (current === key ? null : key));
  };

  // Agrupa los pings seguidos con velocidad 0 en una sola parada.
  const segments = useMemo<Segment[]>(() => {
    const result: Segment[] = [];
    let i = 0;

    while (i < reportData.length) {
      const current = reportData[i];

      if (current.speed === 0) {
        let last = i;
        while (
          last + 1 < reportData.length &&
          reportData[last + 1].speed === 0 &&
          reportData[last + 1].date === current.date
        ) {
          last++;
        }

        if (last > i) {
          const start = reportData[i];
          const end = reportData[last];

          result.push({
            kind: 'stop',
            key: `stop-${start.id}`,
            date: start.date,
            start,
            end,
            count: last - i + 1,
            minutes: minutesBetween(start.date, start.time, end.date, end.time),
          });

          i = last + 1;
          continue;
        }
      }

      result.push({
        kind: 'move',
        key: `move-${current.id}`,
        date: current.date,
        item: current,
      });
      i++;
    }

    return result;
  }, [reportData]);

  const counts = useMemo(
    () => ({
      all: segments.length,
      move: segments.filter(s => s.kind === 'move').length,
      stop: segments.filter(s => s.kind === 'stop').length,
    }),
    [segments],
  );

  const stats = useMemo(() => {
    if (reportData.length === 0) {
      return { distance: 0, maxSpeed: 0, stops: 0, idleMinutes: 0 };
    }

    const odometers = reportData.map(i => i.odometer);
    const idleMinutes = segments.reduce(
      (acc, s) => (s.kind === 'stop' ? acc + (s.minutes ?? 0) : acc),
      0,
    );

    return {
      distance: Math.max(...odometers) - Math.min(...odometers),
      maxSpeed: Math.max(...reportData.map(i => i.speed)),
      stops: counts.stop,
      idleMinutes,
    };
  }, [reportData, segments, counts.stop]);

  const sections = useMemo(() => {
    const visible =
      filter === 'all' ? segments : segments.filter(s => s.kind === filter);

    const byDay = new Map<string, Segment[]>();
    visible.forEach(segment => {
      const list = byDay.get(segment.date);
      if (list) {
        list.push(segment);
      } else {
        byDay.set(segment.date, [segment]);
      }
    });

    return Array.from(byDay, ([date, data]) => ({
      title: formatDayTitle(date),
      date,
      data,
    }));
  }, [segments, filter]);

  const renderDetail = (item: ReportItem) => (
    <View style={bodyStyles.detail}>
      <View style={bodyStyles.detailRow}>
        <Text style={bodyStyles.detailLabel}>Odómetro</Text>
        <Text style={bodyStyles.detailValue}>
          {item.odometer.toFixed(2)} km
        </Text>
      </View>
      <View style={bodyStyles.detailRow}>
        <Text style={bodyStyles.detailLabel}>Coordenadas</Text>
        <Text style={bodyStyles.detailValue}>
          {item.latitude.toFixed(6)}, {item.longitude.toFixed(6)}
        </Text>
      </View>
      <View style={bodyStyles.detailRow}>
        <Text style={bodyStyles.detailLabel}>Registro</Text>
        <Text style={bodyStyles.detailValue}>N° {item.number}</Text>
      </View>
      <TouchableOpacity
        style={bodyStyles.mapButton}
        onPress={() => openStreetView(item)}
        activeOpacity={0.85}
      >
        <Search size={13} color="#fff" />
        <Text style={bodyStyles.mapButtonText}>Ver el lugar en 3D</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSegment = ({ item: segment }: { item: Segment }) => {
    const expanded = expandedKey === segment.key;

    if (segment.kind === 'stop') {
      return (
        <TouchableOpacity
          style={bodyStyles.row}
          onPress={() => toggleExpanded(segment.key)}
          activeOpacity={0.8}
        >
          <View style={bodyStyles.timeCol}>
            <Text style={bodyStyles.time}>{shortTime(segment.start.time)}</Text>
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
                  Detenido {formatDuration(segment.minutes)}
                </Text>
                <Text style={bodyStyles.stopRange}>
                  {shortTime(segment.start.time)} –{' '}
                  {shortTime(segment.end.time)}
                </Text>
              </View>
              <Text style={[bodyStyles.address, bodyStyles.addressMuted]}>
                {segment.start.location}
              </Text>
              <View style={bodyStyles.metaRow}>
                <Text style={bodyStyles.metaText}>
                  {segment.count} registros agrupados
                </Text>
                <ChevronDown
                  size={12}
                  color="#c98a55"
                  style={{
                    transform: [{ rotate: expanded ? '180deg' : '0deg' }],
                  }}
                />
              </View>
            </View>

            {expanded && renderDetail(segment.start)}
          </View>
        </TouchableOpacity>
      );
    }

    const { item } = segment;
    const stopped = item.speed === 0;
    const isMax = stats.maxSpeed > 0 && item.speed === stats.maxSpeed;

    return (
      <TouchableOpacity
        style={bodyStyles.row}
        onPress={() => toggleExpanded(segment.key)}
        activeOpacity={0.8}
      >
        <View style={bodyStyles.timeCol}>
          <Text style={[bodyStyles.time, stopped && bodyStyles.timeMuted]}>
            {shortTime(item.time)}
          </Text>
        </View>

        <View style={bodyStyles.railCol}>
          <View style={bodyStyles.rail} />
          <View
            style={[
              bodyStyles.dot,
              !stopped && bodyStyles.dotMoving,
              isMax && bodyStyles.dotFast,
            ]}
          />
        </View>

        <View style={bodyStyles.content}>
          <Text style={bodyStyles.address} numberOfLines={expanded ? 4 : 2}>
            {item.location}
          </Text>

          <View style={bodyStyles.metaRow}>
            <View
              style={[
                bodyStyles.badge,
                stopped && bodyStyles.badgeIdle,
                isMax && bodyStyles.badgeFast,
              ]}
            >
              <Gauge
                size={10}
                color={stopped ? '#8d97a8' : isMax ? '#e36414' : '#1e3a8a'}
              />
              <Text
                style={[
                  bodyStyles.badgeText,
                  stopped && bodyStyles.badgeTextIdle,
                  isMax && bodyStyles.badgeTextFast,
                ]}
              >
                {stopped ? 'Detenido' : `${item.speed} km/h`}
              </Text>
            </View>
            {isMax && <Text style={bodyStyles.metaText}>máxima del rango</Text>}
          </View>

          {expanded && renderDetail(item)}
        </View>
      </TouchableOpacity>
    );
  };

  const idle = compactDuration(stats.idleMinutes);

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
              <Route size={14} color="#1e3a8a" />
            </View>
            <Text style={bodyStyles.summaryValue}>
              {stats.distance.toFixed(1)}
              <Text style={bodyStyles.summaryUnit}> km</Text>
            </Text>
            <Text style={bodyStyles.summaryLabel}>Recorrido</Text>
          </View>

          <View style={bodyStyles.summaryDivider} />

          <View style={bodyStyles.summaryTile}>
            <View
              style={[
                bodyStyles.summaryIcon,
                { backgroundColor: 'rgba(227,100,20,0.12)' },
              ]}
            >
              <Gauge size={14} color="#e36414" />
            </View>
            <Text style={bodyStyles.summaryValue}>
              {stats.maxSpeed}
              <Text style={bodyStyles.summaryUnit}> km/h</Text>
            </Text>
            <Text style={bodyStyles.summaryLabel}>Vel. máxima</Text>
          </View>

          <View style={bodyStyles.summaryDivider} />

          <View style={bodyStyles.summaryTile}>
            <View
              style={[
                bodyStyles.summaryIcon,
                { backgroundColor: 'rgba(30,58,138,0.10)' },
              ]}
            >
              <ParkingCircle size={14} color="#1e3a8a" />
            </View>
            <Text style={bodyStyles.summaryValue}>{stats.stops}</Text>
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
            <Text style={bodyStyles.summaryLabel}>Detenido</Text>
          </View>
        </View>
      </View>

      <View style={bodyStyles.filterRow}>
        {(
          [
            { key: 'all', label: 'Todo el recorrido' },
            { key: 'move', label: 'En movimiento' },
            { key: 'stop', label: 'Paradas' },
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
            <Text style={styles.headerTitle}>Reporte General</Text>
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
            keyExtractor={segment => segment.key}
            renderItem={renderSegment}
            renderSectionHeader={({ section }) => (
              <View style={bodyStyles.dayHeader}>
                <Text style={bodyStyles.dayTitle}>{section.title}</Text>
                <Text style={bodyStyles.dayCount}>
                  {section.data.length}{' '}
                  {section.data.length === 1 ? 'punto' : 'puntos'}
                </Text>
              </View>
            )}
            ListHeaderComponent={renderListHeader}
            ListEmptyComponent={
              <View style={bodyStyles.filterEmpty}>
                <MapPin size={34} color="#c3cbd8" />
                <Text style={bodyStyles.filterEmptyText}>
                  {filter === 'stop'
                    ? 'La unidad no registró paradas en este rango'
                    : 'No hay puntos en movimiento en este rango'}
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

export default GeneralReport;
