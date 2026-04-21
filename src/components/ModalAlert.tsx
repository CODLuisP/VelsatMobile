import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';
import { AlertTriangle, CheckCircle } from 'lucide-react-native';
import { Text } from './ScaledComponents';

interface ModalAlertProps {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  buttonText?: string;
  color?: string;
  isError?: boolean;
}

const ModalAlert: React.FC<ModalAlertProps> = ({
  isVisible,
  onClose,
  title,
  message,
  buttonText = 'Entendido',
  color = '#e36414',
  isError = false,
}) => {
  const theme = isError
    ? {
        topBg: '#fee2e2',
        iconColor: '#ef4444',
        buttonBg: '#ef4444',
        Icon: AlertTriangle,
      }
    : {
        topBg: '#dcfce7',
        iconColor: '#16a34a',
        buttonBg: '#16a34a',
        Icon: CheckCircle,
      };

  const { topBg, iconColor, buttonBg, Icon } = theme;

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      backdropColor="#000"
      backdropOpacity={0.7}
      backdropTransitionInTiming={0}
      backdropTransitionOutTiming={0}
      animationIn="zoomIn"
      animationOut="fadeOutDown"
      animationInTiming={260}
      animationOutTiming={300}
      coverScreen={true}
      statusBarTranslucent={true}
      style={styles.modal}
      useNativeDriver={true}
    >
      <View style={styles.card}>
        {/* Zona superior con ícono */}
        <View style={[styles.top, { backgroundColor: topBg }]}>
          <View style={styles.iconCircle}>
            <Icon size={32} color={iconColor} strokeWidth={2.5} />
          </View>
        </View>

        {/* Cuerpo */}
        <View style={styles.body}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: buttonBg }]}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>
              {buttonText.toUpperCase()}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: '82%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 32,
    elevation: 16,
  },
  top: {
    height: 110,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  closeBtn: {
    position: 'absolute',
    top: 12,
    right: 14,
    zIndex: 10,
    backgroundColor: '#e5383b',
    borderRadius: 5,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '700',
  },
  body: {
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 24,
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  message: {
    fontSize: 13.5,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  button: {
    marginTop: 8,
    borderRadius: 8,
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.4,
  },
});

export default ModalAlert;