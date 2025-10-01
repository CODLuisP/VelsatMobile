import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import React, { useState, useRef } from 'react';
import { ChevronLeft, Phone, MapPin, ChevronRight } from 'lucide-react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import NavigationBarColor from 'react-native-navigation-bar-color';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../../App';
import {
  getBottomSpace,
  useNavigationMode,
} from '../../hooks/useNavigationMode';
import { styles } from '../../styles/servicesdetaildriver';

const ServicesDetailDriver = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const scrollViewRef = useRef<ScrollView>(null);

  const insets = useSafeAreaInsets();
  const navigationDetection = useNavigationMode();
  const bottomSpace = getBottomSpace(
    insets,
    navigationDetection.hasNavigationBar,
  );

  const [passengers] = useState([
    {
      id: 1,
      name: 'Luis Alexander Castrejón Cabrera',
      phone: '952379386',
      dni: '23793793',
      pickupLocation: {
        address: 'Urb. Condado Real Lote D-6',
        district: 'San Juan de Miraflores',
        reference: '1 cuadra antes del Wuarique de Chelo - Fonavi II',
        dateTime: '22/09/2025 00:00',
      },
      destination: {
        address: 'Avenida Morales Duárez s/n',
        district: 'Provincia Constitucional del Callao',
        location: 'Aeropuerto Internacional Jorge Chávez',
        dateTime: '22/09/2025 02:55',
      },
    },
    {
      id: 2,
      name: 'María González Pérez',
      phone: '987654321',
      dni: '45678912',
      pickupLocation: {
        address: 'Av. Principal 123',
        district: 'Miraflores',
        reference: 'Frente al parque Kennedy',
        dateTime: '22/09/2025 00:15',
      },
      destination: {
        address: 'Avenida Morales Duárez s/n',
        district: 'Provincia Constitucional del Callao',
        location: 'Aeropuerto Internacional Jorge Chávez',
        dateTime: '22/09/2025 02:55',
      },
    },

    
    {
      id: 3,
      name: 'Carlos Rodríguez Silva',
      phone: '965432178',
      dni: '78945612',
      pickupLocation: {
        address: 'Calle Los Sauces 456',
        district: 'San Isidro',
        reference: 'Al lado del centro comercial',
        dateTime: '22/09/2025 00:30',
      },
      destination: {
        address: 'Avenida Morales Duárez s/n',
        district: 'Provincia Constitucional del Callao parte 3',
        location: 'Aeropuerto Internacional Jorge Chávez',
        dateTime: '22/09/2025 02:55',
      },
    },
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);

  const serviceDetails = {
    type: 'Entrada',
    passengers: passengers.length,
    group: 'Aire',
    provider: 'Empresa Gacela',
    unit: 'C247-CSC170',
  };

  useFocusEffect(
    React.useCallback(() => {
      NavigationBarColor('#1e3a8a', false);
    }, []),
  );

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handlePrevious = () => {
    const newIndex = currentIndex === 0 ? passengers.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
    scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: false });
  };

  const handleNext = () => {
    const newIndex = currentIndex === passengers.length - 1 ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
    scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: false });
  };

  const currentPassenger = passengers[currentIndex];
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
        ref={scrollViewRef}
        style={styles.contentList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View style={styles.formContainer}>
          {/* Indicador de Pasajero */}
          <View style={styles.passengerIndicator}>
            <Text style={styles.passengerIndicatorLabel}>
              Visualizando Pasajero
            </Text>
            <Text style={styles.passengerIndicatorNumber}>
              {currentIndex + 1}/{passengers.length}
            </Text>
          </View>

          {/* Contenedor del slider (solo las 3 primeras tarjetas) */}
          <View style={styles.sliderWrapper}>
            {/* Botón izquierdo */}
            {passengers.length > 1 && (
              <TouchableOpacity
                onPress={handlePrevious}
                style={styles.navButton}
              >
                <ChevronLeft size={24} color="#333" />
              </TouchableOpacity>
            )}

            {/* Contenedor de las tarjetas del slider */}
            <View style={styles.sliderCardsContainer}>
              {/* Datos del Pasajero */}
              <View style={styles.cardslider}>
                <Text style={styles.sectionTitle}>Datos Pasajero</Text>

                <View style={styles.rowWithIcon}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>Nombres</Text>
                    <Text style={styles.value}>{currentPassenger.name}</Text>
                  </View>
                  <TouchableOpacity style={styles.iconButton}>
                    <Phone size={20} color="#333" />
                  </TouchableOpacity>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.label}>Teléfono</Text>
                  <Text style={styles.value}>{currentPassenger.phone}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.label}>DNI</Text>
                  <Text style={styles.value}>{currentPassenger.dni}</Text>
                </View>
              </View>

              {/* Lugar de Recojo */}
              <View style={styles.cardslider}>
                <Text style={styles.sectionTitle}>Lugar de recojo</Text>

                <View style={styles.gridRow}>
                  <View style={styles.gridItem}>
                    <Text style={styles.label}>Dirección</Text>
                    <Text style={styles.value}>
                      {currentPassenger.pickupLocation.address}
                    </Text>
                  </View>
                  <View style={styles.gridItemRight}>
                    <Text style={styles.label}>Fecha y hora</Text>
                    <Text style={styles.value}>
                      {currentPassenger.pickupLocation.dateTime}
                    </Text>
                  </View>
                </View>

                <View style={styles.infoRowWithIcon}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>Distrito</Text>
                    <Text style={styles.value}>
                      {currentPassenger.pickupLocation.district}
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.iconButtonSmall}>
                    <MapPin size={20} color="#333" />
                  </TouchableOpacity>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.label}>Ubicación</Text>
                  <Text style={styles.value}>-</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.label}>Referencia</Text>
                  <Text style={styles.value}>
                    {currentPassenger.pickupLocation.reference}
                  </Text>
                </View>
              </View>

              {/* Destino de Viaje */}
              <View style={styles.cardslider}>
                <Text style={styles.sectionTitle}>Destino de viaje</Text>

                <View style={styles.gridRow}>
                  <View style={styles.gridItem}>
                    <Text style={styles.label}>Dirección</Text>
                    <Text style={styles.value}>
                      {currentPassenger.destination.address}
                    </Text>
                  </View>
                  <View style={styles.gridItem}>
                    <Text style={styles.label}>Fecha y hora</Text>
                    <Text style={styles.value}>
                      {currentPassenger.destination.dateTime}
                    </Text>
                  </View>
                </View>

                <View style={styles.infoRowWithIcon}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>Distrito</Text>
                    <Text style={styles.value}>
                      {currentPassenger.destination.district}
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.iconButtonSmall}>
                    <MapPin size={20} color="#333" />
                  </TouchableOpacity>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.label}>Ubicación</Text>
                  <Text style={styles.value}>
                    {currentPassenger.destination.location}
                  </Text>
                  <Text style={styles.linkText}>¿Cómo llegar?</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.label}>Referencia</Text>
                  <Text style={styles.value}>-</Text>
                </View>
              </View>
            </View>

            {/* Botón derecho */}
            {passengers.length > 1 && (
              <TouchableOpacity
                onPress={handleNext}
                style={styles.navButton}
              >
                <ChevronRight size={24} color="#333" />
              </TouchableOpacity>
            )}
          </View>

          {/* Tarjetas fijas (fuera del slider) */}
          {/* Detalles de Servicio */}
          <View style={styles.card}>
            <Text style={styles.centerLabel}>Detalles de servicio</Text>

            <View style={styles.gridRow}>
              <View style={styles.gridItem}>
                <Text style={styles.label}>Tipo</Text>
                <Text style={styles.value}>{serviceDetails.type}</Text>
              </View>
              <View style={styles.gridItemRight}>
                <Text style={styles.label}>Cantidad de pasajeros</Text>
                <Text style={styles.value}>
                  {serviceDetails.passengers}
                </Text>
              </View>
            </View>

            <View style={styles.gridRow}>
              <View style={styles.gridItem}>
                <Text style={styles.label}>Grupo</Text>
                <Text style={styles.value}>{serviceDetails.group}</Text>
              </View>
              <View style={styles.gridItemRight}>
                <Text style={styles.label}>Proveedor</Text>
                <Text style={styles.value}>
                  {serviceDetails.provider}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Unidad</Text>
              <Text style={styles.value}>{serviceDetails.unit}</Text>
            </View>
          </View>

          {/* Opciones de Servicio */}
          <View style={styles.card}>
            <Text style={styles.centerLabel}>Opciones de servicio</Text>

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.buttonBlue}>
                <Text style={styles.buttonText}>Cambiar orden</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.buttonGray}>
                <Text style={styles.buttonText}>Ruta de servicio</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.buttonOrange}>
                <Text style={styles.buttonText}>Observaciones</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default ServicesDetailDriver;