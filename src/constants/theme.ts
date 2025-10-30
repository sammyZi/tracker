/**
 * Theme Configuration
 * Defines colors, typography, spacing, and other design tokens
 */

export const Colors = {
  // Primary Colors
  primary: '#6C63FF',
  primaryDark: '#5548E8',
  primaryLight: '#8B84FF',

  // Secondary Colors
  success: '#00D9A3',
  warning: '#FFB800',
  error: '#FF6B6B',
  info: '#4ECDC4',

  // Neutral Colors
  background: '#F8F9FA',
  surface: '#FFFFFF',
  textPrimary: '#2D3436',
  textSecondary: '#636E72',
  border: '#DFE6E9',
  disabled: '#B2BEC3',

  // Activity Type Colors
  running: '#00D9A3',
  walking: '#FFB800',
};

export const Typography = {
  // Font Families
  fontFamily: {
    regular: 'Poppins_400Regular',
    medium: 'Poppins_500Medium',
    semiBold: 'Poppins_600SemiBold',
    bold: 'Poppins_700Bold',
    light: 'Poppins_300Light',
  },

  // Font Sizes
  fontSize: {
    extraLarge: 56,
    large: 32,
    mediumLarge: 24,
    medium: 20,
    regular: 16,
    small: 14,
    extraSmall: 12,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const BorderRadius = {
  small: 8,
  medium: 12,
  large: 16,
  extraLarge: 20,
  round: 50,
};

export const Shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const Layout = {
  screenPadding: 16,
  cardPadding: 20,
  buttonHeight: 56,
  inputHeight: 48,
  minTouchTarget: 44,
};
