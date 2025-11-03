# Bug Fixes - Activity Tracking Issues

## Issues Fixed

### 1. "Failed to start tracking" after stopping activity

**Problem**: After stopping an activity and trying to start a new one, the app showed "Failed to start tracking" error.

**Root Cause**: The `initializeServices()` function was calling `locationService.startTracking(false)` on component mount, which meant location tracking was already active. When starting a new activity, the LocationService detected tracking was already started and threw a warning.

**Solution**:
- Removed the automatic `locationService.startTracking()` call from `initializeServices()`
- Location tracking now only starts when the user explicitly starts an activity via `handleStart()`
- The location service properly initializes and subscribes to updates without starting tracking prematurely

**Changes in `ActivityTrackingScreen.tsx`**:
```typescript
// Before
const initializeServices = async () => {
  // ... other initialization
  try {
    await locationService.startTracking(false);
  } catch (error) {
    console.log('Location permission not granted:', error);
  }
};

// After
const initializeServices = async () => {
  // ... other initialization
  // Subscribe to location updates (but don't start tracking yet)
  locationService.onLocationUpdate((location) => {
    setCurrentLocation(location);
  });
};
```

### 2. Back button exits app instead of returning to home screen

**Problem**: When pressing the Android back button on the ActivityTrackingScreen, the app would exit completely instead of returning to the home screen.

**Root Cause**: No back button handler was implemented, and the screen wasn't properly integrated with navigation.

**Solution**:
- Added `BackHandler` from React Native to intercept hardware back button presses
- Implemented smart back button behavior:
  - **When tracking is active**: Shows confirmation dialog with options to Continue, Stop & Save, or Discard
  - **When not tracking**: Returns to home screen via `onBack` callback
- Added visual back button in the UI (top-left corner) when not tracking
- Added `onBack` prop to `ActivityTrackingScreen` component
- Updated `App.tsx` to pass the callback that sets `showTrackingScreen` to false

**Changes in `ActivityTrackingScreen.tsx`**:

1. **Added BackHandler import**:
```typescript
import { BackHandler } from 'react-native';
```

2. **Added onBack prop**:
```typescript
interface ActivityTrackingScreenProps {
  onBack?: () => void;
}

export const ActivityTrackingScreen: React.FC<ActivityTrackingScreenProps> = ({ onBack }) => {
```

3. **Added back button handler in useEffect**:
```typescript
useEffect(() => {
  initializeServices();
  
  // Handle Android back button
  const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
    if (isTracking) {
      // Show confirmation dialog
      Alert.alert(
        'Activity in Progress',
        'You have an active activity. What would you like to do?',
        [
          { text: 'Continue', style: 'cancel' },
          { text: 'Stop & Save', onPress: async () => { /* ... */ } },
          { text: 'Discard', style: 'destructive', onPress: async () => { /* ... */ } },
        ]
      );
      return true; // Prevent default back behavior
    } else {
      // If not tracking, allow back navigation
      if (onBack) {
        onBack();
        return true;
      }
      return false;
    }
  });
  
  return () => {
    backHandler.remove();
    // ... cleanup
  };
}, [isTracking, onBack]);
```

4. **Added visual back button in UI**:
```typescript
{!isTracking && onBack && (
  <TouchableOpacity 
    style={styles.backButton} 
    onPress={onBack}
  >
    <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
  </TouchableOpacity>
)}
```

**Changes in `App.tsx`**:
```typescript
// Before
if (showTrackingScreen) {
  return <ActivityTrackingScreen />;
}

// After
if (showTrackingScreen) {
  return <ActivityTrackingScreen onBack={() => setShowTrackingScreen(false)} />;
}
```

### 3. Improved activity discard flow

**Problem**: When discarding an activity, the cleanup wasn't properly handling all edge cases.

**Solution**:
- Added try-catch blocks to handle errors gracefully
- Ensured location tracking is stopped even if activity service has issues
- Properly reset audio announcements
- Reset UI state in all cases

**Changes in `ActivityTrackingScreen.tsx`**:
```typescript
{
  text: 'Discard',
  style: 'destructive',
  onPress: async () => {
    try {
      // Stop activity service (which will stop location tracking)
      if (ActivityService.isActivityInProgress()) {
        // Force stop without saving
        await locationService.stopTracking();
      }
      AudioAnnouncementService.stop();
      resetState();
    } catch (error) {
      console.error('Error discarding activity:', error);
      resetState();
    }
  },
}
```

## Testing Recommendations

1. **Start/Stop Flow**:
   - Start an activity
   - Stop and save it
   - Immediately start a new activity (should work without errors)

2. **Back Button Behavior**:
   - Start an activity
   - Press back button (should show confirmation)
   - Choose "Continue" (should stay on screen)
   - Press back button again
   - Choose "Discard" (should return to home)
   - Press back button when not tracking (should return to home immediately)

3. **Discard Flow**:
   - Start an activity
   - Press stop button
   - Choose "Discard"
   - Verify location tracking stops
   - Verify audio announcements stop
   - Verify UI resets properly

4. **Visual Back Button**:
   - When not tracking, verify back button appears in top-left
   - Press it to return to home screen
   - When tracking, verify back button is hidden (status badge shows instead)

## Files Modified

1. `fitness-tracker-app/src/screens/activity/ActivityTrackingScreen.tsx`
   - Removed automatic location tracking start
   - Added BackHandler for hardware back button
   - Added onBack prop and callback handling
   - Added visual back button in UI
   - Improved error handling in discard flow

2. `fitness-tracker-app/App.tsx`
   - Added onBack callback to ActivityTrackingScreen

## Additional Improvements

- Better error handling throughout the activity lifecycle
- Graceful cleanup on all exit paths
- User-friendly confirmation dialogs
- Consistent state management
- Proper resource cleanup

## Known Limitations

- The app still uses a simple state toggle for navigation instead of a proper navigation library (React Navigation)
- For a production app, consider implementing proper navigation with stack/tab navigators
- The back button handler is specific to Android (iOS uses gesture-based navigation)
