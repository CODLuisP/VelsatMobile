import axios from 'axios';
import { useAuthStore, User as UserType } from '../../store/authStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Eye,
  EyeOff,
  Fingerprint,
  LogIn,
  Scan,
  KeyRound,
  AlertCircle,
  X,
} from 'lucide-react-native';
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Image,
  Linking,
  Alert,
  Platform,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
  interpolate,
  runOnJS,
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutRight,
  Layout,
} from 'react-native-reanimated';
import { styles } from '../../styles/login';
import { useFocusEffect } from '@react-navigation/native';
import NavigationBarColor from 'react-native-navigation-bar-color';

import SystemNavigationBar from 'react-native-system-navigation-bar';
import {
  getBottomSpace,
  useNavigationMode,
} from '../../hooks/useNavigationMode';
import LinearGradient from 'react-native-linear-gradient';
import ModalAlert from '../ModalAlert';
import { Text, TextInput } from '../ScaledComponents';

const { width, height } = Dimensions.get('window');

// ─── Componente de error inline ───────────────────────────────────────────────
interface InlineErrorProps {
  message: string;
  onDismiss: () => void;
}

const getErrorTitle = (message: string): string => {
  const m = message.toLowerCase();
  if (m.includes('usuario') && m.includes('ingresa')) return 'Campo requerido';
  if (m.includes('contraseña') && m.includes('ingresa')) return 'Campo requerido';
  if (m.includes('incorrectos') || m.includes('inválida')) return 'Acceso denegado';
  if (m.includes('conexión') || m.includes('internet') || m.includes('red')) return 'Sin conexión';
  if (m.includes('servidor')) return 'Error del servidor';
  if (m.includes('biométric') || m.includes('pin') || m.includes('identidad')) return 'Autenticación fallida';
  return 'Atención';
};

