# Personal Records - Usage Examples

## Example 1: Display Personal Records in Stats Screen

The stats screen already displays personal records automatically. The implementation is already integrated:

```typescript
// src/screens/stats/StatsScreen.tsx
import { PersonalRecordsCard } from '../../components/stats';

const renderPersonalRecords = () => {
  if (!stats) return null;

  return (
    <View style={styles.recordsSection}>
      <PersonalRecordsCard 
        records={stats.personalRecords} 
        units={units}
        showBadges={true}
      />
    </View>
  );
};
```

## Example 2: Check for New Records After Activity

Add this to your activity completion flow:

```typescript
import { checkForNewRecordsAfterSave } from '@/utils/recordsHelper';
import { RecordBrokenNotification } from '@/components/stats';

const handleActivityComplete = async (activity: Activity) => {
  // Save the activity
  await StorageService.saveActivity(activity);
  
  // Check for new records
  const result = await checkForNewRecordsAfterSave(activity.id, settings.units);
  
  if (result.hasNewRecords) {
    // Show notification for each broken record
    result.records.forEach((record, index) => {
      setTimeout(() => {
        setNotification({
          recordType: record.type,
          value: record.formattedValue,
          visible: true,
        });
        
        // Show haptic feedback
        HapticFeedbackService.success();
        
        // Log achievement
        console.log('🏆 New Record:', record.description);
      }, index * 500); // Stagger notifications
    });
  }
};
```

## Example 3: Show Record Notification Component

```typescript
import React, { useState } from 'react';
import { RecordBrokenNotification } from '@/components/stats';

function ActivitySummaryScreen() {
  const [notification, setNotification] = useState({
    recordType: 'distance' as const,
    value: '',
    visible: false,
  });

  return (
    <View>
      {/* Your activity summary content */}
      
      {/* Record notification overlay */}
      <RecordBrokenNotification
        recordType={notification.recordType}
        value={notification.value}
        visible={notification.visible}
        onDismiss={() => setNotification(prev => ({ ...prev, visible: false }))}
      />
    </View>
  );
}
```

## Example 4: Use Personal Records Hook

```typescript
import { usePersonalRecords } from '@/hooks';

function PersonalRecordsScreen() {
  const { records, loading, error, refresh } = usePersonalRecords();

  if (loading) {
    return <ActivityIndicator />;
  }

  if (error) {
    return <Text>Error loading records: {error.message}</Text>;
  }

  return (
    <ScrollView>
      <PersonalRecordsCard 
        records={records} 
        units="metric"
        showBadges={true}
      />
      
      <Button title="Refresh" onPress={refresh} />
    </ScrollView>
  );
}
```

## Example 5: Manual Record Checking

```typescript
import StorageService from '@/services/storage';
import PersonalRecordsService from '@/services/personalRecords';

// Get all-time records
const allTimeRecords = await StorageService.getPersonalRecords();
console.log('Longest distance:', allTimeRecords.longestDistance.value);

// Get records for a specific period
const activities = await StorageService.getActivities();
const weekRecords = PersonalRecordsService.getPeriodRecords(
  activities,
  Date.now() - 7 * 24 * 60 * 60 * 1000
);

// Compare periods
const monthRecords = PersonalRecordsService.getPeriodRecords(
  activities,
  Date.now() - 30 * 24 * 60 * 60 * 1000
);

const comparison = PersonalRecordsService.compareRecords(
  weekRecords,
  monthRecords
);

if (comparison.distance.improved) {
  console.log('Distance improved by:', comparison.distance.change);
}
```

## Example 6: Show Celebration Message

```typescript
import { 
  getRecordCongratulationMessage, 
  getRecordEmoji 
} from '@/utils/recordsHelper';

const showRecordCelebration = (recordType: 'distance' | 'pace' | 'duration' | 'steps') => {
  const message = getRecordCongratulationMessage(recordType);
  const emoji = getRecordEmoji(recordType);
  
  Alert.alert(
    `${emoji} New Record!`,
    message,
    [{ text: 'Awesome!', style: 'default' }]
  );
};
```

## Example 7: Custom Record Display

```typescript
import { PersonalRecords } from '@/types';
import { formatDistance, formatPace, formatDuration } from '@/utils';

function CustomRecordsDisplay({ records, units }: { records: PersonalRecords, units: UnitSystem }) {
  return (
    <View>
      <Text>Your Best Achievements:</Text>
      
      {records.longestDistance.value > 0 && (
        <View>
          <Text>🏆 Longest Distance</Text>
          <Text>{formatDistance(records.longestDistance.value, units)}</Text>
          <Text>Set on {new Date(records.longestDistance.date).toLocaleDateString()}</Text>
        </View>
      )}
      
      {records.fastestPace.value > 0 && (
        <View>
          <Text>⚡ Fastest Pace</Text>
          <Text>{formatPace(records.fastestPace.value, units)}</Text>
          <Text>Set on {new Date(records.fastestPace.date).toLocaleDateString()}</Text>
        </View>
      )}
      
      {/* Add other records... */}
    </View>
  );
}
```

## Example 8: Integration with Activity Tracking

```typescript
import ActivityService from '@/services/activity';
import StorageService from '@/services/storage';

// In your activity tracking screen
const handleStopActivity = async () => {
  try {
    // Stop and save activity
    const completedActivity = await ActivityService.stopActivity();
    
    // Check for new records immediately
    const recordCheck = await StorageService.checkForNewRecords(completedActivity.id);
    
    if (recordCheck.hasNewRecords) {
      // Navigate to summary with celebration
      navigation.navigate('ActivitySummary', {
        activity: completedActivity,
        newRecords: recordCheck.brokenRecords,
      });
    } else {
      // Navigate to summary normally
      navigation.navigate('ActivitySummary', {
        activity: completedActivity,
      });
    }
  } catch (error) {
    console.error('Error stopping activity:', error);
  }
};
```

## Example 9: Show Records in Profile

```typescript
function ProfileScreen() {
  const { records, loading } = usePersonalRecords();
  const { settings } = useSettings();

  return (
    <ScrollView>
      {/* User profile info */}
      
      <View style={styles.recordsSection}>
        <Text style={styles.sectionTitle}>Personal Bests</Text>
        
        {!loading && records && (
          <PersonalRecordsCard 
            records={records} 
            units={settings.units}
            showBadges={true}
          />
        )}
      </View>
    </ScrollView>
  );
}
```

## Example 10: Motivational Messages Based on Records

```typescript
import { PersonalRecords } from '@/types';

function getMotivationalMessage(records: PersonalRecords): string {
  const totalRecords = [
    records.longestDistance.value,
    records.fastestPace.value,
    records.longestDuration.value,
    records.mostSteps.value,
  ].filter(v => v > 0).length;

  if (totalRecords === 0) {
    return "Start your first activity to set your records!";
  } else if (totalRecords < 4) {
    return "Keep going! You're building your record collection!";
  } else {
    return "Amazing! You've set records in all categories!";
  }
}

// Use in empty state or dashboard
<Text>{getMotivationalMessage(records)}</Text>
```

## Best Practices

1. **Always check for new records after saving activities** to provide immediate feedback
2. **Use the helper utilities** for consistent formatting and messaging
3. **Show celebrations** when records are broken to motivate users
4. **Refresh statistics** after activities to ensure records are current
5. **Handle loading and error states** properly in UI components
6. **Stagger notifications** if multiple records are broken at once
7. **Provide context** about when records were set (date/time)
8. **Use haptic feedback** for record achievements
9. **Log achievements** for analytics and debugging
10. **Test edge cases** like zero values and empty activity lists
