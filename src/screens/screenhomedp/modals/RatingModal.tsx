import React from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  ActivityIndicator,
  StyleSheet,
  Animated,
  Platform,
  StatusBar
} from 'react-native';
import { Star, X } from 'lucide-react-native';

interface RatingModalProps {
  visible: boolean;
  loading: boolean;
  selectedRating: number;
  onRatingSelect: (rating: number) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export const RatingModal: React.FC<RatingModalProps> = ({
  visible,
  loading,
  selectedRating,
  onRatingSelect,
  onConfirm,
  onCancel,
}) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.95)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 65,
          friction: 9,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.95);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
        {/* Botón cerrar flotante */}
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={onCancel}
          activeOpacity={0.8}
        >
          <X size={20} color="#fff" strokeWidth={2} />
        </TouchableOpacity>

        {/* Contenedor principal */}
        <TouchableOpacity
          style={styles.contentArea}
          activeOpacity={1}
          onPress={onCancel}
        >
          <Animated.View 
            style={[
              styles.card,
              { 
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }]
              }
            ]}
            onStartShouldSetResponder={() => true}
          >
            <Text style={styles.title}>Calificar Conductor</Text>

            <Text style={styles.subtitle}>
              ¿Cómo calificarías tu experiencia?
            </Text>

            {/* Estrellas seleccionables */}
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map(star => (
                <TouchableOpacity
                  key={star}
                  onPress={() => onRatingSelect(star)}
                  style={styles.starButton}
                  activeOpacity={0.7}
                >
                  <Star
                    size={40}
                    color={star <= selectedRating ? '#FFA726' : '#cbd5e1'}
                    fill={star <= selectedRating ? '#FFA726' : 'transparent'}
                    strokeWidth={2}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Botones de acción */}
            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onCancel}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  (selectedRating === 0 || loading) && styles.confirmButtonDisabled
                ]}
                onPress={onConfirm}
                disabled={loading || selectedRating === 0}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.confirmButtonText}>Enviar</Text>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.6)',
    zIndex: 10,
  },
  contentArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 24,
    textAlign: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 28,
    gap: 8,
  },
  starButton: {
    padding: 4,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cancelButtonText: {
    color: '#475569',
    fontSize: 15,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#FFA726',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fb923c',
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});