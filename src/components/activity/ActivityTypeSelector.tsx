import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../common/Text';
import { Colors, BorderRadius, Spacing, Shadows } from '../../constants/theme';
import { ActivityType } from '../../types';

interface ActivityTypeSelectorProps {
  selectedType: ActivityType;
  onTypeChange: (type: ActivityType) => void;
}

export const ActivityTypeSelector: React.FC<ActivityTypeSelectorProps> = ({
  selectedType,
  onTypeChange,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.option,
          selectedType === 'walking' && styles.optionSelected,
        ]}
        onPress={() => onTypeChange('walking')}
        activeOpacity={0.7}
      >
        <Ionicons
          name="walk"
          size={24}
          color={selectedType === 'walking' ? Colors.surface : Colors.textPrimary}
        />
        <Text
          variant="small"
          weight="semiBold"
          color={selectedType === 'walking' ? Colors.surface : Colors.textPrimary}
          style={styles.label}
        >
          Walking
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.option,
          selectedType === 'running' && styles.optionSelected,
        ]}
        onPress={() => onTypeChange('running')}
        activeOpacity={0.7}
      >
        <Ionicons
          name="fitness"
          size={24}
          color={selectedType === 'running' ? Colors.surface : Colors.textPrimary}
        />
        <Text
          variant="small"
          weight="semiBold"
          color={selectedType === 'running' ? Colors.surface : Colors.textPrimary}
          style={styles.label}
        >
          Running
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.large,
    padding: Spacing.xs,
    ...Shadows.medium,
  },
  option: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.medium,
  },
  optionSelected: {
    backgroundColor: Colors.primary,
  },
  label: {
    marginLeft: Spacing.sm,
  },
});
