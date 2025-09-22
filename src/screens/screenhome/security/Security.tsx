import React, { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { ChevronLeft, Fingerprint, Shield, CheckCircle, Scan, Lock, Loader } from 'lucide-react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { styles } from '../../../styles/security';
import { RootStackParamList } from '../../../../App';
import { useAuthStore } from '../../../store/authStore';

// Configuración del botón
interface ButtonConfig {
    text: string;
    icon: any;
    disabled: boolean;
}

// Configuración del contenido
interface ContentConfig {
    title: string;
    description: string;
}

const Security: React.FC = () => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    
    // Usar el authStore extendido
    const {
        biometric,
        checkBiometricAvailability,
        enableBiometric,
        getBiometricDisplayName
    } = useAuthStore();
    
    // Estado local solo para la activación
    const [isActivating, setIsActivating] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Verificar disponibilidad al cargar la pantalla
        const initBiometric = async () => {
            await checkBiometricAvailability();
            setIsLoading(false);
        };
        
        initBiometric();
    }, [checkBiometricAvailability]);

    const handleGoBack = (): void => {
        navigation.goBack();
    };

    const handleActivateSecurity = async (): Promise<void> => {
        setIsActivating(true);
        
        try {
            if (!biometric.isAvailable) {
                Alert.alert(
                    'Configurar PIN',
                    'Tu dispositivo no tiene biometría disponible. Te dirigiremos a configurar un PIN.',
                    [
                        { text: 'Cancelar', style: 'cancel' },
                        { text: 'Configurar', onPress: () => navigateToPin() }
                    ]
                );
                setIsActivating(false);
                return;
            }

            // Activar biometría usando el authStore
            const success = await enableBiometric(biometric.type || '');
            
            if (success) {
                Alert.alert(
                    'Perfecto!',
                    `${getBiometricDisplayName()} ha sido activada exitosamente. Ahora podrás acceder a la app de forma rápida y segura.`,
                    [{ text: 'Continuar', onPress: () => navigation.goBack() }]
                );
            } else {
                Alert.alert(
                    'Error',
                    'No se pudo activar la biometría. Inténtalo de nuevo.',
                    [{ text: 'OK' }]
                );
            }
            
        } catch (error) {
            console.log('Error activating biometrics:', error);
            Alert.alert(
                'Error',
                'Hubo un problema al configurar la biometría. Verifica que esté configurada en tu dispositivo.',
                [{ text: 'OK' }]
            );
        }
        
        setIsActivating(false);
    };

    const navigateToPin = (): void => {
        console.log('Navegar a configuración de PIN');
        // navigation.navigate('ConfigurePin');
    };

    // Función para obtener configuración del botón
    const getButtonConfig = (): ButtonConfig => {
        if (isLoading) {
            return { 
                text: 'Detectando...', 
                icon: Loader,
                disabled: true 
            };
        }
        
        if (!biometric.isAvailable) {
            return { 
                text: 'Configurar PIN', 
                icon: Lock,
                disabled: false 
            };
        }

        switch (biometric.type) {
            case 'FaceID':
                return { 
                    text: 'Activar Face ID', 
                    icon: Scan,
                    disabled: false 
                };
            case 'TouchID':
                return { 
                    text: 'Activar Touch ID', 
                    icon: Fingerprint,
                    disabled: false 
                };
            case 'Biometrics':
                return { 
                    text: 'Activar Huella Dactilar', 
                    icon: Fingerprint,
                    disabled: false 
                };
            default:
                return { 
                    text: 'Configurar PIN', 
                    icon: Lock,
                    disabled: false 
                };
        }
    };

    // Función para obtener el título y descripción dinámicos
    const getContentConfig = (): ContentConfig => {
        if (isLoading) {
            return {
                title: 'Configurando Seguridad',
                description: 'Detectando las opciones de seguridad disponibles en tu dispositivo...'
            };
        }

        if (!biometric.isAvailable) {
            return {
                title: 'Seguridad con PIN',
                description: 'Tu dispositivo no tiene biometría disponible. Configura un PIN para proteger tu cuenta de forma segura.'
            };
        }

        switch (biometric.type) {
            case 'FaceID':
                return {
                    title: 'Face ID',
                    description: 'Accede de forma rápida y segura usando tu rostro. Face ID es más seguro que las contraseñas tradicionales.'
                };
            case 'TouchID':
                return {
                    title: 'Touch ID',
                    description: 'Accede de forma rápida y segura usando tu huella dactilar. Touch ID es más seguro que las contraseñas tradicionales.'
                };
            case 'Biometrics':
                return {
                    title: 'Huella Dactilar',
                    description: 'Accede de forma rápida y segura usando tu huella dactilar. La biometría es más segura que las contraseñas tradicionales.'
                };
            default:
                return {
                    title: 'Seguridad Biométrica',
                    description: 'Configura la seguridad de tu cuenta usando las opciones disponibles en tu dispositivo.'
                };
        }
    };

    const buttonConfig = getButtonConfig();
    const contentConfig = getContentConfig();
    const IconComponent = buttonConfig.icon;

    return (
        <View style={styles.container}>
            {/* Header con gradiente mejorado */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                        <ChevronLeft size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerMainTitle}>Seguridad</Text>
                </View>

                {/* Status Badge */}
                <View style={styles.statusBadge}>
                    <Shield size={16} color="#fb8500" />
                    <Text style={styles.statusText}>
                        {isLoading ? 'Detectando...' : 'Configuración de Seguridad'}
                    </Text>
                </View>
            </View>

            <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                {/* Main Content */}
                <View style={styles.mainContent}>
                    {/* Card Container */}
                    <View style={styles.cardContainer}>
                        {/* Phone Illustration */}
                        <View style={styles.phoneContainer}>
                            <Image
                                source={require('../../../../assets/userdata.png')}
                                style={styles.phoneImage}
                                resizeMode="contain"
                            />
                        </View>

                        {/* Title and Description - Dinámicos */}
                        <View style={styles.textContent}>
                            <Text style={styles.mainTitle}>
                                {contentConfig.title}
                            </Text>
                          
                            <Text style={styles.description}>
                                {contentConfig.description}
                            </Text>
                        </View>

                        {/* Features List */}
                        <View style={styles.featuresList}>
                            <View style={styles.featureItem}>
                                <CheckCircle size={20} color="#10D9C4" />
                                <Text style={styles.featureText}>
                                    {biometric.isAvailable ? 'Acceso instantáneo en menos de 1 segundo' : 'Acceso rápido y seguro'}
                                </Text>
                            </View>
                            <View style={styles.featureItem}>
                                <CheckCircle size={20} color="#10D9C4" />
                                <Text style={styles.featureText}>Tecnología de encriptación avanzada</Text>
                            </View>
                            <View style={styles.featureItem}>
                                <CheckCircle size={20} color="#10D9C4" />
                                <Text style={styles.featureText}>
                                    {biometric.isAvailable ? 
                                        'Tus datos biométricos nunca salen del dispositivo' : 
                                        'Tu PIN se guarda de forma segura y encriptada'
                                    }
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Action Button - UN SOLO BOTÓN INTELIGENTE */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[
                            styles.activateButton,
                            (buttonConfig.disabled || isActivating) && styles.disabledButton
                        ]}
                        onPress={handleActivateSecurity}
                        disabled={buttonConfig.disabled || isActivating}
                    >
                        <View style={styles.buttonContent}>
                            <IconComponent 
                                size={22} 
                                color="#fff" 
                            />
                            <Text style={styles.activateButtonText}>
                                {isActivating ? 'Activando...' : buttonConfig.text}
                            </Text>
                        </View>
                        <View style={styles.buttonGradient} />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

export default Security;