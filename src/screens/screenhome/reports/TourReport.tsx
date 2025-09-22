import React, { useEffect, useState } from 'react';
import { Text, View, TouchableOpacity, Platform, PermissionsAndroid } from 'react-native';
import { ChevronLeft, Calendar, ChevronRight } from 'lucide-react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import MapView, { PROVIDER_DEFAULT } from 'react-native-maps';
import { WebView } from 'react-native-webview';
import { styles } from '../../../styles/tourreport';
import { RootStackParamList } from '../../../../App';

const TourReport = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [sidebarCompact, setSidebarCompact] = useState(false);

  // Coordenadas de ejemplo para Lima, Perú
  const latitude = -12.0464;
  const longitude = -77.0428;

  // ✅ FUNCIÓN PARA PEDIR PERMISOS DE UBICACIÓN
  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Permiso de Ubicación',
            message: 'Esta app necesita acceso a tu ubicación para mostrar el mapa',
            buttonNeutral: 'Preguntar después',
            buttonNegative: 'Cancelar',
            buttonPositive: 'OK',
          }
        );
        
        setHasLocationPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
      } catch (err) {
        console.warn(err);
        setHasLocationPermission(false);
      }
    } else {
      // iOS usa Apple Maps nativo
      setHasLocationPermission(true);
    }
  };

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
    setSidebarCompact(false); // Reset compact mode when toggling
  };

  const toggleSidebarCompact = () => {
    setSidebarCompact(!sidebarCompact);
  };

  // ✅ HTML CON LEAFLET PARA ANDROID
  const leafletHTML = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <title>Reporte de Recorrido</title>
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
        </style>
    </head>
    <body>
        <div id="map"></div>
        <script>
            // Inicializar el mapa
            var map = L.map('map', {
                zoomControl: true,
                scrollWheelZoom: true,
                doubleClickZoom: true,
                touchZoom: true
            }).setView([${latitude}, ${longitude}], 13);

            // Agregar capa de OpenStreetMap
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 19
            }).addTo(map);

            // Agregar ubicación del usuario si hay permisos
            ${hasLocationPermission ? `
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(position) {
                    var userLat = position.coords.latitude;
                    var userLng = position.coords.longitude;
                    
                    var userIcon = L.divIcon({
                        html: '<div style="background-color: #3b82f6; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(59,130,246,0.5);"></div>',
                        iconSize: [16, 16],
                        iconAnchor: [8, 8],
                        className: 'user-location-icon'
                    });
                    
                    L.marker([userLat, userLng], {icon: userIcon})
                        .addTo(map)
                        .bindPopup('<div style="text-align: center;"><strong>Tu ubicación</strong></div>');
                }, function(error) {
                    console.log('Error obteniendo ubicación:', error);
                });
            }` : ''}

            // Evitar scroll en el contenedor padre
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

  // ✅ FUNCIÓN PARA RENDERIZAR EL MAPA SEGÚN LA PLATAFORMA
  const renderMap = () => {
    if (Platform.OS === 'ios') {
      // ✅ APPLE MAPS PARA iOS
      return (
        <MapView
          provider={PROVIDER_DEFAULT} // Apple Maps
          style={styles.map}
          initialRegion={{
            latitude: latitude,
            longitude: longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          showsUserLocation={hasLocationPermission}
          showsMyLocationButton={hasLocationPermission}
        />
      );
    } else {
      // ✅ LEAFLET PARA ANDROID
      return (
        <WebView
          source={{ html: leafletHTML }}
          style={styles.map}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
          mixedContentMode="compatibility"
          geolocationEnabled={hasLocationPermission}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.warn('WebView error: ', nativeEvent);
          }}
        />
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <ChevronLeft size={26} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Reporte de Recorrido</Text>
            <Text style={styles.headerSubtitle}>Unidad M2L-777</Text>
            <View style={styles.headerDateContainer}>
              <Calendar size={16} color="#fff" />
              <Text style={styles.headerDate}>
                18/09/2025 00:00 - 18/09/2025 23:59
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Contenido con Mapa y Sidebar */}
      <View style={styles.content}>
        {/* Container del Mapa - Ahora siempre ocupa todo el espacio */}
        <View style={styles.mapContainer}>
          {renderMap()}
        </View>

        {/* Botón para mostrar sidebar cuando está oculto */}
        {!sidebarVisible && (
          <TouchableOpacity 
            style={styles.showSidebarButton} 
            onPress={toggleSidebar}
          >
            <ChevronRight size={20} color="#fff" />
          </TouchableOpacity>
        )}

        {/* Sidebar - Solo se muestra cuando sidebarVisible es true */}
        {sidebarVisible && (
          <View style={[
            styles.sidebar, 
            sidebarCompact && styles.sidebarCompact
          ]}>
            <View style={[
              styles.sidebarHeader,
              sidebarCompact && styles.sidebarCompactHeader
            ]}>
              {!sidebarCompact ? (
                <>
                  <View style={styles.sidebarHeaderContent}>
                    <Text style={styles.sidebarTitle}>LEYENDA</Text>
                    <View style={styles.sidebarHeaderIcon}>
                      {/* Aquí puedes agregar el ícono que aparece en la imagen */}
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row' }}>
               
                    <TouchableOpacity 
                      style={styles.hideSidebarButton} 
                      onPress={toggleSidebar}
                    >
                      <ChevronLeft size={20} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  <TouchableOpacity 
                    style={{ flex: 1 }} 
                    onPress={toggleSidebarCompact}
                  >
                    <Text style={styles.sidebarCompactTitle}>L</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.hideSidebarButton} 
                    onPress={toggleSidebar}
                  >
                    <ChevronLeft size={16} color="#fff" />
                  </TouchableOpacity>
                </>
              )}
            </View>
            
            {!sidebarCompact && (
              <View style={styles.sidebarContent}>
                {/* Información de la Unidad */}
                <View style={styles.sidebarSection}>
                  <Text style={styles.sidebarSectionTitle}>UNIDAD</Text>
                  <Text style={styles.sidebarText}>64-808763</Text>
                </View>

                {/* Rango de Fechas */}
                <View style={styles.sidebarSection}>
                  <Text style={styles.sidebarSectionTitle}>RANGO FECHAS</Text>
                  <Text style={styles.sidebarText}>18/09/2025 00:00 - 18/09/2025 23:59</Text>
                </View>

                {/* Rango de Velocidad */}
                <View style={styles.sidebarSection}>
                  <Text style={styles.sidebarSectionTitle}>RANGO VELOCIDAD</Text>
                  
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} />
                    <Text style={styles.legendText}>0 km/h</Text>
                  </View>
                  
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#22c55e' }]} />
                    <Text style={styles.legendText}>1 - 10 km/h</Text>
                  </View>
                  
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#eab308' }]} />
                    <Text style={styles.legendText}>11 - 30 km/h</Text>
                  </View>
                  
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#3b82f6' }]} />
                    <Text style={styles.legendText}> 60 km/h</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

export default TourReport;