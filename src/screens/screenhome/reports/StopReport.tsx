import React, { useState } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import {
  ChevronLeft,
  MapPin,
  Clock,
  Timer,
  Globe,
  Calendar,
} from 'lucide-react-native';
import { NavigationProp, useFocusEffect, useNavigation } from '@react-navigation/native';
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
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  totalTime: string;
  location: string;
  latitude: number;
  longitude: number;
}

const StopReport = () => {
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
      startDate: '18/09/2025',
      startTime: '00:00',
      endDate: '18/09/2025',
      endTime: '01:34',
      totalTime: '01H:34M:23S',
      location: 'Panamericana Norte, Reque, Chiclayo, Lambayeque, Perú',
      latitude: -6.8986,
      longitude: -79.78812,
    },
    {
      id: '2',
      number: 2,
      startDate: '18/09/2025',
      startTime: '00:00',
      endDate: '18/09/2025',
      endTime: '01:34',
      totalTime: '01H:34M:23S',
      location: 'Panamericana Norte, Reque, Chiclayo, Lambayeque, Perú',
      latitude: -6.8986,
      longitude: -79.78812,
    },
    {
      id: '3',
      number: 3,
      startDate: '18/09/2025',
      startTime: '02:15',
      endDate: '18/09/2025',
      endTime: '03:45',
      totalTime: '01H:30M:15S',
      location: 'Panamericana Norte, Reque, Chiclayo, Lambayeque, Perú',
      latitude: -6.8986,
      longitude: -79.78812,
    },
    {
      id: '4',
      number: 4,
      startDate: '18/09/2025',
      startTime: '04:20',
      endDate: '18/09/2025',
      endTime: '05:10',
      totalTime: '00H:50M:12S',
      location: 'Panamericana Norte, Reque, Chiclayo, Lambayeque, Perú',
      latitude: -6.8986,
      longitude: -79.78812,
    },
    {
      id: '5',
      number: 5,
      startDate: '18/09/2025',
      startTime: '06:30',
      endDate: '18/09/2025',
      endTime: '07:25',
      totalTime: '00H:55M:30S',
      location: 'Panamericana Norte, Reque, Chiclayo, Lambayeque, Perú',
      latitude: -6.8986,
      longitude: -79.78812,
    },
    {
      id: '6',
      number: 6,
      startDate: '18/09/2025',
      startTime: '08:15',
      endDate: '18/09/2025',
      endTime: '09:40',
      totalTime: '01H:25M:45S',
      location: 'Panamericana Norte, Reque, Chiclayo, Lambayeque, Perú',
      latitude: -6.8986,
      longitude: -79.78812,
    },
  ]);

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
              {/* Sección izquierda - Fecha y hora de inicio */}
              <View style={styles.leftSection}>
                <View style={styles.dateTimeContainer}>
                  <Clock size={14} color="#666" />
                  <Text style={styles.sectionLabel}>
                    Fecha y hora de inicio
                  </Text>
                </View>
                <Text style={styles.dateTimeText}>
                  {item.startDate} {item.startTime}
                </Text>

                <View style={styles.speedContainer}>
                  <Clock size={14} color="#666" />
                  <Text style={styles.sectionLabel}>Fecha y hora final</Text>
                </View>
                <Text style={styles.speedText}>
                  {item.endDate} {item.endTime}
                </Text>
              </View>

              {/* Sección derecha - Tiempo total y coordenadas */}
              <View style={styles.rightSection}>
                <View style={styles.odometerContainer}>
                  <Timer size={14} color="#666" />
                  <Text style={styles.sectionLabel}>Tiempo Total</Text>
                </View>
                <Text style={styles.odometerText}>{item.totalTime}</Text>

                <View style={styles.coordinatesContainer}>
                  <Globe size={14} color="#666" />
                  <Text style={styles.sectionLabel}>Latitud y Longitud</Text>
                </View>
                <Text style={styles.coordinatesText}>
                  {item.latitude}, {item.longitude}
                </Text>
              </View>
            </View>

      
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
    <View style={[styles.container, { paddingBottom: bottomSpace }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topSpace }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <ChevronLeft size={26} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Reporte Paradas</Text>
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

export default StopReport;
