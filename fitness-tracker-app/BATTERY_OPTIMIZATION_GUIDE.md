# Battery Optimization Guide

This guide explains how the battery optimization feature works in the Fitness Tracker app.

## Overview

The app now automatically requests battery optimization exemption when background tracking is needed. This ensures accurate GPS tracking without interruptions from Android's battery optimization features.

## Features

### Automatic Request
- When starting an activity with background tracking, the app automatically checks if battery optimization is enabled
- If enabled, it shows a user-friendly dialog explaining why exemption is needed
- Users can choose to open settings immediately or skip for now
- The app won't ask more than once per 24 hours to avoid being annoying

### Manual Management
- Users can view and manage battery optimization status in the Settings screen
- The `BatteryOptimizationCard` component shows current status (Restricted/Unrestricted)
- Users can manually open battery settings at any time
- Info button explains what battery optimization does and why exemption helps

## Implementation

### Services

**BatteryOptimizationService** (`src/services/battery/BatteryOptimizationService.ts`)
- `isAppBatteryOptimized()` - Check if app is currently restricted
- `requestBatteryOptimizationExemption(context, skipCooldown)` - Show dialog and request exemption
- `openBatteryOptimizationSettings()` - Open Android battery settings
- `ensureBatteryExemption(context, skipCooldown)` - Smart check that respects 24-hour cooldown (unless skipped)
- `showBatteryOptimizationInfo()` - Display informational dialog

### Integration

The service is automatically integrated into two places:

**1. Onboarding Flow (PermissionsScreen)**
```typescript
// After permissions are granted
if (Platform.OS === 'android' && backgroundStatus === 'granted') {
  // Skip cooldown during onboarding to ensure user sees the prompt
  await BatteryOptimizationService.ensureBatteryExemption('tracking', true);
}
```

**2. Location Tracking (LocationService)**
```typescript
// In LocationService.ts
private async startBackgroundTracking(): Promise<void> {
  // Request battery optimization exemption before starting
  await batteryOptimizationService.ensureBatteryExemption('tracking');
  
  // Start background tracking...
}
```

### UI Component

**BatteryOptimizationCard** (`src/components/settings/BatteryOptimizationCard.tsx`)
- Shows current battery optimization status
- Displays color-coded badge (Restricted/Unrestricted)
- Provides button to disable optimization
- Info icon for additional details
- Only visible on Android devices

## Usage in Settings Screen

Add the component to your settings screen:

```typescript
import { BatteryOptimizationCard } from '@/components';

function SettingsScreen() {
  return (
    <ScrollView>
      {/* Other settings */}
      <BatteryOptimizationCard />
      {/* More settings */}
    </ScrollView>
  );
}
```

## Permissions

The following permission has been added to `AndroidManifest.xml` and `app.json`:

```xml
<uses-permission android:name="android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS"/>
```

## User Experience

### First App Launch (Onboarding)
1. User opens app for the first time
2. Permissions screen appears requesting location, background location, and motion permissions
3. User grants permissions by tapping "Grant Permissions"
4. **After background location is granted, battery optimization dialog appears immediately**
5. Dialog explains why battery exemption helps with tracking
6. User can choose "Open Settings" or "Not Now"
7. If "Open Settings", Android battery settings open
8. User disables optimization for the app
9. Onboarding completes and user enters the app

### First Activity Start
1. User starts an activity with background tracking
2. If battery optimization wasn't disabled during onboarding:
   - App checks if 24 hours have passed since last request
   - If yes, shows dialog again
   - If no, tracking starts without prompt
3. Activity tracking starts with full background support

### Subsequent Starts
- If user granted exemption: No dialog, tracking starts immediately
- If user declined: Dialog won't show again for 24 hours
- User can always manage it manually in Settings screen

## Benefits

- **Accurate Tracking**: GPS continues working in background without interruptions
- **Consistent Updates**: Location updates arrive on schedule
- **Better Routes**: No gaps in recorded routes due to battery restrictions
- **User Control**: Users understand why exemption helps and can manage it

## Testing

To test the battery optimization flow:

### Test Onboarding Flow
1. Uninstall the app completely
2. Reinstall and open the app
3. Grant location permissions when prompted
4. Grant background location permission
5. **Battery optimization dialog should appear immediately**
6. Test both "Open Settings" and "Not Now" options
7. Verify tracking works after completing onboarding

### Test During Activity
1. If you skipped battery optimization during onboarding
2. Start an activity with background tracking
3. Verify the dialog appears (if 24 hours have passed)
4. Open settings and disable optimization
5. Verify tracking works reliably in background

### Reset for Testing
To test the onboarding flow again:
- Uninstall the app completely
- Or clear app data in Android settings
- This resets the 24-hour cooldown timer

## Notes

- iOS doesn't have battery optimization settings, so this feature is Android-only
- The 24-hour cooldown prevents annoying users with repeated requests
- Users can always access battery settings manually from the Settings screen
- The app continues to work even if exemption is not granted, but tracking may be less reliable
