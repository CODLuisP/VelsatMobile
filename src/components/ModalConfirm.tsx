import React from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Text } from './ScaledComponents';

interface ModalConfirmProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  color?: string; // Color solo para el header
  confirmText?: string;
  cancelText?: string;
}

const ModalConfirm: React.FC<ModalConfirmProps> = ({
  isVisible,
  onClose,
  onConfirm,
  title,
  message,
  color = '#FFA726', // color del header (naranja)
  confirmText = 'Aceptar',
  cancelText = 'Cancelar',
}) => {
  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header con color */}
          <View style={[styles.header, { backgroundColor: color }]}>
            <Text style={styles.title}>{title}</Text>
          </View>

          {/* Mensaje */}
          <View style={styles.body}>
            <Text style={styles.message}>{message}</Text>
          </View>

          {/* Botones blancos */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.whiteButton]}
              onPress={onClose}
              activeOpacity={0.7}>
              <Text style={styles.blackText}>{cancelText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.whiteButton]}
              onPress={onConfirm}
              activeOpacity={0.7}>
              <Text style={styles.blackText}>{confirmText}</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: width * 0.85,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  body: {
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  message: {
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  whiteButton: {
    backgroundColor: '#fafafaff',
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
  },
  blackText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5c5c5cff',
  },
});

export default ModalConfirm;
