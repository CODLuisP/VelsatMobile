import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  Animated,
  PanResponder,
  ScrollView,
  TextInput,
  Platform,
} from 'react-native';
import { X, MapPinned, Check, Filter } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getBottomSpace, useNavigationMode } from '../../../hooks/useNavigationMode';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  filters: {
    speedRange: '' | 'stopped' | 'slow' | 'medium' | 'fast';
    status: '' | 'stopped' | 'moving';
    location: string;
  };
  onApplyFilters: (filters: {
    speedRange: '' | 'stopped' | 'slow' | 'medium' | 'fast';
    status: '' | 'stopped' | 'moving';
    location: string;
  }) => void;
}

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  filters,
  onApplyFilters,
}) => {
  const [tempFilters, setTempFilters] = useState(filters);
  const slideAnim = useState(new Animated.Value(height))[0];
  const insets = useSafeAreaInsets();
  const navigationDetection = useNavigationMode();
  const bottomSpace = getBottomSpace(
    insets,
    navigationDetection.hasNavigationBar,
  );

  useEffect(() => {
    if (visible) {
      setTempFilters(filters);
      // Animar entrada
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    } else {
      // Animar salida
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 0,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 0,
      useNativeDriver: true,
    }).start();
    onClose();  // <-- Ejecuta INMEDIATAMENTE
  };

  const handleSpeedFilterToggle = (speed: 'stopped' | 'slow' | 'medium' | 'fast') => {
    setTempFilters({
      ...tempFilters,
      speedRange: tempFilters.speedRange === speed ? '' : speed,
    });
  };

  const handleStatusFilterToggle = (status: 'stopped' | 'moving') => {
    setTempFilters({
      ...tempFilters,
      status: tempFilters.status === status ? '' : status,
    });
  };

  const handleClearFilters = () => {
    setTempFilters({
      speedRange: '',
      status: '',
      location: '',
    });
    onApplyFilters({
      speedRange: '',
      status: '',
      location: '',
    });
    handleClose();
  };
  const handleApplyFilters = () => {
    onApplyFilters(tempFilters);
    handleClose();
  };

  // PanResponder para arrastrar hacia abajo
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return gestureState.dy > 5;
    },
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dy > 0) {
        slideAnim.setValue(gestureState.dy);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dy > 150) {
        handleClose();
      } else {
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }).start();
      }
    },
  });

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.modalContent,
                {
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              {/* Indicador de arrastre */}
              <View style={styles.dragIndicatorContainer} {...panResponder.panHandlers}>
                <View style={styles.dragIndicator} />
              </View>

              {/* Header */}
              <View style={styles.modalHeader}>
                <View style={styles.headerLeft}>
                  <Filter size={24} color="#3b82f6" />
                  <Text style={styles.modalTitle}>Filtrar Unidades</Text>
                </View>
                <TouchableOpacity
                  onPress={handleClose}
                  style={styles.closeButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <X size={24} color="#64748b" />
                </TouchableOpacity>
              </View>

              {/* Body */}
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                {/* Filtro por Velocidad */}
                <View style={styles.filterSection}>
                  <Text style={styles.filterSectionTitle}>Velocidad</Text>
                  <View style={styles.filterOptions}>
                    <TouchableOpacity
                      style={[
                        styles.filterOption,
                        tempFilters.speedRange === 'stopped' &&
                        styles.filterOptionActive,
                      ]}
                      onPress={() => handleSpeedFilterToggle('stopped')}
                    >
                      <View style={styles.filterOptionContent}>
                        <View
                          style={[
                            styles.speedColorDot,
                            { backgroundColor: '#FF4444' },
                          ]}
                        />
                        <Text
                          style={[
                            styles.filterOptionText,
                            tempFilters.speedRange === 'stopped' &&
                            styles.filterOptionTextActive,
                          ]}
                        >
                          Detenidos (0 km/h)
                        </Text>
                      </View>
                      {tempFilters.speedRange === 'stopped' && (
                        <Check size={16} color="#3b82f6" />
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.filterOption,
                        tempFilters.speedRange === 'slow' &&
                        styles.filterOptionActive,
                      ]}
                      onPress={() => handleSpeedFilterToggle('slow')}
                    >
                      <View style={styles.filterOptionContent}>
                        <View
                          style={[
                            styles.speedColorDot,
                            { backgroundColor: '#FFA500' },
                          ]}
                        />
                        <Text
                          style={[
                            styles.filterOptionText,
                            tempFilters.speedRange === 'slow' &&
                            styles.filterOptionTextActive,
                          ]}
                        >
                          Lento (1-10 km/h)
                        </Text>
                      </View>
                      {tempFilters.speedRange === 'slow' && (
                        <Check size={16} color="#3b82f6" />
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.filterOption,
                        tempFilters.speedRange === 'medium' &&
                        styles.filterOptionActive,
                      ]}
                      onPress={() => handleSpeedFilterToggle('medium')}
                    >
                      <View style={styles.filterOptionContent}>
                        <View
                          style={[
                            styles.speedColorDot,
                            { backgroundColor: '#00AA00' },
                          ]}
                        />
                        <Text
                          style={[
                            styles.filterOptionText,
                            tempFilters.speedRange === 'medium' &&
                            styles.filterOptionTextActive,
                          ]}
                        >
                          Medio (11-59 km/h)
                        </Text>
                      </View>
                      {tempFilters.speedRange === 'medium' && (
                        <Check size={16} color="#3b82f6" />
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.filterOption,
                        tempFilters.speedRange === 'fast' &&
                        styles.filterOptionActive,
                      ]}
                      onPress={() => handleSpeedFilterToggle('fast')}
                    >
                      <View style={styles.filterOptionContent}>
                        <View
                          style={[
                            styles.speedColorDot,
                            { backgroundColor: '#0066FF' },
                          ]}
                        />
                        <Text
                          style={[
                            styles.filterOptionText,
                            tempFilters.speedRange === 'fast' &&
                            styles.filterOptionTextActive,
                          ]}
                        >
                          Rápido (60+ km/h)
                        </Text>
                      </View>
                      {tempFilters.speedRange === 'fast' && (
                        <Check size={16} color="#3b82f6" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Filtro por Estado */}
                <View style={styles.filterSection}>
                  <Text style={styles.filterSectionTitle}>Estado</Text>
                  <View style={styles.filterOptions}>
                    <TouchableOpacity
                      style={[
                        styles.filterOption,
                        tempFilters.status === 'moving' &&
                        styles.filterOptionActive,
                      ]}
                      onPress={() => handleStatusFilterToggle('moving')}
                    >
                      <Text
                        style={[
                          styles.filterOptionText,
                          tempFilters.status === 'moving' &&
                          styles.filterOptionTextActive,
                        ]}
                      >
                        En Movimiento
                      </Text>
                      {tempFilters.status === 'moving' && (
                        <Check size={16} color="#3b82f6" />
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.filterOption,
                        tempFilters.status === 'stopped' &&
                        styles.filterOptionActive,
                      ]}
                      onPress={() => handleStatusFilterToggle('stopped')}
                    >
                      <Text
                        style={[
                          styles.filterOptionText,
                          tempFilters.status === 'stopped' &&
                          styles.filterOptionTextActive,
                        ]}
                      >
                        Detenidos
                      </Text>
                      {tempFilters.status === 'stopped' && (
                        <Check size={16} color="#3b82f6" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Filtro por Ubicación */}
                <View style={styles.filterSection}>
                  <Text style={styles.filterSectionTitle}>Ubicación</Text>
                  <View style={styles.locationInputContainer}>
                    <MapPinned size={20} color="#94a3b8" />
                    <TextInput
                      style={styles.locationInput}
                      placeholder="Ej: Lima, Av. Principal, etc."
                      placeholderTextColor="#94a3b8"
                      value={tempFilters.location}
                      onChangeText={text =>
                        setTempFilters({ ...tempFilters, location: text })
                      }
                    />
                    {tempFilters.location !== '' && (
                      <TouchableOpacity
                        onPress={() =>
                          setTempFilters({ ...tempFilters, location: '' })
                        }
                      >
                        <X size={20} color="#94a3b8" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </ScrollView>

              {/* Footer */}
              <View style={[
                styles.modalFooter,
                {
                  marginBottom: Platform.OS === 'android' && bottomSpace < 10
                    ? 45
                    : bottomSpace - 2
                }
              ]}>                <TouchableOpacity
                style={styles.clearButton}
                onPress={handleClearFilters}
              >
                  <Text style={styles.clearButtonText}>Limpiar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.applyButton}
                  onPress={handleApplyFilters}
                >
                  <Text style={styles.applyButtonText}>Aplicar Filtros</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    width: '100%',
    height: height * 0.86,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  dragIndicatorContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 12,
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: '#cbd5e1',
    borderRadius: 2,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    height: height * 0.55,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 12,
  },
  filterOptions: {
    gap: 10,
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#eeeff0ff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  filterOptionActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  filterOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  speedColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  filterOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
  },
  filterOptionTextActive: {
    color: '#1e40af',
    fontWeight: '600',
  },
  locationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  locationInput: {
    flex: 1,
    fontSize: 14,
    color: '#1e293b',
    padding: 0,
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    gap: 12,

  },
  clearButton: {
    flex: 1,
    backgroundColor: '#f97316',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#ffffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  applyButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default FilterModal;