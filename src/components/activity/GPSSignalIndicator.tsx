import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../common/Text';
import { Colors, BorderRadius, Spacing } from '../../constants/theme';
import { AccuracyQuality } from '../../types';

interface GPSSignalIndicatorProps {
  quality: AccuracyQuality;
  accuracy?: number;
}

export const GPSSignalIndicator: React.FC<GPSSignalIndicatorProps> = ({
  quality,
  accuracy,
}) => {
  const getQualityColor = () => {
    switch (quality) {
      case 'excellent':
        return Colors.success;
      case 'good':
        return Colors.info;
      case 'fair':
        return Colors.warning;
      case 'poor':
        return Colors.error;
      default:
        return Colors.disabled;
    }
  };

  const getQualityText = () => {
    switch (quality) {
      case 'excellent':
        return 'Excellent';
      case 'good':
        return 'Good';
      case 'fair':
        return 'Fair';
      case 'poor':
        return 'Poor';
      default:
        return 'Unknown';
    }
  };

  const getSignalBars = () => {
    switch (quality) {
      case 'excellent':
        return 4;
      case 'good':
        return 3;
      case 'fair':
        return 2;
      case 'poor':
        return 1;
      default:
        return 0;
    }
  };

  const signalBars = getSignalBars();

  return (
    <View style={styles.container}>
      <View style={styles.barsContainer}>
        {[1, 2, 3, 4].map((bar) => (
          <View
            key={bar}
            style={[
              styles.bar,
              {
                height: bar * 4 + 4,
                backgroundColor:
                  bar <= signalBars ? getQualityColor() : Colors.disabled,
              },
            ]}
          />
        ))}
      </View>
      <View style={styles.textContainer}>
        <Text variant="extraSmall" weight="medium" color={Colors.surface}>
          GPS: {getQualityText()}
        </Text>
        {accuracy !== undefined && (
          <Text variant="extraSmall" weight="regular" color={Colors.surface} style={styles.accuracy}>
            ±{accuracy.toFixed(0)}m
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: BorderRadius.medium,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginRight: Spacing.sm,
    gap: 2,
  },
  bar: {
    width: 4,
    borderRadius: 2,
  },
  textContainer: {
    flexDirection: 'column',
  },
  accuracy: {
    opacity: 0.8,
    marginTop: 2,
  },
});
