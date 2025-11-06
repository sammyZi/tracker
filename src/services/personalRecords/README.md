# Personal Records Service

The Personal Records Service manages tracking and updating of personal records for the Fitness Tracker App.

## Features

- **Automatic Record Calculation**: Calculates personal records from all stored activities
- **Record Types Tracked**:
  - Longest Distance
  - Fastest Pace
  - Longest Duration
  - Most Steps
- **Record Comparison**: Check if new activities break existing records
- **Period-based Records**: Get records for specific time periods (week, month, all-time)
- **Record Descriptions**: Generate human-readable descriptions of broken records

## Usage

### Basic Usage

```typescript
import PersonalRecordsService from '@/services/personalRecords';

// Calculate personal records from activities
const activities = await StorageService.getActivities();
const records = PersonalRecordsService.calculatePersonalRecords(activities);

console.log('Longest distance:', records.longestDistance.value);
console.log('Fastest pace:', records.fastestPace.value);
```

### Check for New Records

```typescript
import StorageService from '@/services/storage';

// After saving a new activity
const activity = await ActivityService.stopActivity();
await StorageService.saveActivity(activity);

// Check if any records were broken
const result = await StorageService.checkForNewRecords(activity.id);

if (result.hasNewRecords) {
  result.brokenRecords.forEach(record => {
    console.log(`New ${record.type} record: ${record.newValue}`);
  });
}
```

### Using the Hook

```typescript
import { usePersonalRecords } from '@/hooks';

function MyComponent() {
  const { records, loading, error, refresh } = usePersonalRecords();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <PersonalRecordsCard records={records} units="metric" />
  );
}
```

### Display Records with Notifications

```typescript
import { checkForNewRecordsAfterSave } from '@/utils/recordsHelper';
import { RecordBrokenNotification } from '@/components/stats';

// After saving an activity
const result = await checkForNewRecordsAfterSave(activity.id, 'metric');

if (result.hasNewRecords) {
  // Show notification for each broken record
  result.records.forEach(record => {
    // Show notification UI
    setNotification({
      recordType: record.type,
      value: record.formattedValue,
      visible: true,
    });
  });
}
```

## Components

### PersonalRecordsCard

Displays personal records with trophy icons and badges.

```typescript
<PersonalRecordsCard 
  records={personalRecords} 
  units="metric"
  showBadges={true}
/>
```

### RecordBrokenNotification

Shows a celebration notification when a record is broken.

```typescript
<RecordBrokenNotification
  recordType="distance"
  value="10.5 km"
  visible={showNotification}
  onDismiss={() => setShowNotification(false)}
/>
```

## Data Structure

### PersonalRecords

```typescript
interface PersonalRecords {
  longestDistance: ActivityRecord;
  fastestPace: ActivityRecord;
  longestDuration: ActivityRecord;
  mostSteps: ActivityRecord;
}

interface ActivityRecord {
  value: number;        // The record value
  activityId: string;   // ID of the activity that set the record
  date: number;         // Timestamp when the record was set
}
```

## Automatic Updates

Personal records are automatically updated when:

1. A new activity is saved via `StorageService.saveActivity()`
2. Statistics are calculated via `StorageService.getStatistics()`
3. The `useStatistics` hook refreshes data

The system compares each new activity against existing records and updates them if the new activity has better values.

## Record Calculation Logic

- **Longest Distance**: Activity with the highest distance value (in meters)
- **Fastest Pace**: Activity with the lowest pace value (in seconds per km) - lower is better
- **Longest Duration**: Activity with the highest duration value (in seconds)
- **Most Steps**: Activity with the highest step count

## Integration Points

### Storage Service
- `getPersonalRecords()`: Get all-time personal records
- `checkForNewRecords(activityId)`: Check if an activity broke any records
- `getStatistics(period)`: Includes personal records in statistics

### Activity Service
- Records are checked automatically after `stopActivity()` saves the activity

### Stats Screen
- Displays personal records using `PersonalRecordsCard`
- Updates automatically when new activities are added

## Best Practices

1. **Always check for new records after saving an activity** to provide immediate feedback to users
2. **Use the helper utilities** in `recordsHelper.ts` for consistent formatting
3. **Show celebrations** when records are broken to motivate users
4. **Refresh statistics** after activities are saved to ensure records are up-to-date

## Future Enhancements

Potential improvements for the personal records system:

- Activity-type specific records (separate records for walking vs running)
- Monthly/yearly record tracking
- Record history and progression over time
- Social sharing of record achievements
- Badges and achievements for milestone records
- Record predictions based on trends
