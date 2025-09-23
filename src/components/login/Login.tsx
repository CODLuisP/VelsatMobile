import axios from 'axios';
import { useAuthStore, User as UserType } from '../../store/authStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Eye, EyeOff, Fingerprint, Lock, Phone, Scan, User } from 'lucide-react-native';
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
  interpolateColor,
  runOnJS,
} from 'react-native-reanimated';
import { styles } from '../../styles/login';

const { width, height } = Dimensions.get('window');

const Login = () => {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Animaciones principales
  const logoScale = useSharedValue(1);
  const formOpacity = useSharedValue(1);
  const formTranslateY = useSharedValue(0);
  const backgroundShift = useSharedValue(0);
  const orb1 = useSharedValue(0);
  const orb2 = useSharedValue(0);
  const orb3 = useSharedValue(0);

  // Animaciones GPS específicas
  const satellite1 = useSharedValue(0);
  const satellite2 = useSharedValue(0);
  const satellite3 = useSharedValue(0);
  const gpsSignal1 = useSharedValue(0);
  const gpsSignal2 = useSharedValue(0);
  const gpsSignal3 = useSharedValue(0);
  const radarSweep = useSharedValue(0);
  const antennaSignal = useSharedValue(0);
  const networkPulse = useSharedValue(0);

  // Animación del carro en carretera (footer)
  const carPosition = useSharedValue(-100);
  const roadOffset = useSharedValue(0);

  // Usar authStore extendido
  const { 
    setUser, 
    setServer, 
    setToken, 
    setLoading,
    // Funciones biométricas
    biometric,
    checkBiometricAvailability,
    authenticateWithBiometric,
    getBiometricDisplayName,
    canUseBiometricLogin
  } = useAuthStore();

  // Estado para mostrar opción biométrica
  const [showBiometricOption, setShowBiometricOption] = useState(false);


  // Login con biometría
// REEMPLAZA tu handleBiometricLogin en Login.tsx por esta versión:

const handleBiometricLogin = async () => {
  try {
    setLoading(true);
    console.log('🔐 Iniciando autenticación biométrica...');
    
    const success = await authenticateWithBiometric();
    
    if (success) {
      console.log('✅ Login biométrico exitoso');
      // La sesión se restaura automáticamente en el store
      // NO llamar setLoading(false) aquí porque la app navega automáticamente
    } else {
      console.log('❌ Autenticación biométrica fallida');
      Alert.alert(
        'Autenticación fallida',
        'No se pudo verificar tu identidad. Intenta de nuevo o usa tu contraseña.',
        [{ text: 'Entendido' }]
      );
      setLoading(false);
    }
  } catch (error) {
    console.log('❌ Error biometric login:', error);
    Alert.alert(
      'Error de Autenticación', 
      'Hubo un problema con la autenticación biométrica. Intenta con tu usuario y contraseña.',
      [{ text: 'Entendido' }]
    );
    setLoading(false);
  }
};

  // Función para cargar datos guardados (solo para credenciales normales)
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
      console.log('Error loading saved credentials:', error);
    }
  };

  // Función para guardar credenciales normales
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
      console.log('Error saving credentials:', error);
    }
  };

  // Función para limpiar credenciales normales
  const clearCredentials = async () => {
    try {
      await AsyncStorage.removeItem('savedUser');
      await AsyncStorage.removeItem('savedPassword');
      await AsyncStorage.removeItem('rememberMe');
    } catch (error) {
      console.log('Error clearing credentials:', error);
    }
  };

  // Función para abrir la aplicación de teléfono
  const makePhoneCall = () => {
    const phoneNumber = '91290330';
    const phoneUrl = `tel:${phoneNumber}`;

    Linking.canOpenURL(phoneUrl)
      .then(supported => {
        if (supported) {
          return Linking.openURL(phoneUrl);
        } else {
          Alert.alert('Error', 'No se pudo abrir la aplicación de teléfono');
        }
      })
      .catch(err => {
        Alert.alert('Error', 'No se pudo realizar la llamada');
        console.error('Error making phone call:', err);
      });
  };

