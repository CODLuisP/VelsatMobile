import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Easing } from 'react-native';

interface RadarDotProps {
  color?: string;
  size?: number;
  pulseCount?: number;
}

const RadarDot: React.FC<RadarDotProps> = ({ 
  color = '#00ff00', 
  size = 8,
  pulseCount = 3 
}) => {
  const pulses = useRef(
    Array.from({ length: pulseCount }, () => ({
      scale: new Animated.Value(1),
      opacity: new Animated.Value(0.8),
    }))
  ).current;

  const rotation = useRef(new Animated.Value(0)).current;
  const glowPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animación de rotación del halo
    const rotateAnimation = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // Animación de brillo del punto central
    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, {
          toValue: 1.3,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowPulse, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    // Crear ondas de radar escalonadas
    const pulseAnimations = pulses.map((pulse, index) => {
      const delay = (index * 2000) / pulseCount;
      
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(pulse.scale, {
              toValue: 4,
              duration: 2000,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(pulse.opacity, {
              toValue: 0,
              duration: 2000,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(pulse.scale, {
              toValue: 1,
              duration: 0,
              useNativeDriver: true,
            }),
            Animated.timing(pulse.opacity, {
              toValue: 0.8,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
        ])
      );
    });

    rotateAnimation.start();
    glowAnimation.start();
    pulseAnimations.forEach(anim => anim.start());

    return () => {
      rotateAnimation.stop();
      glowAnimation.stop();
      pulseAnimations.forEach(anim => anim.stop());
    };
  }, [pulses, rotation, glowPulse, pulseCount]);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, { width: size * 8, height: size * 8 }]}>
      {/* Ondas de radar */}
      {pulses.map((pulse, index) => (
        <Animated.View
          key={index}
          style={[
            styles.pulse,
            {
              backgroundColor: color,
              opacity: pulse.opacity,
              transform: [{ scale: pulse.scale }],
              width: size * 3,
              height: size * 3,
            },
          ]}
        />
      ))}

      {/* Halo rotatorio (efecto de barrido de radar) */}
      <Animated.View
        style={[
          styles.halo,
          {
            width: size * 6,
            height: size * 6,
            transform: [{ rotate: spin }],
          },
        ]}
      >
        <View
          style={[
            styles.haloGradient,
            { 
              borderColor: color,
              borderTopColor: 'transparent',
              borderLeftColor: 'transparent',
            },
          ]}
        />
      </Animated.View>

      {/* Anillo exterior */}
      <View
        style={[
          styles.ring,
          {
            borderColor: `${color}60`,
            width: size * 4,
            height: size * 4,
            borderWidth: 1.5,
          },
        ]}
      />

      {/* Punto central con brillo */}
      <Animated.View
        style={[
          styles.dotGlow,
          {
            backgroundColor: color,
            width: size * 1.8,
            height: size * 1.8,
            shadowColor: color,
            transform: [{ scale: glowPulse }],
          },
        ]}
      />
      <View
        style={[
          styles.dot,
          { 
            backgroundColor: color, 
            width: size, 
            height: size,
            shadowColor: color,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    borderRadius: 999,
    zIndex: 5,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
  },
  dotGlow: {
    position: 'absolute',
    borderRadius: 999,
    zIndex: 4,
    opacity: 0.4,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  pulse: {
    position: 'absolute',
    borderRadius: 999,
    zIndex: 1,
    opacity: 0.6,
  },
  ring: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 2,
    zIndex: 2,
  },
  halo: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  haloGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
    borderWidth: 2,
    opacity: 0.5,
  },
});

export default RadarDot;