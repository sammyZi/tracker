/**
 * GoalAchievedNotification Component
 * Displays a celebration notification when a goal is achieved
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../common/Text';
import { Button } from '../common/Button';
import { Goal } from '../../types';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import GoalsService from '../../services/goals/GoalsService';

interface GoalAchievedNotificationProps {
  goal: Goal | null;
  units: 'metric' | 'imperial';
  onClose: () => void;
}

export const GoalAchievedNotification: React.FC<GoalAchievedNotificationProps> = ({
  goal,
  units,
  onClose,
}) => {
  const scaleAnim = new Animated.Value(0);

  useEffect(() => {
    if (goal) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    }
  }, [goal]);

  if (!goal) return null;

  const getGoalTypeLabel = (): string => {
    switch (goal.type) {
      case 'distance':
        return 'Distance Goal';
      case 'frequency':
        return 'Activity Goal';
      case 'duration':
        return 'Duration Goal';
      default:
        return 'Goal';
    }
  };

  return (
    <Modal
      visible={!!goal}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="trophy" size={48} color={Colors.warning} />
            </View>
            <View style={styles.checkBadge}>
              <Ionicons name="checkmark-circle" size={32} color={Colors.success} />
            </View>
          </View>

          <Text variant="extraLarge" weight="bold" align="center" style={styles.title}>
            Goal Achieved! 🎉
          </Text>

          <Text variant="medium" color={Colors.textSecondary} align="center" style={styles.subtitle}>
            Congratulations! You've completed your {getGoalTypeLabel().toLowerCase()}
          </Text>

          <View style={styles.goalDetails}>
            <View style={styles.detailRow}>
              <Text variant="small" color={Colors.textSecondary}>
                Target
              </Text>
              <Text variant="medium" weight="semiBold" color={Colors.textPrimary}>
                {GoalsService.formatGoalTarget(goal, units)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text variant="small" color={Colors.textSecondary}>
                Period
              </Text>
              <Text variant="medium" weight="semiBold" color={Colors.textPrimary}>
                {goal.period === 'weekly' ? 'Weekly' : 'Monthly'}
              </Text>
            </View>
          </View>

          <Button
            title="Awesome!"
            variant="primary"
            onPress={onClose}
            style={styles.button}
          />
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  container: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.extraLarge,
    padding: Spacing.xxl,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    ...Shadows.large,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: Spacing.xl,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${Colors.warning}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkBadge: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    backgroundColor: Colors.surface,
    borderRadius: 16,
  },
  title: {
    marginBottom: Spacing.md,
  },
  subtitle: {
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  goalDetails: {
    width: '100%',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.medium,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    width: '100%',
  },
});
