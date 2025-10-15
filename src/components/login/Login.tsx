import axios from 'axios';
import { useAuthStore, User as UserType } from '../../store/authStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Eye,
  EyeOff,
  Fingerprint,
  Lock,
  LogIn,
  Phone,
  Scan,
  User,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Image,
  Linking,
  Alert,
  Platform,
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
} from 'react-native-reanimated';
import { styles } from '../../styles/login';
import { useFocusEffect } from '@react-navigation/native';

import SystemNavigationBar from 'react-native-system-navigation-bar';
import {
  getBottomSpace,
  useNavigationMode,
} from '../../hooks/useNavigationMode';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

const Login = () => {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const buttonScale = useSharedValue(1);
  const loadingRotation = useSharedValue(0);

  const insets = useSafeAreaInsets();
  const navigationDetection = useNavigationMode();

  const bottomSpace = getBottomSpace(
    insets,
    navigationDetection.hasNavigationBar,
  );

  useFocusEffect(
    React.useCallback(() => {
      SystemNavigationBar.setNavigationColor('#00296b');

      return () => {
        SystemNavigationBar.setNavigationColor('#00296b');
      };
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
    getBiometricDisplayName,
    canUseBiometricLogin,
    logout,
  } = useAuthStore();

  const [showBiometricOption, setShowBiometricOption] = useState(false);

  const handleBiometricLogin = async () => {
    try {
      setIsLoggingIn(true);
      setLoading(true);

    const success = await authenticateWithBiometric();

      if (success) {
        console.log('✅ Autenticación biométrica exitosa');
      } else {
        console.log('❌ Autenticación biométrica fallida');
        
        Alert.alert(
          'Autenticación fallida',
          'No se pudo verificar tu identidad. Intenta de nuevo o usa tu contraseña.',
          [
            { 
              text: 'Entendido',
              onPress: () => {
                setIsLoggingIn(false);
                setLoading(false);
              }
            }
          ],
        );
      }
    } catch (error) {
      console.log('❌ Error en autenticación biométrica:', error);
      
      Alert.alert(
        'Error de Autenticación',
        'Hubo un problema con la autenticación biométrica. Intenta con tu usuario y contraseña.',
        [
          { 
            text: 'Entendido',
            onPress: () => {
              setIsLoggingIn(false);
              setLoading(false);
            }
          }
        ],
      );
    }
  };

  const loadSavedCredentials = async () => {
    try {
      const savedUser = await AsyncStorage.getItem('savedUser');
      const savedPassword = await AsyncStorage.getItem('savedPassword');
      const rememberFlag = await AsyncStorage.getItem('rememberMe');

      if (rememberFlag === 'true' && savedUser && savedPassword) {
        setUsuario(savedUser);
        setPassword(savedPassword);
        setRememberMe(true);
      }
    } catch (error) {
      // Error handling silently
    }
  };

  const saveCredentials = async () => {
    try {
      if (rememberMe) {
        await AsyncStorage.setItem('savedUser', usuario);
        await AsyncStorage.setItem('savedPassword', password);
        await AsyncStorage.setItem('rememberMe', 'true');
      } else {
        await clearCredentials();
      }
    } catch (error) {
      // Error handling silently
    }
  };

  const clearCredentials = async () => {
    try {
      await AsyncStorage.removeItem('savedUser');
      await AsyncStorage.removeItem('savedPassword');
      await AsyncStorage.removeItem('rememberMe');
    } catch (error) {
      // Error handling silently
    }
  };

  const makePhoneCall = (): void => {
    const phoneNumber: string = '912903330';
    const phoneUrl: string = `tel:${phoneNumber}`;

    Linking.openURL(phoneUrl)
      .catch(error => {
        Alert.alert(
          'No se pudo abrir el marcador',
          `Marca manualmente este número:\n${phoneNumber}`,
          [{ text: 'Entendido' }],
        );
      });
  };

  const handleLogin = async () => {
    if (!usuario.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu usuario');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu contraseña');
      return;
    }

    try {
      console.log('🚀 Iniciando login para usuario:', usuario);
      
      // Activar estado de carga INMEDIATAMENTE
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
      console.log('🌐 Servidor obtenido:', serverData.servidor, 'tipo:', serverData.tipo);

      if (!serverData.servidor) {
        Alert.alert(
          'Error',
          'No se pudo obtener la configuración del servidor',
        );
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

        // Busca esta sección en tu handleLogin (alrededor de la línea 268)
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
        Alert.alert('Error', 'Respuesta de login inválida');
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
          errorMessage = 'Sin conexión a internet. Verifica tu conexión';
        } else {
          errorMessage = 'Error de configuración';
        }
      }

      Alert.alert('Error de Login', errorMessage);
      setIsLoggingIn(false);
      setLoading(false);
    }
  };

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
    backgroundColor: isLoggingIn ? '#22c55e' : '#f97316',
  }));

  const loadingIconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${loadingRotation.value}deg` }],
  }));

  useEffect(() => {
    loadSavedCredentials();

    const checkBiometricWithDelay = async (): Promise<void> => {
      try {
        await checkBiometricAvailability();

        const canUse = canUseBiometricLogin();

      if (canUse) {
        console.log('✅ Login biométrico disponible');
        setShowBiometricOption(true);
        
        // 🆕 Auto-ejecutar login biométrico
        setTimeout(() => {
          handleBiometricLogin();
        }, 500);
        
      } else {
        console.log('⚠️ Login biométrico no disponible:', {
          enabled: biometric.isEnabled,
          available: biometric.isAvailable,
          hasCredentials:
            !!useAuthStore.getState().biometricCredentials.username,
        });
      }
    } catch (error) {
      console.log('❌ Error en verificación biométrica:', error);
    }
  };

    checkBiometricWithDelay();

    backgroundShift.value = withRepeat(
      withTiming(1, { duration: 8000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
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
    <LinearGradient
      colors={[
        '#003f88',
        '#00296b',
        '#00296b',
        '#001845',
        '#00296b',
        '#00296b',
        '#00296b',
      ]}
      style={styles.container}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <Image
        source={require('../../../assets/mapa.png')}
        style={styles.backgroundMap}
        resizeMode="cover"
      />

      <View style={styles.mainContent}>
        <Animated.View style={[styles.formContainer, formStyle]}>
          <View style={styles.formCard}>
            <Animated.View style={[styles.logoContainer, logoStyle]}>
              <View style={styles.logoMain}>
                <Image
                  source={require('../../../assets/logob.png')}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
                <Text style={styles.logoText}>VELSAT</Text>
              </View>
            </Animated.View>
            <Text style={styles.welcomeText}>BIENVENIDO DE VUELTA</Text>

            {showBiometricOption && (
              <>
                <View style={styles.biometricSection}>
                  <TouchableOpacity
                    style={styles.biometricButton}
                    onPress={handleBiometricLogin}
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

                <View style={styles.loginSeparator}>
                  <View style={styles.separatorLine} />
                  <Text style={styles.separatorText}>o</Text>
                  <View style={styles.separatorLine} />
                </View>
              </>
            )}

            <View style={styles.inputGroup}>
              <View style={styles.inputContainer}>
                <View style={styles.inputIconContainer}>
                  <User color="white" size={24} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Usuario"
                  placeholderTextColor="rgba(255,255,255,0.7)"
                  value={usuario}
                  onChangeText={setUsuario}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.inputIconContainer}>
                  <Lock color="white" size={24} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Contraseña"
                  placeholderTextColor="rgba(255,255,255,0.7)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIconContainer}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff color="rgba(255,255,255,0.7)" size={20} />
                  ) : (
                    <Eye color="rgba(255,255,255,0.7)" size={20} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.rememberContainer}
              onPress={() => setRememberMe(!rememberMe)}
            >
              <View
                style={[styles.checkbox, rememberMe && styles.checkboxChecked]}
              >
                {rememberMe && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.rememberText}>Recordar mi contraseña</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={isLoggingIn}
              activeOpacity={0.8}
            >
              <Animated.View
                style={[
                  styles.loginButtonGradient,
                  buttonAnimatedStyle,
                  { borderRadius: 16 },
                ]}
              >
                {isLoggingIn ? (
                  <>
                    <Animated.View
                      style={[styles.loadingSpinnerContainer, loadingIconStyle]}
                    >
                      <View style={styles.loadingSpinnerCircle} />
                    </Animated.View>
                    <Text style={styles.loginButtonText}>CARGANDO...</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.loginButtonText}>INICIAR SESIÓN</Text>
                    <View style={styles.loginArrow}>
                      <LogIn color="white" size={16} />
                    </View>
                  </>
                )}
              </Animated.View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={makePhoneCall}
            >
              <Phone
                color="rgba(255,255,255,0.8)"
                size={16}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.forgotPasswordText}>
                Contáctanos por teléfono
              </Text>
            </TouchableOpacity>

            <View style={styles.statusContainer}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>V. 2.2.1</Text>
            </View>
          </View>
        </Animated.View>
      </View>
    </LinearGradient>
  );
};

export default Login;
