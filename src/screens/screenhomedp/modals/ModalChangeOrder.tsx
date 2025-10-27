import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Animated,
  PanResponder,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { X, GripVertical } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  getBottomSpace,
  useNavigationMode,
} from '../../../hooks/useNavigationMode';
import axios from 'axios';

// Habilitar LayoutAnimation en Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Passenger {
  id: string;
  name: string;
  order: number;
}

interface ModalChangeOrderProps {
  visible: boolean;
  onClose: () => void;
  passengers: Array<{
    apellidos: string;
    codpedido: string;
    orden: string;
  }>;
  onSaveOrder?: (passengers: Passenger[]) => void;
  onShowAlert: (title: string, message: string, color?: string) => void;
}

const ModalChangeOrder: React.FC<ModalChangeOrderProps> = ({
  visible,
  onClose,
  passengers: initialPassengers,
  onSaveOrder,
  onShowAlert
}) => {
  const insets = useSafeAreaInsets();
  const navigationDetection = useNavigationMode();
  const bottomSpace = getBottomSpace(
    insets,
    navigationDetection.hasNavigationBar,
  );
  const topSpace = insets.top + 5;

  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  useEffect(() => {
    if (initialPassengers && initialPassengers.length > 0) {
      const mappedPassengers = initialPassengers
        .map(p => ({
          id: p.codpedido,
          name: p.apellidos,
          order: parseInt(p.orden),
        }))
        .sort((a, b) => a.order - b.order);

      setPassengers(mappedPassengers);
      console.log(
        '🔄 Pasajeros recibidos para cambiar orden (ordenados):',
        mappedPassengers,
      );
    }
  }, [initialPassengers]);

const handleSave = async () => {
  try {
    console.log('💾 Guardando nuevo orden...');
    
    const cambios = passengers.map((passenger, index) => ({
      orden: (index + 1).toString(),
      codpedido: parseInt(passenger.id),
    }));

    console.log('📤 Enviando cambios:', cambios);

    const response = await axios.put(
      'https://velsat.pe:2087/api/Aplicativo/cambiarOrdenBatch',
      cambios
    );

    console.log('✅ Orden actualizado correctamente:', response.data);
    onShowAlert('Éxito', 'Orden actualizado correctamente', '#0b692eff');

    onClose(); // Cerrar modal después de guardar
  } catch (error: any) {
    console.error('❌ Error al guardar orden:', error);
    console.error('Response data:', error.response?.data);

    onShowAlert(
          'Error', 
          error.response?.data?.message || 'No se pudo actualizar el orden. Intenta nuevamente.', '#b10202ff'
        );
  }
};

  const movePassenger = (fromIndex: number, toIndex: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const newPassengers = [...passengers];
    const [removed] = newPassengers.splice(fromIndex, 1);
    newPassengers.splice(toIndex, 0, removed);
    setPassengers(newPassengers);
  };

  const PassengerItem = ({
    passenger,
    index,
  }: {
    passenger: Passenger;
    index: number;
  }) => {
    const pan = React.useRef(new Animated.ValueXY()).current;
    const [itemHeight] = useState(80);

    const panResponder = React.useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          setDraggingIndex(index);
          pan.setOffset({
            x: 0,
            y: 0,
          });
        },
        onPanResponderMove: (_, gesture) => {
          pan.setValue({ x: 0, y: gesture.dy });
        },
        onPanResponderRelease: (_, gesture) => {
          const moveY = gesture.dy;
          const newIndex = Math.round(index + moveY / itemHeight);
          const clampedIndex = Math.max(
            0,
            Math.min(passengers.length - 1, newIndex),
          );

          if (clampedIndex !== index) {
            movePassenger(index, clampedIndex);
          }

          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start(() => {
            pan.flattenOffset();
            setDraggingIndex(null);
          });
        },
      }),
    ).current;

    const isDragging = draggingIndex === index;

    return (
      <Animated.View
        style={[
          styles.passengerCard,
          isDragging && styles.passengerCardDragging,
          {
            transform: [{ translateY: pan.y }],
            zIndex: isDragging ? 1000 : 1,
          },
        ]}
        {...panResponder.panHandlers}
      >
        <View style={styles.orderBadge}>
          <Text style={styles.orderText}>{index + 1}</Text>
        </View>

        <Text style={styles.passengerName}>{passenger.name}</Text>

        <View style={styles.dragHandle}>
          <GripVertical size={24} color={isDragging ? '#007AFF' : '#999'} />
        </View>
      </Animated.View>
    );
  };

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
              <Text style={styles.modalTitle}>Cambiar Orden</Text>
              <Text style={styles.modalSubtitle}>
                Mantén presionado y arrastra
              </Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.contentContainer}>
            <View style={styles.listContainer}>
              {passengers.map((passenger, index) => (
                <PassengerItem
                  key={passenger.id}
                  passenger={passenger}
                  index={index}
                />
              ))}
            </View>
          </View>

          <View style={[styles.footer, { paddingBottom: bottomSpace + 20 }]}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Guardar Orden</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  modalContent: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
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
    padding: 20,
  },
  listContainer: {
    flex: 1,
  },
  passengerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  passengerCardDragging: {
    backgroundColor: '#F0F7FF',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
    opacity: 0.95,
  },
  orderBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  orderText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  passengerName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
    lineHeight: 22,
  },
  dragHandle: {
    padding: 8,
    marginLeft: 8,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ModalChangeOrder;
