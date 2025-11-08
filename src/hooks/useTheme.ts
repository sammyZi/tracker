/**
 * useTheme Hook
 * Provides theme colors based on user's theme preference
 */

import { useColorScheme } from 'react-native';
import { useSettings } from '../context';
import { LightColors, DarkColors } from '../constants/theme';

export const useTheme = () => {
  const { settings } = useSettings();
  const systemColorScheme = useColorScheme();

  // Determine which theme to use
  const getTheme = () => {
    if (settings.theme === 'auto') {
      return systemColorScheme === 'dark' ? 'dark' : 'light';
    }
    return settings.theme;
  };

  const theme = getTheme();
  const colors = theme === 'dark' ? DarkColors : LightColors;

  return {
    theme,
    colors,
    isDark: theme === 'dark',
  };
};
