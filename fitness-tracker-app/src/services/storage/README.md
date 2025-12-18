# StorageService

Local data persistence service using AsyncStorage for the Fitness Tracker App.

## Features

- ✅ Activity storage and retrieval with filtering
- ✅ User profile management
- ✅ Settings persistence
- ✅ Goal management
- ✅ Statistics calculation
- ✅ Data export/import for backups
- ✅ Storage usage monitoring

## Usage Examples

### Activities

```typescript
import StorageService from '@/services/storage';

// Save an activity
const activity: Activity = {
  id: 'activity-123',
  type: 'running',
  startTime: Date.now(),
  endTime: Date.now() + 3600000,
  duration: 3600,
  distance: 5000,
  steps: 6500,
  route: [...],
  averagePace: 720,
  maxPace: 600,
  calories: 350,
  status: 'completed',
  createdAt: Date.now(),
};

await StorageService.saveActivity(activity);

// Get all activities
const activities = await StorageService.getActivities();

// Get activities with filters
const recentRuns = await StorageService.getActivities({
  type: 'running',
  startDate: Date.now() - 7 * 24 * 60 * 60 * 1000, // Last 7 days
  limit: 10,
});

// Get single activity
const activity = await StorageService.getActivity('activity-123');

// Delete activity
await StorageService.deleteActivity('activity-123');
```

### User Profile

```typescript
// Save profile
const profile: UserProfile = {
  id: 'user-123',
  name: 'John Doe',
  profilePictureUri: 'file:///path/to/image.jpg',
  weight: 75,
  height: 180,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

await StorageService.saveUserProfile(profile);

// Get profile
const profile = await StorageService.getUserProfile();
```

### Settings

```typescript
// Save settings
const settings: UserSettings = {
  units: 'metric',
  audioAnnouncements: true,
  announcementInterval: 1000,
  autoPause: true,
  autoPauseSensitivity: 'medium',
  mapType: 'standard',
  theme: 'auto',
};

await StorageService.saveSettings(settings);

// Get settings
const settings = await StorageService.getSettings();
```

### Goals

```typescript
// Save a goal
const goal: Goal = {
  id: 'goal-123',
  type: 'distance',
  target: 50000, // 50km
  period: 'weekly',
  startDate: Date.now(),
  endDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
  progress: 0,
  achieved: false,
  createdAt: Date.now(),
};

await StorageService.saveGoal(goal);

// Get all goals
const goals = await StorageService.getGoals();

// Update goal
await StorageService.updateGoal('goal-123', { progress: 25000 });

// Delete goal
await StorageService.deleteGoal('goal-123');
```

### Statistics

```typescript
// Get weekly statistics
const weekStats = await StorageService.getStatistics('week');

// Get monthly statistics
const monthStats = await StorageService.getStatistics('month');

// Get all-time statistics
const allTimeStats = await StorageService.getStatistics('allTime');

console.log(weekStats.totalDistance); // Total distance in meters
console.log(weekStats.personalRecords.longestDistance); // Personal record
```

### Data Export/Import

```typescript
// Export all data
const jsonData = await StorageService.exportData();
// Save to file or share

// Import data
await StorageService.importData(jsonData);

// Get storage info
const info = await StorageService.getStorageInfo();
console.log(`Storage keys: ${info.keys}`);
console.log(`Estimated size: ${info.estimatedSize} bytes`);

// Clear all data (logout/reset)
await StorageService.clearAllData();
```

## Storage Keys

The service uses the following AsyncStorage keys:

- `@user_profile` - User profile data
- `@user_settings` - User settings
- `@activities` - List of all activities
- `@goals` - List of all goals
- `@activity_{id}` - Individual activity cache

## Error Handling

All methods throw errors that should be caught:

```typescript
try {
  await StorageService.saveActivity(activity);
} catch (error) {
  console.error('Failed to save activity:', error);
  // Handle error appropriately
}
```

## Data Structure

### Export Format

```json
{
  "version": "1.0.0",
  "exportDate": 1234567890,
  "profile": { ... },
  "settings": { ... },
  "activities": [ ... ],
  "goals": [ ... ]
}
```

## Performance Considerations

- Activities are stored both in a list and individually for efficient access
- Filters are applied in-memory after retrieval
- Statistics are calculated on-demand from stored activities
- Use pagination (limit filter) for large activity lists
