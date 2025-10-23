import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getBottomSpace, useNavigationMode } from '../../../hooks/useNavigationMode';
import MapView, { Marker, PROVIDER_GOOGLE, PROVIDER_DEFAULT } from 'react-native-maps';

interface ModalChangeOrderProps {
  visible: boolean;
  onClose: () => void;
}

// Marcadores GPS aleatorios en Cajamarca, Perú
const randomMarkers = [
  {
    id: '1',
    latitude: -7.1639,
    longitude: -78.5126,
    title: 'Punto 1',
    description: 'Luis Castrejón Cabrera',
  },
  {
    id: '2',
    latitude: -7.1580,
    longitude: -78.5180,
    title: 'Punto 2',
    description: 'Diego Guevara Campos',
  },
  {
    id: '3',
    latitude: -7.1620,
    longitude: -78.5080,
    title: 'Punto 3',
    description: 'Lucía Ramírez Martínez',
  },
  {
    id: '4',
    latitude: -7.1700,
    longitude: -78.5150,
    title: 'Punto 4',
    description: 'Renato Salazar Quispe',
  },
  {
    id: '5',
    latitude: -7.1560,
    longitude: -78.5100,
    title: 'Punto 5',
    description: 'Ana Torres Silva',
  },
];

const ModalRouteService: React.FC<ModalChangeOrderProps> = ({ visible, onClose }) => {
  const insets = useSafeAreaInsets();
  const navigationDetection = useNavigationMode();
  const bottomSpace = getBottomSpace(
    insets,
    navigationDetection.hasNavigationBar,
  );
  const topSpace = insets.top + 5;
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    if (visible && mapRef.current) {
      // Ajustar la vista del mapa para mostrar todos los marcadores
      setTimeout(() => {
        mapRef.current?.fitToCoordinates(
          randomMarkers.map(marker => ({
            latitude: marker.latitude,
            longitude: marker.longitude,
          })),
          {
            edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
            animated: true,
          }
        );
      }, 500);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { paddingTop: topSpace - 35 }]}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>Ruta de Servicio</Text>
              <Text style={styles.modalSubtitle}>
                {randomMarkers.length} puntos de parada
              </Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <X size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.contentContainer}>
            <MapView
              ref={mapRef}
              provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
              style={styles.map}
              initialRegion={{
                latitude: -7.1639,
                longitude: -78.5126,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }}
              showsUserLocation={true}
              showsMyLocationButton={true}
              showsCompass={true}
              showsScale={true}
            >
              {randomMarkers.map((marker, index) => (
                <Marker
                  key={marker.id}
                  coordinate={{
                    latitude: marker.latitude,
                    longitude: marker.longitude,
                  }}
                  title={marker.title}
                  description={marker.description}
                  pinColor={index === 0 ? '#00C853' : index === randomMarkers.length - 1 ? '#FF3D00' : '#007AFF'}
                >
                  <View style={styles.markerContainer}>
                    <View style={[
                      styles.markerBadge,
                      index === 0 && styles.markerStart,
                      index === randomMarkers.length - 1 && styles.markerEnd,
                    ]}>
                      <Text style={styles.markerText}>{index + 1}</Text>
                    </View>
                    <View style={styles.markerArrow} />
                  </View>
                </Marker>
              ))}
            </MapView>

            {/* Leyenda */}
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#00C853' }]} />
                <Text style={styles.legendText}>Inicio</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#007AFF' }]} />
                <Text style={styles.legendText}>Paradas</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#FF3D00' }]} />
                <Text style={styles.legendText}>Final</Text>
              </View>
            </View>
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
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
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
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  markerStart: {
    backgroundColor: '#00C853',
  },
  markerEnd: {
    backgroundColor: '#FF3D00',
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
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FFFFFF',
    marginTop: -3,
  },
  legend: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
});

export default ModalRouteService;