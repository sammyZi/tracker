/**
 * RecordBrokenNotification Component
 * Displays a celebration notification when a personal record is broken
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../common/Text';
import { Spacing, BorderRadius } from '../../constants/theme';
import { useTheme } from '../../hooks';

interface RecordBrokenNotificationProps {
  recordType: 'distance' | 'pace' | 'duration' | 'steps';
  value: string;
  visible: boolean;
  onDismiss?: () => void;
}

const RECORD_LABELS = {
  distance: 'Longest Distance',
  pace: 'Fastest Pace',
  duration: 'Longest Duration',
  steps: 'Most Steps',
};

const RECORD_ICONS = {
  distance: 'map-marker-distance' as const,
  pace: 'speedometer' as const,
  duration: 'time' as const,
  steps: 'walk' as const,
};

export const RecordBrokenNotification: React.FC<RecordBrokenNotificationProps> = ({
  recordType,
  value,
  visible,
  onDismiss,
}) => {
  const { colors } = useTheme();

  const RECORD_COLORS = {
    distance: colors.primary,
    pace: colors.success,
    duration: colors.info,
    steps: colors.warning,
  };

  const slideAnim = useRef(new Animated.Value(-100)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Slide in and scale up
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss after 4 seconds
      const timer = setTimeout(() => {
        dismissNotification();
      }, 4000);

      return () => clearTimeout(timer);
    } else {
      dismissNotification();
    }
  }, [visible]);

  const dismissNotification = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onDismiss) {
        onDismiss();
      }
    });
  };

  if (!visible) {
    return null;
  }

  const color = RECORD_COLORS[recordType];

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <View style={[styles.notification, { backgroundColor: colors.surface, borderLeftColor: color }]}>
        <View style={styles.iconContainer}>
          <View style={[styles.trophyBackground, { backgroundColor: `${colors.warning}20` }]}>
            <Ionicons name="trophy" size={24} color={colors.warning} />
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <Text variant="small" weight="semiBold" color={color}>
              NEW PERSONAL RECORD! 🎉
            </Text>
          </View>
          <Text variant="medium" weight="semiBold" style={styles.recordLabel}>
            {RECORD_LABELS[recordType]}
          </Text>
          <Text variant="large" weight="bold" color={color} style={styles.value}>
            {value}
          </Text>
        </View>

        <View style={styles.celebrationContainer}>
          <Text style={styles.celebration}>🏆</Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: Spacing.lg,
    right: Spacing.lg,
    zIndex: 1000,
  },
  notification: {
    borderRadius: BorderRadius.large,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderLeftWidth: 4,
  },
  iconContainer: {
    marginRight: Spacing.md,
  },
  trophyBackground: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  header: {
    marginBottom: Spacing.xs,
  },
  recordLabel: {
    marginBottom: Spacing.xs,
  },
  value: {
    marginTop: Spacing.xs,
  },
  celebrationContainer: {
    marginLeft: Spacing.md,
  },
  celebration: {
    fontSize: 32,
  },
});
