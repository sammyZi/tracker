import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../common/Text';
import { BorderRadius, Spacing, Shadows } from '../../constants/theme';
import { useTheme } from '../../hooks';

/**
 * ActivityTypeSelector
 * 
 * Note: Currently the app uses a single 'activity' type.
 * This component is kept for future multi-activity support.
 * It displays the current activity type as a label.
 */
export const ActivityTypeSelector: React.FC = () => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={[styles.option, { backgroundColor: colors.primary }]}>
        <Ionicons
          name="fitness"
          size={24}
          color="#FFFFFF"
        />
        <Text
          variant="small"
          weight="semiBold"
          color="#FFFFFF"
          style={styles.label}
        >
          Activity
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: BorderRadius.large,
    padding: Spacing.xs,
    ...Shadows.medium,
  },
  option: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.medium,
  },
  label: {
    marginLeft: Spacing.sm,
  },
});
