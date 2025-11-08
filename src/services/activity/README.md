# Activity Service

The ActivityService manages the complete lifecycle of fitness tracking activities including walking and running sessions.

## Features

- **Activity Lifecycle Management**: Start, pause, resume, and stop activities
- **Real-time Metrics**: Calculate distance, pace, duration, steps, and calories
- **Route Tracking**: Collect and store GPS route points
- **State Management**: Track activity status (active, paused, completed)
- **Storage Integration**: Automatically save completed activities to local storage
- **Location Integration**: Seamless integration with LocationService for GPS tracking
- **Step Counter Integration**: Automatic step counting using device pedometer

## Usage

### Starting an Activity

```typescript
import ActivityService from '@/services/activity';

// Start a new running activity with background tracking
const activityId = await ActivityService.startActivity('running', true);

// Start a walking activity without background tracking
const activityId = await ActivityService.startActivity('walking', false);
```

### Pausing and Resuming

```typescript
// Pause the current activity
await ActivityService.pauseActivity();

// Resume the paused activity
await ActivityService.resumeActivity();
```

### Stopping an Activity

```typescript
// Stop and save the activity
const completedActivity = await ActivityService.stopActivity();
console.log('Activity saved:', completedActivity);
```

### Getting Current Metrics

```typescript
// Get current activity metrics
const metrics = ActivityService.getCurrentMetrics();
console.log('Distance:', metrics.distance, 'meters');
console.log('Duration:', metrics.duration, 'seconds');
console.log('Average Pace:', metrics.averagePace, 'sec/km');
console.log('Current Pace:', metrics.currentPace, 'sec/km');
console.log('Steps:', metrics.steps);
console.log('Calories:', metrics.calories);
```

### Subscribing to Metrics Updates

```typescript
// Subscribe to real-time metrics updates
const unsubscribe = ActivityService.onMetricsUpdate((metrics) => {
  console.log('Metrics updated:', metrics);
  // Update UI with new metrics
});

// Unsubscribe when done
unsubscribe();
```

### Updating Step Count

```typescript
// Update step count from pedometer
ActivityService.updateSteps(1234);
```

### Checking Activity Status

```typescript
// Check if an activity is in progress
const isActive = ActivityService.isActivityInProgress();

// Check if activity is paused
const isPaused = ActivityService.isActivityPaused();

// Get current activity details
const currentActivity = ActivityService.getCurrentActivity();
```

## Metrics Calculation

### Distance
- Calculated using the Haversine formula between consecutive GPS points
- Measured in meters
- Accurate for both short and long distances

### Pace
- **Average Pace**: Total duration divided by total distance (seconds per kilometer)
- **Current Pace**: Based on the last 30 seconds of movement
- Measured in seconds per kilometer

### Duration
- Active time only (excludes paused time)
- Measured in seconds
- Automatically handles pause/resume cycles

### Calories
- Calculated using MET (Metabolic Equivalent of Task) values
- Based on activity type, speed, duration, and user weight
- Walking: 3.0-4.3 MET depending on speed
- Running: 8.0-12.0 MET depending on speed

### Elevation Gain
- Calculated from altitude changes in route points
- Only positive elevation changes are counted
- Optional (only available if GPS provides altitude data)

## Activity Data Model

```typescript
interface Activity {
  id: string;                    // Unique activity ID
  type: 'walking' | 'running';   // Activity type
  startTime: number;             // Start timestamp (ms)
  endTime: number;               // End timestamp (ms)
  duration: number;              // Active duration in seconds
  distance: number;              // Total distance in meters
  steps: number;                 // Total step count
  route: RoutePoint[];           // GPS route points
  averagePace: number;           // Average pace (sec/km)
  maxPace: number;               // Fastest pace (sec/km)
  calories: number;              // Estimated calories burned
  elevationGain?: number;        // Total elevation gain (meters)
  status: 'completed';           // Activity status
  createdAt: number;             // Creation timestamp (ms)
}
```

## Integration with Other Services

### LocationService
- Automatically starts/stops GPS tracking
- Receives real-time location updates
- Applies accuracy filtering and Kalman smoothing
- Supports background location tracking

### StorageService
- Automatically saves completed activities
- Stores activity data locally using AsyncStorage
- Enables activity history and statistics

### StepCounterService
- Automatically starts/stops step counting with activities
- Receives real-time step count updates
- Gracefully handles devices without pedometer support
- Continues counting in background during activities

## Error Handling

```typescript
try {
  await ActivityService.startActivity('running');
} catch (error) {
  if (error.message === 'An activity is already in progress') {
    // Handle already active activity
  } else if (error.message.includes('permissions')) {
    // Handle permission errors
  } else {
    // Handle other errors
  }
}
```

## Notes

- Only one activity can be active at a time
- Activities must be stopped before starting a new one
- Paused time is automatically excluded from duration calculations
- Metrics are updated every second during active tracking
- Location updates are throttled to avoid excessive calculations
- User weight for calorie calculation defaults to 70kg (will be updated to use user profile)

## Future Enhancements

- [ ] Integration with user profile for accurate calorie calculation
- [ ] Auto-pause detection based on movement
- [ ] Split times and lap tracking
- [ ] Heart rate monitoring integration
- [ ] Advanced pace zones and analysis
