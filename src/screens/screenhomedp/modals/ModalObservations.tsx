import React, { useEffect, useState } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { X, User, MessageSquare, ChevronDown } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  getBottomSpace,
  useNavigationMode,
} from '../../../hooks/useNavigationMode';
import axios from 'axios';
import { Text, TextInput } from '../../../components/ScaledComponents';

interface Passenger {
  id: string;
  name: string;
  orden: string;
}

interface ModalObservationsProps {
  visible: boolean;
  onClose: () => void;
  passengers: Array<{
    apellidos: string;
    codpedido: string;
    orden: string;
  }>;
  onSubmit?: (passengerId: string, observation: string) => void;
  onShowAlert: (title: string, message: string, color?: string) => void;
}

const ModalObservations: React.FC<ModalObservationsProps> = ({
  visible,
  onClose,
  passengers: initialPassengers,
  onSubmit,
  onShowAlert,
}) => {
  const insets = useSafeAreaInsets();
  const navigationDetection = useNavigationMode();
  const bottomSpace = getBottomSpace(
    insets,
    navigationDetection.hasNavigationBar,
  );
  const topSpace = insets.top + 5;

  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [selectedPassenger, setSelectedPassenger] = useState<Passenger | null>(
    null,
  );
  const [observation, setObservation] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (initialPassengers && initialPassengers.length > 0) {
      const mappedPassengers = initialPassengers.map(p => ({
        id: p.codpedido,
        name: p.apellidos.toUpperCase(),
        orden: p.orden,
      }));
      setPassengers(mappedPassengers);
    }
  }, [initialPassengers]);

  const handleSubmit = async () => {
    if (selectedPassenger && observation.trim()) {
      try {
        const response = await axios.post(
          `https://do.velsat.pe:2053/api/Aplicativo/EnviarObservacion?codpedido=${selectedPassenger.id}`,
          `"${observation.trim()}"`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );

        onShowAlert(
          'Éxito',
          'La observación se envió correctamente',
          '#0b692eff',
        );

        setSelectedPassenger(null);
        setObservation('');
        onClose();
      } catch (error: any) {
        onShowAlert(
          'Error',
          error.response?.data?.message ||
            'No se pudo enviar la observación. Intenta nuevamente.',
          '#b10202ff',
        );
      }
    } else {
      // 🔥 Mostrar alerta si falta información
      onShowAlert(
        'Atención',
        'Por favor seleccione un pasajero e ingrese una observación',
      );
    }
  };

  const selectPassenger = (passenger: Passenger) => {
    setSelectedPassenger(passenger);
    setShowDropdown(false);
  };

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent={false}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        <View style={[styles.modalContent, { paddingTop: topSpace - 35 }]}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>Observaciones</Text>
              <Text style={styles.modalSubtitle}>
                Registra una observación del servicio
              </Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.contentContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Selector de Pasajero */}
            <View style={styles.section}>
              <View style={styles.labelContainer}>
                <User size={20} color="#007AFF" />
                <Text style={styles.label}>Seleccione un pasajero</Text>
              </View>

              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setShowDropdown(!showDropdown)}
              >
                <Text
                  style={[
                    styles.dropdownText,
                    !selectedPassenger && styles.dropdownPlaceholder,
                  ]}
                >
                  {selectedPassenger
                    ? `${selectedPassenger.name}`
                    : passengers.length > 0
                    ? 'Seleccione un pasajero'
                    : 'No hay pasajeros disponibles'}{' '}
                </Text>
                <ChevronDown
                  size={20}
                  color="#666"
                  style={[
                    styles.dropdownIcon,
                    showDropdown && styles.dropdownIconRotated,
                  ]}
                />
              </TouchableOpacity>

              {showDropdown && (
                <View style={styles.dropdownList}>
                  {passengers
                    .filter(passenger => passenger.orden !== '0')
                    .map(passenger => (
                      <TouchableOpacity
                        key={passenger.id}
                        style={[
                          styles.dropdownItem,
                          selectedPassenger?.id === passenger.id &&
                            styles.dropdownItemSelected,
                        ]}
                        onPress={() => selectPassenger(passenger)}
                      >
                        <User
                          size={18}
                          color={
                            selectedPassenger?.id === passenger.id
                              ? '#007AFF'
                              : '#666'
                          }
                        />
                        <Text
                          style={[
                            styles.dropdownItemText,
                            selectedPassenger?.id === passenger.id &&
                              styles.dropdownItemTextSelected,
                          ]}
                        >
                          {passenger.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                </View>
              )}
            </View>

            {/* Campo de Observación */}
            <View style={styles.section}>
              <View style={styles.labelContainer}>
                <MessageSquare size={20} color="#007AFF" />
                <Text style={styles.label}>Ingrese observación</Text>
              </View>

              <TextInput
                style={styles.textArea}
                placeholder="Ingrese observación ..."
                placeholderTextColor="#999"
                value={observation}
                onChangeText={setObservation}
                multiline
                numberOfLines={8}
                textAlignVertical="top"
              />

              <Text style={styles.charCount}>
                {observation.length} / 200 caracteres
              </Text>
            </View>
          </ScrollView>

          {/* Footer con botón */}
          <View style={[styles.footer, { paddingBottom: bottomSpace + 20 }]}>
            <TouchableOpacity
              style={[
                styles.submitButton,
                (!selectedPassenger || !observation.trim()) &&
                  styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!selectedPassenger || !observation.trim()}
            >
              <Text style={styles.submitButtonText}>Enviar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    padding: 20,
  },
  section: {
    marginBottom: 28,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
    padding: 16,
    minHeight: 56,
  },
  dropdownText: {
    fontSize: 14,
    color: '#1A1A1A',
    flex: 1,
  },
  dropdownPlaceholder: {
    color: '#999',
  },
  dropdownIcon: {
    marginLeft: 8,
  },
  dropdownIconRotated: {
    transform: [{ rotate: '180deg' }],
  },
  dropdownList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  dropdownItemSelected: {
    backgroundColor: '#F0F7FF',
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#333',
    flex: 1,
  },
  dropdownItemTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
    padding: 16,
    fontSize: 14,
    color: '#1A1A1A',
    minHeight: 160,
    maxHeight: 200,
  },
  charCount: {
    fontSize: 13,
    color: '#999',
    marginTop: 8,
    textAlign: 'right',
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  submitButton: {
    backgroundColor: '#0c55b5ff',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#E5E5E5',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ModalObservations;
