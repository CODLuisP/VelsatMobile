import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Modal,
  Linking,
  Alert,
  Animated,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, MapPin, Phone, Star, X } from 'lucide-react-native';
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

import { Platform } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, Circle } from 'react-native-maps';
import { WebView } from 'react-native-webview';
import * as signalR from '@microsoft/signalr';
import { useAuthStore } from '../../store/authStore';
import { ImageModal } from './modals/ImageModal';
import { CancelModal } from './modals/CancelModal';
import { RatingModal } from './modals/RatingModal';

type ServicesDetailPassengerRouteProp = RouteProp<
  RootStackParamList,
  'ServicesDetailPassenger'
>;

interface VehicleData {
  deviceId: string;
  lastGPSTimestamp: number;
  lastValidLatitude: number;
  lastValidLongitude: number;
  lastValidHeading: number;
  lastValidSpeed: number;
  lastOdometerKM: number;
}

interface SignalRData {
  fechaActual: string;
  vehiculo: VehicleData;
}

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

  const AnimatedCircle = Animated.createAnimatedComponent(Circle);

  const RadarPulse = ({
    latitude,
    longitude,
    color,
    delay = 0,
  }: {
    latitude: number;
    longitude: number;
    color: string;
    delay?: number;
  }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const opacityAnim = useRef(new Animated.Value(0.7)).current;

    useEffect(() => {
      const timeout = setTimeout(() => {
        Animated.loop(
          Animated.parallel([
            Animated.timing(scaleAnim, {
              toValue: 50,
              duration: 3000,
              useNativeDriver: false,
            }),
            Animated.sequence([
              Animated.timing(opacityAnim, {
                toValue: 0.4,
                duration: 1500,
                useNativeDriver: false,
              }),
              Animated.timing(opacityAnim, {
                toValue: 0,
                duration: 1500,
                useNativeDriver: false,
              }),
            ]),
          ]),
        ).start();
      }, delay);

      return () => clearTimeout(timeout);
    }, []);

    // Interpolar para el color con opacidad
    const fillColor = opacityAnim.interpolate({
      inputRange: [0, 0.7],
      outputRange: [`${color}00`, `${color}B3`], // Transparente a 70% opacidad
    });

    return (
      <AnimatedCircle
        center={{ latitude, longitude }}
        radius={scaleAnim}
        fillColor={fillColor}
        strokeColor={color}
        strokeWidth={2}
      />
    );
  };

  const getLeafletHTML = () => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
            body { margin: 0; padding: 0; }
            #map { height: 100vh; width: 100vw; }
            .radar-pulse {
                position: absolute;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background-color: #4CAF50;
                animation: pulse 3s infinite;
            }
            @keyframes pulse {
                0% { transform: scale(0.2); opacity: 0.7; }
                100% { transform: scale(6); opacity: 0; }
            }
        </style>
    </head>
    <body>
        <div id="map"></div>
        <script>
            var map = L.map('map').setView([${vehicleLocation.latitude}, ${vehicleLocation.longitude}], 15);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '© OpenStreetMap'
            }).addTo(map);

            var carIcon = L.divIcon({
    html: '<div style="position: relative; width: 60px; height: 40px;"><div class="radar-pulse" style="position: absolute; top: 10px; left: 20px;"></div><img src="https://res.cloudinary.com/dyc4ik1ko/image/upload/v1759966615/Car_nkielr.png" style="width:60px;height:40px;position:relative;z-index:10;"/></div>',
    iconSize: [60, 60],
    iconAnchor: [30, 20],
    className: ''
});

            L.marker([${vehicleLocation.latitude}, ${vehicleLocation.longitude}], {icon: carIcon})
                .addTo(map)
                .bindPopup('<b>${serviceData.unidad}</b><br>Velocidad: ${vehicleLocation.speed} km/h');
        </script>
    </body>
    </html>
  `;
  };

  const renderVehicleMap = () => {
    if (Platform.OS === 'ios') {
      return (
        <View
          style={{
            height: 250,
            borderRadius: 10,
            overflow: 'hidden',
            marginTop: 10,
          }}
        >
          <MapView
            provider={PROVIDER_DEFAULT}
            style={{ flex: 1 }}
            region={{
              latitude: vehicleLocation.latitude,
              longitude: vehicleLocation.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            {/* Múltiples pulsos con delay */}
            <RadarPulse
              latitude={vehicleLocation.latitude}
              longitude={vehicleLocation.longitude}
              color="#4CAF50"
              delay={0}
            />
            <RadarPulse
              latitude={vehicleLocation.latitude}
              longitude={vehicleLocation.longitude}
              color="#4CAF50"
              delay={1000}
            />
            <RadarPulse
              latitude={vehicleLocation.latitude}
              longitude={vehicleLocation.longitude}
              color="#4CAF50"
              delay={2000}
            />

            <Marker
              coordinate={{
                latitude: vehicleLocation.latitude,
                longitude: vehicleLocation.longitude,
              }}
              title={serviceData.unidad.toUpperCase()}
              description={`Velocidad: ${vehicleLocation.speed} km/h`}
              tracksViewChanges={false}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <Image
                source={{
                  uri: 'https://res.cloudinary.com/dyc4ik1ko/image/upload/v1759966615/Car_nkielr.png',
                }}
                style={{ width: 60, height: 30 }}
                resizeMode="contain"
              />
            </Marker>
          </MapView>
        </View>
      );
    } else {
      return (
        <View
          style={{
            height: 250,
            borderRadius: 10,
            overflow: 'hidden',
            marginTop: 10,
          }}
        >
          <WebView
            source={{ html: getLeafletHTML() }}
            style={{ flex: 1 }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            nestedScrollEnabled={true} 
          />
        </View>
      );
    }
  };

  console.log('📥 Datos recibidos del servicio:', serviceData);

  // Función para obtener los datos del conductor
  const fetchDriverData = async () => {
    try {
      setLoadingDriver(true);
      console.log(
        '🔍 Obteniendo datos del conductor:',
        serviceData.codconductor,
      );

      const url = `https://velsat.pe:2087/api/Aplicativo/detalleConductor/${serviceData.codconductor}`;
      console.log('🌐 URL Conductor:', url);

      const response = await fetch(url);
      console.log('📡 Status de respuesta conductor:', response.status);

      const text = await response.text();
      console.log('📄 Respuesta conductor como texto:', text);

      // Verificar si hay mensaje de error
      if (text.includes('No se encontró') || text.includes('no encontrado')) {
        console.log('ℹ️ No se encontró información del conductor');
        setDriverData(null);
        return;
      }

      // Intentar parsear el JSON
      try {
        const data = JSON.parse(text);
        console.log('📦 Datos del conductor recibidos:', data);
        setDriverData(data);
      } catch (parseError) {
        console.error('❌ Error al parsear JSON del conductor:', parseError);
        setDriverData(null);
      }
    } catch (error) {
      console.error('❌ Error al obtener datos del conductor:', error);
      setDriverData(null);
    } finally {
      setLoadingDriver(false);
    }
  };

  // Función para obtener los datos del destino
  const fetchDestinoData = async (codcliente: string) => {
    try {
      setLoadingDestino(true);
      console.log('🔍 Obteniendo datos del destino:', codcliente);

      const url = `https://velsat.pe:2087/api/Aplicativo/detalleDestino/${codcliente}`;
      console.log('🌐 URL Destino:', url);

      const response = await fetch(url);
      console.log('📡 Status de respuesta destino:', response.status);

      const text = await response.text();
      console.log('📄 Respuesta destino como texto:', text);

      // Verificar si hay mensaje de error
      if (text.includes('No se encontró') || text.includes('no encontrado')) {
        console.log('ℹ️ No se encontró información del destino');
        setDestinoData(null);
        return;
      }

      // Intentar parsear el JSON
      try {
        const data = JSON.parse(text);
        console.log('📦 Datos del destino recibidos:', data);
        // La API devuelve un array, tomamos el primer elemento
        if (data && data.length > 0) {
          setDestinoData(data[0]);
        } else {
          setDestinoData(null);
        }
      } catch (parseError) {
        console.error('❌ Error al parsear JSON del destino:', parseError);
        setDestinoData(null);
      }
    } catch (error) {
      console.error('❌ Error al obtener datos del destino:', error);
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
      console.log('⚠️ No hay código de conductor');
      setLoadingDriver(false);
    }

    // Verificar si necesitamos obtener datos del destino
    // Para tipo "I": obtener destino si no es 4175 o null
    if (
      serviceData.tipo === 'I' &&
      serviceData.destino &&
      serviceData.destino !== '4175'
    ) {
      fetchDestinoData(serviceData.destino);
    }

    // Para tipo "S": obtener lugar de recojo si no es 4175 o null
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

  // Función para obtener el proveedor
  const getProveedor = (codusuario: string) => {
    switch (codusuario) {
      case 'cgacela':
        return 'Empresa Gacela';
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

  // Función para renderizar las estrellas de calificación
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

  // Función para abrir el modal de cancelación
  const handleCancelPress = () => {
    setCancelModalVisible(true);
  };

  // Función para cerrar el modal de cancelación
  const handleCloseCancelModal = () => {
    setCancelModalVisible(false);
  };

  // Función para cancelar el servicio
  const handleConfirmCancel = async () => {
    try {
      setCancellingService(true);
      console.log('🚫 Cancelando servicio...');

      const url = 'https://velsat.pe:2087/api/Aplicativo/cancelarServicio';
      console.log('🌐 URL:', url);

      const requestBody = {
        codservicio: serviceData.codservicio,
        codpedido: serviceData.codpedido,
        codusuario: serviceData.codusuario,
        codcliente: serviceData.codcliente,
        empresa: serviceData.empresa,
        numero: serviceData.numero,
        fechaservicio: serviceData.fechaservicio,
        tipo: getTipoServicio(serviceData.tipo),
      };

      console.log('📦 Body de la petición:', requestBody);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📡 Status de respuesta:', response.status);

      const text = await response.text();
      console.log('📄 Respuesta:', text);

      if (response.ok) {
        console.log('✅ Servicio cancelado exitosamente');
        // Cerrar el modal
        setCancelModalVisible(false);
        // Opcional: Mostrar mensaje de éxito o regresar a la pantalla anterior
        navigation.goBack();
      } else {
        console.error('❌ Error al cancelar el servicio:', text);
        // Mostrar mensaje de error al usuario
      }
    } catch (error) {
      console.error('❌ Error en la petición de cancelación:', error);
    } finally {
      setCancellingService(false);
    }
  };

  // Abrir modal de calificación
  const handleRatingPress = () => {
    setRatingModalVisible(true);
    setSelectedRating(0);
  };

  // Cerrar modal de calificación
  const handleCloseRatingModal = () => {
    setRatingModalVisible(false);
    setSelectedRating(0);
  };

  // Enviar calificación
  const handleSendRating = async () => {
    if (selectedRating === 0) {
      console.log('⚠️ Debe seleccionar una calificación');
      return;
    }

    try {
      setSendingRating(true);
      console.log('⭐ Enviando calificación...');

      const url = `https://velsat.pe:2087/api/Aplicativo/enviarCalificacion?valor=${selectedRating}&codtaxi=${serviceData.codconductor}`;
      console.log('🌐 URL:', url);

      const response = await fetch(url, {
        method: 'POST',
      });

      console.log('📡 Status:', response.status);
      const text = await response.text();
      console.log('📄 Respuesta:', text);

      if (response.ok) {
        console.log('✅ Calificación enviada exitosamente');
        setRatingModalVisible(false);
        // Opcional: Mostrar mensaje de éxito
      }
    } catch (error) {
      console.error('❌ Error al enviar calificación:', error);
    } finally {
      setSendingRating(false);
    }
  };

  const makePhoneCall = (): void => {
    if (!driverData?.telefono) {
      console.log('⚠️ No hay teléfono disponible');
      Alert.alert(
        'Teléfono no disponible',
        'No hay un número de teléfono registrado para este conductor.',
        [{ text: 'Entendido' }],
      );
      return;
    }

    const phoneNumber: string = driverData.telefono;
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

  const topSpace = insets.top + 5;

  return (
    <View style={[styles.container, { paddingBottom: bottomSpace-2 }]}>
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
            ) : (
              <View style={styles.driverContainer}>
                <TouchableOpacity
                  style={styles.driverAvatar}
                  onPress={handleImagePress}
                  activeOpacity={0.7}
                >
                  {driverData?.imagen ? (
                    <Image
                      source={{ uri: driverData.imagen }}
                      style={styles.avatarPlaceholder}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.avatarPlaceholder} />
                  )}
                </TouchableOpacity>

                <View style={styles.driverInfo}>
                  <Text style={styles.driverLabel}>Conductor</Text>
                  <Text style={styles.driverValue}>
                    {driverData
                      ? `${driverData.apellidos.trim()} ${driverData.nombres.trim()}`.trim() ||
                        'No disponible'
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

                    <TouchableOpacity
                      style={styles.mapButton}
                      onPress={() =>
                        openGoogleMaps(
                          parseFloat(serviceData.wy),
                          parseFloat(serviceData.wx),
                        )
                      }
                    >
                      <MapPin size={20} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.mapText}>¿Cómo llegar?</Text>
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
                  <ActivityIndicator size="large" color="#fff" />
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

                      <TouchableOpacity
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
                        <MapPin size={20} color="#000" />
                      </TouchableOpacity>
                      <Text style={styles.mapText}>¿Cómo llegar?</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Destino de viaje */}
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

                      <TouchableOpacity
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
                        <MapPin size={20} color="#000" />
                      </TouchableOpacity>
                      <Text style={styles.mapText}>¿Cómo llegar?</Text>
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

                    <TouchableOpacity
                      style={styles.mapButton}
                      onPress={() =>
                        openGoogleMaps(
                          parseFloat(serviceData.wy),
                          parseFloat(serviceData.wx),
                        )
                      }
                    >
                      <MapPin size={20} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.mapText}>¿Cómo llegar?</Text>
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
                  {serviceData?.totalpax || '-'}
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
                  {serviceData?.unidad.toUpperCase() || 'No asignada'}
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
            {renderVehicleMap()}
          </View>

          {/* Opciones del servicio */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Opciones del servicio</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.buttonBlue,
                  { opacity: driverData?.telefono ? 1 : 0.5 },
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
                <X size={16} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.buttonRedText}>Cancelar Servicio</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.buttonOrange}
                onPress={handleRatingPress}
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


    </View>
  );
};

export default ServicesDetailPassenger;
