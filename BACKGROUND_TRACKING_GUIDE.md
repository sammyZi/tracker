# Background Tracking Guide

## Preventing App from Closing in Background

This app uses background location tracking for fitness activities. Android aggressively manages battery by killing background apps. Here's how to prevent that:

## Automatic Setup

The app will automatically:
1. Request battery optimization exemption when you first open it
2. Run location tracking as a foreground service with notification
3. Use a separate process for background tracking

## Manual Steps (If App Still Closes)

### 1. Disable Battery Optimization
- Go to **Settings** → **Apps** → **Fitness Tracker**
- Tap **Battery** → **Battery optimization**
- Select **All apps** from dropdown
- Find **Fitness Tracker** and select **Don't optimize**

### 2. Allow Background Activity
- Go to **Settings** → **Apps** → **Fitness Tracker**
- Tap **Battery**
- Enable **Allow background activity**
- Enable **Unrestricted data usage** (if available)

### 3. Disable Adaptive Battery (Optional)
- Go to **Settings** → **Battery** → **Adaptive Battery**
- Turn it **OFF** (this affects all apps)

### 4. Lock App in Recent Apps
- Open **Recent Apps** (square button)
- Find **Fitness Tracker**
- Tap the app icon at top
- Select **Lock** or **Pin** (prevents Android from closing it)

### 5. Manufacturer-Specific Settings

#### Samsung
- **Settings** → **Apps** → **Fitness Tracker** → **Battery**
- Set to **Unrestricted**
- **Settings** → **Device care** → **Battery** → **Background usage limits**
- Remove app from **Sleeping apps** and **Deep sleeping apps**

#### Xiaomi/MIUI
- **Settings** → **Apps** → **Manage apps** → **Fitness Tracker**
- **Autostart**: Enable
- **Battery saver**: No restrictions
- **Settings** → **Battery & performance** → **App battery saver**
- Find app and set to **No restrictions**

#### Huawei
- **Settings** → **Apps** → **Apps** → **Fitness Tracker**
- **Battery** → **App launch**: Manual, enable all three options
- **Settings** → **Battery** → **App launch**
- Find app and disable **Manage automatically**

#### OnePlus/Oppo
- **Settings** → **Battery** → **Battery optimization**
- Find app and select **Don't optimize**
- **Settings** → **Apps** → **Fitness Tracker** → **Battery**
- Enable **Allow background activity**

#### Vivo
- **Settings** → **Battery** → **Background power consumption management**
- Find app and enable **Allow high background power consumption**

## Verification

To verify background tracking is working:
1. Start a workout
2. Press home button (don't swipe away the app)
3. You should see a persistent notification
4. Wait 2-3 minutes
5. Return to app - distance should have increased

## Troubleshooting

**App still closes after 5-10 minutes:**
- Check if you've completed ALL steps above
- Some manufacturers are very aggressive - try disabling Adaptive Battery
- Make sure location permission is set to "Allow all the time"

**No notification showing:**
- Check notification permissions are enabled
- The notification is required for foreground service

**GPS not accurate:**
- Make sure you're outdoors with clear sky view
- Wait 30-60 seconds for GPS to lock
- Check that "High accuracy" location mode is enabled

## Technical Details

The app uses:
- Foreground service with persistent notification
- Separate background process for location tracking
- Battery optimization exemption request
- Wake locks to prevent CPU sleep during tracking
- Background location permission ("Allow all the time")

These are necessary for accurate fitness tracking and are standard for fitness/navigation apps.