const InlineError: React.FC<InlineErrorProps> = ({ message, onDismiss }) => {
  const progressWidth = useSharedValue(100);
  const containerOpacity = useSharedValue(0);
  const containerTranslateY = useSharedValue(8);

  useEffect(() => {
    containerOpacity.value = withTiming(1, { duration: 250, easing: Easing.out(Easing.cubic) });
    containerTranslateY.value = withTiming(0, { duration: 280, easing: Easing.out(Easing.back(1.4)) });
    progressWidth.value = withTiming(0, { duration: 5000, easing: Easing.linear });
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
    transform: [{ translateY: containerTranslateY.value }],
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const title = getErrorTitle(message);

  return (
    <Animated.View style={[errorStyles.wrapper, containerStyle]}>
      <View style={errorStyles.container}>
        {/* Ícono circular */}
        <View style={errorStyles.iconCircle}>
          <AlertCircle color="#f87171" size={16} strokeWidth={2} />
        </View>

        {/* Texto */}
        <View style={errorStyles.textBlock}>
          <Text style={errorStyles.title}>{title}</Text>
          <Text style={errorStyles.message} numberOfLines={2}>
            {message}
          </Text>
        </View>

        {/* Botón cerrar */}
        <TouchableOpacity
          onPress={onDismiss}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={errorStyles.closeBtn}
        >
          <X color="rgba(255,255,255,0.3)" size={11} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {/* Barra de progreso */}
      <View style={errorStyles.progressTrack}>
        <Animated.View style={[errorStyles.progressBar, progressStyle]} />
      </View>
    </Animated.View>
  );
};

const errorStyles = StyleSheet.create({
  wrapper: {
    marginBottom: 14,
    borderRadius: 14,
    overflow: 'hidden',

    backgroundColor: 'rgba(226, 75, 74, 0.09)',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 14,
    gap: 10,
  },
  iconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(226, 75, 74, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 11,
    fontWeight: '700',
    color: '#d62828',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  message: {
    fontSize: 13,
    fontWeight: '400',
    color: '#d62828',
    lineHeight: 18,
  },
  closeBtn: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 3,
  },
  progressTrack: {
    height: 2,
    backgroundColor: 'rgba(226, 75, 74, 0.15)',
  },
  progressBar: {
    height: 2,
    backgroundColor: '#e24b4a',
  },
});
// ──────────────────────────────────────────────────────────────────────────────

const Login = () => {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const buttonScale = useSharedValue(1);
  const loadingRotation = useSharedValue(0);

  // ── Estado de error unificado (reemplaza modalVisible + modalConfig) ──
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const errorTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showError = (message: string) => {
    // Limpiar timeout anterior si existía
    if (errorTimeout.current) clearTimeout(errorTimeout.current);
    setErrorMsg(message);
    // Auto-dismiss tras 5 segundos
    errorTimeout.current = setTimeout(() => setErrorMsg(null), 5000);
  };

  const dismissError = () => {
    if (errorTimeout.current) clearTimeout(errorTimeout.current);
    setErrorMsg(null);
  };

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (errorTimeout.current) clearTimeout(errorTimeout.current);
    };
  }, []);
  // ─────────────────────────────────────────────────────────────────────

  const insets = useSafeAreaInsets();
  const navigationDetection = useNavigationMode();

  const bottomSpace = getBottomSpace(
    insets,
    navigationDetection.hasNavigationBar,
  );

  useFocusEffect(
    React.useCallback(() => {
      NavigationBarColor('#ffffff', true);
    }, []),
  );

  // Animaciones principales
  const logoScale = useSharedValue(1);
  const formOpacity = useSharedValue(1);
  const formTranslateY = useSharedValue(0);
  const backgroundShift = useSharedValue(0);

  // Animación del carro en carretera (footer)
  const carPosition = useSharedValue(-100);
  const roadOffset = useSharedValue(0);

  // Animación del GPS (pulso)
  const gpsScale = useSharedValue(1);
  const gpsRotation = useSharedValue(0);

  // Usar authStore extendido
  const {
    setUser,
    setServer,
    setToken,
    setTipo,
    setLoading,
    biometric,
    checkBiometricAvailability,
    authenticateWithBiometric,
    authenticateWithPin,
    getBiometricDisplayName,
    canUseBiometricLogin,
    canUsePinLogin,
    logout,
  } = useAuthStore();

  const [showBiometricOption, setShowBiometricOption] = useState(false);
  const [showPinOption, setShowPinOption] = useState(false);

  const handleBiometricLogin = async () => {
    try {
      setIsLoggingIn(true);
      setLoading(true);

      const success = await authenticateWithBiometric();

      if (success) {
        // Autenticación exitosa
      } else {
        showError('No se pudo verificar tu identidad. Intenta de nuevo o usa tu contraseña.');
        setIsLoggingIn(false);
        setLoading(false);
      }
    } catch (error: any) {
      if (error?.message === 'USER_CANCELLED') {
        setIsLoggingIn(false);
        setLoading(false);
        return;
      }

      showError('Hubo un problema con la autenticación biométrica. Intenta con tu usuario y contraseña.');
      setIsLoggingIn(false);
      setLoading(false);
    }
  };

  const handlePinLogin = async () => {
    try {
      setIsLoggingIn(true);
      setLoading(true);

      const success = await authenticateWithPin();

      if (success) {
        // Autenticación exitosa
      } else {
        showError('No se pudo autenticar con PIN. Intenta con tu contraseña.');
        setIsLoggingIn(false);
        setLoading(false);
      }
    } catch (error: any) {
      showError('Hubo un problema con el PIN. Intenta con tu usuario y contraseña.');
      setIsLoggingIn(false);
      setLoading(false);
    }
  };

  const loadSavedCredentials = async () => {
    try {
      const savedUser = await AsyncStorage.getItem('savedUser');
      const rememberFlag = await AsyncStorage.getItem('rememberMe');

      if (rememberFlag === 'true' && savedUser) {
        setUsuario(savedUser);
        setRememberMe(true);
      }
    } catch (error) {
      // Error silencioso
    }
  };

  const saveCredentials = async () => {
    try {
      if (rememberMe) {
        await AsyncStorage.setItem('savedUser', usuario);
        await AsyncStorage.setItem('rememberMe', 'true');
      } else {
        await clearCredentials();
      }
    } catch (error) {
      // Error silencioso
    }
  };

  const clearCredentials = async () => {
    try {
      await AsyncStorage.removeItem('savedUser');
      await AsyncStorage.removeItem('rememberMe');
    } catch (error) {
      // Error silencioso
    }
  };

  const makePhoneCall = (): void => {
    const phoneNumber: string = '912903330';
    const phoneUrl: string = `tel:${phoneNumber}`;

    Linking.openURL(phoneUrl)
      .then(() => {
        // Marcador abierto
      })
      .catch(error => {
        showError(`No se pudo abrir el marcador. Marca manualmente: ${phoneNumber}`);
      });
  };

  const handleLogin = async () => {
    if (!usuario.trim()) {
      showError('Por favor ingresa tu usuario');
      return;
    }

    if (!password.trim()) {
      showError('Por favor ingresa tu contraseña');
      return;
    }

    // Limpiar error anterior al intentar login
    dismissError();

    try {
      setIsLoggingIn(true);
      setLoading(true);

      buttonScale.value = withSequence(
        withTiming(0.95, { duration: 100 }),
        withTiming(1, { duration: 100 }),
      );

      loadingRotation.value = withRepeat(
        withTiming(360, { duration: 1000, easing: Easing.linear }),
        -1,
        false,
      );

      const serverResponse = await axios.get(
        `https://velsat.pe:2087/api/Server/MobileServer/${usuario}`,
        {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      const serverData = serverResponse.data;

      if (!serverData.servidor) {
        showError('No se pudo obtener la configuración del servidor');
        setIsLoggingIn(false);
        setLoading(false);
        return;
      }

      const loginResponse = await axios.post(
        `${serverData.servidor}/api/Login/MobileLogin`,
        {
          login: usuario,
          clave: password,
          tipo: serverData.tipo,
        },
        {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      const loginData = loginResponse.data;

      if (loginData.token && loginData.username && loginData.account) {
        await saveCredentials();

        setServer(serverData.servidor);
        setToken(loginData.token);
        setTipo(serverData.tipo);

        const userObj: UserType = {
          id: loginData.username,
          username: loginData.username,
          email: `${loginData.username}@velsat.com`,
          name:
            loginData.username.charAt(0).toUpperCase() +
            loginData.username.slice(1),
          description: loginData.account.description,
          codigo: loginData.account.codigo,
        };

        setUser(userObj);
      } else {
        showError('Respuesta de login inválida');
        setIsLoggingIn(false);
        setLoading(false);
      }
    } catch (error) {
      let errorMessage = 'Error de conexión';

      if (axios.isAxiosError(error)) {
        if (error.response) {
          const status = error.response.status;
          if (status === 401 || status === 400) {
            errorMessage = 'Usuario o contraseña incorrectos';
          } else if (status >= 500) {
            errorMessage = 'Error del servidor. Intenta más tarde';
          } else {
            errorMessage = `Error del servidor (${status})`;
          }
        } else if (error.request) {
          errorMessage = 'Sin conexión a internet. Verifica tu red';
        } else {
          errorMessage = 'Error de configuración';
        }
      }

      showError(errorMessage);
      setIsLoggingIn(false);
      setLoading(false);
    }
  };


  useEffect(() => {
    loadSavedCredentials();

    const checkBiometricWithDelay = async (): Promise<void> => {
      try {
        await checkBiometricAvailability();

        const canUseBio = canUseBiometricLogin();
        const canUsePin = canUsePinLogin();

        if (canUseBio) {
          setShowBiometricOption(true);

          setTimeout(() => {
            handleBiometricLogin();
          }, 500);
        } else if (canUsePin) {
          setShowPinOption(true);
        }
      } catch (error) {
        // Error silencioso
      }
    };

    checkBiometricWithDelay();

    backgroundShift.value = withRepeat(
      withTiming(1, { duration: 8000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );

    // Animación del GPS (pulso suave)
    gpsScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );

    // Rotación suave del GPS
    gpsRotation.value = withRepeat(
      withTiming(360, { duration: 20000, easing: Easing.linear }),
      -1,
      false,
    );

    const startCarAnimation = (): void => {
      carPosition.value = -200;
      carPosition.value = withTiming(
        width + 100,
        {
          duration: 8000,
          easing: Easing.linear,
        },
        (finished?: boolean) => {
          if (finished) {
            runOnJS(startCarAnimation)();
          }
        },
      );
    };

    startCarAnimation();

    roadOffset.value = withRepeat(
      withTiming(80, {
        duration: 800,
        easing: Easing.linear,
      }),
      -1,
      false,
    );
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }));

  const formStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: formTranslateY.value }],
  }));

  return (
    <>
      <View style={styles.mainContent}>
        {/* Background Section with GPS image */}
        <LinearGradient
          colors={['#03152fff', '#051541ff', '#042356ff']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.topBackgroundSection}>
          {/* GPS Background Image */}
          <Image
            source={require('../../../assets/fondovel.jpg')}
            style={styles.gpsBackgroundImage}
            resizeMode="cover"
          />

          {/* Welcome Header */}
          <View style={styles.headerSection}>
            <Text style={styles.welcomeTitles}>Bienvenido</Text>
            <Text style={styles.welcomeSubtitle}>
              Inicia sesión para continuar
            </Text>
          </View>

          {/* Logo GPS centrado */}
          <Animated.View style={[styles.logoContainer, logoStyle]}>
            <Image
              source={require('../../../assets/logob.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.welcomeTitle}>VELSAT</Text>
          </Animated.View>

          {/* Biometric/PIN buttons inside background section */}
          {showPinOption && !showBiometricOption && (
            <View style={{ marginBottom: 20, paddingHorizontal: 48 }}>
              <TouchableOpacity
                style={styles.biometricButton}
                onPress={handlePinLogin}
                activeOpacity={0.7}
              >
                <View style={styles.biometricButtonContent}>
                  <KeyRound color="#fff" size={24} />
                  <Text style={styles.biometricButtonText}>
                    Acceder con PIN
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          )}

          {showBiometricOption && (
            <View style={{ marginBottom: 20, paddingHorizontal: 48 }}>
              <TouchableOpacity
                style={styles.biometricButton}
                onPress={handleBiometricLogin}
                activeOpacity={0.7}
              >
                <View style={styles.biometricButtonContent}>
                  {biometric.type === 'FaceID' && (
                    <Scan color="#fff" size={24} />
                  )}
                  {(biometric.type === 'TouchID' ||
                    biometric.type === 'Biometrics') && (
                    <Fingerprint color="#fff" size={24} />
                  )}
                  <Text style={styles.biometricButtonText}>
                    Acceder con {getBiometricDisplayName()}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
        </LinearGradient>

        {/* Form Section */}
        <Animated.View style={[styles.formContainer, formStyle]}>
          {/* Or Divider - only show if biometric/pin is available */}
          {(showPinOption || showBiometricOption) && (
            <View style={styles.orDivider}>
              <Text style={styles.orText}>o</Text>
            </View>
          )}

          {/* Input Fields */}
          <View style={styles.mainContentInputs}>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Usuario</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder=""
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={usuario}
                  onChangeText={text => {
                    setUsuario(text);
                    if (errorMsg) dismissError();
                  }}
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Contraseña</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder=""
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={password}
                  onChangeText={text => {
                    setPassword(text);
                    if (errorMsg) dismissError();
                  }}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIconContainer}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff color="rgba(0, 0, 0, 0.5)" size={20} />
                  ) : (
                    <Eye color="rgba(0, 0, 0, 0.5)" size={20} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* ── Error inline ── */}
          {errorMsg && (
            <InlineError message={errorMsg} onDismiss={dismissError} />
          )}

          {/* Sign In Button */}
          <TouchableOpacity
            style={styles.signInButton}
            onPress={handleLogin}
            disabled={isLoggingIn}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                isLoggingIn ? ['#22c55e', '#16a34a'] : ['#e85d04', '#dc2f02']
              }
              style={styles.signInGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {isLoggingIn ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Text style={styles.signInText}>Iniciar Sesión</Text>
                  <LogIn color="#ffffff" size={20} style={{ marginLeft: 8 }} />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Bottom Links */}
          <View style={styles.bottomLinks}>
            <TouchableOpacity
              style={styles.rememberContainer}
              onPress={() => setRememberMe(!rememberMe)}
            >
              <View
                style={[styles.checkbox, rememberMe && styles.checkboxChecked]}
              >
                {rememberMe && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.linkText}>Recordar usuario</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footerContainer}>
            {/* Social Login Section */}
            <View style={styles.socialSection}>
              <Text style={styles.socialText}>
                Aplicación de control logístico
              </Text>
            </View>

            {/* Version */}
            <View style={styles.versionContainer}>
              <Text style={styles.versionText}>V. 2.4.9</Text>
            </View>
          </View>
        </Animated.View>
      </View>

      {/* ModalAlert ya NO se usa para errores de login/validación */}
      {/* Si necesitas usarlo para otro propósito en el futuro, déjalo aquí */}
    </>
  );
};

export default Login;