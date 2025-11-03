# Clear Cache and Restart - Fix RNMapsAirModule Error

## The Issue

You're seeing: `TurboModule Registry.getEnforcing(...): 'RNMapsAirModule' could not be found`

This happens because:
1. The old code with react-native-maps was cached by Metro bundler
2. We've switched to a placeholder component that doesn't need native modules
3. Metro needs to clear its cache and reload

## Solution: Clear Cache and Restart

### Step 1: Stop the Current Server

Press `Ctrl+C` in the terminal where Expo is running to stop the server.

### Step 2: Clear All Caches

Run this command in the `fitness-tracker-app` directory:

```bash
npx expo start -c
```

The `-c` flag clears the Metro bundler cache.

### Step 3: Reload the App

After the server starts:
1. Press `r` in the terminal to reload the app
2. Or shake your device and tap "Reload"

## Alternative: Full Clean

If the above doesn't work, do a complete clean:

```bash
# Stop the server (Ctrl+C)

# Clear watchman cache (if on Mac/Linux)
watchman watch-del-all

# Clear Metro cache
npx expo start -c

# Clear npm cache (if needed)
npm cache clean --force

# Reinstall node_modules (if needed)
rm -rf node_modules
npm install
npx expo start -c
```

## What Changed

We've updated the app to work in Expo Go without native modules:

### Before (Required Native Build)
```typescript
// Used react-native-maps - needs native code
import MapView from 'react-native-maps';
```

### After (Works in Expo Go)
```typescript
// Uses placeholder component - no native code needed
export { LiveRouteMap } from './LiveRouteMapPlaceholder';
```

## What You'll See Now

The app will show:
- ✅ Animated location marker with pulsing effect
- ✅ Current GPS coordinates display
- ✅ GPS accuracy indicator
- ✅ Route statistics (points collected, distance)
- ✅ Map type toggle button
- ✅ All tracking functionality works

Instead of a full map, you'll see a clean UI showing your location data.

## When to Use Full Maps

When you're ready for the full map experience:

1. **Update the import** in `src/components/map/index.ts`:
   ```typescript
   // Change from:
   export { LiveRouteMap } from './LiveRouteMapPlaceholder';
   
   // To:
   export { LiveRouteMap } from './LiveRouteMapFull';
   ```

2. **Build native code**:
   ```bash
   npx expo prebuild
   npx expo run:ios  # or run:android
   ```

3. **Configure Google Maps API key** (see MAPS_SETUP.md)

## Quick Commands Reference

```bash
# Clear cache and start
npx expo start -c

# Reload app (press in terminal)
r

# Clear everything and start fresh
rm -rf node_modules
npm install
npx expo start -c
```

## Still Having Issues?

1. **Make sure you stopped the old server** (Ctrl+C)
2. **Close the Expo Go app completely** and reopen it
3. **Scan the QR code again** to reconnect
4. **Check you're in the right directory**: `cd fitness-tracker-app`
5. **Verify the changes** in `src/components/map/index.ts`

## Expected Behavior After Fix

✅ App loads without errors
✅ Activity tracking screen shows location placeholder
✅ GPS coordinates update in real-time
✅ No "RNMapsAirModule" error
✅ All other features work normally

The full interactive map will be available when you build native code later!
