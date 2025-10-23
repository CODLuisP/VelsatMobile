import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';

interface ModalAlertProps {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  buttonText?: string;
}

const ModalAlert: React.FC<ModalAlertProps> = ({
  isVisible,
  onClose,
  title,
  message,
  buttonText = 'Entendido',
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
  coverScreen={true}              // <- 🔥 esto hace que cubra toda la pantalla, incluso la barra de navegación
  statusBarTranslucent={true}     // <- 🔥 permite ocupar también detrás del StatusBar
  style={styles.modal}
  useNativeDriver={true}          // más suave en animaciones
>

      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>{title}</Text>
        <Text style={styles.modalMessage}>{message}</Text>
        <TouchableOpacity style={styles.modalButton} onPress={onClose} activeOpacity={0.8}>
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
    // NO pongas backgroundColor aquí
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    marginHorizontal: 30,
    alignItems: 'center',
    width:'95%'
  },
  modalTitle: {
    color: '#e36414',
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
    backgroundColor: '#e36414',
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