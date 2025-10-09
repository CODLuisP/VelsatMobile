import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import React from 'react';
import {
  Battery,
  Zap,
  Power,
  AlertTriangle,
  ChevronLeft,
} from 'lucide-react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../../App';
import { styles } from '../../styles/notifications';

import NavigationBarColor from 'react-native-navigation-bar-color';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  getBottomSpace,
  useNavigationMode,
} from '../../hooks/useNavigationMode';
import LinearGradient from 'react-native-linear-gradient';

// Interfaz para el tipo de notificación
interface Notification {
  id: number;
  type: string;
  title: string;
  device: string;
  timestamp: string;
  icon: any;
}

const Notifications = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

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

  const notifications = [
    {
      id: 1,
      type: 'battery',
      title: 'Desconexión de batería',
      device: 'M2L-777',
      timestamp: '11/09/2025 23:35:58',
      icon: Battery,
    },
    {
      id: 2,
      type: 'motor',
      title: 'Encendido de motor',
      device: 'M2L-777',
      timestamp: '11/09/2025 23:35:58',
      icon: Zap,
    },
    {
      id: 3,
      type: 'motor-off',
      title: 'Apagado de motor',
      device: 'M2L-777',
      timestamp: '11/09/2025 23:35:58',
      icon: Power,
    },
    {
      id: 4,
      type: 'panic',
      title: 'Botón de pánico',
      device: 'M2L-777',
      timestamp: '11/09/2025 23:35:58',
      icon: AlertTriangle,
    },

    {
      id: 5,
      type: 'panic',
      title: 'Botón de pánico',
      device: 'M2L-777',
      timestamp: '11/09/2025 23:35:58',
      icon: AlertTriangle,
    },

    {
      id: 6,
      type: 'panic',
      title: 'Botón de pánico',
      device: 'M2L-777',
      timestamp: '11/09/2025 23:35:58',
      icon: AlertTriangle,
    },

    {
      id: 7,
      type: 'panic',
      title: 'Botón de pánico',
      device: 'M2L-777',
      timestamp: '11/09/2025 23:35:58',
      icon: AlertTriangle,
    },
    {
      id: 8,
      type: 'panic',
      title: 'Botón de pánico luis',
      device: 'M2L-777',
      timestamp: '11/09/2025 23:35:58',
      icon: AlertTriangle,
    },
  ];

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
            Visualiza el detalle de los eventos de tus unidades, desconexión de
            batería, apagado de motor, encendido de motor y botón de pánico.
          </Text>
        </View>
      </View>
      <ScrollView
        style={styles.notificationsList}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formContainer}>
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
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default Notifications;
