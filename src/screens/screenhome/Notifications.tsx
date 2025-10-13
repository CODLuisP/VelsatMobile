import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import React, { useEffect, useState } from 'react';
import {
  Battery,
  Zap,
  Power,
  AlertTriangle,
  ChevronLeft,
  Bell,
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
const apiClient = axios.create({
  baseURL: 'https://velsat.pe:2087/api/Aplicativo',
  timeout: 15000, // 15 segundos
  headers: {
    'Content-Type': 'application/json',
  },
});

const Notifications = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user, logout, server, tipo } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [displayedNotifications, setDisplayedNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  
  const ITEMS_PER_PAGE = 50; // Mostrar 50 notificaciones por página

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

  // Función para cargar más notificaciones
  const loadMoreNotifications = () => {
    const startIndex = currentPage * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const moreNotifications = notifications.slice(startIndex, endIndex);
    
    if (moreNotifications.length > 0) {
      setDisplayedNotifications(prev => [...prev, ...moreNotifications]);
      setCurrentPage(prev => prev + 1);
    }
  };

  // Función para cargar las notificaciones desde la API
  const fetchNotifications = async (isRefreshing = false) => {
    const startTime = Date.now();
    console.log('Iniciando petición...');
    
    try {
      if (!isRefreshing) {
        setLoading(true);
      }
      setError('');
      
      const response = await apiClient.get<ApiNotification[]>(
        `/notifications/${user?.username}`
      );

      const endTime = Date.now();
      console.log(`Petición completada en ${endTime - startTime}ms`);
      console.log('Total de registros recibidos:', response.data.length);

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

      // Guardar todos los datos
      setNotifications(transformedNotifications);
      
      // Mostrar solo los primeros 50
      setDisplayedNotifications(transformedNotifications.slice(0, ITEMS_PER_PAGE));
      setCurrentPage(1);
      
      console.log(`Mostrando ${ITEMS_PER_PAGE} de ${transformedNotifications.length} notificaciones`);
    } catch (err: any) {
      const endTime = Date.now();
      console.error('Error al cargar notificaciones:', err);
      console.log(`Error después de ${endTime - startTime}ms`);
      
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
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Función para refrescar
  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications(true);
  };

  // Cargar notificaciones al montar el componente
  useEffect(() => {
    if (user?.username) {
      fetchNotifications();
    }
  }, [user]);

  // Detectar cuando llega al final del scroll
  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20;
    
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
      // Si no está cargando más y hay más datos disponibles
      if (!loadingMore && displayedNotifications.length < notifications.length) {
        setLoadingMore(true);
        setTimeout(() => {
          loadMoreNotifications();
          setLoadingMore(false);
        }, 500);
      }
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleNotificationPress = (notification: Notification) => {
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

  const topSpace = insets.top + 5;

  return (
    <LinearGradient
      colors={['#00296b', '#1e3a8a', '#00296b']}
      style={[styles.container, { paddingBottom: bottomSpace }]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <View style={[styles.header, { paddingTop: topSpace }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
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
          {notifications.length > 0 && !loading && (
            <Text style={styles.counterText}>
              Mostrando {displayedNotifications.length} de {notifications.length} notificaciones
            </Text>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.notificationsList}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={400}
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
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity 
                style={styles.retryButton} 
                onPress={() => fetchNotifications()}
              >
                <Text style={styles.retryButtonText}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          ) : notifications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Bell size={48} color="#fff" style={{ opacity: 0.5 }} />
              <Text style={styles.emptyText}>No hay notificaciones</Text>
            </View>
          ) : (
            <>
              {displayedNotifications.map(notification => {
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
              
              {loadingMore && (
                <View style={styles.loadingMoreContainer}>
                  <ActivityIndicator size="small" color="#FF8C42" />
                  <Text style={styles.loadingMoreText}>Cargando más...</Text>
                </View>
              )}
              
              {displayedNotifications.length >= notifications.length && notifications.length > ITEMS_PER_PAGE && (
                <View style={styles.endContainer}>
                  <Text style={styles.endText}>No hay más notificaciones</Text>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default Notifications;