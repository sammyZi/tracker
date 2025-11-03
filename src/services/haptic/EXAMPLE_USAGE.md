# Haptic Feedback Service - Example Usage

## Basic Integration in Activity Tracking

```typescript
import HapticFeedbackService from '@/services/haptic';

// Initialize on app start
useEffect(() => {
  HapticFeedbackService.initialize(true);
}, []);

// Handle activity start
const handleStart = async () => {
  // Trigger haptic feedback
  await HapticFeedbackService.activityStart();
  
  await ActivityService.startActivity(activityType);
};

// Handle activity pause
const handlePause = async () => {
  // Trigger haptic feedback
  await HapticFeedbackService.activityPause();
  
  await ActivityService.pauseActivity();
};

// Handle activity resume
const handleResume = async () => {
  // Trigger haptic feedback
  await HapticFeedbackService.activityResume();
  
  await ActivityService.resumeActivity();
};

// Handle activity stop
const handleStop = async () => {
  // Trigger haptic feedback (double tap pattern)
  await HapticFeedbackService.activityStop();
  
  // Show confirmation dialog
  Alert.alert('Stop Activity', 'Save this activity?');
};

// Handle successful save
const handleSave = async () => {
  await ActivityService.stopActivity();
  await HapticFeedbackService.success();
};

// Handle error
const handleError = async () => {
  await HapticFeedbackService.error();
  Alert.alert('Error', 'Failed to save activity');
};
```

## UI Interactions

```typescript
// Button press feedback
<TouchableOpacity
  onPress={async () => {
    await HapticFeedbackService.light();
    handleButtonPress();
  }}
>
  <Text>Press Me</Text>
</TouchableOpacity>

// Selection feedback (for toggles, pickers)
<TouchableOpacity
  onPress={async () => {
    await HapticFeedbackService.selection();
    setActivityType('running');
  }}
>
  <Text>Running</Text>
</TouchableOpacity>

// Important action feedback
<TouchableOpacity
  onPress={async () => {
    await HapticFeedbackService.heavy();
    handleImportantAction();
  }}
>
  <Text>Delete</Text>
</TouchableOpacity>
```

## Milestone Celebrations

```typescript
// Distance milestone
useEffect(() => {
  if (AudioAnnouncementService.shouldAnnounce(distance)) {
    // Trigger haptic feedback along with audio
    HapticFeedbackService.distanceMilestone();
    AudioAnnouncementService.announceDistance(distance, pace);
  }
}, [distance]);

// Goal achievement
const handleGoalAchieved = async () => {
  // Triple tap pattern for celebration
  await HapticFeedbackService.goalAchievement();
  
  // Show notification
  NotificationService.showGoalAchievement('Weekly Goal', 'You ran 50km this week!');
};
```

## Settings Integration

```typescript
// Toggle haptic feedback
const toggleHapticFeedback = (enabled: boolean) => {
  if (enabled) {
    HapticFeedbackService.enable();
    // Give immediate feedback
    HapticFeedbackService.success();
  } else {
    HapticFeedbackService.disable();
  }
};

// Check if enabled
const isEnabled = HapticFeedbackService.isEnabled();

// Check if supported
const isSupported = HapticFeedbackService.isSupported();
if (!isSupported) {
  console.warn('Haptic feedback not supported on this device');
}
```

## Generic Trigger

```typescript
// Trigger by type
await HapticFeedbackService.trigger('success');
await HapticFeedbackService.trigger('warning');
await HapticFeedbackService.trigger('error');
await HapticFeedbackService.trigger('light');
await HapticFeedbackService.trigger('medium');
await HapticFeedbackService.trigger('heavy');
await HapticFeedbackService.trigger('selection');
```

## Complete Activity Flow Example

```typescript
const ActivityTrackingScreen = () => {
  const handleActivityFlow = async () => {
    try {
      // Start
      await HapticFeedbackService.activityStart();
      await ActivityService.startActivity('running');
      
      // ... activity in progress ...
      
      // Milestone reached
      await HapticFeedbackService.distanceMilestone();
      
      // Pause
      await HapticFeedbackService.activityPause();
      await ActivityService.pauseActivity();
      
      // Resume
      await HapticFeedbackService.activityResume();
      await ActivityService.resumeActivity();
      
      // Stop
      await HapticFeedbackService.activityStop();
      
      // Save success
      await ActivityService.stopActivity();
      await HapticFeedbackService.success();
      
    } catch (error) {
      // Error feedback
      await HapticFeedbackService.error();
      Alert.alert('Error', error.message);
    }
  };
};
```

## Feedback Patterns

### Activity Controls
- **Start**: Success notification (positive confirmation)
- **Pause**: Warning notification (cautionary)
- **Resume**: Success notification (positive confirmation)
- **Stop**: Double heavy impact (emphasis on important action)

### Milestones
- **Distance**: Success notification
- **Goal**: Triple heavy impact (celebration)

### UI Interactions
- **Button Press**: Light impact
- **Selection**: Selection feedback
- **Toggle**: Selection feedback
- **Important Action**: Heavy impact

### Notifications
- **Success**: Success notification
- **Warning**: Warning notification
- **Error**: Error notification
