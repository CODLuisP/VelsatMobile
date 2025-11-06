import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  getBottomSpace,
  useNavigationMode,
} from '../../../hooks/useNavigationMode';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { WebView } from 'react-native-webview';
import { Text } from '../../../components/ScaledComponents';

interface MarkerData {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  description: string;
  isOrderZero: boolean; // ← Agregar esta propiedad
  orden: number;
}

interface ModalRouteServiceProps {
  visible: boolean;
  onClose: () => void;
  passengers: Array<{
    apellidos: string;
    codpedido: string;
    orden: string;
    wx: string;
    wy: string;
  }>;
  tipo: string;
}

const ModalRouteService: React.FC<ModalRouteServiceProps> = ({
  visible,
  onClose,
  passengers: initialPassengers,
  tipo,
}) => {
  const insets = useSafeAreaInsets();
  const navigationDetection = useNavigationMode();
  const bottomSpace = getBottomSpace(
    insets,
    navigationDetection.hasNavigationBar,
  );
  const topSpace = insets.top + 5;
  const mapRef = useRef<MapView>(null);

  const [markers, setMarkers] = useState<MarkerData[]>([]);

  useEffect(() => {
    if (initialPassengers && initialPassengers.length > 0) {
      const mappedMarkers = initialPassengers
        .filter(p => p.wx && p.wy && p.wx !== '0' && p.wy !== '0')
        .map(p => {
          const orden = parseInt(p.orden);
          let title = '';

          if (orden === 0) {
            // Para orden 0, depende del tipo
            const lugarTexto =
              tipo === 'I' ? 'Destino de viaje' : 'Lugar de recojo';
            const estadoTexto = tipo === 'I' ? 'FIN' : 'INICIO';
            title = `${lugarTexto} - ${estadoTexto}`;
          } else {
            // Para orden diferente de 0, usar el número de orden
            title = `Pasajero ${orden}`;
          }

          return {
            id: p.codpedido,
            latitude: parseFloat(p.wy),
            longitude: parseFloat(p.wx),
            title: title,
            description: p.apellidos,
            isOrderZero: p.orden === '0',
            orden: orden,
          };
        });

      setMarkers(mappedMarkers);
    }
  }, [initialPassengers, tipo]); // ← Agregar 'tipo' como dependencia

  // Ajustar el mapa para mostrar todos los marcadores (iOS)
  useEffect(() => {
    if (Platform.OS === 'ios' && markers.length > 0 && mapRef.current) {
      // Esperar un momento para que el mapa se renderice
      setTimeout(() => {
        const coordinates = markers.map(marker => ({
          latitude: marker.latitude,
          longitude: marker.longitude,
        }));

        mapRef.current?.fitToCoordinates(coordinates, {
          edgePadding: {
            top: 100,
            right: 50,
            bottom: 100,
            left: 50,
          },
          animated: true,
        });
      }, 500);
    }
  }, [markers]);

  // HTML para Leaflet en Android
  const leafletHTML = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <style>
      body, html {
        margin: 0;
        padding: 0;
        height: 100%;
        width: 100%;
      }
      #map {
        height: 100%;
        width: 100%;
      }
      .custom-marker {
        position: relative;
        width: 32px;
        height: 40px;
      }
      .marker-pin {
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        background: #00C853;
        position: absolute;
        transform: rotate(-45deg);
        left: 50%;
        top: 50%;
        margin: -16px 0 0 -16px;
        border: 2px solid white;
        box-shadow: 0 3px 10px rgba(0,0,0,0.3);
      }
      .marker-pin.order-zero {
        background: #e41d1dff;
      }
      .marker-pin.order-zero-blue {
        background: #0051ffff;
      }
      .marker-number {
        position: absolute;
        top: 8px;
        left: 50%;
        transform: translateX(-30%);
        color: white;
        font-weight: 900;
        font-size: 18px;
        z-index: 10;
        text-shadow: 0 1px 3px rgba(0,0,0,0.4);
      }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script>
      var map = L.map('map').setView([-7.1639, -78.5126], 13);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      var markers = ${JSON.stringify(markers)};
      var tipo = "${tipo}";
      var bounds = [];

      markers.forEach(function(marker) {
        var pinClass = 'marker-pin';
        if (marker.isOrderZero) {
          pinClass = tipo === 'I' ? 'marker-pin order-zero' : 'marker-pin order-zero-blue';
        }
        
        var markerNumberHtml = marker.isOrderZero ? '' : '<div class="marker-number">' + marker.orden + '</div>';
        
        var icon = L.divIcon({
          className: 'custom-marker',
          html: '<div class="' + pinClass + '"></div>' + markerNumberHtml,
          iconSize: [32, 40],
          iconAnchor: [16, 40],
          popupAnchor: [0, -40]
        });

        var leafletMarker = L.marker([marker.latitude, marker.longitude], {
          icon: icon
        }).addTo(map);

        leafletMarker.bindPopup('<b>' + marker.title + '</b><br>' + marker.description);
        
        bounds.push([marker.latitude, marker.longitude]);
      });

      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    </script>
  </body>
  </html>
`;
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { paddingTop: topSpace - 35 }]}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>Ruta de Servicio</Text>
              <Text style={styles.modalSubtitle}>
                {markers.length} puntos de parada
              </Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.contentContainer}>
            {Platform.OS === 'ios' ? (
              // Mapa nativo para iOS
              <MapView
                ref={mapRef}
                provider={PROVIDER_DEFAULT}
                style={styles.map}
                initialRegion={{
                  latitude: markers.length > 0 ? markers[0].latitude : -7.1639,
                  longitude:
                    markers.length > 0 ? markers[0].longitude : -78.5126,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
                }}
                showsUserLocation={true}
                showsMyLocationButton={true}
                showsCompass={true}
                showsScale={true}
              >
                {markers.map(marker => (
                  <Marker
                    key={marker.id}
                    coordinate={{
                      latitude: marker.latitude,
                      longitude: marker.longitude,
                    }}
                    title={marker.title}
                    description={marker.description}
                  >
                    <View style={styles.markerContainer}>
                      <View
                        style={[
                          styles.markerBadge,
                          marker.isOrderZero && {
                            backgroundColor:
                              tipo === 'I' ? '#e41d1dff' : '#0051ffff',
                          },
                        ]}
                      >
                        {!marker.isOrderZero && (
                          <Text style={styles.markerText}>{marker.orden}</Text>
                        )}
                      </View>
                      <View
                        style={[
                          styles.markerArrow,
                          marker.isOrderZero && {
                            borderTopColor:
                              tipo === 'I' ? '#e41d1dff' : '#0051ffff',
                          },
                        ]}
                      />
                    </View>
                  </Marker>
                ))}
              </MapView>
            ) : (
              // Leaflet para Android
              <WebView
                source={{ html: leafletHTML }}
                style={styles.map}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
              />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalContent: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#666',
    fontWeight: '400',
  },
  closeButton: {
    padding: 5,
    marginTop: -5,
  },
  contentContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  markerContainer: {
    alignItems: 'center',
  },
  markerBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f77f00',
    justifyContent: 'center',
    alignItems: 'center',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  markerText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  markerArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#f77f00',
    marginTop: -3,
  },
});

export default ModalRouteService;
