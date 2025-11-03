// AnimatedNavButton.tsx
import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Animated, StyleSheet, ViewStyle } from 'react-native';

interface AnimatedNavButtonProps {
  onPress: () => void;
  icon: React.ReactNode;
  style?: ViewStyle;
  direction?: 'left' | 'right' | 'up' | 'down';
  animationDuration?: number;
  stopAfter?: number;
}

export const AnimatedNavButton: React.FC<AnimatedNavButtonProps> = ({
  onPress,
  icon,
  style,
  direction = 'left',
  animationDuration = 800,
  stopAfter = 5000,
}) => {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const getMovement = () => {
      switch (direction) {
        case 'left':
          return -6;
        case 'right':
          return 6;
        case 'up':
          return -6;
        case 'down':
          return 6;
      }
    };

    const translateValue = getMovement();

    // Animación de deslizamiento suave
    const slideAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(slideAnim, {
          toValue: translateValue,
          duration: animationDuration,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: animationDuration,
          useNativeDriver: true,
        }),
      ])
    );

    // Animación de escala sutil
    const scaleAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.15,
          duration: animationDuration,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: animationDuration,
          useNativeDriver: true,
        }),
      ])
    );

    // Animación de opacidad (efecto de brillo)
    const opacityAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: animationDuration,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.4,
          duration: animationDuration,
          useNativeDriver: true,
        }),
      ])
    );

    slideAnimation.start();
    scaleAnimation.start();
    opacityAnimation.start();

    let timeout: number | undefined;
    if (stopAfter > 0) {
      timeout = setTimeout(() => {
        slideAnimation.stop();
        scaleAnimation.stop();
        opacityAnimation.stop();
        
        // Reseteo suave
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      }, stopAfter) as unknown as number;
    }

    return () => {
      slideAnimation.stop();
      scaleAnimation.stop();
      opacityAnimation.stop();
      if (timeout) clearTimeout(timeout);
    };
  }, [direction, animationDuration, stopAfter]);

  const getTransform = () => {
    if (direction === 'left' || direction === 'right') {
      return [{ translateX: slideAnim }, { scale: scaleAnim }];
    }
    return [{ translateY: slideAnim }, { scale: scaleAnim }];
  };

  return (
    <TouchableOpacity 
      onPress={onPress} 
      style={[styles.navButton, style]}
      activeOpacity={0.8}
    >
      {/* Glow effect background */}
      <Animated.View 
        style={[
          styles.glowEffect,
          {
            opacity: opacityAnim.interpolate({
              inputRange: [0.4, 1],
              outputRange: [0.2, 0.5],
            }),
          },
        ]} 
      />
      
      {/* Icon with animation */}
      <Animated.View
        style={{
          transform: getTransform(),
          opacity: opacityAnim,
        }}
      >
        {icon}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  navButton: {
    width: 40,
    height: 40,
    backgroundColor: '#dee2e6',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#adb5bd',
    shadowOffset: { 
      width: 0, 
      height: 4 
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'hidden',
  },
  glowEffect: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
  },
});