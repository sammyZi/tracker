/**
 * PaceChart Component
 * Line chart showing pace improvements over time
 */

import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Activity, UnitSystem } from '../../types';
import { Colors, Spacing } from '../../constants/theme';
import { Text } from '../common/Text';

interface PaceChartProps {
  activities: Activity[];
  units: UnitSystem;
  period: 'week' | 'month';
}

const screenWidth = Dimensions.get('window').width;

export const PaceChart: React.FC<PaceChartProps> = ({
  activities,
  units,
  period,
}) => {
  const chartData = useMemo(() => {
    if (activities.length === 0) {
      return {
        labels: [],
        datasets: [{ data: [0] }],
      };
    }

    // Filter out activities with invalid pace
    const validActivities = activities.filter(
      (a) => a.averagePace > 0 && isFinite(a.averagePace)
    );

    if (validActivities.length === 0) {
      return {
        labels: [],
        datasets: [{ data: [0] }],
      };
    }

    // Sort by date
    const sortedActivities = [...validActivities].sort(
      (a, b) => a.startTime - b.startTime
    );

    // Take last N activities based on period
    const activitiesToShow = period === 'week' ? 7 : 14;
    const recentActivities = sortedActivities.slice(-activitiesToShow);

    const labels = recentActivities.map((activity, index) => {
      const date = new Date(activity.startTime);
      return period === 'week'
        ? date.toLocaleDateString('en-US', { weekday: 'short' })
        : `${date.getMonth() + 1}/${date.getDate()}`;
    });

    // Convert pace to minutes per unit for display
    const data = recentActivities.map((activity) => {
      let pace = activity.averagePace;
      if (units === 'imperial') {
        pace = pace * 1.60934; // Convert to min/mile
      }
      return pace / 60; // Convert to minutes
    });

    return {
      labels,
      datasets: [{ data: data.length > 0 ? data : [0] }],
    };
  }, [activities, units, period]);

  if (activities.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text variant="medium" color={Colors.textSecondary} align="center">
          No activity data available for this period
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LineChart
        data={chartData}
        width={screenWidth - 32}
        height={220}
        chartConfig={{
          backgroundColor: Colors.surface,
          backgroundGradientFrom: Colors.surface,
          backgroundGradientTo: Colors.surface,
          decimalPlaces: 1,
          color: (opacity = 1) => `rgba(0, 217, 163, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(99, 110, 114, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: '4',
            strokeWidth: '2',
            stroke: Colors.success,
          },
          propsForBackgroundLines: {
            strokeDasharray: '',
            stroke: Colors.border,
            strokeWidth: 1,
          },
        }}
        bezier
        style={styles.chart}
        withInnerLines
        withOuterLines
        withVerticalLines={false}
        withHorizontalLines
        withDots
        withShadow={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  chart: {
    marginVertical: Spacing.md,
    borderRadius: 16,
  },
  emptyContainer: {
    padding: Spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
