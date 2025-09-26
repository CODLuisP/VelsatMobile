import React, { useState } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from 'react-native';
import {
  ChevronLeft,
  MapPin,
  Clock,
  Gauge,
  Navigation,
  Globe,
  Calendar,
} from 'lucide-react-native';
import {
  NavigationProp,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import { styles } from '../../../styles/generalreport';
import { RootStackParamList } from '../../../../App';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  getBottomSpace,
  useNavigationMode,
} from '../../../hooks/useNavigationMode';
import NavigationBarColor from 'react-native-navigation-bar-color';

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

const GeneralReport = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

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

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleReportItemPress = (item: ReportItem) => {
    console.log('Clicked on report item:', item);
  };

  const [reportData] = useState<ReportItem[]>([
    {
      id: '1',
      number: 1,
      date: '18/09/2025',
      time: '02:25',
      speed: 75,
      odometer: 37449.58,
      location: 'Panamericana Norte, Reque, Chiclayo, Lambayeque, Perú',
      latitude: -6.8986,
      longitude: -79.78812,
    },
    {
      id: '2',
      number: 2,
      date: '18/09/2025',
      time: '02:25',
      speed: 25,
      odometer: 37449.58,
      location: 'Panamericana Norte, Reque, Chiclayo, Lambayeque, Perú',
      latitude: -6.8986,
      longitude: -79.78812,
    },
    {
      id: '3',
      number: 3,
      date: '18/09/2025',
      time: '02:25',
      speed: 5,
      odometer: 37449.58,
      location: 'Panamericana Norte, Reque, Chiclayo, Lambayeque, Perú',
      latitude: -6.8986,
      longitude: -79.78812,
    },
    {
      id: '4',
      number: 4,
      date: '18/09/2025',
      time: '02:25',
      speed: 75,
      odometer: 37449.58,
      location: 'Panamericana Norte, Reque, Chiclayo, Lambayeque, Perú',
      latitude: -6.8986,
      longitude: -79.78812,
    },
    {
      id: '5',
      number: 5,
      date: '18/09/2025',
      time: '02:25',
      speed: 75,
      odometer: 37449.58,
      location: 'Panamericana Norte, Reque, Chiclayo, Lambayeque, Perú',
      latitude: -6.8986,
      longitude: -79.78812,
    },
    {
      id: '6',
      number: 6,
      date: '18/09/2025',
      time: '02:25',
      speed: 75,
      odometer: 37449.58,
      location: 'Panamericana Norte, Reque, Chiclayo, Lambayeque, Perú',
      latitude: -6.8986,
      longitude: -79.78812,
    },
  ]);

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

              {/* Sección derecha - Odómetro y coordenadas */}
              <View style={styles.rightSection}>
                <View style={styles.odometerContainer}>
                  <Navigation size={14} color="#666" />
                  <Text style={styles.sectionLabel}>Odómetro</Text>
                </View>
                <Text style={styles.odometerText}>
                  {item.odometer.toFixed(2)} km
                </Text>

                <View style={styles.coordinatesContainer}>
                  <Globe size={14} color="#666" />
                  <Text style={styles.sectionLabel}>Latitud y Longitud</Text>
                </View>
                <Text style={styles.coordinatesText}>
                  {item.latitude}, {item.longitude}
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

  return (
    <View style={[styles.container, { paddingBottom: bottomSpace }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <ChevronLeft size={26} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Reporte General</Text>
            <Text style={styles.headerSubtitle}>Unidad M2L-777</Text>
            <View style={styles.headerDateContainer}>
              <Calendar size={16} color="#fff" />
              <Text style={styles.headerDate}>
                18/09/2025 00:00 - 18/09/2025 23:59
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Lista de reportes */}
      <FlatList
        data={reportData}
        keyExtractor={item => item.id}
        renderItem={({ item, index }) => renderReportItem({ item, index })}
        style={styles.reportsList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.reportsListContent}
      />
    </View>
  );
};

export default GeneralReport;
