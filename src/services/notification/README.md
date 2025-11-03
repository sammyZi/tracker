# Notification Service

The NotificationService manages all notifications for the Fitness Tracker app, including persistent activity tracking notifications, distance announcements, and goal achievements.

## Features

- **Permission Management**: Request and check notification permissions
- **Persistent Notifications**: Show ongoing notifications during active workout sessions
- **Real-time Updates**: Update notification with current metrics (time, distance, pace)
- **Background Updates**: Notifications update even when screen is off
- **Distance Announcements**: Notify users when they reach distance milestones
- **Goal Achievements**: Celebrate when users achieve their fitness goals
- **Activity Completion**: Show summary when workout is completed

## Usage

### Initialize the Service

```typescript
import NotificationService from '@/services/notification';

// Initialize (sets up Android notification channels)
await NotificationService.initialize();
```

### Request Permissions

```typescript
// Request notification permissions
const granted = await NotificationService.requestPermissions();

if (granted) {
  console.log('Notification permissions granted');
} else {
  console.log('Notification permissions denied');
}

// Check existing permissions
const hasPermission = await NotificationService.checkPermissions();
```

### Show Activity Notification

```typescript
import { ActivityMetrics } from '@/types';

const metrics: ActivityMetrics = {
  currentPace: 300, // 5:00 /km
  averagePace: 310,
  distance: 2500, // 2.5 km
  duration: 900, // 15 minutes
  steps: 3200,
  calories: 150,
};

// Show notification for active session
await NotificationService.showActivityNotification(
  metrics,
  'running',
  'metric',
  false // isPaused
);

// Show notification for paused session
await NotificationService.showActivityNotification(
  metrics,
  'running',
  'metric',
  true // isPaused
);
```

### Update Activity Notification

```typescript
// Update notification with new metrics (call this periodically during activity)
await NotificationService.updateActivityNotification(
  updatedMetrics,
  'running',
  'metric',
  false
);
```

### Dismiss Activity Notification

```typescript
// Dismiss notification when activity is stopped
await NotificationService.dismissActivityNotification();
```

### Distance Announcements

```typescript
// Show notification when user reaches a distance milestone
await NotificationService.showDistanceAnnouncement(
  5000, // 5 km
  295, // 4:55 /km pace
  'metric'
);
```

### Goal Achievements

```typescript
// Celebrate goal achievement
await NotificationService.showGoalAchievement(
  'Weekly Distance Goal',
  'You ran 50 km this week!'
);
```

### Activity Completion

```typescript
// Show completion summary
await NotificationService.showActivityCompletion(
  finalMetrics,
  'running',
  'metric'
);
```

### Notification Listeners

```typescript
// Listen for notification responses (user taps notification)
const responseSubscription = NotificationService.addNotificationResponseListener(
  (response) => {
    console.log('Notification tapped:', response);
    
    // Handle notification actions
    if (response.actionIdentifier === 'pause') {
      // Pause activity
    } else if (response.actionIdentifier === 'stop') {
      // Stop activity
    }
  }
);

// Listen for notifications received while app is in foreground
const receivedSubscription = NotificationService.addNotificationReceivedListener(
  (notification) => {
    console.log('Notification received:', notification);
  }
);

// Clean up listeners when done
responseSubscription.remove();
receivedSubscription.remove();
```

## Integration with Activity Tracking

### Example: Complete Activity Tracking Flow

```typescript
import NotificationService from '@/services/notification';
import ActivityService from '@/services/activity';

// 1. Initialize notification service
await NotificationService.initialize();
await NotificationService.requestPermissions();

// 2. Start activity
const activityId = await ActivityService.startActivity('running');

// 3. Show initial notification
const metrics = ActivityService.calculateMetrics(
  ActivityService.getCurrentActivity()!
);
await NotificationService.showActivityNotification(
  metrics,
  'running',
  'metric',
  false
);

// 4. Update notification periodically (e.g., every 5 seconds)
const updateInterval = setInterval(async () => {
  const currentActivity = ActivityService.getCurrentActivity();
  if (currentActivity && currentActivity.status === 'active') {
    const updatedMetrics = ActivityService.calculateMetrics(currentActivity);
    await NotificationService.updateActivityNotification(
      updatedMetrics,
      'running',
      'metric',
      false
    );
  }
}, 5000);

// 5. Handle pause
await ActivityService.pauseActivity(activityId);
await NotificationService.updateActivityNotification(
  metrics,
  'running',
  'metric',
  true // isPaused
);

// 6. Handle resume
await ActivityService.resumeActivity(activityId);
await NotificationService.updateActivityNotification(
  metrics,
  'running',
  'metric',
  false // not paused
);

// 7. Stop activity and dismiss notification
clearInterval(updateInterval);
const completedActivity = await ActivityService.stopActivity(activityId);
await NotificationService.dismissActivityNotification();

// 8. Show completion notification
const finalMetrics = ActivityService.calculateMetrics(completedActivity);
await NotificationService.showActivityCompletion(
  finalMetrics,
  'running',
  'metric'
);
```

## Platform-Specific Notes

### Android

- Uses notification channels for better control
- Persistent notifications use HIGH importance
- Foreground service notification for background tracking
- Notification actions require native build

### iOS

- Notification categories with actions (pause, stop)
- Actions require native build (won't work in Expo Go)
- Background notifications require proper permissions

## Configuration

### Android Notification Channel

The service automatically creates an Android notification channel with:
- **ID**: `activity-tracking`
- **Name**: Activity Tracking
- **Importance**: HIGH
- **Vibration**: Enabled
- **Sound**: Configurable per notification
- **Badge**: Enabled

### Notification Format

Activity notifications display:
- **Title**: "Walking in Progress" or "Running in Progress" (or "Paused")
- **Body**: "15:30 • 2.5 km • 5:00 /km" (duration • distance • pace)

## Best Practices

1. **Initialize Early**: Call `initialize()` when app starts
2. **Request Permissions**: Request permissions before starting activity tracking
3. **Update Regularly**: Update notification every 3-5 seconds during active sessions
4. **Dismiss on Stop**: Always dismiss notification when activity stops
5. **Handle Permissions**: Check permissions before showing notifications
6. **Clean Up Listeners**: Remove notification listeners when component unmounts

## Troubleshooting

### Notifications Not Showing

1. Check if permissions are granted
2. Verify notification service is initialized
3. Check device notification settings
4. Ensure app has foreground service permission (Android)

### Notifications Not Updating

1. Verify update interval is appropriate (3-5 seconds)
2. Check if metrics are being calculated correctly
3. Ensure notification ID is being tracked properly

### Background Notifications Not Working

1. Verify background location permissions are granted
2. Check foreground service is running (Android)
3. Ensure notification channel is properly configured
4. Test on physical device (not emulator)

## Requirements Satisfied

This service satisfies the following requirements:

- **6.3**: Persistent notification with real-time metrics during active sessions
- **6.4**: Notification updates even when screen is off
- **7.1**: Audio/haptic feedback for distance milestones
- **7.2**: Configurable announcement settings
- **7.3**: Haptic feedback for activity controls

## Future Enhancements

- Notification action buttons (pause, resume, stop) - requires native build
- Rich notification with map preview
- Customizable notification appearance
- Notification history
- Smart notification timing based on user preferences
