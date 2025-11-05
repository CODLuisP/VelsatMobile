import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Platform,
} from 'react-native';
import {
  ChevronLeft,
  Fingerprint,
  Shield,
  CheckCircle,
  Scan,
  Lock,
  Loader,
  X,
} from 'lucide-react-native';
import {
  NavigationProp,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import { styles } from '../../../styles/security';
import { RootStackParamList } from '../../../../App';
import { useAuthStore } from '../../../store/authStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  getBottomSpace,
  useNavigationMode,
} from '../../../hooks/useNavigationMode';
import NavigationBarColor from 'react-native-navigation-bar-color';
import LinearGradient from 'react-native-linear-gradient';
import ModalAlert from '../../../components/ModalAlert';
import ModalConfirm from '../../../components/ModalConfirm';

// Configuración del botón
interface ButtonConfig {
  text: string;
  icon: React.ComponentType<any>;
  disabled: boolean;
  isDeactivate?: boolean;
}

// Configuración del contenido
interface ContentConfig {
  title: string;
  description: string;
}

const Security: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const insets = useSafeAreaInsets();
  const navigationDetection = useNavigationMode();
  const bottomSpace = getBottomSpace(
    insets,
    navigationDetection.hasNavigationBar,
  );

  const [modalConfirmVisible, setModalConfirmVisible] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({
    title: '',
    message: '',
    color: '',
    onConfirm: () => {},
    confirmText: '',
    cancelText: '',
  });

  const [modalAlertVisible, setModalAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    color: '',
    onDismiss: () => {}, // ← NUEVO
  });

  const handleShowAlert = (
    title: string,
    message: string,
    color?: string,
    onDismiss?: () => void, // ← NUEVO parámetro opcional
  ) => {
    setAlertConfig({
      title,
      message,
      color: color || '#e36414',
      onDismiss: onDismiss || (() => {}), // ← NUEVO
    });
    setModalAlertVisible(true);
  };

  const handleShowConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    color?: string,
    confirmText?: string,
    cancelText?: string,
  ) => {
    setConfirmConfig({
      title,
      message,
      color: color || '#FFA726',
      onConfirm,
      confirmText: confirmText || 'Aceptar',
      cancelText: cancelText || 'Cancelar',
    });
    setModalConfirmVisible(true);
  };

  useFocusEffect(
    React.useCallback(() => {
      NavigationBarColor('#00296b', false);
    }, []),
  );

const {
  biometric,
  checkBiometricAvailability,
  enableBiometric,
  disableBiometric,
  getBiometricDisplayName,
  canUseBiometricLogin,
  enablePinLogin,
  disablePinLogin,
  canUsePinLogin,
} = useAuthStore();

  // Estados locales
  const [isActivating, setIsActivating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAlreadyEnabled, setIsAlreadyEnabled] = useState(false);

useEffect(() => {
  const initBiometric = async () => {
    await checkBiometricAvailability();

    // Verificar si ya está activada (biométrica O PIN)
    const canUseBio = canUseBiometricLogin();
    const canUsePin = canUsePinLogin();
    setIsAlreadyEnabled(canUseBio || canUsePin);

    setIsLoading(false);
  };

  initBiometric();
}, [checkBiometricAvailability, canUseBiometricLogin, canUsePinLogin]);

  const handleGoBack = (): void => {
    navigation.goBack();
  };

  const handleActivateSecurity = async (): Promise<void> => {
    setIsActivating(true);

    try {
      if (isAlreadyEnabled) {
        handleShowConfirm(
          'Desactivar Biometría',
          `¿Estás seguro de que quieres desactivar ${getBiometricDisplayName()}? Tendrás que usar tu usuario y contraseña para entrar.`,
          async () => {
            try {
              await disableBiometric();
              await disablePinLogin();
              setIsAlreadyEnabled(false);

              // Mostrar alerta de éxito
              handleShowAlert(
                'Biometría Desactivada',
                'La biometría ha sido desactivada correctamente. Ahora deberás usar tu usuario y contraseña para entrar.',
                '#4CAF50', // Verde - Éxito
              );
            } catch (error) {
              // Mostrar alerta de error
              handleShowAlert(
                'Error',
                'Hubo un problema al desactivar la biometría.',
                '#c1121f', // Rojo - Error
              );
            }
          },
          '#e36414',
          'Desactivar',
          'Cancelar',
        );
        setIsActivating(false);
        return;
      }

      if (!biometric.isAvailable) {
        handleShowConfirm(
          'Configurar PIN',
          'Tu dispositivo no tiene biometría disponible. Te dirigiremos a configurar un PIN.',
          () => navigateToPin(),
          '#e36414', // Azul - Informativo
          'Configurar',
          'Cancelar',
        );
        setIsActivating(false);
        return;
      }

      const success = await enableBiometric(biometric.type || '');

      if (success) {
        setIsAlreadyEnabled(true);
        handleShowAlert(
          'Perfecto!',
          `${getBiometricDisplayName()} ha sido activada exitosamente.`,
          '#4CAF50',
          () => navigation.goBack(), // ← Cuarto parámetro opcional
        );
      } else {
        handleShowAlert(
          'Error',
          'No se pudo activar la biometría. Inténtalo de nuevo.',
          '#c1121f', // Rojo - Error
        );
      }
    } catch (error) {
      handleShowAlert(
        'Error',
        'Hubo un problema al configurar la biometría. Verifica que esté configurada en tu dispositivo.',
        '#c1121f', // Rojo - Error
      );
    }

    setIsActivating(false);
  };


