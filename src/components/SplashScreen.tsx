// src/components/SplashScreen.tsx
import React, { useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  StatusBar,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  withRepeat,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  // Valores animados
  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(30);
  const backgroundOpacity = useSharedValue(0);
  
  // Animaciones para los puntos de carga
  const dot1Opacity = useSharedValue(0.3);
  const dot2Opacity = useSharedValue(0.3);
  const dot3Opacity = useSharedValue(0.3);
  
  // Función para finalizar el splash
  const finishSplash = () => {
    onFinish();
  };

  useEffect(() => {
    // Secuencia de animaciones
    
    // 1. Fade in del fondo
    backgroundOpacity.value = withTiming(1, {
      duration: 500,
      easing: Easing.out(Easing.ease),
    });

    // 2. Animación del logo (escala y opacidad)
    logoOpacity.value = withDelay(300,
      withTiming(1, {
        duration: 800,
        easing: Easing.out(Easing.ease),
      })
    );

    logoScale.value = withDelay(300,
      withSequence(
        withTiming(1.2, {
          duration: 600,
          easing: Easing.out(Easing.back(1.5)),
        }),
        withTiming(1, {
          duration: 200,
          easing: Easing.out(Easing.ease),
        })
      )
    );

    // 3. Animación del texto
    textOpacity.value = withDelay(1000,
      withTiming(1, {
        duration: 600,
        easing: Easing.out(Easing.ease),
      })
    );

    textTranslateY.value = withDelay(1000,
      withTiming(0, {
        duration: 600,
        easing: Easing.out(Easing.back(1.2)),
      })
    );

    // 4. Animación de los puntos de carga (parpadeantes)
    dot1Opacity.value = withDelay(1200,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 400 }),
          withTiming(0.3, { duration: 400 })
        ),
        -1,
        false
      )
    );

    dot2Opacity.value = withDelay(1400,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 400 }),
          withTiming(0.3, { duration: 400 })
        ),
        -1,
        false
      )
    );

    dot3Opacity.value = withDelay(1600,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 400 }),
          withTiming(0.3, { duration: 400 })
        ),
        -1,
        false
      )
    );

    // 5. Fade out completo y finalizar
    const fadeOutTimer = setTimeout(() => {
      backgroundOpacity.value = withTiming(0, {
        duration: 500,
        easing: Easing.in(Easing.ease),
      }, (finished) => {
        if (finished) {
          runOnJS(finishSplash)();
        }
      });
    }, 1000); // Total: 3 segundos

    return () => clearTimeout(fadeOutTimer);
  }, []);

  // Estilos animados
  const backgroundStyle = useAnimatedStyle(() => ({
    opacity: backgroundOpacity.value,
  }));

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  const dot1Style = useAnimatedStyle(() => ({
    opacity: dot1Opacity.value,
  }));

  const dot2Style = useAnimatedStyle(() => ({
    opacity: dot2Opacity.value,
  }));

  const dot3Style = useAnimatedStyle(() => ({
    opacity: dot3Opacity.value,
  }));

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="#1e3a8a"
        translucent={false}
      />
      
      {/* Fondo animado */}
      <Animated.View style={[styles.background, backgroundStyle]} />
      
      {/* Contenido del splash */}
      <View style={styles.content}>
        
        {/* Logo animado */}
        <Animated.View style={[styles.logoContainer, logoStyle]}>
          <Image 
            source={require('../../assets/logob.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Texto animado */}
        <Animated.View style={[styles.textContainer, textStyle]}>
          <Text style={styles.logoText}>VELSAT MOBILE</Text>
          <Text style={styles.subtitleText}>Version 3.0</Text>
          
          {/* Indicador de carga */}
          <View style={styles.loadingContainer}>
            <Animated.View style={[styles.loadingDot, dot1Style]} />
            <Animated.View style={[styles.loadingDot, dot2Style]} />
            <Animated.View style={[styles.loadingDot, dot3Style]} />
          </View>
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

  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#1e3a8a',
  },

  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },

  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,

  },

  logoImage: {
    width: 200,
    height: 100,
  },

  textContainer: {
    alignItems: 'center',
  },

  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 4,
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  subtitleText: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    marginBottom: 30,
  },

  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#f97316',
    marginHorizontal: 4,
    opacity: 0.3,
  },
});

export default SplashScreen;