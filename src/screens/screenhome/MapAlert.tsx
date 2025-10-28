import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  Image,
  Animated,
} from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import {
  ChevronLeft,
  Battery,
  Zap,
  Power,
  AlertTriangle,
} from 'lucide-react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { WebView } from 'react-native-webview';
import {
  NavigationProp,
  useNavigation,
  RouteProp,
  useRoute,
} from '@react-navigation/native';
import { RootStackParamList } from '../../../App';
import { styles } from '../../styles/mapalert';
import Svg, { Circle } from 'react-native-svg';

import NavigationBarColor from 'react-native-navigation-bar-color';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  getBottomSpace,
  useNavigationMode,
} from '../../hooks/useNavigationMode';
import LinearGradient from 'react-native-linear-gradient';

interface MapAlertRouteParams {
  notificationData: {
    id: number;
    type: string;
    title: string;
    device: string;
    timestamp: string;
    iconName: string;
    speed: number;
    latitude: number;
    longitude: number;
    statusCode: number;
  };
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// Componente de radar animado con SVG
const RadarPulse = ({ color, delay = 0 }: { color: string; delay?: number }) => {
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
        ])
      ).start();
    }, delay);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <AnimatedCircle
      cx="60"
      cy="60"
      r={scaleAnim}
      fill={color}
      opacity={opacityAnim}
    />
  );
};