const handleLogin = async () => {
  // Validaciones básicas
  if (!usuario.trim()) {
    Alert.alert('Error', 'Por favor ingresa tu usuario');
    return;
  }

  if (!password.trim()) {
    Alert.alert('Error', 'Por favor ingresa tu contraseña');
    return;
  }

  try {
    setLoading(true);

    // PASO 1: Obtener el servidor
    const serverResponse = await axios.get(
      `https://velsat.pe:2096/api/Server/${usuario}`,
      {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    const serverData = serverResponse.data;

    if (!serverData.servidor) {
      Alert.alert('Error', 'No se pudo obtener la configuración del servidor');
      setLoading(false);
      return;
    }

    // PASO 2: Hacer login con el servidor obtenido
    const loginResponse = await axios.post(
      `${serverData.servidor}/api/Login/login`,
      {
        login: usuario,
        clave: password,
      },
      {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    const loginData = loginResponse.data;

    if (loginData.token && loginData.username) {
      // Guardar credenciales normales si el usuario lo desea
      await saveCredentials();

      // DEBUG 1: Verificar estado de biometría antes de guardar
      const stateBefore = useAuthStore.getState();
      Alert.alert(
        'DEBUG 1 - Estado antes',
        `Biometría habilitada: ${stateBefore.biometric.isEnabled ? 'SÍ' : 'NO'}\n` +
        `Token recibido: ${loginData.token ? 'SÍ' : 'NO'}\n` +
        `Server recibido: ${serverData.servidor ? 'SÍ' : 'NO'}`,
        [{ text: 'Continuar', onPress: () => continueLogin() }]
      );

      const continueLogin = () => {
        // Guardar server y token
        setServer(serverData.servidor);
        setToken(loginData.token);

        // Crear objeto usuario
        const userObj: UserType = {
          id: loginData.username,
          username: loginData.username,
          email: `${loginData.username}@velsat.com`,
          name: loginData.username.charAt(0).toUpperCase() + loginData.username.slice(1),
        };

        // DEBUG 2: Verificar después de guardar server/token
        setTimeout(() => {
          const stateAfterTokens = useAuthStore.getState();
          Alert.alert(
            'DEBUG 2 - Después de guardar',
            `Token en store: ${stateAfterTokens.token ? 'SÍ' : 'NO'}\n` +
            `Server en store: ${stateAfterTokens.server ? 'SÍ' : 'NO'}\n` +
            `Biometría habilitada: ${stateAfterTokens.biometric.isEnabled ? 'SÍ' : 'NO'}`,
            [{ text: 'Continuar', onPress: () => saveUser() }]
          );

          const saveUser = () => {
            // Guardar usuario
            setUser(userObj);

            // DEBUG 3: Verificar resultado final
            setTimeout(() => {
              const finalState = useAuthStore.getState();
              Alert.alert(
                'DEBUG 3 - Resultado final',
                `Usuario guardado: ${finalState.user ? 'SÍ' : 'NO'}\n` +
                `Credenciales guardadas: ${finalState.biometricCredentials.username ? 'SÍ' : 'NO'}\n` +
                `Username en credenciales: ${finalState.biometricCredentials.username || 'NINGUNO'}`,
                [{ 
                  text: 'OK', 
                  onPress: () => {
                    // Si no se guardaron, forzar guardado manual
                    if (finalState.biometric.isEnabled && !finalState.biometricCredentials.username) {
                      finalState.saveBiometricCredentials(userObj.username, loginData.token, serverData.servidor);
                      
                      setTimeout(() => {
                        const afterManual = useAuthStore.getState();
                        Alert.alert(
                          'DEBUG - Guardado manual',
                          `Credenciales después del guardado manual: ${afterManual.biometricCredentials.username ? 'SÍ' : 'NO'}`,
                          [{ text: 'Finalizar' }]
                        );
                      }, 100);
                    }
                  }
                }]
              );
            }, 300);
          };
        }, 100);
      };

    } else {
      Alert.alert('Error', 'Respuesta de login inválida');
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
    setLoading(false);
  }
};

  // Función para reiniciar el carro cuando sale de pantalla
  const resetCarPosition = () => {
    carPosition.value = -100;
  };


  // 2. REEMPLAZAR el useEffect completo con este:
useEffect(() => {
  // Cargar credenciales guardadas al iniciar
  loadSavedCredentials();

  // Verificar biometría con delay para asegurar hidratación del store
  const checkBiometricWithDelay = async () => {
    try {
      // Esperar a que el store se hidrate completamente
await new Promise<void>(resolve => setTimeout(resolve, 1000));

      console.log('🔄 Verificando disponibilidad biométrica...');
      await checkBiometricAvailability();
      
      // Verificar si se puede usar login biométrico
      const canUse = canUseBiometricLogin();
      console.log('🔍 Puede usar biometría:', canUse);
      
      if (canUse) {
        setShowBiometricOption(true);
        console.log('✅ Opción biométrica habilitada');
      } else {
        console.log('❌ No se puede usar biometría:', {
          enabled: biometric.isEnabled,
          available: biometric.isAvailable,
          hasCredentials: !!useAuthStore.getState().biometricCredentials.username
        });
      }
    } catch (error) {
      console.log('❌ Error en verificación biométrica:', error);
    }
  };

  checkBiometricWithDelay();

  // Resto de animaciones (mantener todo igual)...
  backgroundShift.value = withRepeat(
    withTiming(1, { duration: 8000, easing: Easing.inOut(Easing.ease) }),
    -1,
    true,
  );

  orb1.value = withRepeat(
    withTiming(1, { duration: 6000, easing: Easing.inOut(Easing.ease) }),
    -1,
    true,
  );

  orb2.value = withRepeat(
    withTiming(1, { duration: 8000, easing: Easing.inOut(Easing.ease) }),
    -1,
    true,
  );

  orb3.value = withRepeat(
    withTiming(1, { duration: 10000, easing: Easing.inOut(Easing.ease) }),
    -1,
    true,
  );

  // Satélites en órbita
  satellite1.value = withRepeat(
    withTiming(1, { duration: 12000, easing: Easing.linear }),
    -1,
    false,
  );

  satellite2.value = withDelay(
    4000,
    withRepeat(
      withTiming(1, { duration: 15000, easing: Easing.linear }),
      -1,
      false,
    ),
  );

  satellite3.value = withDelay(
    8000,
    withRepeat(
      withTiming(1, { duration: 18000, easing: Easing.linear }),
      -1,
      false,
    ),
  );

  // Señales GPS pulsantes
  gpsSignal1.value = withRepeat(
    withSequence(
      withTiming(1, { duration: 1500, easing: Easing.out(Easing.cubic) }),
      withTiming(0, { duration: 500, easing: Easing.in(Easing.cubic) }),
    ),
    -1,
    false,
  );

  gpsSignal2.value = withDelay(
    800,
    withRepeat(
      withSequence(
        withTiming(1, { duration: 1500, easing: Easing.out(Easing.cubic) }),
        withTiming(0, { duration: 500, easing: Easing.in(Easing.cubic) }),
      ),
      -1,
      false,
    ),
  );

  gpsSignal3.value = withDelay(
    1600,
    withRepeat(
      withSequence(
        withTiming(1, { duration: 1500, easing: Easing.out(Easing.cubic) }),
        withTiming(0, { duration: 500, easing: Easing.in(Easing.cubic) }),
      ),
      -1,
      false,
    ),
  );

  // Radar sweep
  radarSweep.value = withRepeat(
    withTiming(1, { duration: 4000, easing: Easing.linear }),
    -1,
    false,
  );

  // Señal de antena
  antennaSignal.value = withRepeat(
    withSequence(
      withTiming(1, { duration: 800, easing: Easing.out(Easing.ease) }),
      withTiming(0.3, { duration: 200, easing: Easing.in(Easing.ease) }),
      withTiming(1, { duration: 800, easing: Easing.out(Easing.ease) }),
      withTiming(0, { duration: 1200, easing: Easing.in(Easing.ease) }),
    ),
    -1,
    false,
  );

  // Pulso de red/conexión
  networkPulse.value = withRepeat(
    withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
    -1,
    true,
  );

  // Animación del carro
  const startCarAnimation = () => {
    carPosition.value = withTiming(
      width + 100,
      {
        duration: 8000,
        easing: Easing.linear,
      },
      finished => {
        if (finished) {
          runOnJS(resetCarPosition)();
          runOnJS(startCarAnimation)();
        }
      },
    );
  };

  startCarAnimation();

  // Animación de las líneas de carretera
  roadOffset.value = withRepeat(
    withTiming(80, {
      duration: 800,
      easing: Easing.linear,
    }),
    -1,
    false,
  );
}, []); // Mantener array vacío 


  // Estilos animados
  const backgroundStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        backgroundShift.value,
        [0, 1],
        ['#1e3a8a', '#1e40af'],
      ),
    };
  });

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }));

  const formStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: formTranslateY.value }],
  }));

  const orb1Style = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(orb1.value, [0, 1], [0, -30]) },
      { translateX: interpolate(orb1.value, [0, 1], [0, 20]) },
    ],
  }));

  const orb2Style = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(orb2.value, [0, 1], [0, 40]) },
      { translateX: interpolate(orb2.value, [0, 1], [0, -25]) },
    ],
  }));

  const orb3Style = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(orb3.value, [0, 1], [0, -20]) },
      { translateX: interpolate(orb3.value, [0, 1], [0, 15]) },
    ],
  }));

  // Estilos animados GPS
  const satellite1Style = useAnimatedStyle(() => {
    const angle = interpolate(satellite1.value, [0, 1], [0, 360]);
    const radius = 150;
    const centerX = width * 0.8;
    const centerY = height * 0.15;

    return {
      transform: [
        { translateX: centerX + Math.cos((angle * Math.PI) / 180) * radius },
        {
          translateY:
            centerY + Math.sin((angle * Math.PI) / 180) * radius * 0.3,
        },
        { rotate: `${angle}deg` },
      ],
    };
  });

  const satellite2Style = useAnimatedStyle(() => {
    const angle = interpolate(satellite2.value, [0, 1], [0, 360]);
    const radius = 120;
    const centerX = width * 0.2;
    const centerY = height * 0.25;

    return {
      transform: [
        { translateX: centerX + Math.cos((angle * Math.PI) / 180) * radius },
        {
          translateY:
            centerY + Math.sin((angle * Math.PI) / 180) * radius * 0.4,
        },
        { rotate: `${-angle}deg` },
      ],
    };
  });

  const satellite3Style = useAnimatedStyle(() => {
    const angle = interpolate(satellite3.value, [0, 1], [0, 360]);
    const radius = 100;
    const centerX = width * 0.9;
    const centerY = height * 0.4;

    return {
      transform: [
        { translateX: centerX + Math.cos((angle * Math.PI) / 180) * radius },
        {
          translateY:
            centerY + Math.sin((angle * Math.PI) / 180) * radius * 0.2,
        },
        { rotate: `${angle * 0.5}deg` },
      ],
    };
  });

  const gpsSignal2Style = useAnimatedStyle(() => ({
    opacity: interpolate(gpsSignal2.value, [0, 1], [0.1, 0.6]),
    transform: [{ scale: interpolate(gpsSignal2.value, [0, 1], [0.3, 2.0]) }],
  }));

  const gpsSignal3Style = useAnimatedStyle(() => ({
    opacity: interpolate(gpsSignal3.value, [0, 1], [0.1, 0.7]),
    transform: [{ scale: interpolate(gpsSignal3.value, [0, 1], [0.4, 2.2]) }],
  }));

  const radarSweepStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${interpolate(radarSweep.value, [0, 1], [0, 360])}deg` },
    ],
    opacity: interpolate(
      radarSweep.value,
      [0, 0.1, 0.9, 1],
      [0.8, 0.3, 0.3, 0.8],
    ),
  }));

  const antennaSignalStyle = useAnimatedStyle(() => ({
    opacity: antennaSignal.value,
    transform: [
      { scale: interpolate(antennaSignal.value, [0, 1], [0.8, 1.3]) },
    ],
  }));

  const networkPulseStyle = useAnimatedStyle(() => ({
    opacity: interpolate(networkPulse.value, [0, 1], [0.2, 0.8]),
    transform: [{ scale: interpolate(networkPulse.value, [0, 1], [0.9, 1.1]) }],
  }));

  const carStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: carPosition.value }],
  }));

  const roadStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(roadOffset.value, [0, 80], [0, -80]),
      },
    ],
  }));

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Fondo gradiente animado */}
      <Animated.View style={[styles.backgroundGradient, backgroundStyle]} />

      {/* Orbes decorativos flotantes */}
      <Animated.View style={[styles.orb, styles.orb1, orb1Style]} />
      <Animated.View style={[styles.orb, styles.orb2, orb2Style]} />
      <Animated.View style={[styles.orb, styles.orb3, orb3Style]} />

      {/* ELEMENTOS GPS ANIMADOS */}

      {/* Satélites en órbita */}
      <Animated.View style={[styles.satellite, satellite1Style]}>
        <Text style={styles.satelliteIcon}>🛰️</Text>
      </Animated.View>

      <Animated.View style={[styles.satellite, satellite2Style]}>
        <Text style={styles.satelliteIcon}>🛰️</Text>
      </Animated.View>

      <Animated.View style={[styles.satellite, satellite3Style]}>
        <Text style={styles.satelliteIcon}>🛰️</Text>
      </Animated.View>

      {/* Señales GPS pulsantes */}
      <Animated.View
        style={[styles.gpsSignal, styles.gpsSignal2Pos, gpsSignal2Style]}
      />
      <Animated.View
        style={[styles.gpsSignal, styles.gpsSignal3Pos, gpsSignal3Style]}
      />

      {/* Radar sweep */}
      <View style={styles.radarContainer}>
        <Animated.View style={[styles.radarSweep, radarSweepStyle]} />
        <View style={styles.radarCenter}>
          <Text style={styles.radarIcon}>📡</Text>
        </View>
      </View>

      {/* Antena de comunicación */}
      <View style={styles.antennaContainer}>
        <Animated.View style={[styles.antennaSignal, antennaSignalStyle]} />
        <Text style={styles.antennaIcon}>📶</Text>
      </View>

      {/* Indicadores de red */}
      <Animated.View
        style={[styles.networkPulse, styles.networkPulse1, networkPulseStyle]}
      />
      <Animated.View
        style={[styles.networkPulse, styles.networkPulse2, networkPulseStyle]}
      />

      {/* Contenido principal */}
      <View style={styles.mainContent}>
        {/* Logo con glow effect */}
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

        {/* Formulario moderno */}
        <Animated.View style={[styles.formContainer, formStyle]}>
          <View style={styles.formCard}>
            <Text style={styles.welcomeText}>BIENVENIDO DE VUELTA</Text>

{/* DEBUG MEJORADO */}
<Text style={{color: 'white', fontSize: 10, textAlign: 'center', marginBottom: 10}}>
  DEBUG: {showBiometricOption ? 'Botón VISIBLE' : 'Botón OCULTO'}{'\n'}
  Habilitado: {biometric.isEnabled ? 'SÍ' : 'NO'}{'\n'}
  Disponible: {biometric.isAvailable ? 'SÍ' : 'NO'}{'\n'}
  Credenciales: {useAuthStore.getState().biometricCredentials.username ? 'SÍ' : 'NO'}
</Text>
            {/* BOTÓN BIOMÉTRICO - Solo aparece si está configurado */}
            {showBiometricOption && (
              <>
                <View style={styles.biometricSection}>
                  <TouchableOpacity 
                    style={styles.biometricButton} 
                    onPress={handleBiometricLogin}
                  >
                    <View style={styles.biometricButtonContent}>
                      {biometric.type === 'FaceID' && <Scan color="#fff" size={24} />}
                      {(biometric.type === 'TouchID' || biometric.type === 'Biometrics') && 
                        <Fingerprint color="#fff" size={24} />}
                      <Text style={styles.biometricButtonText}>
                        Acceder con {getBiometricDisplayName()}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Separador visual */}
                <View style={styles.loginSeparator}>
                  <View style={styles.separatorLine} />
                  <Text style={styles.separatorText}>o</Text>
                  <View style={styles.separatorLine} />
                </View>
              </>
            )}

            {/* Inputs con diseño moderno */}
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

            {/* Checkbox para recordar contraseña */}
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

            {/* Botón principal con gradiente */}
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <View style={styles.loginButtonGradient}>
                <Text style={styles.loginButtonText}>INICIAR SESIÓN</Text>
                <View style={styles.loginArrow}>
                  <Text style={styles.arrowText}>→</Text>
                </View>
              </View>
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
          </View>
        </Animated.View>

        {/* Footer con indicador de estado */}
        <View style={styles.footer}>
          <View style={styles.statusContainer}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>
              Aplicativo móvil • GPS en línea
            </Text>
          </View>
        </View>
      </View>

      {/* Carretera con carro en movimiento */}
      <View style={styles.footerRoadSection}>
        <View style={styles.road}>
          <Animated.View style={[styles.roadLines, roadStyle]}>
            {Array.from({ length: 40 }).map((_, index) => (
              <View key={`line1-${index}`} style={styles.roadLine} />
            ))}
          </Animated.View>
          <Animated.View style={[styles.roadLines, roadStyle, { left: 80 }]}>
            {Array.from({ length: 40 }).map((_, index) => (
              <View key={`line2-${index}`} style={styles.roadLine} />
            ))}
          </Animated.View>
        </View>

        <Animated.View style={[styles.carContainer, carStyle]}>
          <Image
            source={require('../../../assets/carlogin.png')}
            style={styles.carImage}
            resizeMode="contain"
          />
        </Animated.View>
      </View>
    </View>
  );
};

export default Login;