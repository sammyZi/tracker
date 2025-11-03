# Rebuild Instructions

## Important: Manifest Changes Require Rebuild

Since we modified the Android manifest (`AndroidManifest.xml`), you **must rebuild the app** for the changes to take effect.

## Steps to Rebuild

### Option 1: Clean Rebuild (Recommended)

```bash
# Navigate to android directory
cd fitness-tracker-app/android

# Clean the build
./gradlew clean

# Go back to project root
cd ..

# Rebuild and run
npx expo run:android
```

### Option 2: Quick Rebuild

```bash
# From project root
cd fitness-tracker-app
npx expo run:android
```

## What Changed

1. **Android Manifest**:
   - Added `FOREGROUND_SERVICE_LOCATION` permission
   - Added `POST_NOTIFICATIONS` permission

2. **GPS Accuracy**:
   - Improved to 3-5 meter accuracy
   - More frequent updates (2 seconds)
   - Better route detail capture (3 meters)

3. **Bug Fixes**:
   - Fixed "Failed to start tracking" error
   - Fixed back button navigation
   - Improved activity lifecycle management

## After Rebuild

### 1. Grant Permissions

When you first run the app:
1. Allow location access: **"Allow all the time"**
2. Allow notifications (Android 13+)
3. Allow physical activity recognition

### 2. Test the Fixes

1. **Start an activity** - Should work without errors
2. **Stop and start again** - Should work without "Failed to start tracking"
3. **Press back button** - Should return to home screen
4. **Lock screen during activity** - Should continue tracking in background

### 3. Verify Accuracy

Check the logs for accuracy values:
```
[Background] Rejected inaccurate location: 15m  // Points > 5m are rejected
```

Good GPS points should show accuracy between 3-5 meters.

## Troubleshooting

### If you still get foreground service error:

1. **Uninstall the old app completely**:
```bash
adb uninstall com.yourcompany.fitnesstracker
```

2. **Clean everything**:
```bash
cd android
./gradlew clean
cd ..
rm -rf android/app/build
```

3. **Rebuild**:
```bash
npx expo run:android
```

### If GPS accuracy is poor:

1. Test outdoors with clear sky view
2. Wait 30-60 seconds for GPS to stabilize
3. Check device GPS settings are enabled
4. Verify "High accuracy" mode is enabled in device settings

## Expected Behavior

✅ Activity starts without errors
✅ Background tracking works with foreground notification
✅ GPS accuracy is 3-5 meters
✅ Routes are smooth and detailed
✅ Back button returns to home screen
✅ Can start new activity after stopping previous one

## Notes

- The first GPS fix may take 30-60 seconds
- Indoor GPS will be less accurate
- Battery usage will be slightly higher due to more frequent updates
- This is normal for high-accuracy GPS tracking
