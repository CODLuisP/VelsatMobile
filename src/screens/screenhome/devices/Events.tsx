import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import {
  Battery,
  Zap,
  Power,
  AlertTriangle,
  ChevronLeft,
  WifiOff,
  ServerCrash,
} from 'lucide-react-native';
import {
  NavigationProp,
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { RootStackParamList } from '../../../../App';
import { styles } from '../../../styles/notifications';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  getBottomSpace,
  useNavigationMode,
} from '../../../hooks/useNavigationMode';
import NavigationBarColor from 'react-native-navigation-bar-color';
import { useAuthStore } from '../../../store/authStore';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';

// Interfaz para el tipo de evento de la API
interface EventAPI {
  accountID: string;
  deviceID: string;
  timestamp: number;
  statusCode: number;
  latitude: number;
  longitude: number;
  speedKPH: number;
}

// Interfaz para el evento procesado
interface Event {
  id: number;
  type: string;
  title: string;
  device: string;
  timestamp: string;
  icon: any;
  apiData: EventAPI;
}

type EventsRouteProp = RouteProp<RootStackParamList, 'Events'>;

const Events = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<EventsRouteProp>();

  const { deviceName } = route.params;
  const { user, logout, server, tipo } = useAuthStore();
  const username = user?.username;

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const insets = useSafeAreaInsets();
  const navigationDetection = useNavigationMode();
  const bottomSpace = getBottomSpace(
    insets,
    navigationDetection.hasNavigationBar,
  );

  useFocusEffect(
    React.useCallback(() => {
      NavigationBarColor('#00296b', false);
    }, []),
  );

  const formatUnixTimestamp = (unixTimestamp: number): string => {
    const date = new Date(unixTimestamp * 1000);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };

  const getEventTitle = (statusCode: number): string => {
    switch (statusCode) {
      case 62477:
        return 'Apagado de motor';
      case 62476:
        return 'Encendido de motor';
      case 63553:
        return 'Botón de pánico';
      case 64787:
        return 'Falla de energía';
      default:
        return 'Evento desconocido';
    }
  };

  const getEventType = (statusCode: number): string => {
    switch (statusCode) {
      case 62477:
        return 'motor-off';
      case 62476:
        return 'motor';
      case 63553:
        return 'panic';
      case 64787:
        return 'battery';
      default:
        return 'default';
    }
  };

  const getEventIcon = (statusCode: number): any => {
    switch (statusCode) {
      case 62477:
        return Power;
      case 62476:
        return Zap;
      case 63553:
        return AlertTriangle;
      case 64787:
        return Battery;
      default:
        return Battery;
    }
  };

  const getIconName = (type: string): string => {
    switch (type) {
      case 'battery':
        return 'Battery';
      case 'motor':
        return 'Zap';
      case 'motor-off':
        return 'Power';
      case 'panic':
        return 'AlertTriangle';
      default:
        return 'Bell';
    }
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get<EventAPI[]>(
        `${server}/api/Aplicativo/notifications/${username}/${deviceName}`,
      );

      const data = response.data;

      const transformedEvents: Event[] = data.map((apiEvent, index) => ({
        id: index + 1,
        type: getEventType(apiEvent.statusCode),
        title: getEventTitle(apiEvent.statusCode),
        device: apiEvent.deviceID,
        timestamp: formatUnixTimestamp(apiEvent.timestamp),
        icon: getEventIcon(apiEvent.statusCode),
        apiData: apiEvent,
      }));

      setEvents(transformedEvents);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Error al cargar los eventos');
      } else {
        setError('Error desconocido');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (username && deviceName) {
      fetchEvents();
    }
  }, [username, deviceName]);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleEventPress = (event: Event) => {
    navigation.navigate('MapEvent', {
      notificationData: {
        id: event.id,
        type: event.type,
        title: event.title,
        device: event.device,
        timestamp: event.timestamp,
        iconName: getIconName(event.type),
        accountID: event.apiData.accountID,
        deviceID: event.apiData.deviceID,
        unixTimestamp: event.apiData.timestamp,
        statusCode: event.apiData.statusCode,
        latitude: event.apiData.latitude,
        longitude: event.apiData.longitude,
        speedKPH: event.apiData.speedKPH,
      },
    });
  };

  const getEventStyle = (type: string) => {
    switch (type) {
      case 'battery':
        return styles.batteryNotification;
      case 'motor':
        return styles.motorNotification;
      case 'motor-off':
        return styles.motorOffNotification;
      case 'panic':
        return styles.panicNotification;
      default:
        return styles.defaultNotification;
    }
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
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <ChevronLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerMainTitle}>
            Alertas de la unidad: {deviceName}
          </Text>
        </View>
        <View style={styles.headerBottom}>
          <Text style={styles.headerTitle}>Alertas de tus unidades</Text>
          <Text style={styles.headerSubtitle}>
            Visualiza el detalle de las alertas de tus unidades, desconexión de
            batería, apagado de motor, encendido de motor y botón de pánico.
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.notificationsList}
        showsVerticalScrollIndicator={false}
        
      >
        <View style={styles.formContainer}>
          {loading ? (
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                paddingVertical: 60,
              }}
            >
              <ActivityIndicator size="large" color="#FF8C42" />
              <Text style={{ color: '#fff', marginTop: 16, fontSize: 16 }}>
                Cargando eventos...
              </Text>
            </View>
          ) : error ? (
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                paddingVertical: 60,
                paddingHorizontal: 40,
              }}
            >
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 5,
                }}
              >
                <ServerCrash size={40} color="#ef4444" />
              </View>
              <Text
                style={{
                  color: '#585959ff',
                  fontSize: 14,
                  fontWeight: '600',
                  textAlign: 'center',
                  marginBottom: 0,
                }}
              >
                Error al cargar eventos
              </Text>
              <Text
                style={{
                  color: '#94a3b8',
                  fontSize: 14,
                  textAlign: 'center',
                  lineHeight: 20,
                }}
              >
                No se pudieron obtener los eventos de esta unidad.
              </Text>
            </View>
          ) : events.length === 0 ? (
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                paddingVertical: 60,
                paddingHorizontal: 40,
              }}
            >
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: 'rgba(148, 163, 184, 0.1)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 20,
                }}
              >
                <AlertTriangle size={40} color="#94a3b8" />
              </View>
              <Text
                style={{
                  color: '#f1f5f9',
                  fontSize: 18,
                  fontWeight: '600',
                  textAlign: 'center',
                  marginBottom: 8,
                }}
              >
                No hay eventos disponibles
              </Text>
              <Text
                style={{
                  color: '#94a3b8',
                  fontSize: 14,
                  textAlign: 'center',
                  lineHeight: 20,
                }}
              >
                Esta unidad no tiene eventos registrados en el sistema
              </Text>
            </View>
          ) : (
            events.map(event => {
              const IconComponent = event.icon;
              return (
                <TouchableOpacity
                  key={event.id}
                  style={[styles.notificationCard, getEventStyle(event.type)]}
                  activeOpacity={0.7}
                  onPress={() => handleEventPress(event)}
                >
                  <View style={styles.notificationHeader}>
                    <View style={styles.iconContainer}>
                      <IconComponent size={24} color="#e0681dff" />
                    </View>
                    <View style={styles.notificationContent}>
                      <Text style={styles.notificationTitle}>
                        {event.title}
                      </Text>
                      <Text style={styles.deviceName}>{event.device}</Text>
                      <Text style={styles.timestamp}>{event.timestamp}</Text>
                    </View>
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

export default Events;
