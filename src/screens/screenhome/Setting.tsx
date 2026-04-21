import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {
  ChevronLeft,
  Settings,
  Eye,
  EyeOff,
  Lock,
  User,
  KeyRound,
  ShieldCheck,
  Building2,
  UserCircle,
  Mail,
  RefreshCw,
  Phone,
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
import { styles } from '../../styles/setting';
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
import axios from 'axios';
import ModalAlert from '../../components/ModalAlert';
import { Text, TextInput } from '../../components/ScaledComponents';

const Setting = () => {
  const { user, server, tipo } = useAuthStore();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [activeForm, setActiveForm] = useState<'update' | 'password'>('update');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalUsuarioVisible, setModalUsuarioVisible] = useState(false);
  const [modalEmailErrorVisible, setModalEmailErrorVisible] = useState(false);
  const [modalUpdateSuccessVisible, setModalUpdateSuccessVisible] = useState(false);
  const [modalPasswordMismatchVisible, setModalPasswordMismatchVisible] = useState(false);
  const [modalPasswordSuccessVisible, setModalPasswordSuccessVisible] = useState(false);
  const [modalPasswordErrorVisible, setModalPasswordErrorVisible] = useState(false);
  const [modalPasswordFieldsVisible, setModalPasswordFieldsVisible] = useState(false);

  const insets = useSafeAreaInsets();
  const navigationDetection = useNavigationMode();
  const bottomSpace = getBottomSpace(insets, navigationDetection.hasNavigationBar);

  useFocusEffect(
    React.useCallback(() => {
      NavigationBarColor('#ffffff', true);
    }, []),
  );

  const [updateData, setUpdateData] = useState({ usuario: '', correo: '', celular: '' });
  const [passwordData, setPasswordData] = useState({ usuario: '', password: '', confirmPassword: '' });

  const slideAnimation = useSharedValue(1);

  const handleGoBack = () => navigation.goBack();

  const handleFormChange = (formType: 'update' | 'password') => {
    if (formType === activeForm) return;
    slideAnimation.value = withTiming(0.7, { duration: 150 }, () => {
      runOnJS(setActiveForm)(formType);
      slideAnimation.value = withTiming(1, { duration: 150 });
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(slideAnimation.value, [0, 1], [0.7, 1]),
  }));

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleUpdateData = async () => {
    if (!updateData.usuario.trim()) { setModalVisible(true); return; }
    if ((tipo === 'c' || tipo === 'p') && !updateData.correo.trim()) { setModalUsuarioVisible(true); return; }
    if (tipo === 'n' && updateData.correo.trim() && !validateEmail(updateData.correo)) { setModalEmailErrorVisible(true); return; }
    if (tipo === 'n') await updateUserTypeN();
    else if (tipo === 'c') await updateUserTypeC();
    else if (tipo === 'p') await updateUserTypeP();
  };

  const updateUserTypeN = async () => {
    setLoading(true);
    try {
      await axios.put(`${server}/api/User/MobileUpdateUser?tipo=n`, { accountID: user?.username || '', description: updateData.usuario, contactEmail: updateData.correo, contactPhone: updateData.celular }, { headers: { 'Content-Type': 'application/json' } });
      setModalUpdateSuccessVisible(true);
      setUpdateData({ usuario: '', correo: '', celular: '' });
    } catch { setModalPasswordErrorVisible(true); }
    finally { setLoading(false); }
  };

  const updateUserTypeC = async () => {
    setLoading(true);
    try {
      await axios.put(`${server}/api/User/MobileUpdateUser?tipo=c`, { accountID: user?.username || '', apellidos: updateData.usuario, login: updateData.correo, telefono: updateData.celular }, { headers: { 'Content-Type': 'application/json' } });
      setModalUpdateSuccessVisible(true);
      setUpdateData({ usuario: '', correo: '', celular: '' });
    } catch { setModalPasswordErrorVisible(true); }
    finally { setLoading(false); }
  };

  const updateUserTypeP = async () => {
    setLoading(true);
    try {
      await axios.put(`${server}/api/User/MobileUpdateUser?tipo=p`, { accountID: user?.username || '', apellidos: updateData.usuario, codlan: updateData.correo, telefono: updateData.celular }, { headers: { 'Content-Type': 'application/json' } });
      setModalUpdateSuccessVisible(true);
      setUpdateData({ usuario: '', correo: '', celular: '' });
    } catch { setModalPasswordErrorVisible(true); }
    finally { setLoading(false); }
  };

  const handleEstablishPassword = async () => {
    if (!passwordData.usuario.trim() || !passwordData.password.trim() || !passwordData.confirmPassword.trim()) { setModalPasswordFieldsVisible(true); return; }
    if (passwordData.password !== passwordData.confirmPassword) { setModalPasswordMismatchVisible(true); return; }
    if (passwordData.password.length < 3) { setModalPasswordFieldsVisible(true); return; }
    await updatePassword();
  };

  const updatePassword = async () => {
    setLoadingPassword(true);
    try {
      await axios.put(`${server}/api/User/MobileUpdatePassword?username=${passwordData.usuario}&password=${passwordData.password}&tipo=${tipo}`, {}, { headers: { 'Content-Type': 'application/json' } });
      setModalPasswordSuccessVisible(true);
      setPasswordData({ usuario: '', password: '', confirmPassword: '' });
    } catch { setModalPasswordErrorVisible(true); }
    finally { setLoadingPassword(false); }
  };

const topSpace = Platform.OS === 'ios' ? insets.top -5 : insets.top + 5;

  return (
    <View style={[styles.container, { paddingBottom: bottomSpace }]}>

     {/* ── HEADER azul: solo avatar + título + tabs ── */}
<LinearGradient
  colors={['#05194fff', '#05194fff', '#18223dff']}
  start={{ x: 0, y: 0 }}
  end={{ x: 0, y: 1 }}
  style={[styles.header, { paddingTop: topSpace }]}
>
  <TouchableOpacity
    style={[styles.backButton, { top: insets.top + 10 }]}
    onPress={handleGoBack}
    activeOpacity={0.7}
  >
    <ChevronLeft size={26} color="#fff" />
  </TouchableOpacity>

  <View style={styles.avatarContainer}>
    <View style={styles.avatar}>
      {activeForm === 'update'
        ? <RefreshCw size={28} color="#e36414" strokeWidth={2} />
        : <Lock size={28} color="#e36414" strokeWidth={2} />
      }
    </View>
  </View>

  <Text style={styles.companyNameTitle}>Configuraciones</Text>

  {/* ── SEGMENTED CONTROL ── */}
  <View style={styles.segmentedContainer}>
    <TouchableOpacity
      style={[styles.segmentOption, activeForm === 'update' && styles.segmentOptionActive]}
      onPress={() => handleFormChange('update')}
      activeOpacity={0.8}
    >
      <Settings size={14} color={activeForm === 'update' ? '#e36414' : '#bbb'} />
      <Text style={[styles.segmentText, activeForm === 'update' && styles.segmentTextActive]}>
        Actualizar datos
      </Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={[styles.segmentOption, activeForm === 'password' && styles.segmentOptionActive]}
      onPress={() => handleFormChange('password')}
      activeOpacity={0.8}
    >
      <Lock size={14} color={activeForm === 'password' ? '#e36414' : '#bbb'} />
      <Text style={[styles.segmentText, activeForm === 'password' && styles.segmentTextActive]}>
        Cambiar contraseña
      </Text>
    </TouchableOpacity>
  </View>

</LinearGradient>

      {/* ── SECCIÓN BLANCA con bordes redondeados arriba ── */}
      <View style={styles.scrollContent}>
        <KeyboardAwareScrollView
          contentContainerStyle={styles.scrollContentContainer}
          enableOnAndroid
          enableAutomaticScroll
          extraScrollHeight={30}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <Animated.View style={animatedStyle}>

            {/* Card info con ícono y título */}
            <View style={styles.infoSection}>
              <View style={styles.infoHeader}>
                {activeForm === 'update'
                  ? <RefreshCw size={18} color="#e36414" />
                  : <Lock size={18} color="#e36414" />
                }
                <Text style={styles.infoTitle}>
                  {activeForm === 'update'
                    ? (tipo === 'n' ? '¿Nuevo correo o celular?' : '¿Nuevo usuario o celular?')
                    : '¿Olvidaste tu contraseña?'
                  }
                </Text>
              </View>

              <View style={styles.infoContent}>

                {/* ── FORMULARIO ACTUALIZAR ── */}
                {activeForm === 'update' ? (
                  <>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>
                        {tipo === 'n' ? 'Razón social' : 'Nombres'}{' '}
                        <Text style={styles.requiredAsterisk}>*</Text>
                      </Text>
                      <View style={styles.inputContainer}>
                        {tipo === 'n'
                          ? <Building2 size={18} color="#999" style={styles.inputIcon} />
                          : <UserCircle size={18} color="#999" style={styles.inputIcon} />
                        }
                        <TextInput
                          style={styles.textInput}
                          value={updateData.usuario}
                          onChangeText={text => setUpdateData({ ...updateData, usuario: text })}
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
                        {tipo === 'n'
                          ? <Mail size={18} color="#999" style={styles.inputIcon} />
                          : <User size={18} color="#999" style={styles.inputIcon} />
                        }
                        <TextInput
                          style={styles.textInput}
                          value={updateData.correo}
                          onChangeText={text => setUpdateData({ ...updateData, correo: text })}
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
                        <Phone size={18} color="#999" style={styles.inputIcon} />
                        <TextInput
                          style={styles.textInput}
                          value={updateData.celular}
                          onChangeText={text => setUpdateData({ ...updateData, celular: text })}
                          placeholder="000000000"
                          placeholderTextColor="#999"
                          keyboardType="phone-pad"
                          editable={!loading}
                        />
                      </View>
                    </View>
                  </>

                ) : (
                  /* ── FORMULARIO CONTRASEÑA ── */
                  <>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>
                        Usuario <Text style={styles.requiredAsterisk}>*</Text>
                      </Text>
                      <View style={styles.inputContainer}>
                        <User size={18} color="#999" style={styles.inputIcon} />
                        <TextInput
                          style={styles.textInput}
                          value={passwordData.usuario}
                          onChangeText={text => setPasswordData({ ...passwordData, usuario: text })}
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
                        <KeyRound size={18} color="#999" style={styles.inputIcon} />
                        <TextInput
                          style={styles.textInput}
                          value={passwordData.password}
                          onChangeText={text => setPasswordData({ ...passwordData, password: text })}
                          placeholder="Mínimo 3 caracteres"
                          placeholderTextColor="#999"
                          secureTextEntry={!showPassword}
                          editable={!loadingPassword}
                        />
                        <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPassword(!showPassword)} disabled={loadingPassword}>
                          {showPassword ? <EyeOff size={18} color="#666" /> : <Eye size={18} color="#666" />}
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>
                        Confirmar contraseña <Text style={styles.requiredAsterisk}>*</Text>
                      </Text>
                      <View style={styles.inputContainer}>
                        <ShieldCheck size={18} color="#999" style={styles.inputIcon} />
                        <TextInput
                          style={styles.textInput}
                          value={passwordData.confirmPassword}
                          onChangeText={text => setPasswordData({ ...passwordData, confirmPassword: text })}
                          placeholder="Repetir contraseña"
                          placeholderTextColor="#999"
                          secureTextEntry={!showConfirmPassword}
                          editable={!loadingPassword}
                        />
                        <TouchableOpacity style={styles.eyeButton} onPress={() => setShowConfirmPassword(!showConfirmPassword)} disabled={loadingPassword}>
                          {showConfirmPassword ? <EyeOff size={18} color="#666" /> : <Eye size={18} color="#666" />}
                        </TouchableOpacity>
                      </View>
                    </View>
                  </>
                )}
              </View>
            </View>

            {/* Botón */}
            <View style={styles.buttonWrapper}>
              <TouchableOpacity
                onPress={activeForm === 'update' ? handleUpdateData : handleEstablishPassword}
                activeOpacity={0.8}
                disabled={loading || loadingPassword}
              >
                <LinearGradient
                  colors={(loading || loadingPassword) ? ['#ccc', '#999'] : ['#fb5607', '#f26419']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientButton}
                >
                  {(loading || loadingPassword) ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.buttonText}>
                      {activeForm === 'update' ? 'Actualizar datos' : 'Establecer contraseña'}
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

          </Animated.View>
        </KeyboardAwareScrollView>
      </View>

      {/* Modales */}
      <ModalAlert isVisible={modalVisible} onClose={() => setModalVisible(false)} title="Campo requerido" message={`Por favor completa el campo ${tipo === 'n' ? 'Razón social' : 'Nombres'}`} />
      <ModalAlert isVisible={modalUsuarioVisible} onClose={() => setModalUsuarioVisible(false)} title="Campo requerido" message="Por favor completa el campo Usuario" />
      <ModalAlert isVisible={modalEmailErrorVisible} onClose={() => setModalEmailErrorVisible(false)} title="Correo inválido" message="Por favor ingresa un correo electrónico válido" />
      <ModalAlert isVisible={modalUpdateSuccessVisible} onClose={() => setModalUpdateSuccessVisible(false)} title="¡Actualización exitosa!" message="Tus datos han sido actualizados correctamente" buttonText="Aceptar" />
      <ModalAlert isVisible={modalPasswordMismatchVisible} onClose={() => setModalPasswordMismatchVisible(false)} title="Contraseñas no coinciden" message="Las contraseñas ingresadas no son iguales. Por favor verifica." />
      <ModalAlert isVisible={modalPasswordSuccessVisible} onClose={() => setModalPasswordSuccessVisible(false)} title="¡Contraseña actualizada!" message="Tu contraseña ha sido cambiada exitosamente" buttonText="Aceptar" />
      <ModalAlert isVisible={modalPasswordErrorVisible} onClose={() => setModalPasswordErrorVisible(false)} title="Error" message="No se pudo completar la operación. Por favor intenta de nuevo." />
      <ModalAlert isVisible={modalPasswordFieldsVisible} onClose={() => setModalPasswordFieldsVisible(false)} title="Campos incompletos" message="Por favor completa todos los campos requeridos. La contraseña debe tener mínimo 3 caracteres." />

    </View>
  );
};

export default Setting;