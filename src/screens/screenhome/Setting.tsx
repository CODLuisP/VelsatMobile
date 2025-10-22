import React, { useState, useRef } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {
  ChevronLeft,
  Settings,
  MapPin,
  Eye,
  EyeOff,
  Check,
  Lock,
  User,
  KeyRound,
  ShieldCheck,
  Building2,
  UserCircle,
  Mail,
  RefreshCw,
  Phone,
  Save,
} from 'lucide-react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../../App';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { styles, alertStyles } from '../../styles/setting';
import NavigationBarColor from 'react-native-navigation-bar-color';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  getBottomSpace,
  useNavigationMode,
} from '../../hooks/useNavigationMode';
import { useAuthStore } from '../../store/authStore';
import LinearGradient from 'react-native-linear-gradient';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import AlertPro from 'react-native-alert-pro';
import axios from 'axios';

const Setting = () => {
  const { user, logout, server, tipo } = useAuthStore();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [activeForm, setActiveForm] = useState<'update' | 'password'>('update');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const alertRef = useRef<any>(null);
  const successAlertRef = useRef<any>(null);
  const errorAlertRef = useRef<any>(null);
  const userAlertRef = useRef<any>(null);
  const passwordMismatchAlertRef = useRef<any>(null);
  const passwordSuccessAlertRef = useRef<any>(null);
  const passwordErrorAlertRef = useRef<any>(null);
  const passwordFieldsAlertRef = useRef<any>(null);

  const insets = useSafeAreaInsets();
  const navigationDetection = useNavigationMode();
  const bottomSpace = getBottomSpace(
    insets,
    navigationDetection.hasNavigationBar,
  );

  useFocusEffect(
    React.useCallback(() => {
      NavigationBarColor('#00296b', false);
    }, []),
  );

  const [updateData, setUpdateData] = useState({
    usuario: '',
    correo: '',
    celular: '',
  });

  const [passwordData, setPasswordData] = useState({
    usuario: '',
    password: '',
    confirmPassword: '',
  });

  const slideAnimation = useSharedValue(1);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleFormChange = (formType: 'update' | 'password') => {
    if (formType === activeForm) return;

    slideAnimation.value = withTiming(0.7, { duration: 150 }, () => {
      runOnJS(setActiveForm)(formType);
      slideAnimation.value = withTiming(1, { duration: 150 });
    });
  };

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(slideAnimation.value, [0, 1], [0.7, 1]);

    return {
      opacity,
    };
  });

  // Validar email
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleUpdateData = async () => {
    // Validación: el campo usuario (Razón social o Nombres) es obligatorio
    if (!updateData.usuario.trim()) {
      alertRef.current?.open();
      return;
    }

    // Validación adicional para tipo 'c' y 'p': verificar que el usuario sea requerido
    if ((tipo === 'c' || tipo === 'p') && !updateData.correo.trim()) {
      userAlertRef.current?.open();
      return;
    }

    // Validación adicional para tipo 'n': verificar que el correo sea válido
    if (tipo === 'n' && updateData.correo.trim()) {
      if (!validateEmail(updateData.correo)) {
        errorAlertRef.current?.open();
        return;
      }
    }

    // Si pasa las validaciones, proceder con la actualización según el tipo
    if (tipo === 'n') {
      await updateUserTypeN();
    } else if (tipo === 'c') {
      await updateUserTypeC();
    } else if (tipo === 'p') {
      await updateUserTypeP();
    }
  };

  const updateUserTypeN = async () => {
    setLoading(true);
    
    try {
      const payload = {
        accountID: user?.username || '',
        description: updateData.usuario,
        contactEmail: updateData.correo,
        contactPhone: updateData.celular,
      };

      const response = await axios.put(
        `${server}/api/User/MobileUpdateUser?tipo=n`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Respuesta del servidor:', response.data);
      
      // Si la respuesta es exitosa, mostrar alerta de éxito
      successAlertRef.current?.open();
      
      // Limpiar los campos después de actualizar
      setUpdateData({
        usuario: '',
        correo: '',
        celular: '',
      });
      
    } catch (error: any) {
      console.error('Error al actualizar datos:', error);
      
      // Mostrar mensaje de error con AlertPro
      if (axios.isAxiosError(error)) {
        console.error('Error de respuesta:', error.response?.data);
      }
      passwordErrorAlertRef.current?.open();
    } finally {
      setLoading(false);
    }
  };

  const updateUserTypeC = async () => {
    setLoading(true);
    
    try {
      const payload = {
        accountID: user?.username || '',
        apellidos: updateData.usuario,
        login: updateData.correo,
        telefono: updateData.celular,
      };

      const response = await axios.put(
        `${server}/api/User/MobileUpdateUser?tipo=c`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Respuesta del servidor:', response.data);
      
      // Si la respuesta es exitosa, mostrar alerta de éxito
      successAlertRef.current?.open();
      
      // Limpiar los campos después de actualizar
      setUpdateData({
        usuario: '',
        correo: '',
        celular: '',
      });
      
    } catch (error: any) {
      console.error('Error al actualizar datos:', error);
      
      // Mostrar mensaje de error con AlertPro
      if (axios.isAxiosError(error)) {
        console.error('Error de respuesta:', error.response?.data);
      }
      passwordErrorAlertRef.current?.open();
    } finally {
      setLoading(false);
    }
  };

  const updateUserTypeP = async () => {
    setLoading(true);
    
    try {
      const payload = {
        accountID: user?.username || '',
        apellidos: updateData.usuario,
        codlan: updateData.correo,
        telefono: updateData.celular,
      };

      const response = await axios.put(
        `${server}/api/User/MobileUpdateUser?tipo=p`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Respuesta del servidor:', response.data);
      
      // Si la respuesta es exitosa, mostrar alerta de éxito
      successAlertRef.current?.open();
      
      // Limpiar los campos después de actualizar
      setUpdateData({
        usuario: '',
        correo: '',
        celular: '',
      });
      
    } catch (error: any) {
      console.error('Error al actualizar datos:', error);
      
      // Mostrar mensaje de error con AlertPro
      if (axios.isAxiosError(error)) {
        console.error('Error de respuesta:', error.response?.data);
      }
      passwordErrorAlertRef.current?.open();
    } finally {
      setLoading(false);
    }
  };

  const handleEstablishPassword = async () => {
    // Validar que todos los campos estén completos
    if (!passwordData.usuario.trim() || !passwordData.password.trim() || !passwordData.confirmPassword.trim()) {
      passwordFieldsAlertRef.current?.open();
      return;
    }

    // Validar que las contraseñas coincidan
    if (passwordData.password !== passwordData.confirmPassword) {
      passwordMismatchAlertRef.current?.open();
      return;
    }

    // Validar que la contraseña tenga al menos 3 caracteres
    if (passwordData.password.length < 3) {
      passwordFieldsAlertRef.current?.open();
      return;
    }

    // Proceder con el cambio de contraseña
    await updatePassword();
  };

  const updatePassword = async () => {
    setLoadingPassword(true);
    
    try {
      const response = await axios.put(
        `${server}/api/User/MobileUpdatePassword?username=${passwordData.usuario}&password=${passwordData.password}&tipo=${tipo}`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Respuesta del servidor (password):', response.data);
      
      // Si la respuesta es exitosa, mostrar alerta de éxito
      passwordSuccessAlertRef.current?.open();
      
      // Limpiar los campos después de actualizar
      setPasswordData({
        usuario: '',
        password: '',
        confirmPassword: '',
      });
      
    } catch (error: any) {
      console.error('Error al cambiar contraseña:', error);
      
      // Mostrar mensaje de error con AlertPro
      if (axios.isAxiosError(error)) {
        console.error('Error de respuesta:', error.response?.data);
      }
      passwordErrorAlertRef.current?.open();
    } finally {
      setLoadingPassword(false);
    }
  };

  const handleAlertClose = () => {
    alertRef.current?.close();
  };

  const handleSuccessAlertClose = () => {
    successAlertRef.current?.close();
  };

  const handleErrorAlertClose = () => {
    errorAlertRef.current?.close();
  };

  const handleUserAlertClose = () => {
    userAlertRef.current?.close();
  };

  const handlePasswordMismatchAlertClose = () => {
    passwordMismatchAlertRef.current?.close();
  };

  const handlePasswordSuccessAlertClose = () => {
    passwordSuccessAlertRef.current?.close();
  };

  const handlePasswordErrorAlertClose = () => {
    passwordErrorAlertRef.current?.close();
  };

  const handlePasswordFieldsAlertClose = () => {
    passwordFieldsAlertRef.current?.close();
  };

const renderPasswordForm = () => (
  <KeyboardAwareScrollView
    style={styles.scrollContent}
    contentContainerStyle={{ paddingBottom: 120 }}
    enableOnAndroid={true}
    enableAutomaticScroll={true}
    extraScrollHeight={30}
    keyboardShouldPersistTaps="handled"
    showsVerticalScrollIndicator={false}
    bounces={false}
  >
    <View style={styles.formContainer}>
      <View style={styles.headerSection}>
        <View style={styles.iconWrapper}>
          <View style={styles.iconCircle}>
            <Lock size={32} color="#e36414" strokeWidth={2} />
          </View>
        </View>
        <Text style={styles.headerTitleForm}>¿Olvidaste tu contraseña?</Text>
        <Text style={styles.headerSubtitle}>
          No te preocupes, suele pasar. Crea una nueva contraseña para tu cuenta.
        </Text>
      </View>

      <View style={styles.inputSection}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            Usuario <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <View style={styles.inputContainer}>
            <User size={20} color="#999" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              value={passwordData.usuario}
              onChangeText={text =>
                setPasswordData({ ...passwordData, usuario: text })
              }
              placeholder="Ingresa tu usuario"
              placeholderTextColor="#999"
              editable={!loadingPassword}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            Nueva contraseña <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <View style={styles.inputContainer}>
            <KeyRound size={20} color="#999" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              value={passwordData.password}
              onChangeText={text =>
                setPasswordData({ ...passwordData, password: text })
              }
              placeholder="Mínimo 3 caracteres"
              placeholderTextColor="#999"
              secureTextEntry={!showPassword}
              editable={!loadingPassword}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
              disabled={loadingPassword}
            >
              {showPassword ? (
                <EyeOff size={20} color="#666" />
              ) : (
                <Eye size={20} color="#666" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            Confirmar contraseña <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <View style={styles.inputContainer}>
            <ShieldCheck size={20} color="#999" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              value={passwordData.confirmPassword}
              onChangeText={text =>
                setPasswordData({ ...passwordData, confirmPassword: text })
              }
              placeholder="Repetir contraseña"
              placeholderTextColor="#999"
              secureTextEntry={!showConfirmPassword}
              editable={!loadingPassword}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={loadingPassword}
            >
              {showConfirmPassword ? (
                <EyeOff size={20} color="#666" />
              ) : (
                <Eye size={20} color="#666" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.buttonWrapper}>
        <TouchableOpacity
          onPress={handleEstablishPassword}
          activeOpacity={0.8}
          disabled={loadingPassword}
        >
          <LinearGradient
            colors={loading ? ['#ccc', '#999'] : ['#fb5607', '#f26419']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            {loadingPassword ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Text style={styles.buttonText}>Establecer contraseña</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  </KeyboardAwareScrollView>
);


const renderUpdateForm = () => (
  <KeyboardAwareScrollView
    style={styles.scrollContent}
    contentContainerStyle={{ paddingBottom: 20 }}
    enableOnAndroid={true}
    enableAutomaticScroll={true}
    extraScrollHeight={30}
    keyboardShouldPersistTaps="handled"
    showsVerticalScrollIndicator={false}
    bounces={false}
  >
    <View style={styles.formContainer}>
      <View style={styles.headerSection}>
        <View style={styles.iconWrapper}>
          <View style={styles.iconCircle}>
            <RefreshCw size={32} color="#e36414" strokeWidth={2} />
          </View>
        </View>
        <Text style={styles.headerTitleForm}>
          {tipo === 'n' ? '¿Nuevo correo o celular?' : '¿Nuevo usuario o celular?'}
        </Text>
        <Text style={styles.headerSubtitle}>
         Actualiza tus datos fácilmente aquí. Para otros cambios, contáctanos.
        </Text>
      </View>

      <View style={styles.inputSection}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            {tipo === 'n' ? 'Razón social' : 'Nombres'} <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <View style={styles.inputContainer}>
            {tipo === 'n' ? (
              <Building2 size={20} color="#999" style={styles.inputIcon} />
            ) : (
              <UserCircle size={20} color="#999" style={styles.inputIcon} />
            )}
            <TextInput
              style={styles.textInput}
              value={updateData.usuario}
              onChangeText={text =>
                setUpdateData({ ...updateData, usuario: text })
              }
              placeholder={tipo === 'n' ? 'Razón social' : 'Nombres'}
              placeholderTextColor="#999"
              editable={!loading}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            {tipo === 'n' ? 'Correo asociado' : 'Usuario'}
            {(tipo === 'c' || tipo === 'p') && <Text style={styles.requiredAsterisk}> *</Text>}
          </Text>
          <View style={styles.inputContainer}>
            {tipo === 'n' ? (
              <Mail size={20} color="#999" style={styles.inputIcon} />
            ) : (
              <User size={20} color="#999" style={styles.inputIcon} />
            )}
            <TextInput
              style={styles.textInput}
              value={updateData.correo}
              onChangeText={text =>
                setUpdateData({ ...updateData, correo: text })
              }
              placeholder={tipo === 'n' ? 'correo@ejemplo.com' : 'Usuario'}
              placeholderTextColor="#999"
              keyboardType={tipo === 'n' ? 'email-address' : 'default'}
              editable={!loading}
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Celular asociado</Text>
          <View style={styles.inputContainer}>
            <Phone size={20} color="#999" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              value={updateData.celular}
              onChangeText={text =>
                setUpdateData({ ...updateData, celular: text })
              }
              placeholder="000000000"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              editable={!loading}
            />
          </View>
        </View>
      </View>

      <View style={styles.buttonWrapper}>
        <TouchableOpacity
          onPress={handleUpdateData}
          activeOpacity={0.8}
          disabled={loading}
        >
          <LinearGradient
            colors={loading ? ['#ccc', '#999'] : ['#fb5607', '#f26419']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Text style={styles.buttonText}>Actualizar datos</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  </KeyboardAwareScrollView>
);

  const topSpace = insets.top + 5;

  return (
    <LinearGradient
      colors={['#00296b', '#1e3a8a', '#00296b']}
      style={[styles.container, { paddingBottom: bottomSpace-2 }]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <View style={[styles.header, { paddingTop: topSpace }]}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <ChevronLeft size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configuraciones</Text>
      </View>

      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[
            styles.navOption,
            activeForm === 'update' && styles.navOptionActive,
          ]}
          onPress={() => handleFormChange('update')}
          activeOpacity={0.8}
        >
          <Settings
            size={20}
            color={activeForm === 'update' ? '#e36414' : '#999'}
          />
          <Text
            style={[
              styles.navOptionText,
              activeForm === 'update'
                ? styles.navOptionTextActive
                : { color: '#999' },
            ]}
          >
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
            activeForm === 'password' && styles.navOptionActive,
          ]}
          onPress={() => handleFormChange('password')}
                    activeOpacity={0.8}

        >
          <MapPin
            size={20}
            color={activeForm === 'password' ? '#e36414' : '#999'}
          />
          <Text
            style={[
              styles.navOptionText,
              activeForm === 'password'
                ? styles.navOptionTextActive
                : { color: '#999' },
            ]}
          >
            Cambiar contraseña
          </Text>
          <ChevronLeft
            size={20}
            color={activeForm === 'password' ? '#e36414' : '#999'}
            style={styles.chevronRight}
          />
        </TouchableOpacity>
      </View>

      <Animated.View style={[styles.contentContainer, animatedStyle]}>
        {activeForm === 'update' ? renderUpdateForm() : renderPasswordForm()}
      </Animated.View>

      {/* Alert Pro Component - Campo requerido (Razón social o Nombres) */}
      <AlertPro
        ref={alertRef}
        title="Campo requerido"
        message={`Por favor completa el campo ${tipo === 'n' ? 'Razón social' : 'Nombres'}`}
        textCancel="Entendido"
        showConfirm={false}
        onCancel={handleAlertClose}
        closeOnPressMask={true}
        customStyles={alertStyles}
      />

      {/* Alert Pro Component - Usuario requerido para tipo C y P */}
      <AlertPro
        ref={userAlertRef}
        title="Campo requerido"
        message="Por favor completa el campo Usuario"
        textCancel="Entendido"
        showConfirm={false}
        onCancel={handleUserAlertClose}
        closeOnPressMask={true}
        customStyles={alertStyles}
      />

      {/* Alert Pro Component - Email inválido */}
      <AlertPro
        ref={errorAlertRef}
        title="Correo inválido"
        message="Por favor ingresa un correo electrónico válido"
        textCancel="Entendido"
        showConfirm={false}
        onCancel={handleErrorAlertClose}
        closeOnPressMask={true}
        customStyles={alertStyles}
      />

      {/* Alert Pro Component - Éxito */}
      <AlertPro
        ref={successAlertRef}
        title="¡Actualización exitosa!"
        message="Tus datos han sido actualizados correctamente"
        textCancel="Aceptar"
        showConfirm={false}
        onCancel={handleSuccessAlertClose}
        closeOnPressMask={true}
        customStyles={alertStyles}
      />

      {/* Alert Pro Component - Contraseñas no coinciden */}
      <AlertPro
        ref={passwordMismatchAlertRef}
        title="Contraseñas no coinciden"
        message="Las contraseñas ingresadas no son iguales. Por favor verifica."
        textCancel="Entendido"
        showConfirm={false}
        onCancel={handlePasswordMismatchAlertClose}
        closeOnPressMask={true}
        customStyles={alertStyles}
      />

      {/* Alert Pro Component - Éxito cambio de contraseña */}
      <AlertPro
        ref={passwordSuccessAlertRef}
        title="¡Contraseña actualizada!"
        message="Tu contraseña ha sido cambiada exitosamente"
        textCancel="Aceptar"
        showConfirm={false}
        onCancel={handlePasswordSuccessAlertClose}
        closeOnPressMask={true}
        customStyles={alertStyles}
      />

      {/* Alert Pro Component - Error general */}
      <AlertPro
        ref={passwordErrorAlertRef}
        title="Error"
        message="No se pudo completar la operación. Por favor intenta de nuevo."
        textCancel="Entendido"
        showConfirm={false}
        onCancel={handlePasswordErrorAlertClose}
        closeOnPressMask={true}
        customStyles={alertStyles}
      />

      {/* Alert Pro Component - Campos incompletos contraseña */}
      <AlertPro
        ref={passwordFieldsAlertRef}
        title="Campos incompletos"
        message="Por favor completa todos los campos requeridos. La contraseña debe tener mínimo 3 caracteres."
        textCancel="Entendido"
        showConfirm={false}
        onCancel={handlePasswordFieldsAlertClose}
        closeOnPressMask={true}
        customStyles={alertStyles}
      />
    </LinearGradient>
  );
};

export default Setting;