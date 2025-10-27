import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronLeft,
  Phone,
  MapPin,
  ChevronRight,
  AlertCircle,
} from 'lucide-react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import NavigationBarColor from 'react-native-navigation-bar-color';
import { useFocusEffect, useRoute, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../../App';
import {
  getBottomSpace,
  useNavigationMode,
} from '../../hooks/useNavigationMode';
import { styles } from '../../styles/servicesdetaildriver';
import { openGoogleMaps } from '../../utils/textUtils';
import axios from 'axios';
import ModalChangeOrder from './modals/ModalChangeOrder';
import ModalRouteService from './modals/ModalRouteService';
import ModalObservations from './modals/ModalObservations';
import { ActivityIndicator } from 'react-native';
import PassengerActionBtn from '../../components/PassengerActionBtn';
import ModalAlert from '../../components/ModalAlert';

type ServicesDetailDriverRouteProp = RouteProp<
  RootStackParamList,
  'ServicesDetailDriver'
>;

interface PassengerAPI {
  apellidos: string;
  codcliente: string;
  codlan: string;
  estado: string;
  codpedido: string;
  direccion: string;
  distrito: string;
  dni: string | null;
  fechapasajero: string;
  nombres: string | null;
  orden: string;
  referencia: string | null;
  telefono: string | null;
  wx: string;
  wy: string;
}

const ServicesDetailDriver = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<ServicesDetailDriverRouteProp>();
  const { serviceData } = route.params;

  const scrollViewRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();
  const navigationDetection = useNavigationMode();
  const bottomSpace = getBottomSpace(
    insets,
    navigationDetection.hasNavigationBar,
  );

  console.log('Datos recibidos en ServicesDetailDriver:', serviceData);

  const [apiPassengers, setApiPassengers] = useState<PassengerAPI[]>([]);
  const [orderZeroPassenger, setOrderZeroPassenger] =
    useState<PassengerAPI | null>(null);

  const [modalChangeOrderVisible, setModalChangeOrderVisible] = useState(false);
  const [modalRouteServiceVisible, setModalRouteServiceVisible] =
    useState(false);
  const [modalObservationsVisible, setModalObservationsVisible] =
    useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [allOrdersZero, setAllOrdersZero] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [modalAlertVisible, setModalAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    color: '',
  });

  // useEffect para consumir la API
  useEffect(() => {
    const fetchServiceDetails = async () => {
      setIsLoading(true); // Inicia loading
      setApiError(null); // Limpiar errores previos

      try {
        const response = await axios.get<PassengerAPI[]>(
          `https://velsat.pe:2087/api/Aplicativo/detalleServicioConductor/${serviceData.codservicio}`,
        );

        console.log('📡 Respuesta de la API:', response.data);

        const orderZero = response.data.find(p => p.orden === '0');
        setOrderZeroPassenger(orderZero || null);

        const filtered = response.data
          .filter(p => p.orden !== '0')
          .sort((a, b) => parseInt(a.orden) - parseInt(b.orden));

        const uniquePassengers = filtered.reduce((acc, current) => {
          const exists = acc.find(p => p.codpedido === current.codpedido);
          if (!exists) {
            acc.push(current);
          }
          return acc;
        }, [] as PassengerAPI[]);

        setApiPassengers(uniquePassengers);

        const allZero = response.data.every(p => p.orden === '0');
        setAllOrdersZero(allZero);
      } catch (error) {
        console.error('Error al consumir la API:', error);
        setApiError('Error al obtener los detalles del servicio');
      } finally {
        setIsLoading(false); // Termina loading
      }
    };

    if (serviceData.codservicio) {
      fetchServiceDetails();
    }
  }, [serviceData.codservicio, refreshTrigger]);

  const passengersForModal = apiPassengers.map(passenger => ({
    apellidos: passenger.apellidos,
    codpedido: passenger.codpedido,
    orden: passenger.orden,
    wx: passenger.wx,
    wy: passenger.wy,
  }));

  useFocusEffect(
    React.useCallback(() => {
      NavigationBarColor('#00296b', false);
    }, []),
  );

  const handleShowAlert = (title: string, message: string, color?: string) => {
    setAlertConfig({ title, message, color: color || '' });
    setModalAlertVisible(true);
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handlePrevious = () => {
    const newIndex =
      currentIndex === 0 ? apiPassengers.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
    scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: false });
  };

  const handleNext = () => {
    const newIndex =
      currentIndex === apiPassengers.length - 1 ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
    scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: false });
  };

  const currentPassenger = apiPassengers[currentIndex];
  const isEntrada = serviceData.tipo === 'I';

  const makePhoneCallPassenger = (): void => {
    if (!currentPassenger?.telefono) {
      console.log('⚠️ No hay teléfono disponible');
      Alert.alert(
        'Teléfono no disponible',
        'No hay un número de teléfono registrado para este pasajero.',
        [{ text: 'Entendido' }],
      );
      return;
    }

    const phoneNumber: string = currentPassenger.telefono;
    const phoneUrl: string = `tel:${phoneNumber}`;

    Linking.openURL(phoneUrl)
      .then(() => {
        console.log('📞 Marcador abierto exitosamente');
      })
      .catch(error => {
        console.log('❌ Error abriendo marcador:', error);
        Alert.alert(
          'No se pudo abrir el marcador',
          `Marca manualmente este número:\n${phoneNumber}`,
          [{ text: 'Entendido' }],
        );
      });
  };

  const openGoogleMapsPassenger = (isPickup: boolean): void => {
    // Determinar qué coordenadas usar según el tipo y si es recojo o destino
    let latitude: string | undefined;
    let longitude: string | undefined;

    if (isPickup) {
      // Para lugar de recojo
      latitude = isEntrada ? currentPassenger?.wy : orderZeroPassenger?.wy;
      longitude = isEntrada ? currentPassenger?.wx : orderZeroPassenger?.wx;
    } else {
      // Para destino de viaje
      latitude = isEntrada ? orderZeroPassenger?.wy : currentPassenger?.wy;
      longitude = isEntrada ? orderZeroPassenger?.wx : currentPassenger?.wx;
    }

    if (!latitude || !longitude) {
      console.log('⚠️ No hay coordenadas disponibles');
      Alert.alert(
        'Ubicación no disponible',
        'No hay coordenadas registradas para esta ubicación.',
        [{ text: 'Entendido' }],
      );
      return;
    }

    openGoogleMaps(parseFloat(latitude), parseFloat(longitude));
  };

  const getLocationData = (
    passenger: PassengerAPI | null,
    field: 'direccion' | 'distrito' | 'ubicacion' | 'referencia',
  ): string => {
    if (!passenger) return '-';

    // Si el codlan es "4175", mostrar datos del aeropuerto
    if (passenger.codlan === '4175') {
      switch (field) {
        case 'direccion':
          return 'Avenida Morales Duárez s/n';
        case 'distrito':
          return 'Provincia Constitucional del Callao';
        case 'ubicacion':
          return 'Aeropuerto Internacional Jorge Chávez';
        case 'referencia':
          return '-';
        default:
          return '-';
      }
    }

    // Si no es "4175", usar los datos normales
    switch (field) {
      case 'direccion':
        return passenger.direccion || '-';
      case 'distrito':
        return passenger.distrito || '-';
      case 'ubicacion':
        return passenger.apellidos || '-';
      case 'referencia':
        return passenger.referencia || '-';
      default:
        return '-';
    }
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

      {isLoading ? (
        // Loading
        <View style={styles.loadingContainer}>
          <View style={styles.emptyStateContainer}>
            <ActivityIndicator size="large" color="#e36414" />
            <Text style={styles.emptyStateTitle}>Cargando detalles</Text>
            <Text style={styles.emptyStateSubtitle}>
              Por favor espera un momento
            </Text>
          </View>
        </View>
      ) : apiError ? (
        // Error
        <View style={styles.loadingContainer}>
          <View style={styles.emptyStateContainer}>
            <View style={[styles.iconCircle, styles.iconCircleLarge]}>
              <AlertCircle size={40} color="#ff4444" />
            </View>
            <Text style={styles.emptyStateTitleDark}>Error al cargar</Text>
            <Text style={styles.emptyStateDescription}>{apiError}</Text>
          </View>
        </View>
      ) : (
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
              {allOrdersZero ? (
                <Text style={styles.passengerIndicatorNumber}>
                  Solicite orden de atención
                </Text>
              ) : (
                <Text style={styles.passengerIndicatorNumber}>
                  {currentIndex + 1}/{apiPassengers.length}
                </Text>
              )}
            </View>

            {/* Contenedor del slider (solo las 3 primeras tarjetas) */}
            <View style={styles.sliderWrapper}>
              {/* Botón izquierdo */}
              <TouchableOpacity
                onPress={handlePrevious}
                style={styles.navButton}
              >
                <ChevronLeft size={24} color="#333" />
              </TouchableOpacity>

              {/* Contenedor de las tarjetas del slider */}
              <View style={styles.sliderCardsContainer}>
                {currentPassenger && (
                  <>
                    {/* Datos del Pasajero */}
                    <View style={styles.cardslider}>
                      <Text style={styles.sectionTitle}>Datos Pasajero</Text>

                      <View style={styles.rowWithIcon}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.label}>Nombres</Text>
                          <Text style={styles.value}>
                            {currentPassenger.apellidos || '-'}
                          </Text>
                        </View>
                        <View style={styles.actionButtons}>
                          <TouchableOpacity
                            style={[
                              styles.iconButtonSmall,
                              { opacity: currentPassenger?.telefono ? 1 : 0.3 },
                            ]}
                            onPress={makePhoneCallPassenger}
                            disabled={!currentPassenger?.telefono}
                          >
                            <Phone size={20} color="#fff" />
                          </TouchableOpacity>
                          <Text style={styles.linkText}>Llamar pasajero</Text>
                        </View>
                      </View>

                      <View style={styles.infoRow}>
                        <Text style={styles.label}>Teléfono</Text>
                        <Text style={styles.value}>
                          {currentPassenger.telefono || '-'}
                        </Text>
                      </View>

                      <View style={styles.infoRow}>
                        <Text style={styles.label}>DNI</Text>
                        <Text style={styles.value}>
                          {currentPassenger.dni || '-'}
                        </Text>
                      </View>

                      <View style={styles.actionButton}>
                        <PassengerActionBtn
                          codpedido={currentPassenger.codpedido}
                          estado={currentPassenger.estado}
                          codusuario={serviceData.codusuario}
                        />
                      </View>
                    </View>

                    {/* Lugar de Recojo */}
                    <View style={styles.cardslider}>
                      <Text style={styles.sectionTitle}>Lugar de recojo</Text>

                      <View style={styles.gridRow}>
                        <View style={styles.gridItem}>
                          <Text style={styles.label}>Dirección</Text>
                          <Text style={styles.value}>
                            {isEntrada
                              ? currentPassenger.direccion
                              : getLocationData(
                                  orderZeroPassenger,
                                  'direccion',
                                )}
                          </Text>
                        </View>

                        <View style={styles.gridItemRight}>
                          <Text style={styles.label}>Fecha y hora</Text>
                          <Text style={styles.value}>
                            {isEntrada
                              ? currentPassenger.fechapasajero
                              : orderZeroPassenger?.fechapasajero || '-'}
                          </Text>
                          <TouchableOpacity
                            style={[
                              styles.iconButtonSmall,
                              {
                                opacity: (
                                  isEntrada
                                    ? currentPassenger?.wy
                                    : orderZeroPassenger?.wy
                                )
                                  ? 1
                                  : 0.3,
                              },
                            ]}
                            onPress={() => openGoogleMapsPassenger(true)}
                            disabled={
                              !(isEntrada
                                ? currentPassenger?.wy
                                : orderZeroPassenger?.wy)
                            }
                          >
                            <MapPin size={20} color="#fff" />
                          </TouchableOpacity>
                          <Text style={styles.linkText}>¿Cómo llegar?</Text>
                        </View>
                      </View>

                      <View style={styles.infoRowWithIcon}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.label}>Distrito</Text>
                          <Text style={styles.value}>
                            {isEntrada
                              ? currentPassenger.distrito
                              : getLocationData(orderZeroPassenger, 'distrito')}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.infoRow}>
                        <Text style={styles.label}>Ubicación</Text>
                        <Text style={styles.value}>
                          {isEntrada
                            ? '-'
                            : getLocationData(orderZeroPassenger, 'ubicacion')}
                        </Text>
                      </View>

                      <View style={styles.infoRow}>
                        <Text style={styles.label}>Referencia</Text>
                        <Text style={styles.value}>
                          {isEntrada
                            ? currentPassenger.referencia || '-'
                            : getLocationData(orderZeroPassenger, 'referencia')}
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
                            {isEntrada
                              ? getLocationData(orderZeroPassenger, 'direccion')
                              : currentPassenger.direccion}
                          </Text>
                        </View>
                        <View style={styles.gridItemRight}>
                          <Text style={styles.label}>Fecha y hora</Text>
                          <Text style={styles.value}>
                            {isEntrada
                              ? orderZeroPassenger?.fechapasajero || '-'
                              : currentPassenger.fechapasajero}
                          </Text>

                          <TouchableOpacity
                            style={[
                              styles.iconButtonSmall,
                              {
                                opacity: (
                                  isEntrada
                                    ? orderZeroPassenger?.wy
                                    : currentPassenger?.wy
                                )
                                  ? 1
                                  : 0.3,
                              },
                            ]}
                            onPress={() => openGoogleMapsPassenger(false)}
                            disabled={
                              !(isEntrada
                                ? orderZeroPassenger?.wy
                                : currentPassenger?.wy)
                            }
                          >
                            <MapPin size={20} color="#fff" />
                          </TouchableOpacity>
                          <Text style={styles.linkText}>¿Cómo llegar?</Text>
                        </View>
                      </View>

                      <View style={styles.infoRowWithIcon}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.label}>Distrito</Text>
                          <Text style={styles.value}>
                            {isEntrada
                              ? getLocationData(orderZeroPassenger, 'distrito')
                              : currentPassenger.distrito}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.infoRow}>
                        <Text style={styles.label}>Ubicación</Text>
                        <Text style={styles.value}>
                          {isEntrada
                            ? getLocationData(orderZeroPassenger, 'ubicacion')
                            : '-'}
                        </Text>
                      </View>

                      <View style={styles.infoRow}>
                        <Text style={styles.label}>Referencia</Text>
                        <Text style={styles.value}>
                          {isEntrada
                            ? getLocationData(orderZeroPassenger, 'referencia')
                            : currentPassenger.referencia || '-'}
                        </Text>
                      </View>
                    </View>
                  </>
                )}
              </View>

              {/* Botón derecho */}
              <TouchableOpacity onPress={handleNext} style={styles.navButton}>
                <ChevronRight size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {/* Tarjetas fijas (fuera del slider) */}
            {/* Detalles de Servicio */}
            <View style={styles.card}>
              <Text style={styles.centerLabel}>Detalles de servicio</Text>

              {/* Tipo y Cantidad de pasajeros */}
              <View style={styles.gridRow}>
                <View style={styles.gridItem}>
                  <Text style={styles.label}>Tipo</Text>
                  <Text style={styles.value}>
                    {serviceData.tipo === 'I'
                      ? 'Entrada'
                      : serviceData.tipo === 'S'
                      ? 'Salida'
                      : '-'}
                  </Text>
                </View>
                <View style={styles.gridItemRight}>
                  <Text style={styles.label}>Cantidad de pasajeros</Text>
                  <Text style={styles.value}>
                    {serviceData.totalpax ?? '-'}
                  </Text>
                </View>
              </View>

              {/* Empresa y Grupo */}
              <View style={styles.gridRow}>
                <View style={styles.gridItem}>
                  <Text style={styles.label}>Empresa</Text>
                  <Text style={styles.value}>{serviceData.empresa || '-'}</Text>
                </View>
                <View style={styles.gridItemRight}>
                  <Text style={styles.label}>Grupo</Text>
                  <Text style={styles.value}>
                    {serviceData.grupo === 'A'
                      ? 'Aire'
                      : serviceData.grupo === 'T'
                      ? 'Tierra'
                      : '-'}
                  </Text>
                </View>
              </View>

              {/* Proveedor y Unidad */}
              <View style={styles.gridRow}>
                <View style={styles.gridItem}>
                  <Text style={styles.label}>Proveedor</Text>
                  <Text style={styles.value}>
                    {serviceData.codusuario === 'movilbus'
                      ? 'Empresa Movil Bus'
                      : serviceData.codusuario === 'cgacela'
                      ? 'Gacela Express'
                      : serviceData.codusuario === 'aremys'
                      ? 'Empresa Aremys'
                      : serviceData.codusuario || '-'}
                  </Text>
                </View>
                <View style={styles.gridItemRight}>
                  <Text style={styles.label}>Unidad</Text>
                  <Text style={styles.value}>{serviceData.unidad || '-'}</Text>
                </View>
              </View>
            </View>

            {/* Opciones de Servicio */}
            <View style={styles.card}>
              <Text style={styles.centerLabel}>Opciones de servicio</Text>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.buttonBlue}
                  onPress={() => setModalChangeOrderVisible(true)}
                >
                  <Text style={styles.buttonText}>Cambiar orden</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.buttonGray}
                  onPress={() => setModalRouteServiceVisible(true)}
                >
                  <Text style={styles.buttonText}>Ruta de servicio</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.buttonOrange}
                  onPress={() => setModalObservationsVisible(true)}
                >
                  <Text style={styles.buttonText}>Observaciones</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      )}

      <ModalChangeOrder
        visible={modalChangeOrderVisible}
        onClose={() => {
          setModalChangeOrderVisible(false);
          setRefreshTrigger(prev => prev + 1);
        }}
        passengers={passengersForModal}
        onShowAlert={handleShowAlert}
      />

      <ModalRouteService
        visible={modalRouteServiceVisible}
        onClose={() => setModalRouteServiceVisible(false)}
        passengers={passengersForModal}
      />

      <ModalObservations
        visible={modalObservationsVisible}
        onClose={() => setModalObservationsVisible(false)}
        passengers={passengersForModal}
        onShowAlert={handleShowAlert}
      />

      <ModalAlert
        isVisible={modalAlertVisible}
        onClose={() => setModalAlertVisible(false)}
        title={alertConfig.title}
        message={alertConfig.message}
        color={alertConfig.color}
      />
    </View>
  );
};

export default ServicesDetailDriver;
