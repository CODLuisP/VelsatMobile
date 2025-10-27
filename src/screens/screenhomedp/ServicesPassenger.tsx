import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import {
  ChevronLeft,
  Users,
  Calendar,
  User,
  CalendarX2,
  Clock,
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
import { useAuthStore } from '../../store/authStore';
import axios from 'axios';

interface ApiService {
  codservicio: string;
  codpedido: string;
  codusuario: string;
  codcliente: string | null;
  unidad: string;
  direccion: string;
  distrito: string;
  wy: string;
  wx: string;
  referencia: string | null;
  fechapasajero: string;
  orden: string;
  empresa: string;
  numero: string;
  codconductor: string;
  destino: string | null;
  fechaservicio: string;
  tipo: string;
  totalpax: string;
}

const ServicesPassenger = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const { user, logout, server, tipo } = useAuthStore();

  const codigo = user?.codigo;

  const [apiServices, setApiServices] = useState<ApiService[]>([]);
  const [loading, setLoading] = useState(true);

  const insets = useSafeAreaInsets();
  const navigationDetection = useNavigationMode();
  const bottomSpace = getBottomSpace(
    insets,
    navigationDetection.hasNavigationBar,
  );

  const fetchServiciosPasajero = async () => {
    try {
      setLoading(true);

      const url = `https://velsat.pe:2087/api/Aplicativo/serviciosPasajero/${codigo}`;

      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.data && Array.isArray(response.data)) {
        setApiServices(response.data);
      } else {
        setApiServices([]);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          if (error.response.data && 
              typeof error.response.data === 'string' && 
              error.response.data.includes('No se encontraron servicios')) {
            setApiServices([]);
          }
        }
      }
      setApiServices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (codigo) {
      fetchServiciosPasajero();
    } else {
      setLoading(false);
    }
  }, [codigo]);

  useFocusEffect(
    React.useCallback(() => {
      NavigationBarColor('#00296b', false);
    }, []),
  );

  const handleGoBack = () => {
    navigation.goBack();
  };

  const getTipoServicio = (tipo: string) => {
    return tipo === 'I' ? 'Entrada' : 'Salida';
  };

  const getFechaFin = (tipo: string, fechaservicio: string) => {
    return tipo === 'S' ? '-' : fechaservicio;
  };

  const getServiceStatus = (fechaservicio: string) => {
    const [fecha, hora] = fechaservicio.split(' ');
    const [dia, mes, año] = fecha.split('/');
    const [horas, minutos] = hora.split(':');

    const fechaServicio = new Date(
      parseInt(año),
      parseInt(mes) - 1,
      parseInt(dia),
      parseInt(horas),
      parseInt(minutos),
    );

    const ahora = new Date();
    const ahoraUTC = ahora.getTime() + ahora.getTimezoneOffset() * 60000;
    const ahoraPeru = new Date(ahoraUTC + 3600000 * -5); 

    const diferenciaMs = fechaServicio.getTime() - ahoraPeru.getTime();
    const diferenciaMinutos = Math.floor(diferenciaMs / (1000 * 60));
    const diferenciaHoras = Math.floor(diferenciaMs / (1000 * 60 * 60));

    if (diferenciaMs < 0) {
      const minutosTranscurridos = Math.abs(diferenciaMinutos);

      if (minutosTranscurridos > 30) {
        return {
          text: 'Finalizado',
          color: '#CF1B1B',
        };
      }

      return {
        text: 'En progreso',
        color: '#4CAF50',
      };
    }

    if (diferenciaMinutos < 60) {
      return {
        text: `Faltan ${diferenciaMinutos} min`,
        color: '#FFA726',
      };
    }

    return {
      text: `Faltan ${diferenciaHoras} hrs`,
      color: '#FFA726',
    };
  };

  const handleNavigateToServicesDetailDriver = (service: ApiService) => {
    navigation.navigate('ServicesDetailPassenger', {
      serviceData: service,
    });
  };

  const topSpace = insets.top + 5;

  return (
    <View style={[styles.container, { paddingBottom: bottomSpace }]}>
      <View style={[styles.header, { paddingTop: topSpace }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <ChevronLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerMainTitle}>Servicios programados</Text>
        </View>
      </View>

      <ScrollView
        style={styles.contentList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View style={styles.formContainer}>
          {loading ? (
            <View style={styles.emptyStateContainer}>
              <ActivityIndicator size="large" color="#e36414" />
              <Text style={styles.emptyStateTitle}>Cargando servicios</Text>
              <Text style={styles.emptyStateSubtitle}>
                Por favor espera un momento
              </Text>
            </View>
          ) : apiServices.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <View style={[styles.iconCircle, styles.iconCircleLarge]}>
                <CalendarX2 size={40} color="#e36414" />
              </View>
              <Text style={styles.emptyStateTitleDark}>
                Sin servicios programados
              </Text>
              <Text style={styles.emptyStateDescription}>
                Aún no hay servicios programados para el día de hoy
              </Text>
            </View>
          ) : (
            apiServices.map(service => (
              <TouchableOpacity
                key={service.codservicio}
                onPress={() => handleNavigateToServicesDetailDriver(service)}
                activeOpacity={0.7}
              >
                <View style={styles.serviceCard}>
                  <View style={styles.serviceHeader}>
                    <View style={styles.serviceHeaderLeft}>
                      <Text style={styles.serviceNumber}>
                        Servicio #{service.numero}
                      </Text>
                      <View style={styles.passengersContainer}>
                        <User size={14} color="#FFFFFF" />
                        <Text style={styles.passengersText}>
                          {service.totalpax} pasajero
                          {parseInt(service.totalpax) > 1 ? 's' : ''}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.serviceHeaderRight}>
                      <Text style={styles.locationText}>{service.empresa}</Text>
                    </View>
                  </View>

                  <View style={styles.serviceBody}>
                    <View style={styles.infoRow}>
                      <View style={styles.leftColumn}>
                        <View style={styles.dateSection}>
                          <View style={styles.dateIconRow}>
                            <User size={16} color="#666" />
                            <Text style={styles.dateLabel}>
                              Inicio servicio
                            </Text>
                          </View>
                          <Text style={styles.dateValue}>
                            {service.fechapasajero || service.fechaservicio}
                          </Text>
                        </View>

                        <View style={styles.groupSection}>
                          <View style={styles.groupRow}>
                            <Users size={16} color="#666" />
                            <Text style={styles.groupLabel}>Tipo y orden</Text>
                          </View>
                          <Text style={styles.groupValue}>
                            {getTipoServicio(service.tipo)} - {service.orden} /{' '}
                            {service.totalpax}
                          </Text>
                        </View>
                      </View>

                      <View
                        style={[styles.rightColumn, { alignItems: 'flex-end' }]}
                      >
                        <View style={styles.dateSection}>
                          <View style={styles.dateIconRow}>
                            <Calendar size={16} color="#666" />
                            <Text style={styles.dateLabel}>Fin servicio</Text>
                          </View>
                          <Text style={styles.dateValue}>
                            {getFechaFin(service.tipo, service.fechaservicio)}
                          </Text>
                        </View>

                        <View style={{ marginTop: 8 }}>
                          <View
                            style={[
                              styles.statusBadge,
                              {
                                backgroundColor: getServiceStatus(
                                  service.fechaservicio,
                                ).color,
                              },
                            ]}
                          >
                            <Text style={styles.statusText}>
                              {getServiceStatus(service.fechaservicio).text}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default ServicesPassenger;