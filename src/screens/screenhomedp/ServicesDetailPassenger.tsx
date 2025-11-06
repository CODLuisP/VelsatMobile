import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Linking,
  Alert,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { ChevronLeft, MapPin, Phone, Star } from 'lucide-react-native';
import {
  NavigationProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import NavigationBarColor from 'react-native-navigation-bar-color';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../../App';
import {
  getBottomSpace,
  useNavigationMode,
} from '../../hooks/useNavigationMode';
import { styles } from '../../styles/servicesdetailpassenger';
import { RouteProp } from '@react-navigation/native';
import { openGoogleMaps } from '../../utils/textUtils';
import { ImageModal } from './modals/ImageModal';
import { CancelModal } from './modals/CancelModal';
import { RatingModal } from './modals/RatingModal';
import VehicleMap from './VehicleMap'; // 👈 Importar el nuevo componente
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';
import ModalAlert from '../../components/ModalAlert';

type ServicesDetailPassengerRouteProp = RouteProp<
  RootStackParamList,
  'ServicesDetailPassenger'
>;

interface DriverData {
  apellidos: string;
  nombres: string;
  imagen: string | null;
  telefono: string;
  dni: string;
  calificacion: string | null;
}

interface DestinoData {
  apellidos: string;
  nombres: string | null;
  direccion: string;
  distrito: string;
  referencia: string | null;
  wy: string;
  wx: string;
}

const ServicesDetailPassenger = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<ServicesDetailPassengerRouteProp>();
  const { serviceData } = route.params;

  const [driverData, setDriverData] = useState<DriverData | null>(null);
  const [loadingDriver, setLoadingDriver] = useState(true);
  const [destinoData, setDestinoData] = useState<DestinoData | null>(null);
  const [loadingDestino, setLoadingDestino] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancellingService, setCancellingService] = useState(false);
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [sendingRating, setSendingRating] = useState(false);
  const [vehicleLocation, setVehicleLocation] = useState({
    latitude: -12.0464,
    longitude: -77.0428,
    heading: 0,
    speed: 0,
  });

  const insets = useSafeAreaInsets();
  const navigationDetection = useNavigationMode();
  const bottomSpace = getBottomSpace(
    insets,
    navigationDetection.hasNavigationBar,
  );
  const [driverError, setDriverError] = useState('');
  const [destinoError, setDestinoError] = useState<string | null>(null);

  const [modalAlertVisible, setModalAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    color: '',
  });

  const handleShowAlert = (title: string, message: string, color?: string) => {
    setAlertConfig({ title, message, color: color || '' });
    setModalAlertVisible(true);
  };

  // Función para obtener los datos del conductor
  const fetchDriverData = async () => {
    try {
      setLoadingDriver(true);

      const url = `https://velsat.pe:2087/api/Aplicativo/detalleConductor/${serviceData.codconductor}`;

      const response = await axios.get(url);

      setDriverData(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setDriverError('No se pudieron cargar los datos del conductor');
      } else {
        setDriverError('Error al cargar los datos del conductor');
      }
      setDriverData(null);
    } finally {
      setLoadingDriver(false);
    }
  };

  // Función para obtener los datos del destino
  const fetchDestinoData = async (codcliente: string) => {
    try {
      setLoadingDestino(true);
      setDestinoError(null); // Limpia errores anteriores

      const url = `https://velsat.pe:2087/api/Aplicativo/detalleDestino/${codcliente}`;

      const response = await axios.get(url);

      if (response.data && response.data.length > 0) {
        setDestinoData(response.data[0]);
      } else {
        setDestinoData(null);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setDestinoError('No se pudieron cargar los datos del destino');
      } else {
        setDestinoError('Error al cargar los datos del destino');
      }
      setDestinoData(null);
    } finally {
      setLoadingDestino(false);
    }
  };

  // Ejecutar al montar el componente
  useEffect(() => {
    if (serviceData.codconductor) {
      fetchDriverData();
    } else {
      setLoadingDriver(false);
    }

    if (
      serviceData.tipo === 'I' &&
      serviceData.destino &&
      serviceData.destino !== '4175'
    ) {
      fetchDestinoData(serviceData.destino);
    }

    if (
      serviceData.tipo === 'S' &&
      serviceData.destino &&
      serviceData.destino !== '4175'
    ) {
      fetchDestinoData(serviceData.destino);
    }
  }, [serviceData.codconductor, serviceData.tipo, serviceData.destino]);

  const getTipoServicio = (tipo: string) => {
    return tipo === 'I' ? 'Entrada' : 'Salida';
  };

  const getProveedor = (codusuario: string) => {
    switch (codusuario) {
      case 'cgacela':
        return 'Gacela Express';
      case 'movilbus':
        return 'Empresa Movil Bus';
      case 'aremys':
        return 'Empresa Aremys';
      default:
        return 'Proveedor no disponible';
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      NavigationBarColor('#00296b', false);
    }, []),
  );

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleImagePress = () => {
    if (driverData?.imagen) {
      setImageModalVisible(true);
    }
  };

  const handleCloseModal = () => {
    setImageModalVisible(false);
  };

  const renderStars = (calificacion: string | null) => {
    const rating = calificacion ? parseInt(calificacion) : 0;
    const stars = [];

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={16}
          color={i <= rating ? '#FFA726' : '#ccc'}
          fill={i <= rating ? '#FFA726' : 'transparent'}
          style={{ marginRight: 4 }}
        />,
      );
    }

    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {stars}
      </View>
    );
  };

  const handleCancelPress = () => {
    setCancelModalVisible(true);
  };

  const handleCloseCancelModal = () => {
    setCancelModalVisible(false);
  };

  const handleConfirmCancel = async () => {
  try {
    setCancellingService(true);
    const url = 'https://velsat.pe:2087/api/Aplicativo/cancelarServicio';

    const requestBody = {
      codservicio: serviceData.codservicio,
      codpedido: serviceData.codpedido,
      codusuario: serviceData.codusuario,
      codcliente: serviceData.codcliente,
      empresa: serviceData.empresa,
      numero: serviceData.numero,
      fechaservicio: serviceData.fechaservicio,
      tipo: serviceData.tipo,
    };

    const response = await axios.post(url, requestBody);
    const { success, message } = response.data;

    setCancelModalVisible(false);

    if (success) {
      handleShowAlert('¡Éxito!', message || 'Servicio cancelado correctamente', '#4CAF50');
      setTimeout(() => navigation.goBack(), 1500);
    } else {
      handleShowAlert('No se puede cancelar', message || 'Verifique las condiciones', '#FFA726');
    }

  } catch (error) {
    setCancelModalVisible(false);
    handleShowAlert(
      'Error',
      'No se pudo cancelar el servicio. Intenta nuevamente.',
      '#e36414'
    );
  } finally {
    setCancellingService(false);
  }
};




  const handleRatingPress = () => {
    setRatingModalVisible(true);
    setSelectedRating(0);
  };

  const handleCloseRatingModal = () => {
    setRatingModalVisible(false);
    setSelectedRating(0);
  };

  const handleSendRating = async () => {
    if (selectedRating === 0) {
      handleShowAlert(
        'Atención',
        'Debe seleccionar una calificación',
        '#e36414', // Naranja - Advertencia/Validación
      );
      return;
    }

    try {
      setSendingRating(true);

      const url = `https://velsat.pe:2087/api/Aplicativo/enviarCalificacion`;

      const response = await axios.post(url, null, {
        params: {
          valor: selectedRating,
          codtaxi: serviceData.codconductor,
        },
      });

      setRatingModalVisible(false);
      handleShowAlert(
        '¡Éxito!',
        'Calificación enviada correctamente',
        '#4CAF50', // Verde - Éxito
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        handleShowAlert(
          'Error',
          'No se pudo enviar la calificación',
          '#e36414', // Rojo - Error
        );
      } else {
      }
    } finally {
      setSendingRating(false);
    }
  };

  const actualizarPasajeros = (usuario: string, pasajeros: string) => {
    // Convertir el string de pasajeros a número
    let numeroPasajeros = parseInt(pasajeros) || 0;

    // Definir el valor a restar según el tipo de usuario
    let valorARestar;

    switch (usuario.toLowerCase()) {
      case 'movilbus':
        valorARestar = 1; // Los admin restan de 1 en 1
        break;
      default:
        valorARestar = 0; // Valor por defecto para usuarios normales
    }

    // Restar y asegurar que no sea negativo
    numeroPasajeros = Math.max(0, numeroPasajeros - valorARestar);

    // Retornar como string
    return numeroPasajeros.toString();
  };

  const makePhoneCall = (): void => {
    if (!driverData?.telefono) {
      handleShowAlert(
        'Teléfono no disponible',
        'No hay un número de teléfono registrado para este conductor.',
        '#e36414', // Naranja - Advertencia
      );
      return;
    }

    const phoneNumber: string = driverData.telefono;
    const phoneUrl: string = `tel:${phoneNumber}`;

    Linking.openURL(phoneUrl)
      .then(() => {})
      .catch(error => {
        handleShowAlert(
          'No se pudo abrir el marcador',
          `Marca manualmente este número:\n${phoneNumber}`,
          '#e36414', // Naranja - Advertencia
        );
      });
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

            {loadingDriver ? (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#2b2b2bff" />
                <Text style={{ color: '#2b2b2bff', marginTop: 10 }}>
                  Cargando datos del conductor...
                </Text>
              </View>
            ) : driverError ? (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Text
                  style={{
                    color: '#2b2b2bff',
                    textAlign: 'center',
                    marginBottom: 10,
                  }}
                >
                  {driverError}
                </Text>
              </View>
            ) : (
              <View style={styles.driverContainer}>
                <TouchableOpacity
                  style={styles.driverAvatar}
                  onPress={handleImagePress}
                  activeOpacity={0.7}
                >
                  <Image
                    source={{
                      uri:
                        driverData?.imagen ||
                        'https://res.cloudinary.com/dyc4ik1ko/image/upload/v1761536505/user_aulzrl.png',
                    }}
                    style={styles.avatarPlaceholder}
                    resizeMode="cover"
                  />
                </TouchableOpacity>

                <View style={styles.driverInfo}>
                  <Text style={styles.driverLabel}>Conductor</Text>
                  <Text style={styles.driverValue}>
                    {driverData
                      ? `${driverData.apellidos?.trim() || ''} ${
                          driverData.nombres?.trim() || ''
                        }`.trim() || 'No disponible'
                      : 'No asignado'}
                  </Text>

                  <Text style={styles.driverLabel}>Teléfono</Text>
                  <Text style={styles.driverValue}>
                    {driverData?.telefono || '-'}
                  </Text>

                  <Text style={styles.driverLabel}>DNI</Text>
                  <Text style={styles.driverValue}>
                    {driverData?.dni || '-'}
                  </Text>

                  <Text style={styles.driverLabel}>Calificación</Text>
                  {renderStars(driverData?.calificacion || null)}
                </View>
              </View>
            )}
          </View>

          {/* Lugar de recojo - Tipo Entrada */}
          {serviceData.tipo === 'I' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Lugar de recojo</Text>

              <View style={styles.locationContainer}>
                <View style={styles.locationRow}>
                  <View style={styles.locationLeft}>
                    <Text style={styles.locationLabel}>Dirección</Text>
                    <Text style={styles.locationValue}>
                      {serviceData.direccion || '-'}
                    </Text>

                    <Text style={styles.locationLabel}>Distrito</Text>
                    <Text style={styles.locationValue}>
                      {serviceData.distrito || '-'}
                    </Text>

                    <Text style={styles.locationLabel}>Ubicación</Text>
                    <Text style={styles.locationValue}>-</Text>

                    <Text style={styles.locationLabel}>Referencia</Text>
                    <Text style={styles.locationValue}>
                      {serviceData.referencia || '-'}
                    </Text>
                  </View>

                  <View style={styles.locationRight}>
                    <Text style={styles.dateLabel}>Fecha y hora</Text>
                    <Text style={styles.dateValue}>
                      {serviceData.fechapasajero}
                    </Text>

                    {/* <TouchableOpacity
                      style={styles.mapButton}
                      onPress={() =>
                        openGoogleMaps(
                          parseFloat(serviceData.wy),
                          parseFloat(serviceData.wx),
                        )
                      }
                    >
                      <MapPin size={20} color="#ffffffff" />
                    </TouchableOpacity>
                    <Text style={styles.mapText}>¿Cómo llegar?</Text> */}
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Lugar de recojo - Tipo Salida */}
          {serviceData.tipo === 'S' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Lugar de recojo</Text>

              {loadingDestino ? (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <ActivityIndicator size="large" color="#e36414" />
                  <Text style={{ color: '#fff', marginTop: 10 }}>
                    Cargando lugar de recojo...
                  </Text>
                </View>
              ) : (
                <View style={styles.locationContainer}>
                  <View style={styles.locationRow}>
                    <View style={styles.locationLeft}>
                      <Text style={styles.locationLabel}>Dirección</Text>
                      <Text style={styles.locationValue}>
                        {destinoData
                          ? destinoData.direccion
                          : 'Avenida Morales Duárez s/n'}
                      </Text>

                      <Text style={styles.locationLabel}>Distrito</Text>
                      <Text style={styles.locationValue}>
                        {destinoData
                          ? destinoData.distrito
                          : 'Provincia Constitucional del Callao'}
                      </Text>

                      <Text style={styles.locationLabel}>Ubicación</Text>
                      <Text style={styles.locationValue}>
                        {destinoData
                          ? `${destinoData.apellidos} ${
                              destinoData.nombres || ''
                            }`.trim()
                          : 'Aeropuerto Internacional Jorge Chávez'}
                      </Text>

                      <Text style={styles.locationLabel}>Referencia</Text>
                      <Text style={styles.locationValue}>
                        {destinoData?.referencia || '-'}
                      </Text>
                    </View>

                    <View style={styles.locationRight}>
                      <Text style={styles.dateLabel}>Fecha y hora</Text>
                      <Text style={styles.dateValue}>
                        {serviceData.fechapasajero}
                      </Text>

                      {/* <TouchableOpacity
                        style={styles.mapButton}
                        onPress={() => {
                          const lat =
                            serviceData.destino === '4175' ||
                            serviceData.destino === null
                              ? -12.0249367
                              : parseFloat(destinoData?.wy || '-12.0249367');
                          const lng =
                            serviceData.destino === '4175' ||
                            serviceData.destino === null
                              ? -77.1169252
                              : parseFloat(destinoData?.wx || '-77.1169252');
                          openGoogleMaps(lat, lng);
                        }}
                      >
                        <MapPin size={20} color="#ffffffff" />
                      </TouchableOpacity>
                      <Text style={styles.mapText}>¿Cómo llegar?</Text> */}
                    </View>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Destino de viaje - Tipo Entrada */}
          {serviceData.tipo === 'I' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Destino de viaje</Text>

              {loadingDestino ? (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <ActivityIndicator size="large" color="#fff" />
                  <Text style={{ color: '#fff', marginTop: 10 }}>
                    Cargando destino...
                  </Text>
                </View>
              ) : destinoError ? (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Text
                    style={{
                      color: '#2b2b2bff',
                      textAlign: 'center',
                      marginBottom: 10,
                    }}
                  >
                    {destinoError}
                  </Text>
                </View>
              ) : (
                <View style={styles.locationContainer}>
                  <View style={styles.locationRow}>
                    <View style={styles.locationLeft}>
                      <Text style={styles.locationLabel}>Dirección</Text>
                      <Text style={styles.locationValue}>
                        {destinoData
                          ? destinoData.direccion
                          : 'Avenida Morales Duárez s/n'}
                      </Text>

                      <Text style={styles.locationLabel}>Distrito</Text>
                      <Text style={styles.locationValue}>
                        {destinoData
                          ? destinoData.distrito
                          : 'Provincia Constitucional del Callao'}
                      </Text>

                      <Text style={styles.locationLabel}>Ubicación</Text>
                      <Text style={styles.locationValue}>
                        {destinoData
                          ? `${destinoData.apellidos} ${
                              destinoData.nombres || ''
                            }`.trim()
                          : 'Aeropuerto Internacional Jorge Chávez'}
                      </Text>

                      <Text style={styles.locationLabel}>Referencia</Text>
                      <Text style={styles.locationValue}>
                        {destinoData?.referencia || '-'}
                      </Text>
                    </View>

                    <View style={styles.locationRight}>
                      <Text style={styles.dateLabel}>Fecha y hora</Text>
                      <Text style={styles.dateValue}>
                        {serviceData.fechaservicio}
                      </Text>

                      {/* <TouchableOpacity
                        style={styles.mapButton}
                        onPress={() => {
                          const lat =
                            serviceData.destino === '4175' ||
                            serviceData.destino === null
                              ? -12.0249367
                              : parseFloat(destinoData?.wy || '-12.0249367');
                          const lng =
                            serviceData.destino === '4175' ||
                            serviceData.destino === null
                              ? -77.1169252
                              : parseFloat(destinoData?.wx || '-77.1169252');
                          openGoogleMaps(lat, lng);
                        }}
                      >
                        <MapPin size={20} color="#ffffffff" />
                      </TouchableOpacity>
                      <Text style={styles.mapText}>¿Cómo llegar?</Text> */}
                    </View>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Destino de viaje - Tipo Salida */}
          {serviceData.tipo === 'S' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Destino de viaje</Text>

              <View style={styles.locationContainer}>
                <View style={styles.locationRow}>
                  <View style={styles.locationLeft}>
                    <Text style={styles.locationLabel}>Dirección</Text>
                    <Text style={styles.locationValue}>
                      {serviceData.direccion || '-'}
                    </Text>

                    <Text style={styles.locationLabel}>Distrito</Text>
                    <Text style={styles.locationValue}>
                      {serviceData.distrito || '-'}
                    </Text>

                    <Text style={styles.locationLabel}>Ubicación</Text>
                    <Text style={styles.locationValue}>-</Text>

                    <Text style={styles.locationLabel}>Referencia</Text>
                    <Text style={styles.locationValue}>
                      {serviceData.referencia || '-'}
                    </Text>
                  </View>

                  <View style={styles.locationRight}>
                    <Text style={styles.dateLabel}>Fecha y hora</Text>
                    <Text style={styles.dateValue}>
                      {serviceData.fechaservicio}
                    </Text>

                    {/* <TouchableOpacity
                      style={styles.mapButton}
                      onPress={() =>
                        openGoogleMaps(
                          parseFloat(serviceData.wy),
                          parseFloat(serviceData.wx),
                        )
                      }
                    >
                      <MapPin size={20} color="#ffffffff" />
                    </TouchableOpacity>
                    <Text style={styles.mapText}>¿Cómo llegar?</Text> */}
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Detalles de servicio */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Detalles de servicio</Text>

            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Tipo del servicio</Text>
                <Text style={styles.detailValue}>
                  {getTipoServicio(serviceData.tipo)}
                </Text>
              </View>

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Cantidad de pasajeros</Text>
                <Text style={styles.detailValue}>
                  {serviceData?.totalpax
                    ? actualizarPasajeros(
                        serviceData.codusuario,
                        serviceData.totalpax,
                      )
                    : '-'}
                </Text>
              </View>

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Orden de atención</Text>
                <Text style={styles.detailValue}>
                  {serviceData?.orden || '-'}
                </Text>
              </View>
            </View>

            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Unidad asignada</Text>
                <Text style={styles.detailValue}>
                  {serviceData?.unidad?.toUpperCase() || 'No asignada'}
                </Text>
              </View>

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Empresa</Text>
                <Text style={styles.detailValue}>
                  {serviceData?.empresa || '-'}
                </Text>
              </View>

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Proveedor</Text>
                <Text style={styles.detailValue}>
                  {getProveedor(serviceData.codusuario)}
                </Text>
              </View>
            </View>

            <Text style={styles.detailLabel}>
              Ubicación actual de la unidad asignada
            </Text>

            {/* 👇 USO DEL COMPONENTE SEPARADO */}
            <VehicleMap
              username={serviceData.codusuario}
              placa={serviceData.unidad || ''}
              vehicleName={serviceData.unidad || ''}
            />
          </View>

          {/* Opciones del servicio */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Opciones del servicio</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.buttonBlue,
                  { opacity: driverData?.telefono ? 1 : 0.3 },
                ]}
                onPress={makePhoneCall}
                disabled={!driverData?.telefono}
              >
                <Phone size={16} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.buttonBlueText}> Conductor</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.buttonRed}
                onPress={handleCancelPress}
              >
                <Text style={styles.buttonRedText}>Cancelar Servicio</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.buttonOrange,
                  !driverData && styles.buttonDisabled,
                ]}
                onPress={handleRatingPress}
                disabled={!driverData}
              >
                <Star size={16} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.buttonOrangeText}>Calificar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      <ImageModal
        visible={imageModalVisible}
        imageUri={driverData?.imagen || null}
        onClose={handleCloseModal}
      />

      <CancelModal
        visible={cancelModalVisible}
        loading={cancellingService}
        onConfirm={handleConfirmCancel}
        onCancel={handleCloseCancelModal}
      />

      <RatingModal
        visible={ratingModalVisible}
        loading={sendingRating}
        selectedRating={selectedRating}
        onRatingSelect={setSelectedRating}
        onConfirm={handleSendRating}
        onCancel={handleCloseRatingModal}
      />

      <ModalAlert
        isVisible={modalAlertVisible}
        onClose={() => setModalAlertVisible(false)}
        title={alertConfig.title}
        message={alertConfig.message}
        color={alertConfig.color}
      />
    </LinearGradient>
  );
};

export default ServicesDetailPassenger;
