import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  Users,
  Calendar,
  User,
  CalendarX2,
  ChevronRight,
  Eye,
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
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import LinearGradient from 'react-native-linear-gradient';

interface Service {
  codservicio: string;
  fechapasajero: string | null;
  empresa: string;
  numero: string;
  estado: string;
  codconductor: string;
  destino: string;
  fechaservicio: string;
  status: string;
  tipo: string;
  grupo: string;
  totalpax: number | null;
  unidad: string;
  codusuario: string;
}

const ServicesDriver = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStart, setLoadingStart] = useState<string | null>(null);
  const [loadingEnd, setLoadingEnd] = useState<string | null>(null);

  const { user, logout, server, tipo } = useAuthStore();
  const codigo = user?.codigo;
  const [serviceStates, setServiceStates] = useState<{
    [key: string]: 'idle' | 'started' | 'finished';
  }>({});
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

  const getServiceStatus = (service: Service) => {
    const fechaInicio = service.fechapasajero || service.fechaservicio;
    const [fecha, hora] = fechaInicio.split(' ');
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

    // Si ya pasó la hora de inicio
    if (diferenciaMs <= 0) {
      // Calcular fecha de fin (fechaservicio + 30 minutos)
      const [fechaFin, horaFin] = service.fechaservicio.split(' ');
      const [diaFin, mesFin, añoFin] = fechaFin.split('/');
      const [horasFin, minutosFin] = horaFin.split(':');

      const fechaFinServicio = new Date(
        parseInt(añoFin),
        parseInt(mesFin) - 1,
        parseInt(diaFin),
        parseInt(horasFin),
        parseInt(minutosFin),
      );

      // Agregar 30 minutos a fechaservicio
      fechaFinServicio.setMinutes(fechaFinServicio.getMinutes() + 30);

      // Si ya pasó fechaservicio + 30 min, está finalizado
      if (ahoraPeru.getTime() > fechaFinServicio.getTime()) {
        return {
          text: 'Finalizado',
          color: '#f17b7bff',
        };
      }

      // Si está entre fechapasajero y fechaservicio + 30 min, está en progreso
      return {
        text: 'En progreso',
        color: '#4CAF50',
      };
    }

    // Si falta menos de 60 minutos
    if (diferenciaMinutos < 60) {
      return {
        text: `Faltan ${diferenciaMinutos} min`,
        color: '#FFA726',
      };
    }

    // Si faltan más de 60 minutos
    return {
      text: `Faltan ${diferenciaHoras} hrs`,
      color: '#FFA726',
    };
  };

  // Función para obtener inicio de servicio
  const getInicioServicio = (service: Service): string => {
    // Si fechapasajero es null o vacío, usar fechaservicio
    return service.fechapasajero || service.fechaservicio;
  };

  // Función para obtener fin de servicio
  const getFinServicio = (service: Service): string => {
    // Si tipo es "I" (Entrada), mostrar fechaservicio, sino mostrar "-"
    return service.tipo === 'I' ? service.fechaservicio : '-';
  };

  // Función para mapear tipo de servicio
  const getTipoServicio = (tipo: string) => {
    return tipo === 'I' ? 'Entrada' : 'Salida';
  };

  // Función para mapear grupo
  const getGrupo = (grupo: string) => {
    switch (grupo) {
      case 'N':
        return '-';
      case 'T':
        return 'Tierra';
      case 'A':
        return 'Aire';
      default:
        return grupo;
    }
  };

  // Función para obtener los servicios de la API
  const fetchServices = async () => {
    try {
      setIsLoading(true);

      const url = `https://velsat.pe:2087/api/Aplicativo/serviciosConductor/${codigo}`;

      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.data && Array.isArray(response.data)) {
        setServices(response.data);

        // Inicializar estado de botones según el status
        const initialStates: {
          [key: string]: 'idle' | 'started' | 'finished';
        } = {};
        response.data.forEach((srv: Service) => {
          if (srv.status === '3') initialStates[srv.codservicio] = 'finished';
          else if (srv.status === '2')
            initialStates[srv.codservicio] = 'started';
          else initialStates[srv.codservicio] = 'idle';
        });
        setServiceStates(initialStates);
      } else {
        setServices([]);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          if (
            error.response.data &&
            typeof error.response.data === 'string' &&
            error.response.data.includes('No se encontraron servicios')
          ) {
            setServices([]);
          }
        }
      }
      setServices([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar servicios al montar el componente
  useEffect(() => {
    fetchServices();
  }, []);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleNavigateToServicesDetailDriver = (service: Service) => {
    // Pasar todos los datos del servicio a la siguiente vista
    navigation.navigate('ServicesDetailDriver', { serviceData: service });
  };

  const delay = (ms: number) =>
    new Promise(resolve => setTimeout(() => resolve(undefined), ms));

  const handleStartService = async (
    codservicio: string,
    unidad: string,
    codconductor: string,
  ) => {
    try {
      setLoadingStart(codservicio);
      await axios.post(
        `https://velsat.pe:2087/api/Aplicativo/ActualizarFechaInicioServicio?codservicio=${codservicio}`,
      );
      await axios.post(
        `https://velsat.pe:2087/api/Aplicativo/ActualizarDeviceServicio?codservicio=${codservicio}&deviceID=${unidad}`,
      );
      await axios.post(
        `https://velsat.pe:2087/api/Aplicativo/ActualizarTaxiFinServicio?codtaxi=${codconductor}`,
      );

      // Cambiar estado local
      setServiceStates(prev => ({ ...prev, [codservicio]: 'started' }));
    } catch (error) {
    } finally {
      setLoadingStart(null);
    }
  };

  const handleEndService = async (
    codservicio: string,
    unidad: string,
    codconductor: string,
  ) => {
    try {
      setLoadingEnd(codservicio);
      await axios.post(
        `https://velsat.pe:2087/api/Aplicativo/ActualizarFechaFinServicio?codservicio=${codservicio}`,
      );
      await axios.post(
        `https://velsat.pe:2087/api/Aplicativo/ActualizarDeviceFinServicio?deviceID=${unidad}`,
      );
      await axios.post(
        `https://velsat.pe:2087/api/Aplicativo/ActualizarTaxiFinServicio?codtaxi=${codconductor}`,
      );

      // Cambiar estado local
      setServiceStates(prev => ({ ...prev, [codservicio]: 'finished' }));
    } catch (error) {
    } finally {
      setLoadingEnd(null);
    }
  };

  const actualizarPasajeros = (usuario: string, pasajeros: number): string => {
    // Convertir a número si viene como string
    let numeroPasajeros =
      typeof pasajeros === 'string' ? parseInt(pasajeros) : pasajeros;

    // Validar que sea un número válido
    if (isNaN(numeroPasajeros)) {
      numeroPasajeros = 0;
    }

    // Definir el valor a restar según el tipo de usuario
    let valorARestar;

    switch (usuario.toLowerCase()) {
      case 'movilbus':
        valorARestar = 1;
        break;
      default:
        valorARestar = 0; // No resta nada por defecto
    }

    // Restar y asegurar que no sea negativo
    numeroPasajeros = Math.max(0, numeroPasajeros - valorARestar);

    // Retornar como string
    return numeroPasajeros.toString();
  };

  const topSpace = insets.top + 5;

  return (
    <LinearGradient
      colors={['#021e4bff', '#183890ff', '#032660ff']}
      style={[styles.container, { paddingBottom: bottomSpace - 2 }]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <View style={[styles.header, { paddingTop: topSpace }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={handleGoBack}
            style={styles.backButton}
            activeOpacity={0.7}
          >
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
          {isLoading ? (
            <View style={styles.emptyStateContainer}>
              <ActivityIndicator size="large" color="#e36414" />
              <Text style={styles.emptyStateTitle}>Cargando servicios</Text>
              <Text style={styles.emptyStateSubtitle}>
                Por favor espera un momento
              </Text>
            </View>
          ) : services.length === 0 ? (
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
            services.map(service => {
              const inicioServicio = getInicioServicio(service);
              const finServicio = getFinServicio(service);
              const status = getServiceStatus(service);

              return (
                <TouchableOpacity
                  key={service.codservicio}
                  onPress={() => handleNavigateToServicesDetailDriver(service)}
                  activeOpacity={0.7}
                >
                  <View style={styles.serviceCard}>
                    {/* Header del servicio */}
                    <View style={styles.serviceHeader}>
                      <View style={styles.serviceHeaderLeft}>
                        <Text style={styles.serviceNumber}>
                          Servicio #{service.numero}
                        </Text>
                        <View style={styles.passengersContainer}>
                          <User size={14} color="#FFFFFF" />
                          <Text style={styles.passengersText}>
                            {service.totalpax !== null
                              ? (() => {
                                  const paxActualizado = actualizarPasajeros(
                                    service.codusuario,
                                    service.totalpax
                                  );
                                  const numPax = parseInt(paxActualizado);
                                  return `${paxActualizado} pasajero${
                                    numPax > 1 ? 's' : ''
                                  }`;
                                })()
                              : 'No especificado'}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.serviceHeaderRight}>
                        <Text style={styles.locationText}>
                          {service.empresa}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: status.color },
                        ]}
                      >
                        <Text style={styles.statusText}>{status.text}</Text>
                      </View>
                    </View>

                    {/* Body del servicio */}
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
                              {inicioServicio}
                            </Text>
                          </View>

                          <View style={styles.groupSection}>
                            <View style={styles.groupRow}>
                              <Users size={16} color="#666" />
                              <Text style={styles.groupLabel}>
                                Grupo y tipo
                              </Text>
                            </View>
                            <Text style={styles.groupValue}>
                              {getGrupo(service.grupo)} -{' '}
                              {getTipoServicio(service.tipo)}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.rightColumn}>
                          <View style={styles.dateSection}>
                            <View style={styles.dateIconRow}>
                              <Calendar size={16} color="#666" />
                              <Text style={styles.dateLabel}>Fin servicio</Text>
                            </View>
                            <Text style={styles.dateValue}>{finServicio}</Text>
                          </View>

                          {serviceStates[service.codservicio] !==
                            'finished' && (
                            <View style={styles.actionButtons}>
                              <TouchableOpacity
                                style={[
                                  styles.actionButton,
                                  serviceStates[service.codservicio] === 'idle'
                                    ? styles.actionButtonActive
                                    : styles.actionButtonDisabled,
                                ]}
                                onPress={() =>
                                  handleStartService(
                                    service.codservicio,
                                    service.unidad,
                                    service.codconductor,
                                  )
                                }
                                disabled={
                                  serviceStates[service.codservicio] !==
                                    'idle' ||
                                  loadingStart === service.codservicio
                                }
                              >
                                <Text
                                  style={[
                                    styles.actionButtonText,
                                    serviceStates[service.codservicio] !==
                                      'idle' && styles.actionButtonTextDisabled,
                                  ]}
                                >
                                  {loadingStart === service.codservicio
                                    ? 'Iniciando...'
                                    : 'Iniciar'}
                                </Text>
                              </TouchableOpacity>

                              <TouchableOpacity
                                style={[
                                  styles.actionButton,
                                  serviceStates[service.codservicio] ===
                                  'started'
                                    ? styles.actionButtonEnd
                                    : styles.actionButtonDisabled,
                                ]}
                                onPress={() =>
                                  handleEndService(
                                    service.codservicio,
                                    service.unidad,
                                    service.codconductor,
                                  )
                                }
                                disabled={
                                  serviceStates[service.codservicio] !==
                                    'started' ||
                                  loadingEnd === service.codservicio
                                }
                              >
                                <Text
                                  style={[
                                    styles.actionButtonText,
                                    serviceStates[service.codservicio] !==
                                      'started' &&
                                      styles.actionButtonTextDisabled,
                                  ]}
                                >
                                  {loadingEnd === service.codservicio
                                    ? 'Finalizando...'
                                    : 'Finalizar'}
                                </Text>
                              </TouchableOpacity>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.clickPrompt}
                      onPress={() =>
                        handleNavigateToServicesDetailDriver(service)
                      }
                      activeOpacity={0.7}
                    >
                      <Eye size={16} color="#032660ff" />
                      <Text style={styles.clickPromptText}>
                        Ver detalles completos
                      </Text>
                      <ChevronRight size={16} color="#032660ff" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default ServicesDriver;
