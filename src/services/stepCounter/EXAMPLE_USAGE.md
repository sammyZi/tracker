# Step Counter Service - Example Usage

This document provides practical examples of using the Step Counter Service in the Fitness Tracker App.

## Basic Usage

### Standalone Step Counting

```typescript
import stepCounterService from '@/services/stepCounter';

// Check if pedometer is available
const isAvailable = await stepCounterService.isAvailable();

if (isAvailable) {
  // Start counting
  await stepCounterService.startCounting();
  
  // Get current steps
  const steps = stepCounterService.getCurrentSteps();
  console.log(`Current steps: ${steps}`);
  
  // Stop counting
  const totalSteps = await stepCounterService.stopCounting();
  console.log(`Total steps: ${totalSteps}`);
} else {
  console.log('Pedometer not available on this device');
}
```

### With Real-time Updates

```typescript
import stepCounterService from '@/services/stepCounter';

// Start counting
await stepCounterService.startCounting();

// Subscribe to step updates
const unsubscribe = stepCounterService.onStepUpdate((steps) => {
  console.log(`Steps updated: ${steps}`);
  // Update UI here
});

// Later, unsubscribe
unsubscribe();
```

## Integration with Activity Tracking

### Automatic Integration (Recommended)

The ActivityService automatically handles step counting:

```typescript
import activityService from '@/services/activity';

// Start activity - step counting starts automatically
const activityId = await activityService.startActivity('running');

// Get metrics including steps
const metrics = activityService.getCurrentMetrics();
console.log(`Steps: ${metrics.steps}`);

// Pause activity - step counting pauses
await activityService.pauseActivity();

// Resume activity - step counting resumes
await activityService.resumeActivity();

// Stop activity - step counting stops and final count is saved
const activity = await activityService.stopActivity();
console.log(`Total steps: ${activity.steps}`);
```

### Manual Integration

If you need more control:

```typescript
import activityService from '@/services/activity';
import stepCounterService from '@/services/stepCounter';

// Start activity
await activityService.startActivity('running');

// Manually start step counting
await stepCounterService.startCounting();

// Subscribe to step updates and update activity
const unsubscribe = stepCounterService.onStepUpdate((steps) => {
  activityService.updateSteps(steps);
});

// Stop both
await activityService.stopActivity();
await stepCounterService.stopCounting();
unsubscribe();
```

## React Component Example

### Using Step Counter in a Component

```typescript
import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import stepCounterService from '@/services/stepCounter';

const StepCounterDisplay: React.FC = () => {
  const [steps, setSteps] = useState(0);
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const initStepCounter = async () => {
      const available = await stepCounterService.isAvailable();
      setIsAvailable(available);

      if (available) {
        await stepCounterService.startCounting();
        
        unsubscribe = stepCounterService.onStepUpdate((newSteps) => {
          setSteps(newSteps);
        });
      }
    };

    initStepCounter();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      if (stepCounterService.isCurrentlyCounting()) {
        stepCounterService.stopCounting();
      }
    };
  }, []);

  if (!isAvailable) {
    return (
      <View>
        <Text>Step counter not available</Text>
      </View>
    );
  }

  return (
    <View>
      <Text>Steps: {steps}</Text>
    </View>
  );
};

export default StepCounterDisplay;
```

### Activity Tracking Screen with Steps

```typescript
import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import activityService from '@/services/activity';
import { ActivityMetrics } from '@/types';

const ActivityTrackingScreen: React.FC = () => {
  const [metrics, setMetrics] = useState<ActivityMetrics | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    const unsubscribe = activityService.onMetricsUpdate((newMetrics) => {
      setMetrics(newMetrics);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleStart = async () => {
    try {
      await activityService.startActivity('running');
      setIsTracking(true);
    } catch (error) {
      console.error('Error starting activity:', error);
    }
  };

  const handleStop = async () => {
    try {
      const activity = await activityService.stopActivity();
      setIsTracking(false);
      console.log('Activity completed:', activity);
    } catch (error) {
      console.error('Error stopping activity:', error);
    }
  };

  return (
    <View>
      {metrics && (
        <>
          <Text>Distance: {(metrics.distance / 1000).toFixed(2)} km</Text>
          <Text>Duration: {Math.floor(metrics.duration / 60)} min</Text>
          <Text>Steps: {metrics.steps}</Text>
          <Text>Pace: {(metrics.averagePace / 60).toFixed(2)} min/km</Text>
          <Text>Calories: {metrics.calories}</Text>
        </>
      )}
      
      {!isTracking ? (
        <Button title="Start Activity" onPress={handleStart} />
      ) : (
        <Button title="Stop Activity" onPress={handleStop} />
      )}
    </View>
  );
};

export default ActivityTrackingScreen;
```

