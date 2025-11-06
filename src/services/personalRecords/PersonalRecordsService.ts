/**
 * PersonalRecordsService - Manages personal records tracking and updates
 * 
 * Features:
 * - Calculate personal records from activities
 * - Track longest distance, fastest pace, longest duration, most steps
 * - Automatic updates when new activities are saved
 * - Efficient record comparison and updates
 */

import {
  Activity,
  PersonalRecords,
  ActivityRecord,
} from '../../types';

class PersonalRecordsService {
  /**
   * Calculate personal records from a list of activities
   * @param activities - Array of completed activities
   * @returns PersonalRecords object with all records
   */
  calculatePersonalRecords(activities: Activity[]): PersonalRecords {
    const defaultRecord: ActivityRecord = {
      value: 0,
      activityId: '',
      date: 0,
    };

    if (activities.length === 0) {
      return {
        longestDistance: defaultRecord,
        fastestPace: defaultRecord,
        longestDuration: defaultRecord,
        mostSteps: defaultRecord,
      };
    }

    // Find longest distance
    const longestDistance = activities.reduce((max, a) =>
      a.distance > max.distance ? a : max
    );

    // Find fastest pace (lowest value, excluding zero)
    const fastestPace = activities.reduce((min, a) => {
      // Skip activities with no pace data
      if (a.averagePace === 0) return min;
      
      // If min has no pace yet, use current activity
      if (min.averagePace === 0) return a;
      
      // Return activity with faster (lower) pace
      return a.averagePace < min.averagePace ? a : min;
    });

    // Find longest duration
    const longestDuration = activities.reduce((max, a) =>
      a.duration > max.duration ? a : max
    );

    // Find most steps
    const mostSteps = activities.reduce((max, a) =>
      a.steps > max.steps ? a : max
    );

    return {
      longestDistance: {
        value: longestDistance.distance,
        activityId: longestDistance.id,
        date: longestDistance.startTime,
      },
      fastestPace: {
        value: fastestPace.averagePace,
        activityId: fastestPace.id,
        date: fastestPace.startTime,
      },
      longestDuration: {
        value: longestDuration.duration,
        activityId: longestDuration.id,
        date: longestDuration.startTime,
      },
      mostSteps: {
        value: mostSteps.steps,
        activityId: mostSteps.id,
        date: mostSteps.startTime,
      },
    };
  }

  /**
   * Check if a new activity breaks any personal records
   * @param newActivity - The newly completed activity
   * @param currentRecords - Current personal records
   * @returns Object indicating which records were broken
   */
  checkForNewRecords(
    newActivity: Activity,
    currentRecords: PersonalRecords
  ): {
    hasNewRecords: boolean;
    brokenRecords: Array<{
      type: 'distance' | 'pace' | 'duration' | 'steps';
      oldValue: number;
      newValue: number;
    }>;
  } {
    const brokenRecords: Array<{
      type: 'distance' | 'pace' | 'duration' | 'steps';
      oldValue: number;
      newValue: number;
    }> = [];

    // Check longest distance
    if (newActivity.distance > currentRecords.longestDistance.value) {
      brokenRecords.push({
        type: 'distance',
        oldValue: currentRecords.longestDistance.value,
        newValue: newActivity.distance,
      });
    }

    // Check fastest pace (lower is better)
    if (
      newActivity.averagePace > 0 &&
      (currentRecords.fastestPace.value === 0 ||
        newActivity.averagePace < currentRecords.fastestPace.value)
    ) {
      brokenRecords.push({
        type: 'pace',
        oldValue: currentRecords.fastestPace.value,
        newValue: newActivity.averagePace,
      });
    }

    // Check longest duration
    if (newActivity.duration > currentRecords.longestDuration.value) {
      brokenRecords.push({
        type: 'duration',
        oldValue: currentRecords.longestDuration.value,
        newValue: newActivity.duration,
      });
    }

    // Check most steps
    if (newActivity.steps > currentRecords.mostSteps.value) {
      brokenRecords.push({
        type: 'steps',
        oldValue: currentRecords.mostSteps.value,
        newValue: newActivity.steps,
      });
    }

    return {
      hasNewRecords: brokenRecords.length > 0,
      brokenRecords,
    };
  }

