import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Shadows, Spacing } from '../../constants/theme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface FloatingActionButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  variant?: 'primary' | 'success' | 'error';
  size?: 'medium' | 'large';
  pulsing?: boolean;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon,
  onPress,
  variant = 'primary',
  size = 'large',
  pulsing = false,
}) => {
  const scale = useSharedValue(1);
  const pulseScale = useSharedValue(1);

  React.useEffect(() => {
    if (pulsing) {
      pulseScale.value = withRepeat(
        withTiming(1.1, {
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true
      );
    } else {
      pulseScale.value = withTiming(1);
    }
  }, [pulsing]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value * pulseScale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const getBackgroundColor = () => {
    switch (variant) {
      case 'success':
        return Colors.success;
      case 'error':
        return Colors.error;
      default:
        return Colors.primary;
    }
  };

  const buttonSize = size === 'large' ? 70 : 56;
  const iconSize = size === 'large' ? 32 : 24;

  return (
    <View style={styles.container}>
      {pulsing && (
        <Animated.View
          style={[
            styles.pulseRing,
            {
              width: buttonSize + 20,
              height: buttonSize + 20,
              borderRadius: (buttonSize + 20) / 2,
              backgroundColor: getBackgroundColor(),
            },
            animatedStyle,
          ]}
        />
      )}
      <AnimatedTouchable
        style={[
          styles.button,
          {
            width: buttonSize,
            height: buttonSize,
            borderRadius: buttonSize / 2,
            backgroundColor: getBackgroundColor(),
          },
          animatedStyle,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <Ionicons name={icon} size={iconSize} color={Colors.surface} />
      </AnimatedTouchable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.large,
  },
  pulseRing: {
    position: 'absolute',
    opacity: 0.3,
  },
});
