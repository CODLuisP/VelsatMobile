import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface RadarMarkerSVGProps {
  color: string;
  size: number;
  centerX: number;
  centerY: number;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const RadarMarkerSVG: React.FC<RadarMarkerSVGProps> = ({ color, size, centerX, centerY }) => {
  const scale1 = useRef(new Animated.Value(0.2)).current;
  const opacity1 = useRef(new Animated.Value(0.6)).current;
  
  const scale2 = useRef(new Animated.Value(0.2)).current;
  const opacity2 = useRef(new Animated.Value(0.6)).current;
  
  const scale3 = useRef(new Animated.Value(0.2)).current;
  const opacity3 = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const createPulseAnimation = (scale: Animated.Value, opacity: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(scale, {
              toValue: 6,
              duration: 3000,
              useNativeDriver: true,
            }),
            Animated.sequence([
              Animated.timing(opacity, {
                toValue: 0.3,
                duration: 1500,
                useNativeDriver: true,
              }),
              Animated.timing(opacity, {
                toValue: 0,
                duration: 1500,
                useNativeDriver: true,
              }),
            ]),
          ]),
          Animated.timing(scale, {
            toValue: 0.2,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const anim1 = createPulseAnimation(scale1, opacity1, 0);
    const anim2 = createPulseAnimation(scale2, opacity2, 1000);
    const anim3 = createPulseAnimation(scale3, opacity3, 2000);

    anim1.start();
    anim2.start();
    anim3.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, [color]);

  const baseRadius = size / 2;

  return (
    <Svg height={size * 12} width={size * 12} style={{ position: 'absolute' }}>
      <AnimatedCircle
        cx={centerX}
        cy={centerY}
        r={baseRadius}
        fill={color}
        opacity={opacity1}
        scale={scale1}
      />
      <AnimatedCircle
        cx={centerX}
        cy={centerY}
        r={baseRadius}
        fill={color}
        opacity={opacity2}
        scale={scale2}
      />
      <AnimatedCircle
        cx={centerX}
        cy={centerY}
        r={baseRadius}
        fill={color}
        opacity={opacity3}
        scale={scale3}
      />
    </Svg>
  );
};

export default RadarMarkerSVG;