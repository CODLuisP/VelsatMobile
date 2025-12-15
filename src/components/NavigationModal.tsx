import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, Alert, Image } from 'react-native';
import Modal from 'react-native-modal';
import { handleNavigationApp } from '../utils/textUtils';
import { Platform } from 'react-native';

interface NavigationModalProps {
  visible: boolean;
  onClose: () => void;
  latitude: number;
  longitude: number;
  platform?: 'android' | 'ios';
}

export const NavigationModal: React.FC<NavigationModalProps> = ({
  visible,
  onClose,
  latitude,
  longitude,
  platform = Platform.OS as 'android' | 'ios',
}) => {
  const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`;

  const apps =
    platform === 'android'
      ? [
          { 
            id: 'google' as const, 
            name: 'Google Maps', 
            icon: 'https://res.cloudinary.com/db8efdixd/image/upload/v1765817214/maps_fcrn3m.png' 
          },
          { 
            id: 'waze' as const, 
            name: 'Waze', 
            icon: 'https://res.cloudinary.com/db8efdixd/image/upload/v1765817214/waze_scnotu.png' 
          },
        ]
      : [
          { 
            id: 'google' as const, 
            name: 'Google Maps', 
            icon: 'https://res.cloudinary.com/db8efdixd/image/upload/v1765817214/maps_fcrn3m.png' 
          },
          { 
            id: 'waze' as const, 
            name: 'Waze', 
            icon: 'https://res.cloudinary.com/db8efdixd/image/upload/v1765817214/waze_scnotu.png' 
          },
          { 
            id: 'apple' as const, 
            name: 'Apple Maps', 
            icon: 'https://res.cloudinary.com/db8efdixd/image/upload/v1765817214/apple_elquix.png' 
          },
        ];

  const handleAppSelection = (app: 'google' | 'waze' | 'apple') => {
    onClose();
    
    handleNavigationApp(app, latitude, longitude, (appName) => {
      Alert.alert(
        `${appName} no disponible`,
        '¿Deseas abrir en el navegador?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Abrir en navegador',
            onPress: () => Linking.openURL(webUrl),
          },
        ]
      );
    });
  };

  return (
    <Modal
      isVisible={visible}
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
        <Text style={styles.modalTitle}>¿Con qué app deseas navegar?</Text>
        <Text style={styles.modalSubtitle}>
          Selecciona tu aplicación de navegación
        </Text>

        <View style={styles.optionsContainer}>
          {apps.map((app) => (
            <TouchableOpacity
              key={app.id}
              style={styles.optionButton}
              onPress={() => handleAppSelection(app.id)}
              activeOpacity={0.7}
            >
              <Image 
                source={{ uri: app.icon }} 
                style={styles.optionIcon}
                resizeMode="contain"
              />
              <Text style={styles.optionText}>{app.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onClose}
          activeOpacity={0.8}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#e36414',
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  optionsContainer: {
    width: '100%',
    marginBottom: 15,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  optionIcon: {
    width: 32,
    height: 32,
    marginRight: 12,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  cancelButton: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 30,
    backgroundColor: '#e36414',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default NavigationModal;