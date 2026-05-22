/**
 * ActivityCard
 * Displays a summary card for an activity with thumbnail map
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Text } from '../common/Text';
import { Activity, UnitSystem } from '../../types';
import { formatDistance, formatDuration, formatPace, formatDate } from '../../utils/formatting';
import { Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { useTheme } from '../../hooks';

interface ActivityCardProps {
  activity: Activity;
  onPress: () => void;
  units?: UnitSystem;
}

const ActivityCardComponent: React.FC<ActivityCardProps> = ({
  activity,
  onPress,
  units = 'metric',
}) => {
  const { colors } = useTheme();

  const getActivityIcon = () => {
    return 'fitness';
  };

  const getActivityColor = () => {
    return colors.primary;
  };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        {/* Activity details */}
        <View style={styles.details}>
          {/* Header with type and date */}
          <View style={styles.header}>
            <View style={styles.typeContainer}>
              <Ionicons
                name={getActivityIcon() as any}
                size={16}
                color={getActivityColor()}
              />
              <Text
                variant="small"
                weight="semiBold"
                color={colors.textPrimary}
                style={styles.typeText}
              >
                {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
              </Text>
            </View>
            <Text variant="extraSmall" color={colors.textSecondary}>
              {formatDate(activity.startTime, 'short')}
            </Text>
          </View>

          {/* Metrics */}
          <View style={styles.metrics}>
            {/* Distance */}
            <View style={styles.metric}>
              <Text variant="medium" weight="bold" color={colors.textPrimary}>
                {formatDistance(activity.distance, units)}
              </Text>
              <Text variant="extraSmall" color={colors.textSecondary}>
                Distance
              </Text>
            </View>

            {/* Duration */}
            <View style={styles.metric}>
              <Text variant="medium" weight="bold" color={colors.textPrimary}>
                {formatDuration(activity.duration)}
              </Text>
              <Text variant="extraSmall" color={colors.textSecondary}>
                Duration
              </Text>
            </View>

            {/* Pace */}
            <View style={styles.metric}>
              <Text variant="medium" weight="bold" color={colors.textPrimary}>
                {formatPace(activity.averagePace, units).split(' ')[0]}
              </Text>
              <Text variant="extraSmall" color={colors.textSecondary}>
                Pace
              </Text>
            </View>
          </View>

          {/* Footer with steps and calories */}
          <View style={styles.footer}>
            <View style={styles.footerItem}>
              <Ionicons name="footsteps" size={13} color={colors.textSecondary} />
              <Text variant="extraSmall" color={colors.textSecondary} style={styles.footerText}>
                {activity.steps.toLocaleString()}
              </Text>
            </View>
            <View style={styles.footerItem}>
              <Ionicons name="flame" size={13} color={colors.textSecondary} />
              <Text variant="extraSmall" color={colors.textSecondary} style={styles.footerText}>
                {Math.round(activity.calories)} cal
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Activity type indicator bar */}
      <View style={[styles.indicator, { backgroundColor: getActivityColor() }]} />
    </TouchableOpacity>
  );
};

export const ActivityCard = React.memo(ActivityCardComponent, (prevProps, nextProps) => {
  return (
    prevProps.activity.id === nextProps.activity.id &&
    prevProps.units === nextProps.units
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.large,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    ...Shadows.small,
  },
  cardContent: {
    padding: Spacing.md,
  },
  details: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeText: {
    marginLeft: Spacing.xs,
  },
  metrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  metric: {
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    marginLeft: Spacing.xs,
  },
  indicator: {
    height: 4,
    width: '100%',
  },
});