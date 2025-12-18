/**
 * GoalCard Component
 * Displays a single goal with progress bar
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../common/Text';
import { Card } from '../common/Card';
import { Goal } from '../../types';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import GoalsService from '../../services/goals/GoalsService';

interface GoalCardProps {
  goal: Goal;
  units: 'metric' | 'imperial';
  onPress?: () => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({ goal, units, onPress }) => {
  const progress = GoalsService.getProgressPercentage(goal);
  const isExpired = goal.endDate < Date.now();
  const isAchieved = goal.achieved;

  const getGoalIcon = (): keyof typeof Ionicons.glyphMap => {
    switch (goal.type) {
      case 'distance':
        return 'navigate';
      case 'frequency':
        return 'fitness';
      case 'duration':
        return 'time';
      default:
        return 'flag';
    }
  };

  const getGoalColor = (): string => {
    if (isAchieved) return Colors.success;
    if (isExpired) return Colors.disabled;
    if (progress >= 75) return Colors.warning;
    return Colors.primary;
  };

  const getGoalLabel = (): string => {
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

  const getPeriodLabel = (): string => {
    return goal.period === 'weekly' ? 'This Week' : 'This Month';
  };

  const color = getGoalColor();

  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress} activeOpacity={0.7}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
            <Ionicons name={getGoalIcon()} size={24} color={color} />
          </View>
          <View style={styles.headerText}>
            <Text variant="medium" weight="semiBold" color={Colors.textPrimary}>
              {getGoalLabel()}
            </Text>
            <Text variant="small" color={Colors.textSecondary}>
              {getPeriodLabel()}
            </Text>
          </View>
          {isAchieved && (
            <View style={styles.badge}>
              <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
            </View>
          )}
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressInfo}>
            <Text variant="large" weight="bold" color={Colors.textPrimary}>
              {GoalsService.formatGoalProgress(goal, units)}
            </Text>
            <Text variant="small" color={Colors.textSecondary}>
              of {GoalsService.formatGoalTarget(goal, units)}
            </Text>
          </View>

          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarBackground, { backgroundColor: `${color}20` }]}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${progress}%`,
                    backgroundColor: color,
                  },
                ]}
              />
            </View>
            <Text variant="small" weight="medium" color={color}>
              {progress.toFixed(0)}%
            </Text>
          </View>
        </View>

        {isExpired && !isAchieved && (
          <View style={styles.expiredBanner}>
            <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
            <Text variant="extraSmall" color={Colors.textSecondary} style={styles.expiredText}>
              Expired
            </Text>
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  badge: {
    marginLeft: Spacing.sm,
  },
  progressSection: {
    gap: Spacing.md,
  },
  progressInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.sm,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  expiredBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.xs,
  },
  expiredText: {
    marginLeft: Spacing.xs,
  },
});
