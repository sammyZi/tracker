# Build Instructions - Background Tracking Fix

## Changes Made

The following files were updated to fix the app closing in background:

1. **MainActivity.kt** - Added battery optimization exemption request
2. **AndroidManifest.xml** - Enhanced service configuration with separate process
3. **BACKGROUND_TRACKING_GUIDE.md** - User guide for manual settings

## Build Steps

### 1. Clean Previous Build
```bash
cd fitness-tracker-app/android
./gradlew clean
```

### 2. Build Debug APK (for testing)
```bash
./gradlew assembleDebug
```
APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

### 3. Build Release APK (for distribution)
```bash
./gradlew assembleRelease
```
APK locations:
- Universal: `android/app/build/outputs/apk/release/app-universal-release.apk`
- ARM64: `android/app/build/outputs/apk/release/app-arm64-v8a-release.apk`
- ARMv7: `android/app/build/outputs/apk/release/app-armeabi-v7a-release.apk`

### 4. Install on Device
```bash
# Debug version
adb install android/app/build/outputs/apk/debug/app-debug.apk

# Or release version
adb install android/app/build/outputs/apk/release/app-universal-release.apk
```

## Testing Background Tracking

1. Install the new APK
2. Open the app - it will request battery optimization exemption
3. Grant the permission when prompted
4. Start a workout
5. Press home button (don't swipe away)
6. Wait 5-10 minutes
7. Return to app - verify tracking continued

## If App Still Closes

Follow the manual steps in [BACKGROUND_TRACKING_GUIDE.md](./BACKGROUND_TRACKING_GUIDE.md):
- Disable battery optimization manually
- Check manufacturer-specific settings
- Lock app in recent apps
- Verify notification is showing

## Key Changes Explained

### Battery Optimization Exemption
The app now requests to be excluded from battery optimization. This is standard for fitness/navigation apps that need continuous background tracking.

### Separate Process
The background location service runs in its own process (`:background_location`), which helps prevent it from being killed when the main app is backgrounded.

### Foreground Service
The location tracking runs as a foreground service with a persistent notification, which Android treats with higher priority and is less likely to kill.

## Verification

After installing, check:
- [ ] Battery optimization exemption dialog appears on first launch
- [ ] Persistent notification shows during workout
- [ ] App continues tracking when screen is off
- [ ] App continues tracking when other apps are opened
- [ ] Distance increases even when app is backgrounded

## Troubleshooting

**Permission dialog doesn't appear:**
- Uninstall the app completely
- Reinstall the new APK
- Open the app fresh

**App still closes:**
- Check Settings → Apps → Fitness Tracker → Battery
- Ensure it's set to "Unrestricted" or "Not optimized"
- Follow manufacturer-specific steps in the guide

**No notification showing:**
- Check notification permissions are enabled
- The notification is required for the foreground service to work
