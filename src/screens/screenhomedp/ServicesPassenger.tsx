import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { ChevronLeft, Users, Calendar, User } from 'lucide-react-native';
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

// Interface para los datos de la API
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

  // Estado para almacenar los servicios de la API
  const [apiServices, setApiServices] = useState<ApiService[]>([]);
  const [loading, setLoading] = useState(true);

  const insets = useSafeAreaInsets();
  const navigationDetection = useNavigationMode();
  const bottomSpace = getBottomSpace(
    insets,
    navigationDetection.hasNavigationBar,
  );

// Función para obtener los servicios desde la API
const fetchServiciosPasajero = async () => {
  try {
    setLoading(true);    
    const url = `https://velsat.pe:2087/api/Aplicativo/serviciosPasajero/${codigo}`;
    
    const response = await fetch(url);

    // Primero obtener el texto de la respuesta
    const text = await response.text();
    
    // Verificar si es un mensaje de "no hay servicios"
    if (text.includes('No se encontraron servicios')) {
      setApiServices([]);
      return;
    }
    
    // Intentar parsear el JSON
    try {
      const data = JSON.parse(text);      
      // Guardar los datos en el estado
      setApiServices(data);
      
    } catch (parseError) {
      setApiServices([]);
    }
    
  } catch (error) {
    console.error('❌ Error al obtener servicios:', error);
    setApiServices([]);
  } finally {
    setLoading(false);
  }
};

  // Ejecutar la petición cuando se monte el componente
  useEffect(() => {
    if (codigo) {
      fetchServiciosPasajero();
    } else {
      setLoading(false);
    }
  }, [codigo]);

  useFocusEffect(
    React.useCallback(() => {
      NavigationBarColor('#1e3a8a', false);
    }, []),
  );

  const handleGoBack = () => {
    navigation.goBack();
  };

  // Función para obtener el tipo de servicio
  const getTipoServicio = (tipo: string) => {
    return tipo === 'I' ? 'Entrada' : 'Salida';
  };

  // Función para obtener la fecha de fin
  const getFechaFin = (tipo: string, fechaservicio: string) => {
    return tipo === 'S' ? '-' : fechaservicio;
  };

  // Función para calcular el estado del servicio basado en la fecha
  const getServiceStatus = (fechaservicio: string) => {
    // Parsear la fecha del servicio (formato: "14/10/2025 23:00")
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

    // Obtener la hora actual de Perú (UTC-5)
    const ahora = new Date();
    const ahoraUTC = ahora.getTime() + ahora.getTimezoneOffset() * 60000;
    const ahoraPeru = new Date(ahoraUTC + 3600000 * -5); // UTC-5 para Perú

    const diferenciaMs = fechaServicio.getTime() - ahoraPeru.getTime();
    const diferenciaMinutos = Math.floor(diferenciaMs / (1000 * 60));
    const diferenciaHoras = Math.floor(diferenciaMs / (1000 * 60 * 60));

    // Si ya pasó la hora del servicio
    if (diferenciaMs < 0) {
      const minutosTranscurridos = Math.abs(diferenciaMinutos);

      // Si pasaron más de 30 minutos desde el inicio
      if (minutosTranscurridos > 30) {
        return {
          text: 'Finalizado',
          color: '#CF1B1B',
        };
      }

      // Si pasaron menos de 30 minutos desde el inicio
      return {
        text: 'En progreso',
        color: '#4CAF50',
      };
    }

    // Si falta menos de 1 hora, mostrar en minutos
    if (diferenciaMinutos < 60) {
      return {
        text: `Faltan ${diferenciaMinutos} min`,
        color: '#FFA726',
      };
    }

    // Si falta más de 1 hora, mostrar en horas
    return {
      text: `Faltan ${diferenciaHoras} hrs`,
      color: '#FFA726',
    };
  };

  const handleNavigateToServicesDetailDriver = (service: ApiService) => {
  navigation.navigate('ServicesDetailPassenger', {
    serviceData: service
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
          <Text style={styles.headerMainTitle}>Servicios pasajeros</Text>
        </View>
      </View>

      <ScrollView
        style={styles.contentList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View style={styles.formContainer}>
          {loading ? (
            <Text style={{ color: '#fff', textAlign: 'center', marginTop: 20 }}>
              Cargando servicios...
            </Text>
          ) : apiServices.length === 0 ? (
            <Text style={{ color: '#000', textAlign: 'center', marginTop: 20 }}>
              Aún no hay servicios programados para el día de hoy
            </Text>
          ) : (
            apiServices.map(service => (
              <TouchableOpacity
                key={service.codservicio}
                onPress={() => handleNavigateToServicesDetailDriver(service)} // Pasar el servicio
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
                          {service.totalpax} pasajero
                          {parseInt(service.totalpax) > 1 ? 's' : ''}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.serviceHeaderRight}>
                      <Text style={styles.locationText}>{service.empresa}</Text>
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
                            {service.fechapasajero}
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
