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
import { BorderRadius, Shadows, Layout } from '../../constants/theme';
import { useTheme } from '../../hooks';

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
  const { colors } = useTheme();
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
    const baseStyle: any[] = [
      styles.card,
      { padding, backgroundColor: colors.surface },
    ];

    switch (variant) {
      case 'elevated':
        baseStyle.push(styles.elevated);
        break;
      case 'outlined':
        baseStyle.push({ borderWidth: 1, borderColor: colors.border });
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
  },
  default: {
    ...Shadows.small,
  },
  elevated: {
    ...Shadows.large,
  },
});
