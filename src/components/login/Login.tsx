import AsyncStorage from '@react-native-async-storage/async-storage';
import { Lock, Phone, User } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
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

const { width, height } = Dimensions.get('window');

const Login = () => {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Animaciones principales
  const logoScale = useSharedValue(0);
  const logoGlow = useSharedValue(0);
  const formOpacity = useSharedValue(0);
  const formTranslateY = useSharedValue(50);
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

  // Función para cargar datos guardados
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

  // Función para guardar credenciales
  const saveCredentials = async () => {
    try {
      if (rememberMe) {
        await AsyncStorage.setItem('savedUser', usuario);
        await AsyncStorage.setItem('savedPassword', password);
        await AsyncStorage.setItem('rememberMe', 'true');
      } else {
        await AsyncStorage.removeItem('savedUser');
        await AsyncStorage.removeItem('savedPassword');
        await AsyncStorage.removeItem('rememberMe');
      }
    } catch (error) {
      console.log('Error saving credentials:', error);
    }
  };

  // Función para abrir la aplicación de teléfono
  const makePhoneCall = () => {
    const phoneNumber = '91290330';
    const phoneUrl = `tel:${phoneNumber}`;
    
    Linking.canOpenURL(phoneUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(phoneUrl);
        } else {
          Alert.alert('Error', 'No se pudo abrir la aplicación de teléfono');
        }
      })
      .catch((err) => {
        Alert.alert('Error', 'No se pudo realizar la llamada');
        console.error('Error making phone call:', err);
      });
  };

  // Función para manejar el login
  const handleLogin = () => {
    saveCredentials();
    // Aquí iría tu lógica de login
    console.log('Login attempted with:', { usuario, password, rememberMe });
  };

  // Función para reiniciar el carro cuando sale de pantalla
  const resetCarPosition = () => {
    carPosition.value = -100;
  };

  useEffect(() => {
    // Cargar credenciales guardadas al iniciar
    loadSavedCredentials();

    // Animación de entrada del logo
    logoScale.value = withDelay(300, 
      withTiming(1, { 
        duration: 1200, 
        easing: Easing.out(Easing.back(1.5)) 
      })
    );

    // Glow pulsante del logo
    logoGlow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    // Animación de entrada del formulario
    formOpacity.value = withDelay(800,
      withTiming(1, { duration: 1000, easing: Easing.out(Easing.cubic) })
    );
    formTranslateY.value = withDelay(800,
      withTiming(0, { duration: 1000, easing: Easing.out(Easing.back(1.2)) })
    );

    // Fondo dinámico con gradiente
    backgroundShift.value = withRepeat(
      withTiming(1, { duration: 8000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    // Orbes flotantes decorativos
    orb1.value = withRepeat(
      withTiming(1, { duration: 6000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    
    orb2.value = withRepeat(
      withTiming(1, { duration: 8000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    
    orb3.value = withRepeat(
      withTiming(1, { duration: 10000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    // ANIMACIONES GPS ESPECÍFICAS
    
    // Satélites en órbita
    satellite1.value = withRepeat(
      withTiming(1, { duration: 12000, easing: Easing.linear }),
      -1,
      false
    );
    
    satellite2.value = withDelay(4000,
      withRepeat(
        withTiming(1, { duration: 15000, easing: Easing.linear }),
        -1,
        false
      )
    );
    
    satellite3.value = withDelay(8000,
      withRepeat(
        withTiming(1, { duration: 18000, easing: Easing.linear }),
        -1,
        false
      )
    );

    // Señales GPS pulsantes
    gpsSignal1.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500, easing: Easing.out(Easing.cubic) }),
        withTiming(0, { duration: 500, easing: Easing.in(Easing.cubic) })
      ),
      -1,
      false
    );

    gpsSignal2.value = withDelay(800,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 1500, easing: Easing.out(Easing.cubic) }),
          withTiming(0, { duration: 500, easing: Easing.in(Easing.cubic) })
        ),
        -1,
        false
      )
    );

    gpsSignal3.value = withDelay(1600,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 1500, easing: Easing.out(Easing.cubic) }),
          withTiming(0, { duration: 500, easing: Easing.in(Easing.cubic) })
        ),
        -1,
        false
      )
    );

    // Radar sweep (barrido de radar)
    radarSweep.value = withRepeat(
      withTiming(1, { duration: 4000, easing: Easing.linear }),
      -1,
      false
    );

    // Señal de antena
    antennaSignal.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800, easing: Easing.out(Easing.ease) }),
        withTiming(0.3, { duration: 200, easing: Easing.in(Easing.ease) }),
        withTiming(1, { duration: 800, easing: Easing.out(Easing.ease) }),
        withTiming(0, { duration: 1200, easing: Easing.in(Easing.ease) })
      ),
      -1,
      false
    );

    // Pulso de red/conexión
    networkPulse.value = withRepeat(
      withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    // Animación del carro
    const startCarAnimation = () => {
      carPosition.value = withTiming(
        width + 100,
        {
          duration: 8000,
          easing: Easing.linear,
        },
        (finished) => {
          if (finished) {
            runOnJS(resetCarPosition)();
            runOnJS(startCarAnimation)();
          }
        }
      );
    };

    startCarAnimation();

    // Animación de las líneas de carretera
    roadOffset.value = withRepeat(
      withTiming(80, { 
        duration: 800,
        easing: Easing.linear 
      }),
      -1,
      false
    );

  }, []);

  // Estilos animados existentes
  const backgroundStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        backgroundShift.value,
        [0, 1],
        ['#1e3a8a', '#1e40af']
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

  // NUEVOS ESTILOS ANIMADOS GPS
  const satellite1Style = useAnimatedStyle(() => {
    const angle = interpolate(satellite1.value, [0, 1], [0, 360]);
    const radius = 150;
    const centerX = width * 0.8;
    const centerY = height * 0.15;
    
    return {
      transform: [
        { translateX: centerX + Math.cos(angle * Math.PI / 180) * radius },
        { translateY: centerY + Math.sin(angle * Math.PI / 180) * radius * 0.3 },
        { rotate: `${angle}deg` }
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
        { translateX: centerX + Math.cos(angle * Math.PI / 180) * radius },
        { translateY: centerY + Math.sin(angle * Math.PI / 180) * radius * 0.4 },
        { rotate: `${-angle}deg` }
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
        { translateX: centerX + Math.cos(angle * Math.PI / 180) * radius },
        { translateY: centerY + Math.sin(angle * Math.PI / 180) * radius * 0.2 },
        { rotate: `${angle * 0.5}deg` }
      ],
    };
  });

  const gpsSignal2Style = useAnimatedStyle(() => ({
    opacity: interpolate(gpsSignal2.value, [0, 1], [0.1, 0.6]),
    transform: [
      { scale: interpolate(gpsSignal2.value, [0, 1], [0.3, 2.0]) }
    ],
  }));

  const gpsSignal3Style = useAnimatedStyle(() => ({
    opacity: interpolate(gpsSignal3.value, [0, 1], [0.1, 0.7]),
    transform: [
      { scale: interpolate(gpsSignal3.value, [0, 1], [0.4, 2.2]) }
    ],
  }));

  const radarSweepStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${interpolate(radarSweep.value, [0, 1], [0, 360])}deg` }
    ],
    opacity: interpolate(radarSweep.value, [0, 0.1, 0.9, 1], [0.8, 0.3, 0.3, 0.8]),
  }));

  const antennaSignalStyle = useAnimatedStyle(() => ({
    opacity: antennaSignal.value,
    transform: [
      { scale: interpolate(antennaSignal.value, [0, 1], [0.8, 1.3]) }
    ],
  }));

  const networkPulseStyle = useAnimatedStyle(() => ({
    opacity: interpolate(networkPulse.value, [0, 1], [0.2, 0.8]),
    transform: [
      { scale: interpolate(networkPulse.value, [0, 1], [0.9, 1.1]) }
    ],
  }));

  const carStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: carPosition.value }],
  }));

  const roadStyle = useAnimatedStyle(() => ({
    transform: [{ 
      translateX: interpolate(
        roadOffset.value, 
        [0, 80], 
        [0, -80]
      ) 
    }],
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
      <Animated.View style={[styles.gpsSignal, styles.gpsSignal2Pos, gpsSignal2Style]} />
      <Animated.View style={[styles.gpsSignal, styles.gpsSignal3Pos, gpsSignal3Style]} />

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
      <Animated.View style={[styles.networkPulse, styles.networkPulse1, networkPulseStyle]} />
      <Animated.View style={[styles.networkPulse, styles.networkPulse2, networkPulseStyle]} />

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
                  secureTextEntry
                />
              </View>
            </View>

            {/* Checkbox para recordar contraseña */}
            <TouchableOpacity 
              style={styles.rememberContainer}
              onPress={() => setRememberMe(!rememberMe)}
            >
              <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
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

            <TouchableOpacity style={styles.forgotPassword} onPress={makePhoneCall}>
              <Phone color="rgba(255,255,255,0.8)" size={16} style={{ marginRight: 8 }} />
              <Text style={styles.forgotPasswordText}>Contáctanos por teléfono</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Footer con indicador de estado */}
        <View style={styles.footer}>
          <View style={styles.statusContainer}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Sistema móvil • GPS en línea</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e3a8a',
  },

  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  // Orbes decorativos
  orb: {
    position: 'absolute',
    borderRadius: 100,
    opacity: 0.1,
  },

  orb1: {
    width: 200,
    height: 200,
    backgroundColor: '#f97316',
    top: height * 0.1,
    right: -50,
  },

  orb2: {
    width: 150,
    height: 150,
    backgroundColor: '#3b82f6',
    top: height * 0.4,
    left: -30,
  },

  orb3: {
    width: 120,
    height: 120,
    backgroundColor: '#f97316',
    top: height * 0.6,
    right: -20,
  },

  // NUEVOS ESTILOS GPS
  
  // Satélites
  satellite: {
    position: 'absolute',
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.7,
  },

  satelliteIcon: {
    fontSize: 16,
  },

  // Señales GPS
  gpsSignal: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 0.2,
    borderColor: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.)',
  },

  gpsSignal1Pos: {
    top: height * 0.2,
    left: width * 0.15,
  },

  gpsSignal2Pos: {
    top: height * 0.35,
    right: width * 0.2,
  },

  gpsSignal3Pos: {
    top: height * 0.5,
    left: width * 0.1,
  },

  // Radar
  radarContainer: {
    position: 'absolute',
    top: height * 0.08,
    left: width * 0.1,
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },

  radarSweep: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    borderRightColor: '#10b981',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
  },

  radarCenter: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.5)',
  },

  radarIcon: {
    fontSize: 14,
  },

  // Antena
  antennaContainer: {
    position: 'absolute',
    top: height * 0.15,
    right: width * 0.15,
    alignItems: 'center',
    justifyContent: 'center',
  },

  antennaSignal: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.5)',
  },

  antennaIcon: {
    fontSize: 18,
    opacity: 0.8,
  },

  // Pulsos de red
  networkPulse: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(249, 115, 22, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.6)',
  },

  networkPulse1: {
    top: height * 0.3,
    left: width * 0.05,
  },

  networkPulse2: {
    top: height * 0.45,
    right: width * 0.05,
  },

  // Contenido principal
  mainContent: {
    flex: 1,
    paddingTop: (StatusBar.currentHeight || 0) + 80,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  // Logo moderno
  logoContainer: {
    alignItems: 'center',
    position: 'relative',
    marginTop: 20,
  },

  logoGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f97316',
    opacity: 0.3,
  },

  logoMain: {
    alignItems: 'center',
    zIndex: 1,
  },

  logoIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(249, 115, 22, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(249, 115, 22, 0.5)',
  },

  logoSymbol: {
    fontSize: 32,
  },

  logoText: {
    fontSize: 38,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 3,
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  logoSubtext: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },

  // Formulario moderno
  formContainer: {
    width: '100%',
    flex: 1,
    justifyContent: 'center',
    marginTop: 20,
  },

  formCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 15,
  },

  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
  },

  subtitleText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 32,
  },

  inputGroup: {
    marginBottom: 10,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    overflow: 'hidden',
  },

  inputIconContainer: {
    width: 50,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(249, 115, 22, 0.2)',
  },

  eyeIconContainer: {
    width: 50,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 8,
  },

  inputIcon: {
    fontSize: 20,
  },

  input: {
    flex: 1,
    height: 56,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#ffffff',
    backgroundColor: 'transparent',
  },

  // Checkbox para recordar contraseña
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },

  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },

  checkboxChecked: {
    backgroundColor: '#f97316',
    borderColor: '#f97316',
  },

  checkmark: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },

  rememberText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '500',
  },

  // Botón principal
  loginButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 16,
  },

  loginButtonGradient: {
    backgroundColor: '#f97316',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
  },

  loginButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginRight: 12,
  },

  loginArrow: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  arrowText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Divisor elegante
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },

  dividerCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
  },

  dividerText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '500',
  },

  // Botón biométrico
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 16,
  },

  biometricIcon: {
    fontSize: 20,
    marginRight: 12,
  },

  biometricText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    fontWeight: '500',
  },

  // Botón de contacto telefónico
  forgotPassword: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },

  forgotPasswordText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingBottom: 140,
    marginTop: 20,
  },

  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
    marginRight: 8,
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },

  statusText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    fontWeight: '600',
  },

  // Carretera con carro
  footerRoadSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    zIndex: 100,
  },

  logoImage: {
    width: 180,
    height: 80,
  },

  road: {
    width: '100%',
    height: 100,
    backgroundColor: '#374151',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },

  roadLines: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    width: width * 6,
    height: 4,
    top: '50%',
    marginTop: -2,
  },

  roadLine: {
    width: 30,
    height: 4,
    backgroundColor: '#f97316',
    marginHorizontal: 25,
    borderRadius: 2,
  },

  carContainer: {
    position: 'absolute',
    bottom: -5,
    left: 0,
    zIndex: 101,
  },

  carImage: {
    width: 130,
    height: 130,
  },
});

export default Login;