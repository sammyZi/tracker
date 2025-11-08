# Step Counter Service

The Step Counter Service provides step counting functionality using the device's built-in pedometer sensor via expo-sensors.

## Features

- **Device Availability Check**: Verifies if pedometer is available on the device
- **Session-based Counting**: Tracks steps for individual activity sessions
- **Real-time Updates**: Provides live step count updates during activities
- **Background Support**: Continues counting steps when app is in background
- **Callback System**: Subscribe to step count updates

## Usage

```typescript
import stepCounterService from '@/services/stepCounter';

// Check if pedometer is available
const available = await stepCounterService.isAvailable();

if (available) {
  // Start counting steps
  await stepCounterService.startCounting();

  // Subscribe to step updates
  const unsubscribe = stepCounterService.onStepUpdate((steps) => {
    console.log(`Current steps: ${steps}`);
  });

  // Get current step count
  const currentSteps = stepCounterService.getCurrentSteps();

  // Stop counting and get final count
  const totalSteps = await stepCounterService.stopCounting();

  // Unsubscribe from updates
  unsubscribe();
}
```

## Integration with ActivityService

The Step Counter Service is designed to work seamlessly with the Activity Service:

```typescript
import activityService from '@/services/activity';
import stepCounterService from '@/services/stepCounter';

// Start activity and step counting
await activityService.startActivity('running');
await stepCounterService.startCounting();

// Subscribe to step updates and update activity
stepCounterService.onStepUpdate((steps) => {
  activityService.updateSteps(steps);
});

// Stop both when activity ends
await activityService.stopActivity();
await stepCounterService.stopCounting();
```

## API Reference

### Methods

#### `isAvailable(): Promise<boolean>`
Check if the pedometer sensor is available on the device.

#### `startCounting(): Promise<void>`
Start counting steps for a new activity session.

#### `stopCounting(): Promise<number>`
Stop counting steps and return the total count for the session.

#### `pauseCounting(): void`
Pause step counting (pedometer continues in background).

#### `resumeCounting(): void`
Resume step counting.

#### `getCurrentSteps(): number`
Get the current step count for the active session.

#### `isCurrentlyCounting(): boolean`
Check if currently counting steps.

#### `onStepUpdate(callback: StepUpdateCallback): () => void`
Subscribe to step count updates. Returns an unsubscribe function.

#### `getStepCountForPeriod(start: Date, end: Date): Promise<number>`
Get step count for a specific time period.

#### `reset(): Promise<void>`
Reset the service state (useful for testing or cleanup).

## Notes

- The pedometer may not be available on all devices (especially emulators)
- Step counting accuracy depends on device hardware and sensor quality
- The service uses the device's step counter which runs at the system level
- Steps are counted from the start of the current day as a baseline
- Background step counting works automatically when the app is backgrounded
