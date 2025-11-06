import { View, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, BackHandler, Platform } from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import {
  Battery,
  Zap,
  Power,
  AlertTriangle,
  ChevronLeft,
  Bell,
  AlertCircle,
} from 'lucide-react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../../App';
import { styles } from '../../styles/notifications';
import axios from 'axios';

import NavigationBarColor from 'react-native-navigation-bar-color';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  getBottomSpace,
  useNavigationMode,
} from '../../hooks/useNavigationMode';
import LinearGradient from 'react-native-linear-gradient';
import { useAuthStore } from '../../store/authStore';
import { Text } from '../../components/ScaledComponents';

interface Notification {
  id: number;
  type: string;
  title: string;
  device: string;
  timestamp: string;
  icon: any;
  speed: number;
  latitude: number;
  longitude: number;
  statusCode: number;
}

interface ApiNotification {
  accountID: string;
  deviceID: string;
  timestamp: number;
  fecha: string;
  statusCode: number;
  latitude: number;
  longitude: number;
  speedKPH: number;
}

// Configurar axios con timeout más corto


const Notifications = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user, logout, server, tipo } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string>('');


  const apiClient = axios.create({
    baseURL: `${server}/api/Aplicativo`,
    timeout: 15000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Refs para controlar el estado del componente
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

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

  // Cleanup cuando el componente se desmonta
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;

      // Cancelar cualquier petición pendiente
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }

      // Limpiar estados
      setLoading(false);
      setRefreshing(false);
    };
  }, []);

  // Listener para el botón de hardware back (Android)
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      handleGoBack();
      return true; // Prevenir el comportamiento por defecto
    });

    return () => backHandler.remove();
  }, []);

  // Función para obtener el tipo de notificación según el statusCode
  const getNotificationType = (statusCode: number): string => {
    switch (statusCode) {
      case 62477:
        return 'motor-off'; // Motor apagado
      case 62476:
        return 'motor'; // Motor encendido
      case 63553:
        return 'panic'; // Botón pánico
      case 64787:
        return 'battery'; // Falla de energía
      default:
        return 'default';
    }
  };

  // Función para obtener el título según el statusCode
  const getNotificationTitle = (statusCode: number): string => {
    switch (statusCode) {
      case 62477:
        return 'Motor apagado';
      case 62476:
        return 'Motor encendido';
      case 63553:
        return 'Botón de pánico';
      case 64787:
        return 'Falla de energía';
      default:
        return 'Notificación';
    }
  };

  // Función para obtener el icono según el tipo
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'battery':
        return Battery;
      case 'motor':
        return Zap;
      case 'motor-off':
        return Power;
      case 'panic':
        return AlertTriangle;
      default:
        return Bell;
    }
  };

  // Función para cargar las notificaciones desde la API
  const fetchNotifications = async (isRefreshing = false) => {
    // Verificar ANTES de comenzar
    if (!isMountedRef.current) {
      return;
    }

    const startTime = Date.now();

    // Cancelar petición anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Crear nuevo AbortController
    abortControllerRef.current = new AbortController();

    try {
      // Verificar antes de actualizar estado
      if (!isMountedRef.current) return;

      if (!isRefreshing) {
        setLoading(true);
      }
      setError('');

      const response = await apiClient.get<ApiNotification[]>(
        `/notifications/${user?.username}`,
        { signal: abortControllerRef.current.signal }
      );

      // Verificar INMEDIATAMENTE después de la respuesta
      if (!isMountedRef.current) {
        return;
      }

      const endTime = Date.now();
      // Transformar TODOS los datos
      const transformedNotifications: Notification[] = response.data.map((item, index) => {
        const type = getNotificationType(item.statusCode);
        return {
          id: index + 1,
          type: type,
          title: getNotificationTitle(item.statusCode),
          device: item.deviceID,
          timestamp: item.fecha,
          icon: getNotificationIcon(type),
          speed: item.speedKPH,
          latitude: item.latitude,
          longitude: item.longitude,
          statusCode: item.statusCode,
        };
      });

      // Verificar una vez más antes de actualizar
      if (!isMountedRef.current) {
        return;
      }

      setNotifications(transformedNotifications);

    } catch (err: any) {
      // Si la petición fue cancelada, no hacer nada
      if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
        return;
      }

      if (!isMountedRef.current) return;

      const endTime = Date.now();

      if (err.code === 'ECONNABORTED') {
        setError('La petición tardó demasiado. Verifica tu conexión.');
      } else if (err.response) {
        setError(`Error del servidor: ${err.response.status}`);
      } else if (err.request) {
        setError('No se pudo conectar al servidor. Verifica tu conexión.');
      } else {
        setError('Error al cargar las notificaciones');
      }
    } finally {
      // Verificar antes del finally
      if (isMountedRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  };

  // Función para refrescar
  const onRefresh = () => {
    if (!isMountedRef.current) return;
    setRefreshing(true);
    fetchNotifications(true);
  };

  // Cargar notificaciones al montar el componente
  useEffect(() => {
    if (user?.username && isMountedRef.current) {
      fetchNotifications();
    }
  }, [user]);

  const handleGoBack = () => {
    // Marcar como desmontado PRIMERO
    isMountedRef.current = false;

    // Cancelar operaciones pendientes
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // Limpiar estados antes de navegar
    setLoading(false);
    setRefreshing(false);

    // Navegar después de la limpieza
    navigation.goBack();
  };

  const handleNotificationPress = (notification: Notification) => {
    if (!isMountedRef.current) return;

    navigation.navigate('MapAlert', {
      notificationData: {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        device: notification.device,
        timestamp: notification.timestamp,
        iconName: getIconName(notification.type),
        speed: notification.speed,
        latitude: notification.latitude,
        longitude: notification.longitude,
        statusCode: notification.statusCode,
      },
    });
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

  const getNotificationStyle = (type: string) => {
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

const topSpace = Platform.OS === 'ios' ? insets.top -5 : insets.top + 5;

  return (
    <LinearGradient
      colors={['#021e4bff', '#183890ff', '#032660ff']}
      style={[styles.container, { paddingBottom: bottomSpace - 2 }]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <View style={[styles.header, { paddingTop: topSpace }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton} activeOpacity={0.7}>
            <ChevronLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerMainTitle}>Notificaciones</Text>
        </View>
        <View style={styles.headerBottom}>
          <Text style={styles.headerTitle}>Eventos de tus unidades</Text>
          <Text style={styles.headerSubtitle}>
            Visualiza el detalle de los eventos de tus unidades, falla de energía,
            motor apagado, motor encendido y botón de pánico.
          </Text>


          <View style={styles.counterContainer}>
            <View style={styles.counterTextContainer}>
              <Text style={styles.counterText}>
                Total de notificaciones:
                <Text style={styles.counterNumber}> {notifications.length}</Text>
              </Text>
            </View>
          </View>


        </View>
      </View>

      <ScrollView
        style={styles.notificationsList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FF8C42']}
            tintColor="#FF8C42"
          />
        }
      >
        <View style={styles.formContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF8C42" />
              <Text style={styles.loadingText}>Cargando notificaciones...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <AlertCircle size={60} color="#FFB74D" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : notifications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Bell size={48} color="#fff" style={{ opacity: 0.5 }} />
              <Text style={styles.emptyText}>No hay notificaciones</Text>
            </View>
          ) : (
            <>
              {notifications.map(notification => {
                const IconComponent = notification.icon;
                return (
                  <TouchableOpacity
                    key={notification.id}
                    style={[
                      styles.notificationCard,
                      getNotificationStyle(notification.type),
                    ]}
                    activeOpacity={0.7}
                    onPress={() => handleNotificationPress(notification)}
                  >
                    <View style={styles.notificationHeader}>
                      <View style={styles.iconContainer}>
                        <IconComponent size={24} color="#FF8C42" />
                      </View>
                      <View style={styles.notificationContent}>
                        <Text style={styles.notificationTitle}>
                          {notification.title}
                        </Text>
                        <Text style={styles.deviceName}>{notification.device}</Text>
                        <Text style={styles.timestamp}>
                          {notification.timestamp}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default Notifications;