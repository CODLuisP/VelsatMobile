import React, { useState } from 'react';
import { Text, View, TouchableOpacity, TextInput, Alert } from 'react-native';
import { ChevronLeft, Settings, MapPin, Eye, EyeOff } from 'lucide-react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../../App';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    interpolate,
    runOnJS
} from 'react-native-reanimated';
import { styles } from '../../styles/setting';

const Setting = () => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const [activeForm, setActiveForm] = useState<'update' | 'password'>('update');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Estados para los formularios
    const [updateData, setUpdateData] = useState({
        usuario: 'cgacela',
        correo: 'gacelacorp@gmail.com',
        celular: '976345098'
    });

    const [passwordData, setPasswordData] = useState({
        usuario: 'Usuario existente',
        password: '',
        confirmPassword: ''
    });

    // Animación - CORREGIDO: Solo para opacidad
    const slideAnimation = useSharedValue(1);

    const handleGoBack = () => {
        navigation.goBack();
    };

    const handleFormChange = (formType: 'update' | 'password') => {
        if (formType === activeForm) return;

        // CORREGIDO: Animación suave para el cambio de formularios
        slideAnimation.value = withTiming(0.7, { duration: 150 }, () => {
            runOnJS(setActiveForm)(formType);
            slideAnimation.value = withTiming(1, { duration: 150 });
        });
    };

    // CORREGIDO: Animación simplificada solo para fade in/out
    const animatedStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            slideAnimation.value,
            [0, 1],
            [0.7, 1]
        );

        return {
            opacity,
        };
    });

    const handleUpdateData = () => {
        console.log('Actualizando datos:', updateData);
        // Aquí iría la lógica para actualizar datos
    };

    const handleEstablishPassword = () => {
        if (passwordData.password !== passwordData.confirmPassword) {
            Alert.alert('Error', 'Las contraseñas no coinciden');
            return;
        }
        console.log('Estableciendo contraseña para:', passwordData.usuario);
        // Aquí iría la lógica para cambiar contraseña
    };


    const renderUpdateForm = () => (
        <View style={styles.formContainer}>
            <View style={styles.infoSection}>
                <Text style={styles.infoTitle}>Nuevo correo o celular?</Text>
                <Text style={styles.infoSubtitle}>
                    No te preocupes! Acá podrás actualizar estos datos rápidamente; si deseas cambiar otra información, por favor contáctanos.
                </Text>
            </View>

            <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Usuario</Text>
                <TextInput
                    style={styles.input}
                    value={updateData.usuario}
                    onChangeText={(text) => setUpdateData({ ...updateData, usuario: text })}
                    placeholder="Usuario"
                    placeholderTextColor="#999"
                />

                <Text style={styles.inputLabel}>Correo asociado</Text>
                <TextInput
                    style={styles.input}
                    value={updateData.correo}
                    onChangeText={(text) => setUpdateData({ ...updateData, correo: text })}
                    placeholder="correo@ejemplo.com"
                    placeholderTextColor="#999"
                    keyboardType="email-address"
                />

                <Text style={styles.inputLabel}>Celular asociado</Text>
                <TextInput
                    style={styles.input}
                    value={updateData.celular}
                    onChangeText={(text) => setUpdateData({ ...updateData, celular: text })}
                    placeholder="000000000"
                    placeholderTextColor="#999"
                    keyboardType="phone-pad"
                />
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={handleUpdateData}>
                <Text style={styles.primaryButtonText}>Actualizar datos</Text>
            </TouchableOpacity>
        </View>
    );

    const renderPasswordForm = () => (
        <View style={styles.formContainer}>
            <View style={styles.infoSection}>
                <Text style={styles.infoTitle}>Olvidaste tu contraseña?</Text>
                <Text style={styles.infoSubtitle}>
                    No te preocupes! Suele pasar. Por favor crea una nueva contraseña asociando tu usuario correcto.
                </Text>
            </View>

            <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Usuario</Text>
                <TextInput
                    style={styles.input}
                    value={passwordData.usuario}
                    onChangeText={(text) => setPasswordData({ ...passwordData, usuario: text })}
                    placeholder="Usuario existente"
                    placeholderTextColor="#999"
                />

                <Text style={styles.inputLabel}>Crea una contraseña</Text>
                <View style={styles.passwordContainer}>
                    <TextInput
                        style={styles.passwordInput}
                        value={passwordData.password}
                        onChangeText={(text) => setPasswordData({ ...passwordData, password: text })}
                        placeholder="Debe tener mínimo 3 caracteres"
                        placeholderTextColor="#999"
                        secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity
                        style={styles.eyeButton}
                        onPress={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? (
                            <EyeOff size={20} color="#999" />
                        ) : (
                            <Eye size={20} color="#999" />
                        )}
                    </TouchableOpacity>
                </View>

                <Text style={styles.inputLabel}>Confirma tu contraseña</Text>
                <View style={styles.passwordContainer}>
                    <TextInput
                        style={styles.passwordInput}
                        value={passwordData.confirmPassword}
                        onChangeText={(text) => setPasswordData({ ...passwordData, confirmPassword: text })}
                        placeholder="Repetir contraseña"
                        placeholderTextColor="#999"
                        secureTextEntry={!showConfirmPassword}
                    />
                    <TouchableOpacity
                        style={styles.eyeButton}
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                        {showConfirmPassword ? (
                            <EyeOff size={20} color="#999" />
                        ) : (
                            <Eye size={20} color="#999" />
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={handleEstablishPassword}>
                <Text style={styles.primaryButtonText}>Establecer contraseña</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                    <ChevronLeft size={26} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Configuraciones</Text>
            </View>

            {/* Navigation Options */}
            <View style={styles.navigationContainer}>
                <TouchableOpacity
                    style={[
                        styles.navOption,
                        activeForm === 'update' && styles.navOptionActive
                    ]}
                    onPress={() => handleFormChange('update')}
                >
                    <Settings size={20} color={activeForm === 'update' ? '#e36414' : '#999'} />
                    <Text style={[
                        styles.navOptionText,
                        activeForm === 'update'
                            ? styles.navOptionTextActive
                            : { color: '#999' }  // Color cuando NO está activo
                    ]}>
                        Actualizar datos
                    </Text>
                    <ChevronLeft
                        size={20}
                        color={activeForm === 'update' ? '#e36414' : '#999'}
                        style={styles.chevronRight}
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.navOption,
                        activeForm === 'password' && styles.navOptionActive
                    ]}
                    onPress={() => handleFormChange('password')}
                >
                    <MapPin size={20} color={activeForm === 'password' ? '#e36414' : '#999'} />
                    <Text style={[
                        styles.navOptionText,
                        activeForm === 'password'
                            ? styles.navOptionTextActive
                            : { color: '#999' }  // Color cuando NO está activo
                    ]}>
                        Cambiar contraseña
                    </Text>
                    <ChevronLeft
                        size={20}
                        color={activeForm === 'password' ? '#e36414' : '#999'}
                        style={styles.chevronRight}
                    />
                </TouchableOpacity>
            </View>

            {/* Forms - CORREGIDO: Solo animación en el contenedor principal */}
            <Animated.View style={[styles.contentContainer, animatedStyle]}>
                {activeForm === 'update' ? renderUpdateForm() : renderPasswordForm()}
            </Animated.View>
        </View>
    );
};

export default Setting;