// Componente de marcador personalizado con radar para iOS
const CustomMarker = ({ color }: { color: string }) => {
  return (
    <View
      style={{
        width: 120, 
        height: 120,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* SVG con los radares */}
      <Svg
        height="120"  
        width="120"   
        style={{
          position: 'absolute',
        }}
      >
        <RadarPulse color={color} delay={0} />
        <RadarPulse color={color} delay={1000} />
        <RadarPulse color={color} delay={2000} />
      </Svg>
      
      {/* Imagen del carro encima */}
      <Image
        source={{
          uri: 'https://res.cloudinary.com/dyc4ik1ko/image/upload/v1759966615/Car_nkielr.png',
        }}
        style={{
          width: 70,
          height: 45,
          zIndex: 10,
        }}
        resizeMode="contain"
      />
    </View>
  );
};

const MapAlert = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route =
    useRoute<RouteProp<{ params: MapAlertRouteParams }, 'params'>>();
  const [mapType, setMapType] = useState<'standard' | 'satellite' | 'hybrid'>('standard');

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

  const notificationData = route.params?.notificationData;

  // Usar los datos dinámicos de los parámetros
  const latitude = notificationData?.latitude ;
  const longitude = notificationData?.longitude ;
  const speed = notificationData?.speed || 0;
  const statusCode = notificationData?.statusCode || 0;

  const handleGoBack = () => {
    navigation.goBack();
  };

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

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'battery':
        return '#fb8500';
      case 'motor':
        return '#10b981';
      case 'motor-off':
        return '#6b7280';
      case 'panic':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const IconComponent = notificationData
    ? getIcon(notificationData.iconName)
    : AlertTriangle;
  const alertColor = notificationData
    ? getAlertColor(notificationData.type)
    : '#6b7280';

  // Función para obtener el tipo de capa de Leaflet según el tipo de mapa
  const getLeafletTileLayer = (type: 'standard' | 'satellite' | 'hybrid') => {
    switch (type) {
      case 'satellite':
        return {
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          attribution: '&copy; Esri'
        };
      case 'hybrid':
        return {
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          attribution: '&copy; Esri',
          overlay: true,
          overlayUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          overlayAttribution: '&copy; OpenStreetMap'
        };
      default: // 'standard'
        return {
          url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        };
    }
  };

  const tileConfig = getLeafletTileLayer(mapType);

  const leafletHTML = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <title>Mapa de Alerta</title>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
            integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
            crossorigin=""/>
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
            integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
            crossorigin=""></script>
        <style>
            body { 
                margin: 0; 
                padding: 0; 
                overflow: hidden;
            }
            #map { 
                height: 100vh; 
                width: 100vw;
                z-index: 0;
            }
            .radar-pulse {
                position: absolute;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                animation: pulse 3s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
                pointer-events: none;
            }
            @keyframes pulse {
                0% {
                    transform: scale(0.2);
                    opacity: 0.7;
                }
                50% {
                    opacity: 0.4;
                }
                100% {
                    transform: scale(6);
                    opacity: 0;
                }
            }
        </style>
    </head>
    <body>
        <div id="map"></div>
        <script>
            var map = L.map('map', {
                zoomControl: true,
                scrollWheelZoom: true,
                doubleClickZoom: true,
                touchZoom: true
            }).setView([${latitude}, ${longitude}], 15);

            // Capa base
            var baseLayer = L.tileLayer('${tileConfig.url}', {
                attribution: '${tileConfig.attribution}',
                maxZoom: 19
            }).addTo(map);

            ${tileConfig.overlay ? `
            // Capa de etiquetas para el modo híbrido
            var overlayLayer = L.tileLayer('${tileConfig.overlayUrl}', {
                attribution: '${tileConfig.overlayAttribution}',
                maxZoom: 19,
                opacity: 0.5
            }).addTo(map);
            ` : ''}

            var carIcon = L.divIcon({
                html: \`
                    <div style="position: relative; width: 60px; height: 40px; display: flex; justify-content: center; align-items: center;">
                        <div class="radar-pulse" style="background-color: ${alertColor}; top: 10px; left: 20px;"></div>
                        <div class="radar-pulse" style="background-color: ${alertColor}; top: 10px; left: 20px; animation-delay: 1s;"></div>
                        <div class="radar-pulse" style="background-color: ${alertColor}; top: 10px; left: 20px; animation-delay: 2s;"></div>
                        <img src="https://res.cloudinary.com/dyc4ik1ko/image/upload/v1759966615/Car_nkielr.png" 
                             style="position: relative; z-index: 10; width: 60px; height: 40px;" />
                    </div>
                \`,
                iconSize: [60, 40],
                iconAnchor: [30, 40],
                popupAnchor: [0, -60],
                className: 'custom-car-icon'
            });

            var marker = L.marker([${latitude}, ${longitude}], {icon: carIcon}).addTo(map);
            
            marker.bindPopup(\`
                <div style="text-align: center; font-family: Arial, sans-serif;">
                    <h3 style="margin: 5px 0; color: ${alertColor};">${notificationData?.title || 'Alerta'}</h3>
                    <p style="margin: 3px 0;"><strong>Dispositivo:</strong> ${notificationData?.device || 'Sin información'}</p>
                    <p style="margin: 3px 0;"><strong>N° de alerta:</strong> ${notificationData?.id || 'N/A'}</p>
                    <p style="margin: 3px 0;"><strong>Velocidad:</strong> ${speed} km/h</p>
                    <p style="margin: 3px 0;"><strong>Código:</strong> ${statusCode}</p>
                    <p style="margin: 3px 0;"><strong>Coordenadas:</strong> ${latitude.toFixed(6)}, ${longitude.toFixed(6)}</p>
                    <p style="margin: 3px 0;"><strong>Fecha:</strong> ${notificationData?.timestamp || 'Sin fecha'}</p>
                </div>
            \`).openPopup();

            map.on('focus', function() { 
                map.scrollWheelZoom.enable(); 
            });
            map.on('blur', function() { 
                map.scrollWheelZoom.disable(); 
            });
        </script>
    </body>
    </html>
  `;

  const renderMap = () => {
    if (Platform.OS === 'ios') {
      return (
        <>
          <MapView
            provider={PROVIDER_DEFAULT}
            style={styles.map}
            mapType={mapType}
            initialRegion={{
              latitude: latitude,
              longitude: longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker
              coordinate={{
                latitude: latitude,
                longitude: longitude,
              }}
              title={notificationData?.title || 'Alerta'}
              description={`${notificationData?.device || 'Dispositivo'} - Velocidad: ${speed} km/h - Código: ${statusCode}`}
            >
              <CustomMarker color={alertColor} />
            </Marker>
          </MapView>
        </>
      );
    } else {
      return (
        <WebView
          key={mapType} // Forzar recarga del WebView cuando cambia el tipo de mapa
          source={{ html: leafletHTML }}
          style={styles.map}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
          mixedContentMode="compatibility"
          onError={syntheticEvent => {
            const { nativeEvent } = syntheticEvent;
          }}
        />
      );
    }
  };

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
          <Text style={styles.errorText}>
            No se encontraron datos de la alerta
          </Text>
        </View>
      </View>
    );
  }
  const topSpace = insets.top + 5;

  return (
    <LinearGradient
         colors={['#021e4bff', '#183890ff', '#032660ff']}
         style={[styles.container, { paddingBottom: bottomSpace - 2 }]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <View style={[styles.header, { paddingTop: topSpace + 10 }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <ChevronLeft size={26} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalle de Alerta</Text>
        </View>

        <View style={styles.headerAlertInfo}>
          <View style={styles.headerAlertRow}>
            <View
              style={[
                styles.headerIconContainer,
                { backgroundColor: alertColor },
              ]}
            >
              <IconComponent size={20} color="#fff" />
            </View>
            <View style={styles.headerAlertDetails}>
              <Text style={styles.headerAlertTitle}>
                {notificationData.title}
              </Text>
              <Text style={styles.headerAlertSubtitle}>
                {notificationData.device} 
              </Text>
              <Text style={styles.headerAlertTimestamp}>
                {notificationData.timestamp}
              </Text>
        
            </View>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.mapContainer}>{renderMap()}</View>

        {/* Controles para cambiar tipo de mapa - Ahora funciona en ambas plataformas */}
        <View style={styles.mapTypeSelector}>
          <TouchableOpacity
            style={[
              styles.mapTypeButton,
              mapType === 'standard' && styles.mapTypeButtonActive
            ]}
            onPress={() => setMapType('standard')}
          >
            <Text style={[
              styles.mapTypeButtonText,
              mapType === 'standard' && styles.mapTypeButtonTextActive
            ]}>
              Calles
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.mapTypeButton,
              mapType === 'satellite' && styles.mapTypeButtonActive
            ]}
            onPress={() => setMapType('satellite')}
          >
            <Text style={[
              styles.mapTypeButtonText,
              mapType === 'satellite' && styles.mapTypeButtonTextActive
            ]}>
              Satélite
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.mapTypeButton,
              mapType === 'hybrid' && styles.mapTypeButtonActive
            ]}
            onPress={() => setMapType('hybrid')}
          >
            <Text style={[
              styles.mapTypeButtonText,
              mapType === 'hybrid' && styles.mapTypeButtonTextActive
            ]}>
              Híbrido
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
};

export default MapAlert;