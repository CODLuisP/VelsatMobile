import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import { 
  ChevronLeft, 
  Battery, 
  Zap, 
  Power, 
  AlertTriangle,
  MapPin,
  Clock,
  Smartphone
} from 'lucide-react-native';
import MapView, { Marker } from 'react-native-maps';
import { NavigationProp, useNavigation, RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../../App';
import { styles } from '../../styles/mapalert';

// Interfaz para los parámetros de la ruta
interface MapAlertRouteParams {
  notificationData: {
    id: number;
    type: string;
    title: string;
    device: string;
    timestamp: string;
    iconName: string;
  };
}

const MapAlert = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<{ params: MapAlertRouteParams }, 'params'>>();
  
  // Obtener los datos de la notificación desde los parámetros de navegación
  const notificationData = route.params?.notificationData;

  // Coordenadas de ejemplo (deberías obtenerlas de tus datos)
  const latitude = -12.0464;
  const longitude = -77.0428;

  const handleGoBack = () => {
    navigation.goBack();
  };

  // Función para obtener el icono correcto basado en el tipo
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Battery':
        return Battery;
      case 'Zap':
        return Zap;
      case 'Power':
        return Power;
      case 'AlertTriangle':
        return AlertTriangle;
      default:
        return AlertTriangle;
    }
  };

  // Función para obtener el color basado en el tipo
  const getAlertColor = (type: string) => {
    switch (type) {
      case 'battery':
        return '#fb8500'; // Amarillo para batería
      case 'motor':
        return '#10b981'; // Verde para encendido
      case 'motor-off':
        return '#6b7280'; // Gris para apagado
      case 'panic':
        return '#ef4444'; // Rojo para pánico
      default:
        return '#6b7280';
    }
  };

  const IconComponent = notificationData ? getIcon(notificationData.iconName) : AlertTriangle;
  const alertColor = notificationData ? getAlertColor(notificationData.type) : '#6b7280';

  if (!notificationData) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <ChevronLeft size={26} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalle de Alerta</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No se encontraron datos de la alerta</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <ChevronLeft size={26} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalle de Alerta</Text>
        </View>
        
        {/* Información de la alerta en el header */}
        <View style={styles.headerAlertInfo}>
          <View style={styles.headerAlertRow}>
            <View style={[styles.headerIconContainer, { backgroundColor: alertColor }]}>
              <IconComponent size={20} color="#fff" />
            </View>
            <View style={styles.headerAlertDetails}>
              <Text style={styles.headerAlertTitle}>{notificationData.title}</Text>
              <Text style={styles.headerAlertSubtitle}>
                {notificationData.device} • ID: {notificationData.id}
              </Text>
            <Text style={styles.headerAlertTimestamp}>{notificationData.timestamp}</Text>

            </View>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        {/* Map Container */}
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: latitude,
              longitude: longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            showsUserLocation={true}
            showsMyLocationButton={true}
          >
            <Marker
              coordinate={{
                latitude: latitude,
                longitude: longitude,
              }}
              title={notificationData?.title || 'Alerta'}
              description={`${notificationData?.device || 'Dispositivo'} - ${notificationData?.timestamp || ''}`}
              pinColor={alertColor}
            />
          </MapView>
        </View>
      </View>
    </View>
  );
};

export default MapAlert;