  /**
   * Get a formatted description of a broken record
   * @param recordType - Type of record
   * @param oldValue - Previous record value
   * @param newValue - New record value
   * @returns Formatted description string
   */
  getRecordDescription(
    recordType: 'distance' | 'pace' | 'duration' | 'steps',
    oldValue: number,
    newValue: number
  ): string {
    switch (recordType) {
      case 'distance':
        const oldDistanceKm = (oldValue / 1000).toFixed(2);
        const newDistanceKm = (newValue / 1000).toFixed(2);
        return `New longest distance: ${newDistanceKm} km (previous: ${oldDistanceKm} km)`;
      
      case 'pace':
        const oldPaceMin = Math.floor(oldValue / 60);
        const oldPaceSec = Math.floor(oldValue % 60);
        const newPaceMin = Math.floor(newValue / 60);
        const newPaceSec = Math.floor(newValue % 60);
        return `New fastest pace: ${newPaceMin}:${newPaceSec.toString().padStart(2, '0')}/km (previous: ${oldPaceMin}:${oldPaceSec.toString().padStart(2, '0')}/km)`;
      
      case 'duration':
        const oldDurationMin = Math.floor(oldValue / 60);
        const newDurationMin = Math.floor(newValue / 60);
        return `New longest duration: ${newDurationMin} minutes (previous: ${oldDurationMin} minutes)`;
      
      case 'steps':
        return `New most steps: ${newValue.toLocaleString()} (previous: ${oldValue.toLocaleString()})`;
      
      default:
        return 'New personal record!';
    }
  }

  /**
   * Get all-time personal records across all activities
   * This is a convenience method that filters for all-time records
   * @param activities - All activities
   * @returns PersonalRecords for all time
   */
  getAllTimeRecords(activities: Activity[]): PersonalRecords {
    return this.calculatePersonalRecords(activities);
  }

  /**
   * Get personal records for a specific time period
   * @param activities - All activities
   * @param startDate - Start date timestamp
   * @param endDate - End date timestamp (optional, defaults to now)
   * @returns PersonalRecords for the specified period
   */
  getPeriodRecords(
    activities: Activity[],
    startDate: number,
    endDate: number = Date.now()
  ): PersonalRecords {
    const periodActivities = activities.filter(
      (a) => a.startTime >= startDate && a.startTime <= endDate
    );
    return this.calculatePersonalRecords(periodActivities);
  }

  /**
   * Compare records between two periods
   * @param currentPeriodRecords - Records from current period
   * @param previousPeriodRecords - Records from previous period
   * @returns Comparison results
   */
  compareRecords(
    currentPeriodRecords: PersonalRecords,
    previousPeriodRecords: PersonalRecords
  ): {
    distance: { improved: boolean; change: number };
    pace: { improved: boolean; change: number };
    duration: { improved: boolean; change: number };
    steps: { improved: boolean; change: number };
  } {
    return {
      distance: {
        improved:
          currentPeriodRecords.longestDistance.value >
          previousPeriodRecords.longestDistance.value,
        change:
          currentPeriodRecords.longestDistance.value -
          previousPeriodRecords.longestDistance.value,
      },
      pace: {
        improved:
          currentPeriodRecords.fastestPace.value > 0 &&
          (previousPeriodRecords.fastestPace.value === 0 ||
            currentPeriodRecords.fastestPace.value <
              previousPeriodRecords.fastestPace.value),
        change:
          previousPeriodRecords.fastestPace.value -
          currentPeriodRecords.fastestPace.value,
      },
      duration: {
        improved:
          currentPeriodRecords.longestDuration.value >
          previousPeriodRecords.longestDuration.value,
        change:
          currentPeriodRecords.longestDuration.value -
          previousPeriodRecords.longestDuration.value,
      },
      steps: {
        improved:
          currentPeriodRecords.mostSteps.value >
          previousPeriodRecords.mostSteps.value,
        change:
          currentPeriodRecords.mostSteps.value -
          previousPeriodRecords.mostSteps.value,
      },
    };
  }
}

// Export singleton instance
export default new PersonalRecordsService();
