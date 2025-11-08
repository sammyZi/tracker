/**
 * DistanceChart Component
 * Line chart showing distance trends over time
 */

import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Activity, UnitSystem } from '../../types';
import { Colors, Typography, Spacing } from '../../constants/theme';
import { metersToKilometers, metersToMiles } from '../../utils/calculations';
import { Text } from '../common/Text';

interface DistanceChartProps {
  activities: Activity[];
  units: UnitSystem;
  period: 'week' | 'month';
}

const screenWidth = Dimensions.get('window').width;

export const DistanceChart: React.FC<DistanceChartProps> = ({
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

    // Group activities by day
    const groupedByDay = new Map<string, number>();
    const now = Date.now();
    const daysToShow = period === 'week' ? 7 : 30;

    // Initialize all days with 0
    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date(now - i * 24 * 60 * 60 * 1000);
      const key = date.toISOString().split('T')[0];
      groupedByDay.set(key, 0);
    }

    // Sum distances for each day
    activities.forEach((activity) => {
      const date = new Date(activity.startTime);
      const key = date.toISOString().split('T')[0];
      
      if (groupedByDay.has(key)) {
        const distance = units === 'metric'
          ? metersToKilometers(activity.distance)
          : metersToMiles(activity.distance);
        groupedByDay.set(key, (groupedByDay.get(key) || 0) + distance);
      }
    });

    // Convert to arrays
    const sortedEntries = Array.from(groupedByDay.entries()).sort(
      ([a], [b]) => a.localeCompare(b)
    );

    const labels = sortedEntries.map(([date]) => {
      const d = new Date(date);
      return period === 'week'
        ? d.toLocaleDateString('en-US', { weekday: 'short' })
        : `${d.getMonth() + 1}/${d.getDate()}`;
    });

    const data = sortedEntries.map(([, distance]) => distance);

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
          color: (opacity = 1) => `rgba(108, 99, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(99, 110, 114, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: '4',
            strokeWidth: '2',
            stroke: Colors.primary,
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
        fromZero
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
