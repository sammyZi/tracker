/**
 * EmptyState
 * Displays an empty state with icon, message, and optional action
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './Text';
import { Button } from './Button';
import { Spacing } from '../../constants/theme';
import { useTheme } from '../../hooks';

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  message,
  actionText,
  onAction,
}) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={80} color={colors.disabled} />
      </View>
      
      <Text
        variant="mediumLarge"
        weight="semiBold"
        color={colors.textPrimary}
        style={styles.title}
      >
        {title}
      </Text>
      
      <Text
        variant="regular"
        color={colors.textSecondary}
        style={styles.message}
      >
        {message}
      </Text>
      
      {actionText && onAction && (
        <Button
          title={actionText}
          variant="primary"
          onPress={onAction}
          style={styles.button}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxxl,
  },
  iconContainer: {
    marginBottom: Spacing.xl,
  },
  title: {
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  message: {
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  button: {
    minWidth: 200,
  },
});
