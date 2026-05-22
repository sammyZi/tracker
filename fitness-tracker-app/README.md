# Stride - Walk & Run GPS Tracker

A React Native mobile application built with Expo for tracking walking and running activities with comprehensive metrics, route mapping, and analytics.

[![Play Store](https://img.shields.io/badge/Google_Play-Coming_Soon-green?logo=google-play)](https://play.google.com/store)

## Features

- 🏃 Real-time activity tracking (walking/running)
- 📍 High-accuracy GPS route mapping with Kalman filter smoothing
- 📊 Comprehensive statistics and analytics
- 🎯 Goal setting and achievement tracking
- 📱 Background tracking with notifications
- 🔐 Email/password and Google OAuth authentication
- ☁️ Cloud sync with Supabase
- 💾 Offline support with automatic sync
- 🔊 Audio coaching with distance announcements
- 📈 Personal records and progress tracking
- 🌙 Dark mode support
- 📳 Haptic feedback

## Tech Stack

- **Framework**: React Native with Expo (SDK 54)
- **Language**: TypeScript
- **Authentication**: Supabase Auth (email/password + Google OAuth)
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Local Storage**: AsyncStorage
- **Maps**: React Native Maps + Google Maps
- **Navigation**: React Navigation
- **State Management**: React Context API
- **Animations**: React Native Reanimated
- **Fonts**: Poppins (Google Fonts)
- **Build**: EAS Build

## Prerequisites

- Node.js (v18 or higher)
- npm
- Expo CLI (`npx expo`)
- Android Studio (for Android development)
- EAS CLI (`npm install -g eas-cli`) — for building releases

## Installation

1. Clone the repository

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Then fill in your API keys in `.env`.

4. Start the development server:
   ```bash
   npm start
   ```

## Building for Production

### Android (Play Store)

1. **Generate release keystore** (first time only):
   ```powershell
   .\scripts\generate-keystore.ps1
   ```

2. **Build AAB for Play Store**:
   ```bash
   npm run build:android
   ```

3. **Submit to Play Store**:
   ```bash
   npm run submit:android
   ```

### Local Build

For a local production build (no EAS account needed):
```bash
npm run build:local
```

### Preview Build (for testing)

```bash
npm run build:preview
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start Expo dev server |
| `npm run android` | Run on Android device/emulator |
| `npm run ios` | Run on iOS simulator (Mac only) |
| `npm test` | Run test suite |
| `npm run typecheck` | TypeScript type checking |
| `npm run build:android` | Build production AAB via EAS |
| `npm run build:preview` | Build preview APK via EAS |
| `npm run build:local` | Build production AAB locally |
| `npm run submit:android` | Submit to Play Store |

## Project Structure

```
fitness-tracker-app/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── common/          # Generic components (ErrorBoundary, etc.)
│   │   ├── activity/        # Activity-specific components
│   │   ├── map/             # Map components
│   │   └── charts/          # Chart components
│   ├── screens/             # Screen components
│   │   ├── auth/            # Authentication screens
│   │   ├── activity/        # Activity tracking screens
│   │   ├── history/         # Activity history screens
│   │   ├── stats/           # Statistics screens
│   │   ├── profile/         # Profile screens
│   │   ├── goals/           # Goals screens
│   │   ├── onboarding/      # Permissions & onboarding
│   │   └── settings/        # Settings screens
│   ├── navigation/          # Navigation configuration
│   ├── services/            # Business logic services
│   │   ├── location/        # GPS tracking & background tasks
│   │   ├── storage/         # Local & cloud storage
│   │   ├── sync/            # Cloud sync engine
│   │   ├── auth/            # Authentication service
│   │   └── notification/    # Push notifications
│   ├── hooks/               # Custom React hooks
│   ├── context/             # React Context providers
│   ├── utils/               # Utility functions
│   ├── constants/           # App constants and theme
│   ├── types/               # TypeScript definitions
│   └── config/              # Configuration files
├── android/                 # Native Android project
├── assets/                  # Images, icons
├── store/                   # Play Store listing content
├── app.config.js            # Dynamic Expo configuration
└── eas.json                 # EAS Build configuration
```

## Configuration

### Environment Variables

Create a `.env` file with:
```
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
EXPO_PUBLIC_SUPABASE_URL=your-supabase-project-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Google Maps Setup

1. Get a Google Maps API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Maps SDK for Android and iOS
3. **For production**: Restrict the API key to your app's package name and SHA-1 fingerprint
4. Add the API key to `.env`

### Supabase Setup

1. Create a project at [Supabase](https://supabase.com/)
2. Copy the project URL and anon key to `.env`
3. Run the database migrations from `supabase/migrations/`

## Permissions

### Android
- Fine Location — real-time GPS tracking
- Coarse Location — approximate positioning
- Background Location — track with screen off
- Activity Recognition — step counting
- Foreground Service — background tracking notifications

## Design Guidelines

- **Primary Font**: Poppins
- **Primary Color**: #6C63FF (Vibrant Purple)
- **Spacing System**: 4px base unit
- **Border Radius**: 12-20px for cards and buttons
- **Dark Mode**: Full support with automatic switching

## Privacy & Security

- See [PRIVACY_POLICY.md](./PRIVACY_POLICY.md) for the full privacy policy
- See [DATA_SAFETY.md](./DATA_SAFETY.md) for Play Store data safety information
- API keys are loaded from environment variables, never hardcoded
- Console logs are stripped from production builds
- Network traffic is HTTPS-only in production

## License

MIT

## Contributing

Contributions are welcome! Please read the contributing guidelines before submitting PRs.