## Historical Step Data

### Get Steps for a Specific Period

```typescript
import stepCounterService from '@/services/stepCounter';

// Get steps for today
const today = new Date();
today.setHours(0, 0, 0, 0);
const now = new Date();

const todaySteps = await stepCounterService.getStepCountForPeriod(today, now);
console.log(`Steps today: ${todaySteps}`);

// Get steps for yesterday
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);

const yesterdaySteps = await stepCounterService.getStepCountForPeriod(yesterday, today);
console.log(`Steps yesterday: ${yesterdaySteps}`);

// Get steps for last 7 days
const weekAgo = new Date(today);
weekAgo.setDate(weekAgo.getDate() - 7);

const weekSteps = await stepCounterService.getStepCountForPeriod(weekAgo, now);
console.log(`Steps this week: ${weekSteps}`);
```

## Error Handling

### Graceful Degradation

```typescript
import stepCounterService from '@/services/stepCounter';

const startActivityWithSteps = async () => {
  try {
    // Start activity
    await activityService.startActivity('running');
    
    // Try to start step counting
    const available = await stepCounterService.isAvailable();
    
    if (available) {
      await stepCounterService.startCounting();
      console.log('Step counting enabled');
    } else {
      console.log('Continuing without step counting');
      // Activity tracking continues without steps
    }
  } catch (error) {
    console.error('Error starting activity:', error);
    // Handle error appropriately
  }
};
```

### Handling Permission Issues

```typescript
import stepCounterService from '@/services/stepCounter';
import { Alert } from 'react-native';

const checkStepCounterAvailability = async () => {
  try {
    const available = await stepCounterService.isAvailable();
    
    if (!available) {
      Alert.alert(
        'Step Counter Unavailable',
        'Your device does not support step counting. Activity tracking will continue without step data.',
        [{ text: 'OK' }]
      );
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking step counter:', error);
    return false;
  }
};
```

## Testing on Different Devices

### Emulator vs Physical Device

```typescript
import stepCounterService from '@/services/stepCounter';
import { Platform } from 'react-native';

const initializeStepCounter = async () => {
  const available = await stepCounterService.isAvailable();
  
  if (!available) {
    if (__DEV__) {
      console.log('Step counter not available - likely running on emulator');
      // Use mock data for development
      return { useMockData: true };
    } else {
      console.log('Step counter not available on this device');
      return { useMockData: false };
    }
  }
  
  await stepCounterService.startCounting();
  return { useMockData: false };
};
```

## Best Practices

1. **Always Check Availability**: Check if the pedometer is available before starting
2. **Handle Gracefully**: Continue activity tracking even if step counting is unavailable
3. **Clean Up**: Always unsubscribe from updates and stop counting when done
4. **Background Support**: Step counting continues automatically in background with ActivityService
5. **Error Handling**: Wrap step counter calls in try-catch blocks
6. **User Feedback**: Inform users if step counting is unavailable on their device

## Common Issues

### Issue: Steps not updating
**Solution**: Ensure you've subscribed to step updates and the pedometer is available

### Issue: Steps reset to zero
**Solution**: This happens when starting a new counting session. The service tracks steps from the session start.

### Issue: Inaccurate step count
**Solution**: Step counting accuracy depends on device hardware. Some devices may be more accurate than others.

### Issue: Not working on emulator
**Solution**: Emulators typically don't have pedometer support. Test on a physical device.
