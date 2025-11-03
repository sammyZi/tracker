# Google Maps Setup Guide

This guide explains how to configure Google Maps for the Fitness Tracker app.

## Prerequisites

- Google Cloud Platform account
- Expo account (for EAS Build)

## Step 1: Get Google Maps API Key

### For Android

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps SDK for Android
   - Maps SDK for iOS (if building for iOS)
4. Go to **Credentials** → **Create Credentials** → **API Key**
5. Copy the API key
6. (Recommended) Restrict the API key:
   - Click on the API key to edit
   - Under "Application restrictions", select "Android apps"
   - Add your app's package name: `com.yourcompany.fitnesstracker`
   - Add your SHA-1 certificate fingerprint

### For iOS

1. In the same Google Cloud project
2. Enable **Maps SDK for iOS**
3. Create an API key (or use the same one)
4. (Recommended) Restrict the API key:
   - Under "Application restrictions", select "iOS apps"
   - Add your app's bundle identifier: `com.yourcompany.fitnesstracker`

## Step 2: Configure app.json

The `app.json` file has been pre-configured with placeholders. Replace `YOUR_GOOGLE_MAPS_API_KEY` with your actual API key:

```json
{
  "expo": {
    "plugins": [
      [
        "react-native-maps",
        {
          "googleMapsApiKey": "YOUR_ACTUAL_API_KEY_HERE"
        }
      ]
    ],
    "ios": {
      "config": {
        "googleMapsApiKey": "YOUR_ACTUAL_API_KEY_HERE"
      }
    }
  }
}
```

**Important:** Never commit your actual API key to version control. Use environment variables instead:

### Using Environment Variables (Recommended)

1. Create a `.env` file (already in `.gitignore`):
```
GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

2. Update `app.json` to use the environment variable:
```json
{
  "expo": {
    "plugins": [
      [
        "react-native-maps",
        {
          "googleMapsApiKey": "${GOOGLE_MAPS_API_KEY}"
        }
      ]
    ]
  }
}
```

3. For EAS Build, add the secret:
```bash
eas secret:create --scope project --name GOOGLE_MAPS_API_KEY --value your_actual_api_key_here
```

## Step 3: Rebuild the App

After configuring the API key, you need to rebuild the native code:

### Development Build

```bash
# Install dependencies
npm install

# Prebuild native code
npx expo prebuild

# Run on iOS
npx expo run:ios

# Run on Android
npx expo run:android
```

### Production Build with EAS

```bash
# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Build for both
eas build --platform all
```

## Step 4: Verify Setup

1. Start the app
2. Navigate to the Activity Tracking screen
3. You should see a map with your current location
4. If you see a blank map or error, check:
   - API key is correct
   - Required APIs are enabled in Google Cloud Console
   - App has been rebuilt after configuration

## Troubleshooting

### "TurboModule Registry.getEnforcing(...): 'RNMapsAirModule' could not be found"

This error means the native modules haven't been built. Solutions:
1. Run `npx expo prebuild` to generate native code
2. Rebuild the app with `npx expo run:ios` or `npx expo run:android`
3. Clear cache: `npx expo start -c`

### Blank Map on Android

1. Verify the API key is correct in `app.json`
2. Ensure "Maps SDK for Android" is enabled
3. Check that your app's package name matches the restriction
4. Rebuild the app

### Blank Map on iOS

1. Verify the API key is correct in `app.json` under `ios.config`
2. Ensure "Maps SDK for iOS" is enabled
3. Check that your bundle identifier matches the restriction
4. Rebuild the app

### Map Shows "For development purposes only" watermark

This means:
- You're using an unrestricted API key (okay for development)
- Or billing is not enabled on your Google Cloud project
- Enable billing in Google Cloud Console for production use

## Cost Considerations

Google Maps Platform has a free tier:
- $200 free credit per month
- Maps SDK for Android/iOS: $7 per 1,000 loads
- Most small to medium apps stay within free tier

Monitor usage in Google Cloud Console.

## Alternative: Apple Maps (iOS only)

For iOS-only apps, you can use Apple Maps without an API key:

In `LiveRouteMap.tsx`, change:
```typescript
provider={PROVIDER_GOOGLE}
```
to:
```typescript
provider={undefined} // Uses Apple Maps on iOS
```

Note: This won't work on Android.

## Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for sensitive data
3. **Restrict API keys** to your app's package/bundle ID
4. **Enable billing alerts** in Google Cloud Console
5. **Rotate keys** if accidentally exposed
6. **Use separate keys** for development and production

## Additional Resources

- [Google Maps Platform Documentation](https://developers.google.com/maps/documentation)
- [react-native-maps Documentation](https://github.com/react-native-maps/react-native-maps)
- [Expo Maps Documentation](https://docs.expo.dev/versions/latest/sdk/map-view/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
