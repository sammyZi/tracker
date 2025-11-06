/**
 * Records Helper Utilities
 * Helper functions for working with personal records
 */

import StorageService from '../services/storage/StorageService';
import PersonalRecordsService from '../services/personalRecords/PersonalRecordsService';
import { UnitSystem } from '../types';
import { formatDistance, formatPace, formatDuration } from './formatting';

/**
 * Check for new records after saving an activity
 * @param activityId - ID of the newly saved activity
 * @returns Information about broken records with formatted values
 */
export const checkForNewRecordsAfterSave = async (
  activityId: string,
  units: UnitSystem = 'metric'
): Promise<{
  hasNewRecords: boolean;
  records: Array<{
    type: 'distance' | 'pace' | 'duration' | 'steps';
    label: string;
    formattedValue: string;
    description: string;
  }>;
}> => {
  try {
    const result = await StorageService.checkForNewRecords(activityId);

    if (!result.hasNewRecords) {
      return { hasNewRecords: false, records: [] };
    }

    const records = result.brokenRecords.map((record) => {
      let formattedValue = '';
      let label = '';

      switch (record.type) {
        case 'distance':
          formattedValue = formatDistance(record.newValue, units);
          label = 'Longest Distance';
          break;
        case 'pace':
          formattedValue = formatPace(record.newValue, units);
          label = 'Fastest Pace';
          break;
        case 'duration':
          formattedValue = formatDuration(record.newValue);
          label = 'Longest Duration';
          break;
        case 'steps':
          formattedValue = record.newValue.toLocaleString();
          label = 'Most Steps';
          break;
      }

      const description = PersonalRecordsService.getRecordDescription(
        record.type,
        record.oldValue,
        record.newValue
      );

      return {
        type: record.type,
        label,
        formattedValue,
        description,
      };
    });

    return {
      hasNewRecords: true,
      records,
    };
  } catch (error) {
    console.error('Error checking for new records:', error);
    return { hasNewRecords: false, records: [] };
  }
};

/**
 * Get a congratulatory message for breaking a record
 * @param recordType - Type of record broken
 * @returns Congratulatory message
 */
export const getRecordCongratulationMessage = (
  recordType: 'distance' | 'pace' | 'duration' | 'steps'
): string => {
  const messages = {
    distance: 'Amazing! You just set a new distance record! 🎉',
    pace: 'Incredible! That\'s your fastest pace yet! 🏃‍♂️',
    duration: 'Wow! Your longest workout ever! 💪',
    steps: 'Outstanding! Most steps in a single activity! 👟',
  };

  return messages[recordType];
};

/**
 * Get an emoji for a record type
 * @param recordType - Type of record
 * @returns Emoji string
 */
export const getRecordEmoji = (
  recordType: 'distance' | 'pace' | 'duration' | 'steps'
): string => {
  const emojis = {
    distance: '🏆',
    pace: '⚡',
    duration: '⏱️',
    steps: '👣',
  };

  return emojis[recordType];
};
