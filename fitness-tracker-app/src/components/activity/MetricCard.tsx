import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '../common/Text';
import { BorderRadius, Spacing, Typography } from '../../constants/theme';

interface MetricCardProps {
  label: string;
  value: string;
  unit?: string;
  icon?: React.ReactNode;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  icon,
}) => {
  // MetricCard is used as an overlay on the map with semi-transparent dark bg,
  // so it always uses white text regardless of theme
  return (
    <View style={styles.container}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text variant="small" weight="regular" color="#FFFFFF" style={styles.label}>
        {label}
      </Text>
      <View style={styles.valueContainer}>
        <Text
          style={styles.value}
          weight="semiBold"
          color="#FFFFFF"
        >
          {value}
        </Text>
        {unit && (
          <Text variant="regular" weight="regular" color="#FFFFFF" style={styles.unit}>
            {unit}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: BorderRadius.large,
    padding: Spacing.lg,
    minWidth: 100,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: Spacing.xs,
  },
  label: {
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    fontSize: Typography.fontSize.extraLarge,
    lineHeight: Typography.fontSize.extraLarge + 8,
  },
  unit: {
    marginLeft: Spacing.xs,
    opacity: 0.8,
  },
});
