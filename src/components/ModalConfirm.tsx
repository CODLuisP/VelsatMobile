import React from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { Text } from './ScaledComponents';

interface ModalConfirmProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  color?: string;
  confirmText?: string;
  cancelText?: string;
}

const ModalConfirm: React.FC<ModalConfirmProps> = ({
  isVisible,
  onClose,
  onConfirm,
  title,
  message,
  color = '#FFA726',
  confirmText = 'Aceptar',
  cancelText = 'Cancelar',
}) => {
  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>

          {/* Ícono centrado */}
          <View style={styles.iconWrapper}>
            <View style={[styles.iconCircle, { backgroundColor: color + '22' }]}>
              <AlertCircle size={36} color={color} strokeWidth={2} />
            </View>
          </View>

          {/* Título y mensaje */}
          <View style={styles.body}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
          </View>

          {/* Botones en la misma línea */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.btnCancel}
              onPress={onClose}
              activeOpacity={0.7}>
              <Text style={styles.btnCancelText}>{cancelText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btnConfirm, { backgroundColor: color }]}
              onPress={onConfirm}
              activeOpacity={0.8}>
              <Text style={styles.btnConfirmText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: width * 0.82,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 32,
    elevation: 16,
    paddingBottom: 20,
  },
  iconWrapper: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 8,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  message: {
    fontSize: 13.5,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 21,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    flexDirection: 'row',
    gap: 10,
  },
  btnConfirm: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  btnConfirmText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  btnCancel: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    backgroundColor: '#ef4444',
  },
  btnCancelText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default ModalConfirm;