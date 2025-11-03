# NotificationService Example Usage

This document provides practical examples of using the NotificationService in different scenarios.

## Example 1: Basic Activity Tracking with Notifications

```typescript
import React, { useEffect, useState } from 'react';
import { View, Button } from 'react-native';
import NotificationService from '@/services/notification';
import ActivityService from '@/services/activity';
import { ActivityMetrics } from '@/types';

export default function ActivityTrackingExample() {
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [updateInterval, setUpdateInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initialize notification service on mount
    initializeNotifications();

    return () => {
      // Clean up on unmount
      if (updateInterval) {
        clearInterval(updateInterval);
      }
    };
  }, []);

  const initializeNotifications = async () => {
    await NotificationService.initialize();
    const granted = await NotificationService.requestPermissions();
    
    if (!granted) {
      console.warn('Notification permissions not granted');
    }
  };

  const startActivity = async () => {
    try {
      // Start activity tracking
      const activityId = await ActivityService.startActivity('running');
      setIsTracking(true);
      setIsPaused(false);

      // Show initial notification
      const activity = ActivityService.getCurrentActivity();
      if (activity) {
        const metrics = ActivityService.calculateMetrics(activity);
        await NotificationService.showActivityNotification(
          metrics,
          'running',
          'metric',
          false
        );
      }

      // Set up periodic notification updates (every 5 seconds)
      const interval = setInterval(async () => {
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

      setUpdateInterval(interval);
    } catch (error) {
      console.error('Error starting activity:', error);
    }
  };

  const pauseActivity = async () => {
    try {
      const activity = ActivityService.getCurrentActivity();
      if (activity) {
        await ActivityService.pauseActivity(activity.id);
        setIsPaused(true);

        // Update notification to show paused state
        const metrics = ActivityService.calculateMetrics(activity);
        await NotificationService.updateActivityNotification(
          metrics,
          'running',
          'metric',
          true // isPaused
        );
      }
    } catch (error) {
      console.error('Error pausing activity:', error);
    }
  };

  const resumeActivity = async () => {
    try {
      const activity = ActivityService.getCurrentActivity();
      if (activity) {
        await ActivityService.resumeActivity(activity.id);
        setIsPaused(false);

        // Update notification to show active state
        const metrics = ActivityService.calculateMetrics(activity);
        await NotificationService.updateActivityNotification(
          metrics,
          'running',
          'metric',
          false // not paused
        );
      }
    } catch (error) {
      console.error('Error resuming activity:', error);
    }
  };

  const stopActivity = async () => {
    try {
      // Clear update interval
      if (updateInterval) {
        clearInterval(updateInterval);
        setUpdateInterval(null);
      }

      const activity = ActivityService.getCurrentActivity();
      if (activity) {
        const completedActivity = await ActivityService.stopActivity(activity.id);
        setIsTracking(false);
        setIsPaused(false);

        // Dismiss ongoing notification
        await NotificationService.dismissActivityNotification();

        // Show completion notification
        const finalMetrics = ActivityService.calculateMetrics(completedActivity);
        await NotificationService.showActivityCompletion(
          finalMetrics,
          'running',
          'metric'
        );
      }
    } catch (error) {
      console.error('Error stopping activity:', error);
    }
  };

  return (
    <View>
      {!isTracking ? (
        <Button title="Start Activity" onPress={startActivity} />
      ) : (
        <>
          {!isPaused ? (
            <Button title="Pause" onPress={pauseActivity} />
          ) : (
            <Button title="Resume" onPress={resumeActivity} />
          )}
          <Button title="Stop" onPress={stopActivity} />
        </>
      )}
    </View>
  );
}
```

## Example 2: Distance Milestone Announcements

