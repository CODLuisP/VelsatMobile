import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  TouchableOpacity,
  SectionList,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {
  ChevronLeft,
  Calendar,
  AlertCircle,
  FileX,
  Route,
  Car,
  Target,
  CircleSlash,
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
import { bodyStyles } from '../../../styles/reportbody';
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
import { Text } from '../../../components/ScaledComponents';

interface VehicleReport {
  id: string;
  itemNumber: number;
  unitName: string;
  mileage: number;
}

type SortKey = 'mileage' | 'name';

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
  const [sortBy, setSortBy] = useState<SortKey>('mileage');

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

      const response = await axios.get(url);

      if (
        response.data &&
        response.data.listaKilometros &&
        Array.isArray(response.data.listaKilometros)
      ) {
        const transformedData: VehicleReport[] =
          response.data.listaKilometros.map((item: any) => ({
            id: item.item.toString(),
            itemNumber: item.item,
            unitName: item.deviceId,
            mileage: parseFloat(item.kilometros.toFixed(2)),
          }));

        setVehicleData(transformedData);
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

  const stats = useMemo(() => {
    if (vehicleData.length === 0) {
      return { total: 0, units: 0, average: 0, idle: 0, max: 0 };
    }

    const total = vehicleData.reduce((sum, v) => sum + v.mileage, 0);

    return {
      total,
      units: vehicleData.length,
      average: total / vehicleData.length,
      idle: vehicleData.filter(v => v.mileage <= 0).length,
      max: Math.max(...vehicleData.map(v => v.mileage)),
    };
  }, [vehicleData]);

  const ranked = useMemo(() => {
    const copy = [...vehicleData];
    return sortBy === 'mileage'
      ? copy.sort((a, b) => b.mileage - a.mileage)
      : copy.sort((a, b) => a.unitName.localeCompare(b.unitName));
  }, [vehicleData, sortBy]);

  // Una sola sección para que "Detalle por unidad" quede fijo al hacer scroll.
  const sections = useMemo(
    () => [{ title: 'Detalle por unidad', data: ranked }],
    [ranked],
  );

  const renderVehicleItem = ({
    item,
    index,
  }: {
    item: VehicleReport;
    index: number;
  }) => {
    const idle = item.mileage <= 0;
    const isTop = sortBy === 'mileage' && index === 0 && !idle;
    const share = stats.max > 0 ? (item.mileage / stats.max) * 100 : 0;

    return (
      <View style={bodyStyles.rankRow}>
        <View style={[bodyStyles.rankBadge, isTop && bodyStyles.rankBadgeTop]}>
          <Text
            style={[
              bodyStyles.rankBadgeText,
              isTop && bodyStyles.rankBadgeTextTop,
            ]}
          >
            {sortBy === 'mileage' ? index + 1 : item.itemNumber}
          </Text>
        </View>

        <View style={bodyStyles.rankBody}>
          <View style={bodyStyles.rankTopRow}>
            <Text style={bodyStyles.rankName} numberOfLines={1}>
              {item.unitName}
            </Text>
            <Text
              style={[bodyStyles.rankValue, idle && bodyStyles.rankValueIdle]}
            >
              {item.mileage}
              <Text style={bodyStyles.rankUnit}> km</Text>
            </Text>
          </View>

          <View style={bodyStyles.rankBar}>
            <View
              style={[
                bodyStyles.rankBarFill,
                isTop && bodyStyles.rankBarFillTop,
                { width: `${Math.max(share, 0)}%` },
              ]}
            />
          </View>

          {idle && (
            <Text style={bodyStyles.rankIdleTag}>
              No registró movimiento en el rango
            </Text>
          )}
        </View>
      </View>
    );
  };

  // Una sola unidad: no hay con qué comparar, así que el dato va grande y se
  // acompaña del promedio diario, que sí da contexto al número.
  const renderSingleUnit = () => {
    const days = Math.max(
      1,
      Math.round(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
      ),
    );
    const perDay = stats.total / days;

    return (
      <View style={bodyStyles.heroCard}>
        <View style={bodyStyles.heroImageWrap}>
          <Image
            source={require('../../../../assets/Car.jpg')}
            style={bodyStyles.heroImage}
            resizeMode="contain"
          />
        </View>

        <View style={bodyStyles.heroBody}>
          <Text style={bodyStyles.heroValue}>
            {stats.total.toFixed(2)}
            <Text style={bodyStyles.heroUnit}> km</Text>
          </Text>
          <Text style={bodyStyles.heroLabel}>
            Distancia recorrida en el rango
          </Text>

          <View style={bodyStyles.heroFooter}>
            <View style={bodyStyles.heroFooterTile}>
              <Text style={bodyStyles.heroFooterValue}>
                {perDay.toFixed(1)}
                <Text style={bodyStyles.heroFooterUnit}> km</Text>
              </Text>
              <Text style={bodyStyles.heroFooterLabel}>Promedio por día</Text>
            </View>

            <View style={bodyStyles.heroFooterDivider} />

            <View style={bodyStyles.heroFooterTile}>
              <Text style={bodyStyles.heroFooterValue}>{days}</Text>
              <Text style={bodyStyles.heroFooterLabel}>
                {days === 1 ? 'Día del rango' : 'Días del rango'}
              </Text>
            </View>
          </View>
        </View>
      </View>
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
              <Route size={14} color="#e36414" />
            </View>
            <Text style={bodyStyles.summaryValue}>
              {stats.total.toFixed(0)}
              <Text style={bodyStyles.summaryUnit}> km</Text>
            </Text>
            <Text style={bodyStyles.summaryLabel}>Total de la flota</Text>
          </View>

          <View style={bodyStyles.summaryDivider} />

          <View style={bodyStyles.summaryTile}>
            <View
              style={[
                bodyStyles.summaryIcon,
                { backgroundColor: 'rgba(30,58,138,0.10)' },
              ]}
            >
              <Car size={14} color="#1e3a8a" />
            </View>
            <Text style={bodyStyles.summaryValue}>{stats.units}</Text>
            <Text style={bodyStyles.summaryLabel}>Unidades</Text>
          </View>

          <View style={bodyStyles.summaryDivider} />

          <View style={bodyStyles.summaryTile}>
            <View
              style={[
                bodyStyles.summaryIcon,
                { backgroundColor: 'rgba(30,58,138,0.10)' },
              ]}
            >
              <Target size={14} color="#1e3a8a" />
            </View>
            <Text style={bodyStyles.summaryValue}>
              {stats.average.toFixed(0)}
              <Text style={bodyStyles.summaryUnit}> km</Text>
            </Text>
            <Text style={bodyStyles.summaryLabel}>Promedio</Text>
          </View>

          <View style={bodyStyles.summaryDivider} />

          <View style={bodyStyles.summaryTile}>
            <View
              style={[
                bodyStyles.summaryIcon,
                { backgroundColor: 'rgba(227,100,20,0.12)' },
              ]}
            >
              <CircleSlash size={14} color="#e36414" />
            </View>
            <Text style={bodyStyles.summaryValue}>{stats.idle}</Text>
            <Text style={bodyStyles.summaryLabel}>Sin movimiento</Text>
          </View>
        </View>
      </View>

      <View style={bodyStyles.filterRow}>
        {(
          [
            { key: 'mileage', label: 'Mayor recorrido' },
            { key: 'name', label: 'Por unidad' },
          ] as { key: SortKey; label: string }[]
        ).map(option => {
          const active = sortBy === option.key;
          return (
            <TouchableOpacity
              key={option.key}
              style={[bodyStyles.chip, active && bodyStyles.chipActive]}
              onPress={() => setSortBy(option.key)}
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
      <View style={[styles.header, { paddingTop: topSpace }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              onPress={handleGoBack}
              style={styles.backButton}
              activeOpacity={0.7}
            >
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
        ) : !isAllUnits ? (
          renderSingleUnit()
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={item => item.id}
            renderItem={renderVehicleItem}
            renderSectionHeader={({ section }) => (
              <View style={bodyStyles.dayHeader}>
                <Text style={bodyStyles.dayTitle}>{section.title}</Text>
                <Text style={bodyStyles.dayCount}>
                  {stats.units} {stats.units === 1 ? 'unidad' : 'unidades'}
                </Text>
              </View>
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={bodyStyles.listContent}
            ListHeaderComponent={renderListHeader}
            stickySectionHeadersEnabled
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

export default MileageReport;
