# Quick Start Guide - Fitness Tracker App

## Current Status

✅ Task 10 (Live Route Mapping) has been implemented
⚠️ Native modules need to be built to run the app

## The Issue

You're seeing this error:
```
TurboModule Registry.getEnforcing(...): 'RNMapsAirModule' could not be found
```

This is because `react-native-maps` requires native code that hasn't been compiled yet.

## Quick Solution (Choose One)

### Option A: Local Prebuild (Fastest for Development)

Run these commands in the `fitness-tracker-app` directory:

```bash
# 1. Prebuild native code (creates ios/ and android/ folders)
npx expo prebuild

# 2. Run on iOS simulator
npx expo run:ios

# OR run on Android emulator
npx expo run:android
```

**Time**: ~5-10 minutes
**Pros**: Fast, works offline, good for development
**Cons**: Creates native folders in your project

### Option B: EAS Development Build (Recommended for Team)

```bash
# 1. Install EAS CLI (if not installed)
npm install -g eas-cli

# 2. Login to Expo
eas login

# 3. Build for iOS simulator
eas build --profile development --platform ios

# 4. Install the build and run
npx expo start --dev-client
```

**Time**: ~15-30 minutes (first build)
**Pros**: No native folders, cloud builds, shareable
**Cons**: Requires Expo account, internet connection

## Before You Start

### 1. Get a Google Maps API Key (Optional for Testing)

The app will work without a real API key for initial testing, but maps won't display correctly.

For full functionality:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project
3. Enable "Maps SDK for Android" and "Maps SDK for iOS"
4. Create an API key
5. Update `app.json` with your key

See `MAPS_SETUP.md` for detailed instructions.

### 2. Install Dependencies

```bash
cd fitness-tracker-app
npm install
```

## Step-by-Step: Local Prebuild (Recommended)

### For iOS Development

```bash
# 1. Navigate to project
cd fitness-tracker-app

# 2. Install dependencies
npm install

# 3. Prebuild native code
npx expo prebuild --platform ios

# 4. Run on iOS simulator
npx expo run:ios
```

### For Android Development

```bash
# 1. Navigate to project
cd fitness-tracker-app

# 2. Install dependencies
npm install

# 3. Prebuild native code
npx expo prebuild --platform android

# 4. Run on Android emulator
npx expo run:android
```

## What to Expect

After successful setup, you should see:

1. **Activity Tracking Screen** with:
   - Full-screen map (Google Maps on Android, Apple Maps on iOS)
   - GPS signal indicator
   - Activity type selector (Walking/Running)
   - Start button

2. **Map Features**:
   - Current location marker with pulsing animation
   - Map type toggle (standard/satellite/hybrid)
   - Smooth camera movements
   - Route polyline (when tracking)

## Testing the Implementation

Once the app is running:

1. **Grant Location Permissions** when prompted
2. **Select Activity Type** (Walking or Running)
3. **Press Start** to begin tracking
4. **Watch the map**:
   - Current location marker should pulse
   - Map should center on your location
   - Route line should appear as you move
5. **Toggle Map Type** using the button in top-right
6. **Press Stop** to end tracking

## Troubleshooting

### "Command not found: npx"
Install Node.js from [nodejs.org](https://nodejs.org/)

### "No iOS simulator found"
Install Xcode from the Mac App Store

### "No Android emulator found"
Install Android Studio and create an AVD (Android Virtual Device)

### "Maps not showing"
- This is expected without a Google Maps API key
- The map will show but may have a watermark
- See `MAPS_SETUP.md` to configure API key

### "Build failed"
Try cleaning and rebuilding:
```bash
# Clean
rm -rf node_modules ios android
npm install

# Rebuild
npx expo prebuild
npx expo run:ios  # or run:android
```

### "Metro bundler not starting"
Start it manually:
```bash
npx expo start -c
```

## Project Structure

```
fitness-tracker-app/
├── src/
│   ├── components/
│   │   ├── map/
│   │   │   ├── LiveRouteMap.tsx          ✅ Implemented
│   │   │   ├── AnimatedLocationMarker.tsx ✅ Implemented
│   │   │   └── index.ts
│   │   └── activity/
│   │       ├── ActivityTrackingScreen.tsx ✅ Integrated
│   │       └── ...
│   ├── types/
│   │   └── index.ts                      ✅ Type definitions
│   └── constants/
│       └── theme.ts                      ✅ Design system
├── app.json                              ✅ Configured
├── package.json                          ✅ Dependencies
├── eas.json                              ✅ Build config
├── MAPS_SETUP.md                         📖 Maps setup guide
├── SETUP_NATIVE_MODULES.md               📖 Native setup guide
├── TASK_10_IMPLEMENTATION.md             📖 Implementation details
└── QUICK_START.md                        📖 This file
```

## Next Steps After Setup

1. ✅ Verify map displays correctly
2. ✅ Test location tracking
3. ✅ Test map type toggle
4. ✅ Test route rendering
5. 🔄 Configure Google Maps API key (optional)
6. 🔄 Proceed to Task 11: Implement notification service

## Need Help?

- **Expo Documentation**: https://docs.expo.dev/
- **react-native-maps**: https://github.com/react-native-maps/react-native-maps
- **Google Maps Setup**: See `MAPS_SETUP.md`
- **Native Modules**: See `SETUP_NATIVE_MODULES.md`

## Summary

**What's Done**: ✅ Task 10 - Live route mapping is fully implemented

**What's Needed**: ⚠️ Build native code to run the app

**Quickest Path**: Run `npx expo prebuild` then `npx expo run:ios` (or `run:android`)

**Time Required**: ~5-10 minutes for first build
