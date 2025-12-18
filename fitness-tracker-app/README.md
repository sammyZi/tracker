# Fitness Tracker App

A React Native mobile application built with Expo for tracking walking and running activities with comprehensive metrics, route mapping, and analytics.

## Features

- 🏃 Real-time activity tracking (walking/running)
- 📍 High-accuracy GPS route mapping
- 📊 Comprehensive statistics and analytics
- 🎯 Goal setting and achievement tracking
- 📱 Background tracking with notifications
- 💾 All data stored locally on device (privacy-focused)
- 📤 Data export for backups
- 📈 Personal records and progress tracking

## Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Storage**: AsyncStorage (Local Device Storage)
- **Maps**: React Native Maps
- **Navigation**: React Navigation
- **State Management**: React Context API
- **Fonts**: Poppins (Google Fonts)

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (Mac) or Android Emulator

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. (Optional) Create a `.env` file based on `.env.example` and add your Google Maps API key for enhanced map features

4. Start the development server:
   ```bash
   npm start
   ```

## Project Structure

```
fitness-tracker-app/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── common/          # Generic components
│   │   ├── activity/        # Activity-specific components
│   │   ├── map/             # Map components
│   │   └── charts/          # Chart components
│   ├── screens/             # Screen components
│   │   ├── auth/            # Authentication screens
│   │   ├── activity/        # Activity tracking screens
│   │   ├── history/         # Activity history screens
│   │   ├── stats/           # Statistics screens
│   │   ├── profile/         # Profile screens
│   │   └── settings/        # Settings screens
│   ├── navigation/          # Navigation configuration
│   ├── services/            # Business logic services
│   │   ├── location/        # Location tracking
│   │   ├── activity/        # Activity management
│   │   └── storage/         # Local storage (AsyncStorage)
│   ├── hooks/               # Custom React hooks
│   ├── context/             # React Context providers
│   ├── utils/               # Utility functions
│   ├── constants/           # App constants and theme
│   ├── types/               # TypeScript definitions
│   └── config/              # Configuration files
├── assets/                  # Images, fonts, icons
└── app.json                 # Expo configuration
```

## Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Run on Android emulator/device
- `npm run ios` - Run on iOS simulator/device (Mac only)
- `npm run web` - Run in web browser

## Configuration

### Google Maps Setup (Optional)

1. Get a Google Maps API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Maps SDK for Android and iOS
3. Add the API key to `.env`

## Permissions

The app requires the following permissions:

### iOS
- Location (When In Use and Always)
- Motion & Fitness

### Android
- Fine Location
- Coarse Location
- Background Location
- Activity Recognition
- Foreground Service

## Design Guidelines

The app follows a modern, clean design with:
- **Primary Font**: Poppins
- **Primary Color**: #6C63FF (Vibrant Purple)
- **Spacing System**: 4px base unit
- **Border Radius**: 12-20px for cards and buttons

See the design document for complete guidelines.

## License

MIT

## Contributing

Contributions are welcome! Please read the contributing guidelines before submitting PRs.
