import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Text } from './Text';
import { BorderRadius, Layout, Shadows, Spacing } from '../../constants/theme';
import { useTheme } from '../../hooks';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  title?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: any;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  disabled,
  onPressIn,
  onPressOut,
  style,
  children,
  ...props
}) => {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = (e: any) => {
    scale.value = withSpring(0.95);
    onPressIn?.(e);
  };

  const handlePressOut = (e: any) => {
    scale.value = withSpring(1);
    onPressOut?.(e);
  };

  const getButtonStyle = () => {
    const baseStyle: any[] = [styles.button, styles[`button_${size}`]];
    
    if (fullWidth) {
      baseStyle.push(styles.fullWidth);
    }

    switch (variant) {
      case 'primary':
        baseStyle.push({ backgroundColor: colors.primary, ...Shadows.medium });
        break;
      case 'secondary':
        baseStyle.push({ backgroundColor: colors.success, ...Shadows.medium });
        break;
      case 'outline':
        baseStyle.push({ backgroundColor: 'transparent', borderWidth: 2, borderColor: colors.primary });
        break;
      case 'ghost':
        baseStyle.push({ backgroundColor: 'transparent' });
        break;
    }

    if (disabled) {
      baseStyle.push({ backgroundColor: colors.disabled, opacity: 0.6 });
    }

    return baseStyle;
  };

  const getTextColor = () => {
    if (disabled) return colors.disabled;
    
    switch (variant) {
      case 'primary':
      case 'secondary':
        return '#FFFFFF';
      case 'outline':
      case 'ghost':
        return colors.primary;
      default:
        return '#FFFFFF';
    }
  };

  return (
    <AnimatedTouchable
      style={[animatedStyle, getButtonStyle(), style]}
      disabled={disabled || loading}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' && (
            <View style={styles.iconLeft}>{icon}</View>
          )}
          {title && (
            <Text
              variant={size === 'small' ? 'small' : 'regular'}
              weight="semiBold"
              color={getTextColor()}
              align="center"
            >
              {title}
            </Text>
          )}
          {children}
          {icon && iconPosition === 'right' && (
            <View style={styles.iconRight}>{icon}</View>
          )}
        </View>
      )}
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: BorderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  button_small: {
    height: 40,
    paddingHorizontal: Spacing.lg,
  },
  button_medium: {
    height: Layout.inputHeight,
    paddingHorizontal: Spacing.xl,
  },
  button_large: {
    height: Layout.buttonHeight,
    paddingHorizontal: Spacing.xxl,
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  iconLeft: {
    marginRight: Spacing.sm,
  },
  iconRight: {
    marginLeft: Spacing.sm,
  },
});
