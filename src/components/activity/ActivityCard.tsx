/**
 * ActivityCard
 * Displays a summary card for an activity with thumbnail map
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Text } from '../common/Text';
import { Activity, UnitSystem } from '../../types';
import { formatDistance, formatDuration, formatPace, formatDate } from '../../utils/formatting';
import { Colors, Spacing, BorderRadius, Shadows, Typography } from '../../constants/theme';

interface ActivityCardProps {
  activity: Activity;
  onPress: () => void;
  units?: UnitSystem;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  onPress,
  units = 'metric',
}) => {
  const getActivityIcon = () => {
    return activity.type === 'running' ? 'run' : 'walk';
  };

  const getActivityColor = () => {
    return activity.type === 'running' ? Colors.running : Colors.walking;
  };

  // Generate static map thumbnail URL
  const getMapThumbnailUrl = () => {
    if (!activity.route || activity.route.length === 0) {
      return null;
    }

    // Get start and end points
    const start = activity.route[0];
    const end = activity.route[activity.route.length - 1];

    // Calculate center point
    const centerLat = (start.latitude + end.latitude) / 2;
    const centerLng = (start.longitude + end.longitude) / 2;

    // Create polyline path (simplified for thumbnail)
    const pathPoints = activity.route
      .filter((_, index) => index % Math.max(1, Math.floor(activity.route.length / 20)) === 0)
      .map(point => `${point.latitude},${point.longitude}`)
      .join('|');

    // Google Static Maps API URL
    const width = 120;
    const height = 120;
    const zoom = 14;
    
    return `https://maps.googleapis.com/maps/api/staticmap?center=${centerLat},${centerLng}&zoom=${zoom}&size=${width}x${height}&scale=2&path=color:0x6C63FF|weight:3|${pathPoints}&markers=color:green|label:S|${start.latitude},${start.longitude}&markers=color:red|label:E|${end.latitude},${end.longitude}&style=feature:poi|visibility:off&key=YOUR_API_KEY`;
  };

  const mapUrl = getMapThumbnailUrl();

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        {/* Left side - Map thumbnail or placeholder */}
        <View style={styles.mapContainer}>
          {mapUrl ? (
            <Image
              source={{ uri: mapUrl }}
              style={styles.mapThumbnail}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.mapPlaceholder, { backgroundColor: getActivityColor() + '20' }]}>
              <Ionicons name="map-outline" size={32} color={getActivityColor()} />
            </View>
          )}
        </View>

        {/* Right side - Activity details */}
        <View style={styles.details}>
          {/* Header with type and date */}
          <View style={styles.header}>
            <View style={styles.typeContainer}>
              <MaterialCommunityIcons
                name={getActivityIcon()}
                size={16}
                color={getActivityColor()}
              />
              <Text
                variant="small"
                weight="semiBold"
                color={Colors.textPrimary}
                style={styles.typeText}
              >
                {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
              </Text>
            </View>
            <Text variant="extraSmall" color={Colors.textSecondary}>
              {formatDate(activity.startTime, 'short')}
            </Text>
          </View>

          {/* Metrics */}
          <View style={styles.metrics}>
            {/* Distance */}
            <View style={styles.metric}>
              <Text variant="medium" weight="bold" color={Colors.textPrimary}>
                {formatDistance(activity.distance, units)}
              </Text>
              <Text variant="extraSmall" color={Colors.textSecondary}>
                Distance
              </Text>
            </View>

            {/* Duration */}
            <View style={styles.metric}>
              <Text variant="medium" weight="bold" color={Colors.textPrimary}>
                {formatDuration(activity.duration)}
              </Text>
              <Text variant="extraSmall" color={Colors.textSecondary}>
                Duration
              </Text>
            </View>

            {/* Pace */}
            <View style={styles.metric}>
              <Text variant="medium" weight="bold" color={Colors.textPrimary}>
                {formatPace(activity.averagePace, units).split(' ')[0]}
              </Text>
              <Text variant="extraSmall" color={Colors.textSecondary}>
                Pace
              </Text>
            </View>
          </View>

          {/* Footer with steps and calories */}
          <View style={styles.footer}>
            <View style={styles.footerItem}>
              <Ionicons name="footsteps" size={13} color={Colors.textSecondary} />
              <Text variant="extraSmall" color={Colors.textSecondary} style={styles.footerText}>
                {activity.steps.toLocaleString()}
              </Text>
            </View>
            <View style={styles.footerItem}>
              <Ionicons name="flame" size={13} color={Colors.textSecondary} />
              <Text variant="extraSmall" color={Colors.textSecondary} style={styles.footerText}>
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

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.large,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    ...Shadows.small,
  },
  cardContent: {
    flexDirection: 'row',
    padding: Spacing.md,
  },
  mapContainer: {
    width: 90,
    height: 90,
    borderRadius: BorderRadius.medium,
    overflow: 'hidden',
    marginRight: Spacing.md,
  },
  mapThumbnail: {
    width: '100%',
    height: '100%',
  },
  mapPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
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
