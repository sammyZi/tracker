# Haptic Feedback Service

The Haptic Feedback Service provides tactile feedback for user interactions and activity events, enhancing the user experience with physical confirmation of actions.

## Features

- **Activity Controls**: Haptic feedback for start, pause, resume, and stop actions
- **Milestones**: Feedback for distance achievements and goals
- **UI Interactions**: Light feedback for button presses and selections
- **Notification Types**: Success, warning, and error feedback
- **Configurable**: Enable/disable haptic feedback

## Usage

### Initialize the Service

```typescript
import HapticFeedbackService from '@/services/haptic';

// Initialize with haptic feedback enabled
HapticFeedbackService.initialize(true);
```

### Activity Events

```typescript
// Start activity
await HapticFeedbackService.activityStart();

// Pause activity
await HapticFeedbackService.activityPause();

// Resume activity
await HapticFeedbackService.activityResume();

// Stop activity (double tap pattern)
await HapticFeedbackService.activityStop();
```

### Milestones and Achievements

```typescript
// Distance milestone
await HapticFeedbackService.distanceMilestone();

// Goal achievement (triple tap pattern)
await HapticFeedbackService.goalAchievement();
```

### UI Interactions

```typescript
// Light feedback for button presses
await HapticFeedbackService.light();

// Selection feedback for toggles/pickers
await HapticFeedbackService.selection();

// Medium feedback
await HapticFeedbackService.medium();

// Heavy feedback
await HapticFeedbackService.heavy();
```

### Notification Feedback

```typescript
// Success
await HapticFeedbackService.success();

// Warning
await HapticFeedbackService.warning();

// Error
await HapticFeedbackService.error();
```

### Configuration

```typescript
// Enable/disable
HapticFeedbackService.enable();
HapticFeedbackService.disable();

// Check if enabled
const isEnabled = HapticFeedbackService.isEnabled();

// Check if supported on device
const isSupported = HapticFeedbackService.isSupported();
```

### Generic Trigger

```typescript
// Trigger by type
await HapticFeedbackService.trigger('success');
await HapticFeedbackService.trigger('light');
await HapticFeedbackService.trigger('selection');
```

## Feedback Types

### Impact Feedback
- **Light**: Subtle feedback for minor interactions
- **Medium**: Moderate feedback for standard interactions
- **Heavy**: Strong feedback for important actions

### Notification Feedback
- **Success**: Positive confirmation
- **Warning**: Cautionary feedback
- **Error**: Negative feedback

### Selection Feedback
- **Selection**: Feedback for UI element selection

## Special Patterns

### Stop Action
Double tap pattern with 100ms delay between taps for emphasis.

### Goal Achievement
Triple tap pattern with 100ms delays for celebration effect.

## Platform Support

Haptic feedback is supported on:
- iOS devices
- Most modern Android devices

The service gracefully handles unsupported devices by silently failing.

## Requirements

- Requirement 7.3: Haptic feedback for start, pause, stop actions

## Dependencies

- `expo-haptics`: Haptic feedback functionality
- `react-native`: Platform detection
