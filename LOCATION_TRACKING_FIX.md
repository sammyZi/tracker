# Location Tracking Warning Fix

## Issue

Multiple "Location tracking already started" warnings appearing in logs:

```
WARN  Location tracking already started
WARN  Location tracking already started
WARN  Location tracking already started
```

## Root Cause

The app was trying to start location tracking multiple times without checking if it was already running:

1. **On screen mount**: Started foreground tracking for map
2. **On activity start**: Tried to start background tracking (but foreground was still running)
3. **On activity stop**: Tried to restart foreground tracking (but it was still running)

## Solution

Added proper checks before starting location tracking:

### 1. Initialize Services (Screen Mount)

```typescript
// Only start if not already tracking
if (hasPermission && !locationService.isCurrentlyTracking()) {
  await locationService.startTracking(false);
  console.log('Started foreground location tracking for map');
}
```

### 2. Start Activity

```typescript
// Stop foreground tracking before starting background tracking
if (locationService.isCurrentlyTracking()) {
  console.log('Stopping foreground tracking before starting activity');
  await locationService.stopTracking();
  // Wait for cleanup
  await new Promise(resolve => setTimeout(resolve, 500));
}

await ActivityService.startActivity(activityType, true);
```

### 3. Reset State (After Activity)

```typescript
// Wait for cleanup
await new Promise(resolve => setTimeout(resolve, 500));

// Only restart if not already tracking
if (hasPermission && !locationService.isCurrentlyTracking()) {
  console.log('Restarting foreground location tracking for map');
  await locationService.startTracking(false);
} else if (locationService.isCurrentlyTracking()) {
  console.log('Location tracking already active, not restarting');
}
```

## Key Changes

1. **Check before starting**: Always check `isCurrentlyTracking()` before calling `startTracking()`
2. **Wait for cleanup**: Add 500ms delay after stopping to allow proper cleanup
3. **Better logging**: Added console logs to track what's happening

## Expected Logs (No Warnings)

```
LOG  Started foreground location tracking for map
LOG  Stopping foreground tracking before starting activity
LOG  Location tracking stopped
LOG  Background location tracking started
LOG  Location tracking started with high accuracy (background: true)
LOG  Activity started: [id] (walking)
...
LOG  Location tracking stopped
LOG  Restarting foreground location tracking for map
LOG  Location tracking started with high accuracy (background: false)
```

## Files Modified

- `ActivityTrackingScreen.tsx`:
  - Added `isCurrentlyTracking()` checks
  - Added 500ms delays for cleanup
  - Added debug logging

## Testing

1. **Open app** - Should start foreground tracking once
2. **Start activity** - Should stop foreground, start background (no warnings)
3. **Stop activity** - Should stop background, restart foreground (no warnings)
4. **Start another activity** - Should work without warnings

## Result

✅ No more "Location tracking already started" warnings
✅ Clean tracking lifecycle
✅ Proper foreground/background transitions
✅ Better debugging with logs
