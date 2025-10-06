import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

interface RadarDotProps {
  color?: string;
  size?: number;
}

const RadarDot: React.FC<RadarDotProps> = ({ color = '#00ff00', size = 8 }) => {
  const scale1 = useRef(new Animated.Value(1)).current;
  const opacity1 = useRef(new Animated.Value(0.6)).current;

  const scale2 = useRef(new Animated.Value(1)).current;
  const opacity2 = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const createPulse = (
      scaleAnim: Animated.Value,
      opacityAnim: Animated.Value,
      delay: number
    ) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(scaleAnim, {
              toValue: 3.5,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 0,
              duration: 2000,
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.6,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const pulse1 = createPulse(scale1, opacity1, 0);
    const pulse2 = createPulse(scale2, opacity2, 1000); // desfase entre ondas

    pulse1.start();
    pulse2.start();

    return () => {
      pulse1.stop();
      pulse2.stop();
    };
  }, [scale1, opacity1, scale2, opacity2]);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Ondas expansivas */}
      <Animated.View
        style={[
          styles.pulse,
          {
            backgroundColor: `${color}44`, // color con transparencia
            opacity: opacity1,
            transform: [{ scale: scale1 }],
            width: size * 2.3,
            height: size * 2.3,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.pulse,
          {
            backgroundColor: `${color}44`,
            opacity: opacity2,
            transform: [{ scale: scale2 }],
            width: size * 2.3,
            height: size * 2.3,
          },
        ]}
      />
      {/* Punto central */}
      <View
        style={[
          styles.dot,
          { backgroundColor: color, width: size, height: size },
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
    zIndex: 3,
  },
  pulse: {
    position: 'absolute',
    borderRadius: 999,
    zIndex: 1,
  },
});

export default RadarDot;