const navigateToPin = async (): Promise<void> => {
  try {
    const success = await enablePinLogin();
    
    if (success) {
      setIsAlreadyEnabled(true);
      handleShowAlert(
        '¡PIN Activado!',
        'El PIN ha sido activado exitosamente. Ahora puedes usar tu PIN para entrar a la aplicación.',
        '#4CAF50',
        () => navigation.goBack(),
      );
    } else {
      handleShowAlert(
        'Error',
        'No se pudo activar el PIN. Inténtalo de nuevo.',
        '#c1121f',
      );
    }
  } catch (error) {
    handleShowAlert(
      'Error',
      'Hubo un problema al configurar el PIN.',
      '#c1121f',
    );
  }
};
  const getButtonConfig = (): ButtonConfig => {
    if (isLoading) {
      return {
        text: 'Detectando...',
        icon: Loader,
        disabled: true,
        isDeactivate: false,
      };
    }

    if (isAlreadyEnabled) {
      return {
        text: 'Desactivar Biometría',
        icon: X,
        disabled: false,
        isDeactivate: true,
      };
    }

    if (!biometric.isAvailable) {
      return {
        text: 'Configurar PIN',
        icon: Lock,
        disabled: false,
        isDeactivate: false,
      };
    }

    switch (biometric.type) {
      case 'FaceID':
        return {
          text: 'Activar Face ID',
          icon: Scan,
          disabled: false,
          isDeactivate: false,
        };
      case 'TouchID':
        return {
          text: 'Activar Touch ID',
          icon: Fingerprint,
          disabled: false,
          isDeactivate: false,
        };
      case 'Biometrics':
        return {
          text: 'Activar Huella Dactilar',
          icon: Fingerprint,
          disabled: false,
          isDeactivate: false,
        };
      default:
        return {
          text: 'Configurar PIN',
          icon: Lock,
          disabled: false,
          isDeactivate: false,
        };
    }
  };

  const getContentConfig = (): ContentConfig => {
    if (isLoading) {
      return {
        title: 'Configurando Seguridad',
        description:
          'Detectando las opciones de seguridad disponibles en tu dispositivo...',
      };
    }

    if (isAlreadyEnabled) {
      switch (biometric.type) {
        case 'FaceID':
          return {
            title: 'Face ID Activado',
            description:
              'Tienes activa tu biometría digital en la app. Recuerda que también puedes entrar con tu clave de siempre.',
          };
        case 'TouchID':
          return {
            title: 'Touch ID Activado',
            description:
              'Tienes activa tu biometría digital en la app. Recuerda que también puedes entrar con tu clave de siempre.',
          };
        case 'Biometrics':
          return {
            title: 'Huella Digital Activada',
            description:
              'Tienes activa tu biometría digital en la app. Recuerda que también puedes entrar con tu clave de siempre.',
          };
        default:
          return {
            title: 'Seguridad Activada',
            description: 'Ya tienes configurada la seguridad de tu cuenta.',
          };
      }
    }

    if (!biometric.isAvailable) {
      return {
        title: 'Seguridad con PIN',
        description:
          'Tu dispositivo no tiene biometría disponible. Configura un PIN para proteger tu cuenta de forma segura.',
      };
    }

    switch (biometric.type) {
      case 'FaceID':
        return {
          title: 'Face ID',
          description:
            'Accede de forma rápida y segura usando tu rostro. Face ID es más seguro que las contraseñas tradicionales.',
        };
      case 'TouchID':
        return {
          title: 'Touch ID',
          description:
            'Accede de forma rápida y segura usando tu huella dactilar. Touch ID es más seguro que las contraseñas tradicionales.',
        };
      case 'Biometrics':
        return {
          title: 'Huella Dactilar',
          description:
            'Accede de forma rápida y segura usando tu huella dactilar. La biometría es más segura que las contraseñas tradicionales.',
        };
      default:
        return {
          title: 'Seguridad Biométrica',
          description:
            'Configura la seguridad de tu cuenta usando las opciones disponibles en tu dispositivo.',
        };
    }
  };

  const buttonConfig = getButtonConfig();
  const contentConfig = getContentConfig();
  const IconComponent = buttonConfig.icon;

  const getImageSource = () => {
    if (isLoading) {
      return require('../../../../assets/userdata.png');
    }

    if (isAlreadyEnabled) {
      return require('../../../../assets/seguridad.png');
    }

    switch (biometric.type) {
      case 'FaceID':
        return require('../../../../assets/userdata.png');
      case 'TouchID':
      case 'Biometrics':
        return require('../../../../assets/huella.png');
      default:
        return require('../../../../assets/huella.png');
    }
  };

