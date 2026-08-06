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
  TrendingUp,
  Activity,
  CalendarDays,
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
import { formatDayTitle, shortTime } from '../../../utils/reportUtils';
import { useAuthStore } from '../../../store/authStore';
import LinearGradient from 'react-native-linear-gradient';
import { Text } from '../../../components/ScaledComponents';

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

/**
 * El API ya devuelve solo los registros por encima del límite, así que cada
 * ping es un exceso. Solo se agrupan los pings del mismo minuto exacto: son el
 * mismo instante reportado varias veces, no un tramo. Cualquier hueco mayor se
 * muestra como un exceso aparte.
 */
type Episode = {
  key: string;
  date: string;
  items: ReportItem[];
  start: ReportItem;
  peak: ReportItem;
};

type Filter = 'all' | 'over10' | 'over20';

const SpeedReport = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'SpeedReport'>>();
  const { unit, startDate, endDate, speed } = route.params;

  const limit = Number(speed) || 0;

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

  const episodes = useMemo<Episode[]>(() => {
    const result: Episode[] = [];
    let current: ReportItem[] = [];

    const close = () => {
      if (current.length === 0) return;

      const start = current[0];

      result.push({
        key: `ep-${start.id}`,
        date: start.date,
        items: current,
        start,
        peak: current.reduce((a, b) => (b.speed > a.speed ? b : a)),
      });
      current = [];
    };

    reportData.forEach(item => {
      const previous = current[current.length - 1];

      if (
        previous &&
        previous.date === item.date &&
        shortTime(previous.time) === shortTime(item.time)
      ) {
        current.push(item);
      } else {
        close();
        current = [item];
      }
    });
    close();

    return result;
  }, [reportData]);

  const counts = useMemo(
    () => ({
      all: episodes.length,
      over10: episodes.filter(e => e.peak.speed - limit >= 10).length,
      over20: episodes.filter(e => e.peak.speed - limit >= 20).length,
    }),
    [episodes, limit],
  );

  const stats = useMemo(() => {
    if (reportData.length === 0) {
      return { episodes: 0, max: 0, average: 0, days: 0 };
    }

    const speeds = reportData.map(i => i.speed);

    return {
      episodes: episodes.length,
      max: Math.max(...speeds),
      average: speeds.reduce((acc, s) => acc + s, 0) / speeds.length,
      days: new Set(episodes.map(e => e.date)).size,
    };
  }, [reportData, episodes]);

  const sections = useMemo(() => {
    const threshold = filter === 'over10' ? 10 : filter === 'over20' ? 20 : 0;
    const visible =
      threshold === 0
        ? episodes
        : episodes.filter(e => e.peak.speed - limit >= threshold);

    const byDay = new Map<string, Episode[]>();
    visible.forEach(episode => {
      const list = byDay.get(episode.date);
      if (list) {
        list.push(episode);
      } else {
        byDay.set(episode.date, [episode]);
      }
    });

    return Array.from(byDay, ([date, data]) => ({
      title: formatDayTitle(date),
      date,
      data,
    }));
  }, [episodes, filter, limit]);

  const renderEpisode = ({ item: episode }: { item: Episode }) => {
    const expanded = expandedKey === episode.key;
    const isPeak = stats.max > 0 && episode.peak.speed === stats.max;
    const over = episode.peak.speed - limit;
    const grouped = episode.items.length > 1;
    const episodeAverage =
      episode.items.reduce((acc, i) => acc + i.speed, 0) / episode.items.length;

    return (
      <TouchableOpacity
        style={bodyStyles.row}
        onPress={() => toggleExpanded(episode.key)}
        activeOpacity={0.8}
      >
        <View style={bodyStyles.timeCol}>
          <Text style={bodyStyles.time}>{shortTime(episode.start.time)}</Text>
        </View>

        <View style={bodyStyles.railCol}>
          <View style={bodyStyles.rail} />
          <View style={[bodyStyles.dot, bodyStyles.dotStop]}>
            <Gauge size={12} color="#fff" />
          </View>
        </View>

        <View style={bodyStyles.content}>
          <View style={bodyStyles.stopCard}>
            <View style={bodyStyles.stopTitleRow}>
              <Text style={bodyStyles.excessSpeed}>
                {episode.peak.speed}
                <Text style={bodyStyles.excessUnit}> km/h</Text>
              </Text>
              {/* Solo si aporta segundos: si no, repetiría la hora de la izquierda */}
              {episode.peak.time !== shortTime(episode.peak.time) && (
                <Text style={bodyStyles.stopRange}>{episode.peak.time}</Text>
              )}
            </View>

            <Text style={[bodyStyles.address, bodyStyles.addressMuted]}>
              {episode.peak.location}
            </Text>

            <View style={bodyStyles.metaRow}>
              {limit > 0 && (
                <View style={[bodyStyles.badge, bodyStyles.badgeFast]}>
                  <TrendingUp size={10} color="#e36414" />
                  <Text
                    style={[bodyStyles.badgeText, bodyStyles.badgeTextFast]}
                  >
                    +{over} sobre el límite
                  </Text>
                </View>
              )}
              {isPeak && (
                <Text style={bodyStyles.metaText}>máxima del rango</Text>
              )}
              {grouped && (
                <Text style={bodyStyles.metaText}>
                  {episode.items.length} registros del mismo minuto
                </Text>
              )}
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
                <Text style={bodyStyles.detailLabel}>Fecha y hora</Text>
                <Text style={bodyStyles.detailValue}>
                  {episode.peak.date} {episode.peak.time}
                </Text>
              </View>
              {grouped && (
                <View style={bodyStyles.detailRow}>
                  <Text style={bodyStyles.detailLabel}>
                    Promedio del minuto
                  </Text>
                  <Text style={bodyStyles.detailValue}>
                    {episodeAverage.toFixed(1)} km/h
                  </Text>
                </View>
              )}
              <View style={bodyStyles.detailRow}>
                <Text style={bodyStyles.detailLabel}>Registro</Text>
                <Text style={bodyStyles.detailValue}>
                  N° {episode.peak.number}
                </Text>
              </View>
              <View style={bodyStyles.detailRow}>
                <Text style={bodyStyles.detailLabel}>Coordenadas</Text>
                <Text style={bodyStyles.detailValue}>
                  {episode.peak.latitude.toFixed(6)},{' '}
                  {episode.peak.longitude.toFixed(6)}
                </Text>
              </View>
              <TouchableOpacity
                style={bodyStyles.mapButton}
                onPress={() => openStreetView(episode.peak)}
                activeOpacity={0.85}
              >
                <Search size={13} color="#fff" />
                <Text style={bodyStyles.mapButtonText}>Ver el lugar en 3D</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderListHeader = () => (
    <>
      <View style={bodyStyles.summaryWrap}>
        <View style={bodyStyles.summaryCard}>
          <View style={bodyStyles.summaryTile}>
            <View
              style={[
                bodyStyles.summaryIcon,
                { backgroundColor: 'rgba(227,100,20,0.12)' },
              ]}
            >
              <TrendingUp size={14} color="#e36414" />
            </View>
            <Text style={bodyStyles.summaryValue}>{stats.episodes}</Text>
            <Text style={bodyStyles.summaryLabel}>Excesos</Text>
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
              {stats.max}
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
              <Activity size={14} color="#1e3a8a" />
            </View>
            <Text style={bodyStyles.summaryValue}>
              {stats.average.toFixed(0)}
              <Text style={bodyStyles.summaryUnit}> km/h</Text>
            </Text>
            <Text style={bodyStyles.summaryLabel}>Promedio</Text>
          </View>

          <View style={bodyStyles.summaryDivider} />

          <View style={bodyStyles.summaryTile}>
            <View
              style={[
                bodyStyles.summaryIcon,
                { backgroundColor: 'rgba(30,58,138,0.10)' },
              ]}
            >
              <CalendarDays size={14} color="#1e3a8a" />
            </View>
            <Text style={bodyStyles.summaryValue}>{stats.days}</Text>
            <Text style={bodyStyles.summaryLabel}>
              {stats.days === 1 ? 'Día con excesos' : 'Días con excesos'}
            </Text>
          </View>
        </View>

        {limit > 0 && (
          <Text style={bodyStyles.limitNote}>
            Registros por encima de {limit} km/h ·{' '}
            {reportData.length === stats.episodes
              ? `${stats.episodes} ${
                  stats.episodes === 1 ? 'exceso' : 'excesos'
                }`
              : `${reportData.length} puntos en ${stats.episodes} ${
                  stats.episodes === 1 ? 'exceso' : 'excesos'
                }`}
          </Text>
        )}
      </View>

      <View style={bodyStyles.filterRow}>
        {(
          [
            { key: 'all', label: 'Todos' },
            { key: 'over10', label: '+10 km/h' },
            { key: 'over20', label: '+20 km/h' },
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
            keyExtractor={episode => episode.key}
            renderItem={renderEpisode}
            renderSectionHeader={({ section }) => (
              <View style={bodyStyles.dayHeader}>
                <Text style={bodyStyles.dayTitle}>{section.title}</Text>
                <Text style={bodyStyles.dayCount}>
                  {section.data.length}{' '}
                  {section.data.length === 1 ? 'exceso' : 'excesos'}
                </Text>
              </View>
            )}
            ListHeaderComponent={renderListHeader}
            ListEmptyComponent={
              <View style={bodyStyles.filterEmpty}>
                <MapPin size={34} color="#c3cbd8" />
                <Text style={bodyStyles.filterEmptyText}>
                  {filter === 'over20'
                    ? 'Ningún exceso superó el límite por 20 km/h'
                    : 'Ningún exceso superó el límite por 10 km/h'}
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

export default SpeedReport;
