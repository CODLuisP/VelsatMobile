import {
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
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
import { Text } from '../../components/ScaledComponents';

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
  pasajerosDisponibles?: number;
}

const ServicesDriver = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStart, setLoadingStart] = useState<string | null>(null);
  const [loadingEnd, setLoadingEnd] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

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
      NavigationBarColor('#ffffff', true);
    }, []),
  );

  const fetchPasajerosDisponibles = async (
    codservicio: string,
  ): Promise<number> => {
    try {
      const url = `https://do.velsat.pe:2053/api/Aplicativo/PasajerosDisponibles/${codservicio}`;
      const response = await axios.get(url, {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.data && response.data.pasajerosDisponibles !== undefined) {
        return response.data.pasajerosDisponibles;
      }
      return 0;
    } catch (error) {
      console.error(
        `Error al obtener pasajeros disponibles para ${codservicio}:`,
        error,
      );
      return 0;
    }
  };

  const getServiceStatus = (service: Service) => {
    if (service.status === '2') {
      return {
        text: 'En progreso',
        color: '#4CAF50',
      };
    }

    if (service.status === '3') {
      return {
        text: 'Finalizado',
        color: '#f17b7bff',
      };
    }

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

    if (diferenciaMs <= 0) {
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

      fechaFinServicio.setHours(fechaFinServicio.getHours() + 1);

      if (ahoraPeru.getTime() > fechaFinServicio.getTime()) {
        return {
          text: 'Finalizado',
          color: '#f17b7bff',
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

  const getInicioServicio = (service: Service): string => {
    return service.fechapasajero || service.fechaservicio;
  };

  const getFinServicio = (service: Service): string => {
    return service.tipo === 'I' ? service.fechaservicio : '-';
  };

  const getTipoServicio = (tipo: string) => {
    return tipo === 'I' ? 'Entrada' : 'Salida';
  };

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

  const fetchServices = async () => {
    try {
      setIsLoading(true);

      const url = `https://do.velsat.pe:2053/api/Aplicativo/serviciosConductor/${codigo}`;

      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.data && Array.isArray(response.data)) {
        const serviciosConPasajeros = await Promise.all(
          response.data.map(async (srv: Service) => {
            const pasajerosDisponibles = await fetchPasajerosDisponibles(
              srv.codservicio,
            );
            return {
              ...srv,
              pasajerosDisponibles,
            };
          }),
        );

        const serviciosFiltrados = serviciosConPasajeros.filter(srv => {
          const resultado = srv.pasajerosDisponibles! - 1;
          return resultado !== 0;
        });

        setServices(serviciosFiltrados);

        const initialStates: {
          [key: string]: 'idle' | 'started' | 'finished';
        } = {};
        serviciosFiltrados.forEach((srv: Service) => {
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
      setRefreshing(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const onRefresh = useCallback(() => {
    console.log('🔄 Pull-to-refresh activado');
    setRefreshing(true);
    if (codigo) {
      fetchServices();
    } else {
      setRefreshing(false);
    }
  }, [codigo]);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleNavigateToServicesDetailDriver = (service: Service) => {
    navigation.navigate('ServicesDetailDriver', { serviceData: service });
  };

  const handleStartService = async (
    codservicio: string,
    unidad: string,
    codconductor: string,
  ) => {
    try {
      setLoadingStart(codservicio);
      await axios.post(
        `https://do.velsat.pe:2053/api/Aplicativo/ActualizarFechaInicioServicio?codservicio=${codservicio}`,
      );
      await axios.post(
        `https://velsat.pe:2087/api/Aplicativo/ActualizarDeviceServicio?codservicio=${codservicio}&deviceID=${unidad}`,
      );
      await axios.post(
        `https://do.velsat.pe:2053/api/Aplicativo/ActualizarTaxiFinServicio?codtaxi=${codconductor}`,
      );

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
        `https://do.velsat.pe:2053/api/Aplicativo/ActualizarFechaFinServicio?codservicio=${codservicio}`,
      );
      await axios.post(
        `https://velsat.pe:2087/api/Aplicativo/ActualizarDeviceFinServicio?deviceID=${unidad}`,
      );
      await axios.post(
        `https://do.velsat.pe:2053/api/Aplicativo/ActualizarTaxiFinServicio?codtaxi=${codconductor}`,
      );

      setServiceStates(prev => ({ ...prev, [codservicio]: 'finished' }));
    } catch (error) {
    } finally {
      setLoadingEnd(null);
    }
  };

  const actualizarPasajeros = (usuario: string, pasajeros: number): string => {
    let numeroPasajeros =
      typeof pasajeros === 'string' ? parseInt(pasajeros) : pasajeros;

    if (isNaN(numeroPasajeros)) {
      numeroPasajeros = 0;
    }

    let valorARestar;

    switch (usuario.toLowerCase()) {
      case 'movilbus':
        valorARestar = 1;
        break;
      default:
        valorARestar = 0;
    }
    numeroPasajeros = Math.max(0, numeroPasajeros - valorARestar);

    return numeroPasajeros.toString();
  };

  const topSpace = insets.top + 5;

  return (
    <View style={[styles.container, { paddingBottom: bottomSpace }]}>
      <LinearGradient
        colors={['#05194fff', '#05194fff', '#18223dff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.header, { paddingTop: topSpace }]}
      >
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
      </LinearGradient>

      <ScrollView
        style={styles.contentList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#e36414']}
            tintColor="#e36414"
            title="Actualizando servicios..."
            titleColor="#fff"
          />
        }
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
              const isMovilbus =
                service.codusuario.toLowerCase() === 'movilbus';

              return (
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
                            {service.totalpax !== null
                              ? (() => {
                                  const paxActualizado = actualizarPasajeros(
                                    service.codusuario,
                                    service.totalpax,
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
                              {/* Botón Iniciar - solo para usuarios diferentes a movilbus */}
                              {!isMovilbus && (
                                <TouchableOpacity
                                  style={[
                                    styles.actionButton,
                                    serviceStates[service.codservicio] ===
                                    'idle'
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
                                        'idle' &&
                                        styles.actionButtonTextDisabled,
                                    ]}
                                  >
                                    {loadingStart === service.codservicio
                                      ? 'Iniciando...'
                                      : 'Iniciar'}
                                  </Text>
                                </TouchableOpacity>
                              )}

                              {/* Botón Finalizar */}
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
    </View>
  );
};

export default ServicesDriver;
