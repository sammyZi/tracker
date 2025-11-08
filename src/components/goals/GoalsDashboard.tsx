/**
 * GoalsDashboard Component
 * Compact goals display for dashboard/stats screen
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../common/Text';
import { Card } from '../common/Card';
import { Goal } from '../../types';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import GoalsService from '../../services/goals/GoalsService';

interface GoalsDashboardProps {
  goals: Goal[];
  units: 'metric' | 'imperial';
  onViewAll?: () => void;
}

export const GoalsDashboard: React.FC<GoalsDashboardProps> = ({
  goals,
  units,
  onViewAll,
}) => {
  if (goals.length === 0) {
    return null;
  }

  const getGoalIcon = (type: Goal['type']): keyof typeof Ionicons.glyphMap => {
    switch (type) {
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

  const getGoalColor = (goal: Goal): string => {
    if (goal.achieved) return Colors.success;
    const progress = GoalsService.getProgressPercentage(goal);
    if (progress >= 75) return Colors.warning;
    return Colors.primary;
  };

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="flag" size={20} color={Colors.primary} />
          <Text variant="mediumLarge" weight="semiBold">
            Active Goals
          </Text>
        </View>
        {onViewAll && (
          <TouchableOpacity onPress={onViewAll}>
            <Text variant="small" weight="medium" color={Colors.primary}>
              View All
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.goalsList}>
        {goals.slice(0, 3).map((goal) => {
          const progress = GoalsService.getProgressPercentage(goal);
          const color = getGoalColor(goal);

          return (
            <View key={goal.id} style={styles.goalItem}>
              <View style={styles.goalHeader}>
                <View style={[styles.iconBadge, { backgroundColor: `${color}20` }]}>
                  <Ionicons name={getGoalIcon(goal.type)} size={16} color={color} />
                </View>
                <View style={styles.goalInfo}>
                  <Text variant="small" weight="medium" color={Colors.textPrimary}>
                    {GoalsService.formatGoalTarget(goal, units)}
                  </Text>
                  <Text variant="extraSmall" color={Colors.textSecondary}>
                    {goal.period === 'weekly' ? 'This Week' : 'This Month'}
                  </Text>
                </View>
                {goal.achieved && (
                  <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                )}
              </View>

              <View style={styles.progressBar}>
                <View style={[styles.progressBackground, { backgroundColor: `${color}20` }]}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${progress}%`,
                        backgroundColor: color,
                      },
                    ]}
                  />
                </View>
                <Text variant="extraSmall" weight="medium" color={color}>
                  {progress.toFixed(0)}%
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      {goals.length > 3 && (
        <Text variant="extraSmall" color={Colors.textSecondary} align="center" style={styles.moreText}>
          +{goals.length - 3} more goals
        </Text>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  goalsList: {
    gap: Spacing.lg,
  },
  goalItem: {
    gap: Spacing.sm,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalInfo: {
    flex: 1,
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginLeft: 40, // Align with text above icon
  },
  progressBackground: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  moreText: {
    marginTop: Spacing.md,
  },
});