const topSpace = Platform.OS === 'ios' ? insets.top -5 : insets.top + 5;

  return (
    <LinearGradient
      colors={['#021e4bff', '#183890ff', '#032660ff']}
      style={[styles.container, { paddingBottom: bottomSpace - 2 }]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <View style={[styles.header, { paddingTop: topSpace }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={handleGoBack}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <ChevronLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerMainTitle}>Seguridad</Text>
        </View>

        <View style={styles.statusBadge}>
          <Shield size={16} color="#fb8500" />
          <Text style={styles.statusText}>
            {isLoading
              ? 'Detectando...'
              : isAlreadyEnabled
              ? 'Biometría Activada'
              : 'Configuración de Seguridad'}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mainContent}>
          <View style={styles.cardContainer}>
            <View style={styles.phoneContainer}>
              <Image
                source={getImageSource()}
                style={styles.phoneImage}
                resizeMode="contain"
              />
            </View>

            <View style={styles.textContent}>
              <Text style={styles.mainTitle}>{contentConfig.title}</Text>

              <Text style={styles.description}>
                {contentConfig.description}
              </Text>
            </View>

            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <CheckCircle size={20} color="#38b000" />
                <Text style={styles.featureText}>
                  {isAlreadyEnabled
                    ? 'Autenticación biométrica activa'
                    : biometric.isAvailable
                    ? 'Acceso instantáneo en menos de 1 segundo'
                    : 'Acceso rápido y seguro'}
                </Text>
              </View>
              <View style={styles.featureItem}>
                <CheckCircle size={20} color="#38b000" />
                <Text style={styles.featureText}>
                  Tecnología de encriptación avanzada
                </Text>
              </View>
              <View style={styles.featureItem}>
                <CheckCircle size={20} color="#38b000" />
                <Text style={styles.featureText}>
                  {biometric.isAvailable
                    ? 'Tus datos biométricos nunca salen del dispositivo'
                    : 'Tu PIN se guarda de forma segura y encriptada'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.activateButton,
              (buttonConfig.disabled || isActivating) && styles.disabledButton,
            ]}
            onPress={handleActivateSecurity}
            disabled={buttonConfig.disabled || isActivating}
          >
            <View style={styles.buttonContent}>
              <IconComponent size={22} color="#fff" />
              <Text style={styles.activateButtonText}>
                {isActivating
                  ? isAlreadyEnabled
                    ? 'Desactivando...'
                    : 'Activando...'
                  : buttonConfig.text}
              </Text>
            </View>
            <View style={styles.buttonGradient} />
          </TouchableOpacity>
        </View>

        <ModalAlert
          isVisible={modalAlertVisible}
          onClose={() => {
            setModalAlertVisible(false);
            alertConfig.onDismiss(); // ← Ejecuta el callback
          }}
          title={alertConfig.title}
          message={alertConfig.message}
          color={alertConfig.color}
        />

        <ModalConfirm
          isVisible={modalConfirmVisible}
          onClose={() => setModalConfirmVisible(false)}
          onConfirm={() => {
            confirmConfig.onConfirm();
            setModalConfirmVisible(false);
          }}
          title={confirmConfig.title}
          message={confirmConfig.message}
          color={confirmConfig.color}
          confirmText={confirmConfig.confirmText}
          cancelText={confirmConfig.cancelText}
        />
      </ScrollView>
    </LinearGradient>
  );
};

export default Security;