```typescript
import React, { useEffect, useRef } from 'react';
import NotificationService from '@/services/notification';
import { ActivityMetrics } from '@/types';

export function useDistanceAnnouncements(
  metrics: ActivityMetrics,
  units: 'metric' | 'imperial',
  announcementInterval: number = 1000 // 1 km or 1 mile
) {
  const lastAnnouncedDistance = useRef(0);

  useEffect(() => {
    // Check if we've reached a new milestone
    const currentMilestone = Math.floor(metrics.distance / announcementInterval);
    const lastMilestone = Math.floor(lastAnnouncedDistance.current / announcementInterval);

    if (currentMilestone > lastMilestone) {
      // New milestone reached!
      const milestoneDistance = currentMilestone * announcementInterval;
      
      NotificationService.showDistanceAnnouncement(
        milestoneDistance,
        metrics.currentPace || metrics.averagePace,
        units
      );

      lastAnnouncedDistance.current = milestoneDistance;
    }
  }, [metrics.distance, announcementInterval, units]);
}

// Usage in component
export default function ActivityTracking() {
  const [metrics, setMetrics] = useState<ActivityMetrics>({
    currentPace: 0,
    averagePace: 0,
    distance: 0,
    duration: 0,
    steps: 0,
    calories: 0,
  });

  // Announce every 1 km
  useDistanceAnnouncements(metrics, 'metric', 1000);

  // ... rest of component
}
```

## Example 3: Notification Response Handling

```typescript
import React, { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import NotificationService from '@/services/notification';
import * as Notifications from 'expo-notifications';

export function useNotificationHandlers() {
  const navigation = useNavigation();

  useEffect(() => {
    // Handle notification taps
    const responseSubscription = NotificationService.addNotificationResponseListener(
      (response: Notifications.NotificationResponse) => {
        const data = response.notification.request.content.data;

        if (data.type === 'activity-tracking') {
          // Navigate to activity tracking screen
          navigation.navigate('ActivityTracking');
        } else if (data.type === 'activity-completion') {
          // Navigate to activity summary
          navigation.navigate('ActivitySummary');
        } else if (data.type === 'goal-achievement') {
          // Navigate to goals screen
          navigation.navigate('Goals');
        }
      }
    );

    // Handle notifications received in foreground
    const receivedSubscription = NotificationService.addNotificationReceivedListener(
      (notification: Notifications.Notification) => {
        console.log('Notification received:', notification);
        // You can show an in-app banner or update UI here
      }
    );

    // Clean up
    return () => {
      responseSubscription.remove();
      receivedSubscription.remove();
    };
  }, [navigation]);
}

// Usage in App.tsx or main navigation component
export default function App() {
  useNotificationHandlers();

  return (
    // ... your app navigation
  );
}
```

## Example 4: Goal Achievement Notifications

```typescript
import NotificationService from '@/services/notification';
import StorageService from '@/services/storage';
import { Goal } from '@/types';

export async function checkAndNotifyGoalAchievement(goal: Goal) {
  if (goal.progress >= goal.target && !goal.achieved) {
    // Mark goal as achieved
    await StorageService.updateGoal(goal.id, { achieved: true });

    // Show achievement notification
    const goalTitle = getGoalTitle(goal);
    const goalDescription = getGoalDescription(goal);
    
    await NotificationService.showGoalAchievement(goalTitle, goalDescription);
  }
}

function getGoalTitle(goal: Goal): string {
  switch (goal.type) {
    case 'distance':
      return 'Distance Goal';
    case 'frequency':
      return 'Activity Frequency Goal';
    case 'duration':
      return 'Duration Goal';
    default:
      return 'Goal';
  }
}

function getGoalDescription(goal: Goal): string {
  const period = goal.period === 'weekly' ? 'this week' : 'this month';
  
  switch (goal.type) {
    case 'distance':
      return `You reached ${goal.target / 1000} km ${period}!`;
    case 'frequency':
      return `You completed ${goal.target} activities ${period}!`;
    case 'duration':
      return `You exercised for ${Math.floor(goal.target / 3600)} hours ${period}!`;
    default:
      return `You achieved your goal ${period}!`;
  }
}

// Usage: Check after each activity
export async function onActivityCompleted(activity: Activity) {
  const goals = await StorageService.getGoals();
  
  for (const goal of goals) {
    if (!goal.achieved) {
      // Update goal progress based on activity
      const updatedProgress = calculateGoalProgress(goal, activity);
      await StorageService.updateGoal(goal.id, { progress: updatedProgress });
      
      // Check if goal is now achieved
      const updatedGoal = { ...goal, progress: updatedProgress };
      await checkAndNotifyGoalAchievement(updatedGoal);
    }
  }
}
```

