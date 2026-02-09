import { View, ScrollView, TouchableOpacity, Linking } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronLeft,
  Phone,
  MapPin,
  ChevronRight,
  AlertCircle,
  User,
  MapPinHouse,
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
import LinearGradient from 'react-native-linear-gradient';
import { AnimatedNavButton } from '../../components/AnimatedNavButton';
import NavigationModal from '../../components/NavigationModal';
import { Text } from '../../components/ScaledComponents';
import GpsMobile from './rastreamientoGps/GpsMobile';

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

  const [apiPassengers, setApiPassengers] = useState<PassengerAPI[]>([]);
  const [orderZeroPassenger, setOrderZeroPassenger] =
    useState<PassengerAPI | null>(null);
  const [allPassengers, setAllPassengers] = useState<PassengerAPI[]>([]);
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

  const [modalVisible, setModalVisible] = useState(false);
  const [navigationCoords, setNavigationCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [showOrderWarning, setShowOrderWarning] = useState(false);

  // useEffect para consumir la API
  useEffect(() => {
    const fetchServiceDetails = async () => {
      setIsLoading(true); // Inicia loading
      setApiError(null); // Limpiar errores previos

      try {
        const response = await axios.get<PassengerAPI[]>(
          `https://do.velsat.pe:2053/api/Aplicativo/detalleServicioConductor/${serviceData.codservicio}`,
        );

        const allPassengers = response.data.sort(
          (a, b) => parseInt(a.orden) - parseInt(b.orden),
        );
        setAllPassengers(allPassengers);

        const hasPassengersWithoutOrder = response.data.some(
          p => p.orden === null || p.orden === undefined || p.orden === '',
        );
        setShowOrderWarning(hasPassengersWithoutOrder);

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
        setApiError('Error al obtener los detalles del servicio');
      } finally {
        setIsLoading(false);
      }
    };

    if (serviceData.codservicio) {
      fetchServiceDetails();
    }
  }, [serviceData.codservicio, refreshTrigger]);

  const passengersForModal = allPassengers.map(passenger => ({
    apellidos:
      passenger.codlan === '4175'
        ? 'Destino Aeropuerto Jorge Chavez'
        : passenger.apellidos || 'SIN NOMBRE',
    codpedido: passenger.codpedido,
    orden: passenger.orden,
    wx: passenger.wx,
    wy: passenger.wy,
  }));

  useFocusEffect(
    React.useCallback(() => {
      NavigationBarColor('#ffffff', true);
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
      handleShowAlert(
        'Teléfono no disponible',
        'No hay un número de teléfono registrado para este pasajero.',
        '#FFA726', // Naranja - Advertencia
      );
      return;
    }

    const phoneNumber: string = currentPassenger.telefono;
    const phoneUrl: string = `tel:${phoneNumber}`;

    Linking.openURL(phoneUrl)
      .then(() => {})
      .catch(error => {
        handleShowAlert(
          'No se pudo abrir el marcador',
          `Marca manualmente este número:\n${phoneNumber}`,
          '#FFA726', // Naranja - Advertencia
        );
      });
  };

  const openGoogleMapsPassenger = (isPickup: boolean): void => {
    let latitude: string | undefined;
    let longitude: string | undefined;

    if (isPickup) {
      latitude = isEntrada ? currentPassenger?.wy : orderZeroPassenger?.wy;
      longitude = isEntrada ? currentPassenger?.wx : orderZeroPassenger?.wx;
    } else {
      latitude = isEntrada ? orderZeroPassenger?.wy : currentPassenger?.wy;
      longitude = isEntrada ? orderZeroPassenger?.wx : currentPassenger?.wx;
    }

    if (!latitude || !longitude) {
      handleShowAlert(
        'Ubicación no disponible',
        'No hay coordenadas registradas para esta ubicación.',
        '#FFA726',
      );
      return;
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    const result = openGoogleMaps(lat, lng);

    if (result) {
      setNavigationCoords({ latitude: lat, longitude: lng });
      setModalVisible(true);
    }
  };
  const getLocationData = (
    passenger: PassengerAPI | null,
    field: 'direccion' | 'distrito' | 'ubicacion' | 'referencia',
  ): string => {
    if (!passenger) return '-';

    if (passenger.codlan === '4175') {
      switch (field) {
        case 'direccion':
          return 'Avenida Morales Duárez s/n';
        case 'distrito':
          return 'Provincia Constitucional del Callao';
        case 'ubicacion':
          return 'Aeropuerto Internacional Jorge Chávez';
        case 'referencia':
          return 'No han agregado niguna referencia';
        default:
          return '-';
      }
    }

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

  const actualizarPasajeros = (usuario: string, pasajeros: number): string => {
    let numeroPasajeros =
      typeof pasajeros === 'string' ? parseInt(pasajeros) : pasajeros;

    if (isNaN(numeroPasajeros)) {
      numeroPasajeros = 0;
    }

    let valorARestar;

    switch (usuario.toLowerCase()) {
      case 'movilbus':
        valorARestar = 1;
        break;
      default:
        valorARestar = 0;
    }

    numeroPasajeros = Math.max(0, numeroPasajeros - valorARestar);

    return numeroPasajeros.toString();
  };

  const topSpace = insets.top + 5;

  return (
    <View style={[styles.container, { paddingBottom: bottomSpace }]}>
      <LinearGradient
        colors={['#05194fff', '#05194fff', '#18223dff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.header, { paddingTop: topSpace }]}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <ChevronLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerMainTitle}>Detalles del servicio</Text>
        </View>
      </LinearGradient>

      <ScrollView
        ref={scrollViewRef}
        style={styles.contentList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {isLoading ? (
          // Loading
          <View style={styles.loadingContainer}>
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateTitle}>Cargando detalles</Text>
              <ActivityIndicator size="large" color="#e36414" />

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
          <View style={styles.formContainer}>
            <View style={styles.gpsAlert}>
              <View style={styles.gpsAlertHeader}>
                {serviceData.codusuario === 'movilbus' && (
                  <GpsMobile
                    placa={serviceData.unidad}
                    usuario={serviceData.codusuario}
                    codservicio={serviceData.codservicio}
                    unidad={serviceData.unidad}
                    codconductor={serviceData.codconductor}
                  />
                )}
              </View>
            </View>

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

            {/* Contenedor del slider */}
            <View style={styles.sliderWrapper}>
              {/* Botón izquierdo */}
              <AnimatedNavButton
                onPress={handlePrevious}
                icon={<ChevronLeft size={24} color="#fff" />}
                direction="left"
              />

              {/* Contenedor de las tarjetas del slider */}
              <View style={styles.sliderCardsContainer}>
                {currentPassenger && (
                  <>
                    {/* Datos del Pasajero */}
                    <View style={styles.cardslider}>
                      <View style={styles.sectionTitleContainer}>
                        <User size={20} color="#000" />
                        <Text style={styles.sectionTitle}>Datos Pasajero</Text>
                      </View>

                      <View style={styles.rowWithIcon}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.label}>Nombres</Text>
                          <Text style={styles.value}>
                            {currentPassenger.apellidos || '-'}
                          </Text>

                          <Text style={styles.label}>Teléfono</Text>
                          <Text style={styles.value}>
                            {currentPassenger.telefono || '-'}
                          </Text>

                          <Text style={styles.label}>DNI</Text>
                          <Text style={styles.value}>
                            {currentPassenger.dni || '-'}
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
                      <View style={styles.sectionTitleContainer}>
                        <MapPinHouse size={18} color="#000" />
                        <Text style={styles.sectionTitle}>Lugar de Recojo</Text>
                      </View>

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

                          <Text style={styles.label}>Distrito</Text>
                          <Text style={styles.value}>
                            {isEntrada
                              ? currentPassenger.distrito
                              : getLocationData(orderZeroPassenger, 'distrito')}
                          </Text>

                          <Text style={styles.label}>Ubicación</Text>
                          <Text style={styles.value}>
                            {isEntrada
                              ? '-'
                              : getLocationData(
                                  orderZeroPassenger,
                                  'ubicacion',
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
                    <View style={styles.cardsliderSin}>
                      <View style={styles.sectionTitleContainer}>
                        <MapPinHouse size={18} color="#000" />
                        <Text style={styles.sectionTitle}>
                          Destino de Viaje
                        </Text>
                      </View>
                      <View style={styles.gridRow}>
                        <View style={styles.gridItem}>
                          <Text style={styles.label}>Dirección</Text>
                          <Text style={styles.value}>
                            {isEntrada
                              ? getLocationData(orderZeroPassenger, 'direccion')
                              : currentPassenger.direccion}
                          </Text>

                          <Text style={styles.label}>Distrito</Text>
                          <Text style={styles.value}>
                            {isEntrada
                              ? getLocationData(orderZeroPassenger, 'distrito')
                              : currentPassenger.distrito}
                          </Text>

                          <Text style={styles.label}>Ubicación</Text>
                          <Text style={styles.value}>
                            {isEntrada
                              ? getLocationData(orderZeroPassenger, 'ubicacion')
                              : '-'}
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
                                    ? currentPassenger?.wy
                                    : orderZeroPassenger?.wy
                                )
                                  ? 1
                                  : 0.3,
                              },
                            ]}
                            onPress={() => openGoogleMapsPassenger(false)}
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

                      <View style={styles.infoRow}>
                        <Text style={styles.label}>Referencia</Text>
                        <Text style={styles.value}>
                          {isEntrada
                            ? getLocationData(orderZeroPassenger, 'referencia')
                            : currentPassenger.referencia ||
                              'No han agregado ninguna referencia'}
                        </Text>
                      </View>
                    </View>
                  </>
                )}
              </View>

              {/* Botón derecho */}
              <AnimatedNavButton
                onPress={handleNext}
                icon={<ChevronRight size={24} color="#fff" />}
                direction="right"
              />
            </View>

            {/* Detalles de Servicio */}
            <View style={styles.card}>
              <Text style={styles.centerLabel}>Detalles de Servicio</Text>

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
                    {serviceData.totalpax
                      ? actualizarPasajeros(
                          serviceData.codusuario,
                          serviceData.totalpax,
                        )
                      : '-'}
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
              <Text style={styles.centerLabel}>Opciones de Servicio</Text>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.buttonD}
                  onPress={() => setModalChangeOrderVisible(true)}
                  disabled
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
        )}
      </ScrollView>

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
        onClose={() => {
          setModalRouteServiceVisible(false);
          setShowOrderWarning(false); // Limpiar el warning al cerrar
        }}
        passengers={passengersForModal}
        tipo={serviceData.tipo}
        showOrderWarning={showOrderWarning}
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

      {navigationCoords && (
        <NavigationModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          latitude={navigationCoords.latitude}
          longitude={navigationCoords.longitude}
        />
      )}
    </View>
  );
};

export default ServicesDetailDriver;
