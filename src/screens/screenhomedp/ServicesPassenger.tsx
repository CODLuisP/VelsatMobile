import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import React from 'react';
import {
  ChevronLeft,
  Users,
  Calendar,
  User,
} from 'lucide-react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import NavigationBarColor from 'react-native-navigation-bar-color';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../../App';
import {
  getBottomSpace,
  useNavigationMode,
} from '../../hooks/useNavigationMode';
import { styles } from '../../styles/servicesdriver';

interface Service {
  id: number;
  serviceNumber: string;
  passengers: number;
  location: string;
  status: 'en-2-horas' | 'en-progreso' | 'finalizado';
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  groupType: string;
  serviceType: string;
}

const ServicesPassenger = () => {
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

  const services: Service[] = [
    {
      id: 1,
      serviceNumber: '#1',
      passengers: 1,
      location: 'LATAM',
      status: 'en-2-horas',
      startDate: '22/09/2025',
      startTime: '00:00',
      endDate: '',
      endTime: '',
      groupType: 'Tierra',
      serviceType: 'Salida',
    },
    {
      id: 62,
      serviceNumber: '#62',
      passengers: 1,
      location: 'LATAM',
      status: 'en-progreso',
      startDate: '22/09/2025',
      startTime: '02:00',
      endDate: '',
      endTime: '',
      groupType: 'Tierra',
      serviceType: 'Salida',
    },
    {
      id: 17,
      serviceNumber: '#17',
      passengers: 3,
      location: 'LATAM',
      status: 'en-progreso',
      startDate: '22/09/2025',
      startTime: '00:00',
      endDate: '22/09/2025',
      endTime: '03:40',
      groupType: 'Aire',
      serviceType: 'Entrada',
    },
    {
      id: 80,
      serviceNumber: '#80',
      passengers: 2,
      location: 'LATAM',
      status: 'finalizado',
      startDate: '22/09/2025',
      startTime: '02:00',
      endDate: '22/09/2025',
      endTime: '03:40',
      groupType: 'Aire',
      serviceType: 'Entrada',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'en-2-horas':
        return '#FFA726';
      case 'en-progreso':
        return '#4CAF50';
      case 'finalizado':
        return '#4CAF50';
      default:
        return '#718096';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'en-2-horas':
        return 'En 2 horas';
      case 'en-progreso':
        return 'En progreso';
      case 'finalizado':
        return 'Finalizado';
      default:
        return '';
    }
  };

    const handleNavigateToServicesDetailDriver = () => {
    navigation.navigate('ServicesDetailPassenger');
  };


  const topSpace = insets.top + 5;

  return (
    <View style={[styles.container, { paddingBottom: bottomSpace }]}>
      <View style={[styles.header, { paddingTop: topSpace }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <ChevronLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerMainTitle}>Servicios pasajeros</Text>
        </View>
      </View>

      <ScrollView
        style={styles.contentList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View style={styles.formContainer}>
          {services.map((service) => (
            <TouchableOpacity
              key={service.id}
              onPress={ handleNavigateToServicesDetailDriver}
              activeOpacity={0.7}
            >
              <View style={styles.serviceCard}>
                {/* Header del servicio */}
                <View style={styles.serviceHeader}>
                  <View style={styles.serviceHeaderLeft}>
                    <Text style={styles.serviceNumber}>Servicio {service.serviceNumber}</Text>
                    <View style={styles.passengersContainer}>
                      <User size={14} color="#FFFFFF" />
                      <Text style={styles.passengersText}>
                        {service.passengers} pasajero{service.passengers > 1 ? 's' : ''}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.serviceHeaderRight}>
                    <Text style={styles.locationText}>{service.location}</Text>
                  </View>
                </View>

                {/* Body del servicio */}
                <View style={styles.serviceBody}>
                  <View style={styles.infoRow}>
                    <View style={styles.leftColumn}>
                      <View style={styles.dateSection}>
                        <View style={styles.dateIconRow}>
                          <User size={16} color="#666" />
                          <Text style={styles.dateLabel}>Inicio servicio</Text>
                        </View>
                        <Text style={styles.dateValue}>
                          {service.startDate} {service.startTime}
                        </Text>
                      </View>

                      <View style={styles.groupSection}>
                        <View style={styles.groupRow}>
                          <Users size={16} color="#666" />
                          <Text style={styles.groupLabel}>Tipo y orden</Text>
                        </View>
                        <Text style={styles.groupValue}>
                          {service.serviceType} - {service.groupType}
                        </Text>
                      </View>
                    </View>

                    <View style={[styles.rightColumn, { alignItems: 'flex-end' }]}>
                      <View style={styles.dateSection}>
                        <View style={styles.dateIconRow}>
                          <Calendar size={16} color="#666" />
                          <Text style={styles.dateLabel}>Fin servicio</Text>
                        </View>
                        <Text style={styles.dateValue}>
                          {service.endDate ? `${service.endDate} ${service.endTime}` : '-'}
                        </Text>
                      </View>

                      <View style={{ marginTop: 8 }}>
                        <View
                          style={[
                            styles.statusBadge,
                            { backgroundColor: getStatusColor(service.status) },
                          ]}
                        >
                          <Text style={styles.statusText}>
                            {getStatusText(service.status)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default ServicesPassenger;