import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';
import { Text } from './ScaledComponents';

interface ModalAlertProps {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  buttonText?: string;
  color?: string; 
}

const ModalAlert: React.FC<ModalAlertProps> = ({
  isVisible,
  onClose,
  title,
  message,
  buttonText = 'Entendido',
  color = '#e36414',
}) => {
  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      backdropColor="#000000"
      backdropOpacity={0.4}
      backdropTransitionInTiming={0}
      backdropTransitionOutTiming={0}
      animationIn="zoomIn"
      animationOut="fadeOutDown"
      animationInTiming={300}
      animationOutTiming={400}
      coverScreen={true} 
      statusBarTranslucent={true} 
      style={styles.modal}
      useNativeDriver={true} 
    >
      <View style={styles.modalContent}>
        <Text style={[styles.modalTitle, { color }]}>{title}</Text>
        <Text style={styles.modalMessage}>{message}</Text>
        <TouchableOpacity
          style={[styles.modalButton, { backgroundColor: color }]}
          onPress={onClose}
          activeOpacity={0.8}
        >
          <Text style={styles.modalButtonText}>{buttonText}</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    marginHorizontal: 30,
    alignItems: 'center',
    width: '95%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalMessage: {
    color: '#333',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButton: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 30,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ModalAlert;