## Example 5: Custom Notification Update Intervals

```typescript
import React, { useEffect, useRef } from 'react';
import NotificationService from '@/services/notification';
import { ActivityMetrics } from '@/types';

export function useActivityNotifications(
  isTracking: boolean,
  isPaused: boolean,
  metrics: ActivityMetrics,
  activityType: 'walking' | 'running',
  units: 'metric' | 'imperial',
  updateIntervalMs: number = 5000 // Default 5 seconds
) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isTracking) {
      // Show initial notification
      NotificationService.showActivityNotification(
        metrics,
        activityType,
        units,
        isPaused
      );

      // Set up periodic updates
      intervalRef.current = setInterval(() => {
        NotificationService.updateActivityNotification(
          metrics,
          activityType,
          units,
          isPaused
        );
      }, updateIntervalMs);
    } else {
      // Clear interval and dismiss notification when not tracking
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      NotificationService.dismissActivityNotification();
    }

    // Clean up on unmount or when dependencies change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isTracking, isPaused, activityType, units, updateIntervalMs]);

  // Update notification when metrics change (but not too frequently)
  useEffect(() => {
    if (isTracking) {
      NotificationService.updateActivityNotification(
        metrics,
        activityType,
        units,
        isPaused
      );
    }
  }, [metrics.distance, metrics.duration]); // Only update on significant changes
}

// Usage
export default function ActivityScreen() {
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [metrics, setMetrics] = useState<ActivityMetrics>({...});

  // Automatically manage notifications
  useActivityNotifications(
    isTracking,
    isPaused,
    metrics,
    'running',
    'metric',
    3000 // Update every 3 seconds
  );

  // ... rest of component
}
```

## Example 6: Permission Handling with User Feedback

```typescript
import React, { useState } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import NotificationService from '@/services/notification';

export default function NotificationPermissionScreen() {
  const [permissionStatus, setPermissionStatus] = useState<
    'unknown' | 'granted' | 'denied'
  >('unknown');

  const checkPermissions = async () => {
    const granted = await NotificationService.checkPermissions();
    setPermissionStatus(granted ? 'granted' : 'denied');
  };

  const requestPermissions = async () => {
    const granted = await NotificationService.requestPermissions();
    setPermissionStatus(granted ? 'granted' : 'denied');

    if (!granted) {
      Alert.alert(
        'Notifications Disabled',
        'To receive activity updates and milestone notifications, please enable notifications in your device settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => {
            // Open device settings (requires expo-linking or similar)
            // Linking.openSettings();
          }},
        ]
      );
    }
  };

  return (
    <View>
      <Text>Notification Permission: {permissionStatus}</Text>
      <Button title="Check Permissions" onPress={checkPermissions} />
      <Button title="Request Permissions" onPress={requestPermissions} />
    </View>
  );
}
```

## Tips and Best Practices

1. **Initialize Early**: Call `initialize()` in your app's entry point (App.tsx)
2. **Request Permissions Gracefully**: Explain why you need permissions before requesting
3. **Update Efficiently**: Don't update notifications too frequently (3-5 seconds is good)
4. **Handle Errors**: Always wrap notification calls in try-catch blocks
5. **Clean Up**: Remove listeners and clear intervals when components unmount
6. **Test on Device**: Notifications behave differently on physical devices vs emulators
7. **Respect User Preferences**: Allow users to disable notifications in settings
8. **Battery Conscious**: Balance update frequency with battery consumption
