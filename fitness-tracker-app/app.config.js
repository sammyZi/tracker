/**
 * Dynamic Expo Configuration
 *
 * Reads sensitive values (API keys) from environment variables so they
 * are never hardcoded in version-controlled files.
 *
 * Usage:
 *   - Development: values come from .env via Expo's built-in support
 *   - CI / EAS:    values come from eas.json `env` or EAS Secrets
 */

const IS_PRODUCTION = process.env.APP_VARIANT === 'production';

export default ({ config }) => {
  const googleMapsApiKey =
    process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  return {
    ...config,
    name: 'Stride',
    slug: 'stride',
    scheme: 'stride',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,

    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#1298E7',
    },

    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.fittracker.app',
      googleServicesFile: './GoogleService-Info.plist',
      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          'We need your location to track your activities',
        NSLocationAlwaysAndWhenInUseUsageDescription:
          'We need your location to track activities in the background',
        NSMotionUsageDescription:
          'We need access to your motion sensors to count steps',
      },
    },

    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#1298E7',
      },
      splash: {
        image: './assets/splash-icon.png',
        resizeMode: 'contain',
        backgroundColor: '#1298E7',
        dark: {
          image: './assets/splash-icon.png',
          resizeMode: 'contain',
          backgroundColor: '#0F172A',
        },
      },
      package: 'com.fittracker.app',
      permissions: [
        'ACCESS_FINE_LOCATION',
        'ACCESS_COARSE_LOCATION',
        'ACCESS_BACKGROUND_LOCATION',
        'ACTIVITY_RECOGNITION',
        'FOREGROUND_SERVICE',
        'FOREGROUND_SERVICE_LOCATION',
        'REQUEST_IGNORE_BATTERY_OPTIMIZATIONS',
      ],
      config: {
        googleMaps: {
          apiKey: googleMapsApiKey,
        },
      },
      googleServicesFile: './google-services.json',
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },

    web: {
      favicon: './assets/favicon.png',
    },

    plugins: [
      [
        'expo-location',
        {
          locationAlwaysAndWhenInUsePermission:
            'Allow Stride to use your location to track your walks and runs.',
        },
      ],
      [
        'expo-notifications',
        {
          icon: './assets/notification-icon.png',
          color: '#ffffff',
        },
      ],
      'expo-web-browser',
    ],

    extra: {
      eas: {
        projectId: process.env.EAS_PROJECT_ID || '',
      },
    },
  };
};
