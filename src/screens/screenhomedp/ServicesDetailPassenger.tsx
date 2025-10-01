import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import React from 'react';
import { ChevronLeft, MapPin, Phone, X } from 'lucide-react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import NavigationBarColor from 'react-native-navigation-bar-color';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../../App';
import {
  getBottomSpace,
  useNavigationMode,
} from '../../hooks/useNavigationMode';
import { styles } from '../../styles/servicesdetailpassenger';

const ServicesDetailPassenger = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

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

  const handleGoBack = () => {
    navigation.goBack();
  };

  const topSpace = insets.top + 5;

  return (
    <View style={[styles.container, { paddingBottom: bottomSpace }]}>
      <View style={[styles.header, { paddingTop: topSpace }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <ChevronLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerMainTitle}>Detalles del servicio</Text>
        </View>
      </View>

      <ScrollView
        style={styles.contentList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View style={styles.formContainer}>
          {/* Datos Conductor */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Datos Conductor</Text>
            
            <View style={styles.driverContainer}>
              <View style={styles.driverAvatar}>
                <View style={styles.avatarPlaceholder} />
              </View>
              
              <View style={styles.driverInfo}>
                <Text style={styles.driverLabel}>Conductor</Text>
                <Text style={styles.driverValue}>No asignado</Text>
                
                <Text style={styles.driverLabel}>Teléfono</Text>
                <Text style={styles.driverValue}>-</Text>
                
                <Text style={styles.driverLabel}>DNI</Text>
                <Text style={styles.driverValue}>-</Text>
                
                <Text style={styles.driverLabel}>Calificación</Text>
                <Text style={styles.driverValue}>-</Text>
              </View>
            </View>
          </View>

          {/* Lugar de recojo */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lugar de recojo</Text>
            
            <View style={styles.locationContainer}>
              <View style={styles.locationRow}>
                <View style={styles.locationLeft}>
                  <Text style={styles.locationLabel}>Dirección</Text>
                  <Text style={styles.locationValue}>Urb. Condado Real Lote D-6</Text>
                  
                  <Text style={styles.locationLabel}>Distrito</Text>
                  <Text style={styles.locationValue}>San Juan de Miraflores</Text>
                  
                  <Text style={styles.locationLabel}>Ubicación</Text>
                  <Text style={styles.locationValue}>-</Text>
                  
                  <Text style={styles.locationLabel}>Referencia</Text>
                  <Text style={styles.locationValue}>1 cuadra antes del Wuarique de Chelo - Fonavi II</Text>
                </View>
                
                <View style={styles.locationRight}>
                  <Text style={styles.dateLabel}>Fecha y hora</Text>
                  <Text style={styles.dateValue}>22/09/2025 03:30</Text>
                  
                  <TouchableOpacity style={styles.mapButton}>
                    <MapPin size={20} color="#000" />
                  </TouchableOpacity>
                  <Text style={styles.mapText}>¿Cómo llegar?</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Destino de viaje */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Destino de viaje</Text>
            
            <View style={styles.locationContainer}>
              <View style={styles.locationRow}>
                <View style={styles.locationLeft}>
                  <Text style={styles.locationLabel}>Dirección</Text>
                  <Text style={styles.locationValue}>Avenida Morales Duárez s/n</Text>
                  
                  <Text style={styles.locationLabel}>Distrito</Text>
                  <Text style={styles.locationValue}>Provincia Constitucional del Callao</Text>
                  
                  <Text style={styles.locationLabel}>Ubicación</Text>
                  <Text style={styles.locationValue}>Aeropuerto Internacional Jorge Chávez</Text>
                  
                  <Text style={styles.locationLabel}>Referencia</Text>
                  <Text style={styles.locationValue}>-</Text>
                </View>
                
                <View style={styles.locationRight}>
                  <Text style={styles.dateLabel}>Fecha y hora</Text>
                  <Text style={styles.dateValue}>22/09/2025 04:30</Text>
                  
                  <TouchableOpacity style={styles.mapButton}>
                    <MapPin size={20} color="#000" />
                  </TouchableOpacity>
                  <Text style={styles.mapText}>¿Cómo llegar?</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Detalles de servicio */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Detalles de servicio</Text>
            
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Tipo del servicio</Text>
                <Text style={styles.detailValue}>Salida</Text>
              </View>
              
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Cantidad de pasajeros</Text>
                <Text style={styles.detailValue}>1</Text>
              </View>
              
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Orden de atención</Text>
                <Text style={styles.detailValue}>1</Text>
              </View>
            </View>
            
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Unidad asignada</Text>
                <Text style={styles.detailValue}>No asignado</Text>
              </View>
              
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Proveedor</Text>
                <Text style={styles.detailValue}>Empresa Gacela</Text>
              </View>
            </View>
            
            <Text style={styles.detailLabel}>Ubicación actual de la unidad asignada</Text>
            <View style={styles.mapPlaceholder} />
          </View>

          {/* Opciones del servicio */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Opciones del servicio</Text>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.buttonBlue}>
                <Phone size={16} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.buttonBlueText}> Conductor</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.buttonRed}>
                <X size={16} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.buttonRedText}>Cancelar Servicio</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.buttonOrange}>
                <Text style={styles.buttonOrangeText}>Calificar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default ServicesDetailPassenger;