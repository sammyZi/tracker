import React from 'react';
import {
  View,
  ViewProps,
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Colors, BorderRadius, Shadows, Layout } from '../../constants/theme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface CardProps extends ViewProps {
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: number;
  onPress?: () => void;
  pressable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = Layout.cardPadding,
  onPress,
  pressable = false,
  style,
  children,
  ...props
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (pressable || onPress) {
      scale.value = withSpring(0.98);
    }
  };

  const handlePressOut = () => {
    if (pressable || onPress) {
      scale.value = withSpring(1);
    }
  };

  const getCardStyle = () => {
    const baseStyle: any[] = [styles.card, { padding }];

    switch (variant) {
      case 'elevated':
        baseStyle.push(styles.elevated);
        break;
      case 'outlined':
        baseStyle.push(styles.outlined);
        break;
      default:
        baseStyle.push(styles.default);
    }

    return baseStyle;
  };

  if (onPress || pressable) {
    return (
      <AnimatedTouchable
        style={[animatedStyle, getCardStyle(), style]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        {...(props as TouchableOpacityProps)}
      >
        {children}
      </AnimatedTouchable>
    );
  }

  return (
    <View style={[getCardStyle(), style]} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.large,
    backgroundColor: Colors.surface,
  },
  default: {
    ...Shadows.small,
  },
  elevated: {
    ...Shadows.large,
  },
  outlined: {
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
