import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import React from 'react';
import { Battery, Zap, Power, AlertTriangle, ChevronLeft } from 'lucide-react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../../App';
import { styles } from '../../styles/notifications';

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

  const handleGoBack = () => {
    navigation.goBack();
  };

  // Función para manejar el click en una notificación
  const handleNotificationPress = (notification: Notification) => {
    navigation.navigate('MapAlert', {
      notificationData: {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        device: notification.device,
        timestamp: notification.timestamp,
        iconName: getIconName(notification.type)
      }
    });
  };

  // Función para obtener el nombre del icono basado en el tipo
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <ChevronLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerMainTitle}>Notificaciones</Text>
        </View>
        <View style={styles.headerBottom}>
          <Text style={styles.headerTitle}>Eventos de tus unidades</Text>
          <Text style={styles.headerSubtitle}>
            Visualiza el detalle de los eventos de tus unidades, desconexión de batería, apagado de motor, encendido de motor y botón de pánico.
          </Text>
        </View>
      </View>

      <ScrollView style={styles.notificationsList} showsVerticalScrollIndicator={false}>
        {notifications.map((notification) => {
          const IconComponent = notification.icon;
          return (
            <TouchableOpacity
              key={notification.id}
              style={[styles.notificationCard, getNotificationStyle(notification.type)]}
              activeOpacity={0.7}
              onPress={() => handleNotificationPress(notification)}
            >
              <View style={styles.notificationHeader}>
                <View style={styles.iconContainer}>
                  <IconComponent size={24} color="#FF8C42" />
                </View>
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationTitle}>{notification.title}</Text>
                  <Text style={styles.deviceName}>{notification.device}</Text>
                  <Text style={styles.timestamp}>{notification.timestamp}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default Notifications;