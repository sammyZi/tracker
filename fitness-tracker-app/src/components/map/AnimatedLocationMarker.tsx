/**
 * AnimatedLocationMarker Component
 * 
 * Animated marker for current location with pulsing effect
 */

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Shadows } from '@/constants/theme';
import { useTheme } from '../../hooks';

interface AnimatedLocationMarkerProps {
  size?: number;
  color?: string;
}

export const AnimatedLocationMarker: React.FC<AnimatedLocationMarkerProps> = ({
  size = 40,
  color,
}) => {
  const { colors } = useTheme();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.3);
  const markerColor = color || colors.primary;

  useEffect(() => {
    // Pulsing animation
    scale.value = withRepeat(
      withTiming(1.5, {
        duration: 1500,
        easing: Easing.out(Easing.ease),
      }),
      -1,
      false
    );

    opacity.value = withRepeat(
      withTiming(0, {
        duration: 1500,
        easing: Easing.out(Easing.ease),
      }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Pulsing outer circle */}
      <Animated.View
        style={[
          styles.pulseCircle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: markerColor,
          },
          animatedStyle,
        ]}
      />
      
      {/* Static inner dot */}
      <View
        style={[
          styles.innerDot,
          {
            width: size * 0.4,
            height: size * 0.4,
            borderRadius: (size * 0.4) / 2,
            backgroundColor: markerColor,
            borderColor: colors.surface,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseCircle: {
    position: 'absolute',
  },
  innerDot: {
    borderWidth: 3,
    ...Shadows.small,
  },
});
