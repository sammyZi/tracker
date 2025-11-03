# Enable Full Maps - Step by Step Guide

This guide shows you how to switch from the placeholder to the full interactive map with react-native-maps.

## Prerequisites

- ✅ Google Maps API Key (see MAPS_SETUP.md for how to get one)
- ✅ Xcode installed (for iOS)
- ✅ Android Studio installed (for Android)

## Step 1: Restore react-native-maps Plugin

Edit `app.json` and add the react-native-maps plugin back:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Allow Fitness Tracker to use your location to track activities."
        }
      ],
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#ffffff"
        }
      ],
      [
        "react-native-maps",
        {
          "googleMapsApiKey": "YOUR_ACTUAL_GOOGLE_MAPS_API_KEY"
        }
      ]
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.fitnesstracker",
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "We need your location to track your activities",
        "NSLocationAlwaysAndWhenInUseUsageDescription": "We need your location to track activities in the background",
        "NSMotionUsageDescription": "We need access to your motion sensors to count steps"
      },
      "config": {
        "googleMapsApiKey": "YOUR_ACTUAL_GOOGLE_MAPS_API_KEY"
      }
    }
  }
}
```

**Important**: Replace `YOUR_ACTUAL_GOOGLE_MAPS_API_KEY` with your real API key!

## Step 2: Switch to Full Map Component

Edit `src/components/map/index.ts`:

**Change from:**
```typescript
// Use placeholder for Expo Go (no native modules required)
export { LiveRouteMap } from './LiveRouteMapPlaceholder';

// Full version with react-native-maps (requires native build)
// export { LiveRouteMap } from './LiveRouteMapFull';
```

**To:**
```typescript
// Use placeholder for Expo Go (no native modules required)
// export { LiveRouteMap } from './LiveRouteMapPlaceholder';

// Full version with react-native-maps (requires native build)
export { LiveRouteMap } from './LiveRouteMapFull';
```

## Step 3: Build Native Code

Now you need to generate and build the native iOS/Android code.

### Option A: Local Build (Faster)

#### For iOS:

```bash
# Stop the current Expo server (Ctrl+C)

# Navigate to project
cd fitness-tracker-app

# Prebuild native code
npx expo prebuild --platform ios

# Run on iOS simulator
npx expo run:ios
```

#### For Android:

```bash
# Stop the current Expo server (Ctrl+C)

# Navigate to project
cd fitness-tracker-app

# Prebuild native code
npx expo prebuild --platform android

# Run on Android emulator
npx expo run:android
```

### Option B: EAS Build (Cloud Build)

```bash
# Install EAS CLI (if not installed)
npm install -g eas-cli

# Login to Expo
eas login

# Configure EAS
eas build:configure

# Build for iOS simulator
eas build --profile development --platform ios

# OR build for Android
eas build --profile development --platform android

# After build completes, install it and run:
npx expo start --dev-client
```

## Step 4: Verify Maps Work

After the app builds and runs, you should see:

✅ **Full Interactive Map** with:
- Google Maps (Android) or Apple Maps (iOS)
- Real-time location marker with pulsing animation
- Polyline showing your route as you move
- Pace-based route coloring (green = fast, red = slow)
- Start marker (green flag)
- End marker (red checkmark) when you stop
- Map type toggle (standard/satellite/hybrid)
- Smooth auto-centering
- Accuracy circle around current location

## Troubleshooting

### "Map shows blank or 'For development purposes only'"

**Solution**: Your Google Maps API key needs to be configured properly.

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable these APIs:
   - Maps SDK for Android
   - Maps SDK for iOS
3. Make sure your API key is unrestricted OR restricted to your app's package/bundle ID
4. Rebuild the app after updating the API key

### "Build failed"

**Solution**: Clean and rebuild

```bash
# Remove native folders
rm -rf ios android

# Clear node modules
rm -rf node_modules
npm install

# Prebuild again
npx expo prebuild
npx expo run:ios  # or run:android
```

### "Module not found: react-native-maps"

**Solution**: Make sure you ran `npx expo prebuild` after adding the plugin to app.json

### "Can't use Expo Go anymore"

**Correct!** Once you prebuild, you can't use Expo Go. You must use:
- `npx expo run:ios` for iOS
- `npx expo run:android` for Android
- OR use a development build with `npx expo start --dev-client`

## What Changes After Enabling Maps

### Before (Placeholder):
- ✅ Works in Expo Go
- ✅ Shows coordinates and stats
- ❌ No interactive map
- ❌ No route visualization

### After (Full Maps):
- ❌ Requires native build (no Expo Go)
- ✅ Full interactive map
- ✅ Route polyline with pace colors
- ✅ Start/end markers
- ✅ Auto-centering camera
- ✅ Map type controls

## Quick Reference Commands

```bash
# Enable full maps workflow:

# 1. Update app.json (add react-native-maps plugin)
# 2. Update src/components/map/index.ts (switch to LiveRouteMapFull)

# 3. Build for iOS
npx expo prebuild --platform ios
npx expo run:ios

# OR build for Android
npx expo prebuild --platform android
npx expo run:android

# 4. Test the app with full maps!
```

## Going Back to Placeholder

If you want to go back to Expo Go:

1. **Remove plugin** from `app.json`
2. **Switch back** in `src/components/map/index.ts`:
   ```typescript
   export { LiveRouteMap } from './LiveRouteMapPlaceholder';
   ```
3. **Delete native folders**:
   ```bash
   rm -rf ios android
   ```
4. **Start Expo Go**:
   ```bash
   npx expo start -c
   ```

## Summary

**To Enable Full Maps:**
1. ✅ Add react-native-maps plugin to app.json with API key
2. ✅ Switch to LiveRouteMapFull in index.ts
3. ✅ Run `npx expo prebuild`
4. ✅ Run `npx expo run:ios` or `npx expo run:android`

**Time Required**: 5-15 minutes (first build takes longer)

**Result**: Full interactive map with all features! 🗺️

See `MAPS_SETUP.md` for detailed Google Maps API key setup.
