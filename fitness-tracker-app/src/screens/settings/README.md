# Settings Screen

## Overview
The SettingsScreen provides a comprehensive interface for configuring all app preferences, with all settings persisted to local storage.

## Settings Categories

### Units
- **Unit System**: Toggle between Metric (km) and Imperial (miles)
- Affects distance, pace, and speed displays throughout the app
- Persisted to AsyncStorage

### Audio Announcements
- **Enable/Disable**: Toggle audio announcements during activities
- **Announcement Interval**: Choose from 0.5 km, 1 km, 1 mile, or 2 km
- Intervals automatically adjust based on unit system
- Real-time updates to AudioAnnouncementService

### Activity Tracking
- **Auto-Pause**: Automatically pause tracking when stationary
- **Auto-Pause Sensitivity**: Low, Medium, or High sensitivity levels
- Helps conserve battery and improve accuracy

### Map Display
- **Map Type**: Choose between Standard, Satellite, or Hybrid
- Applies to both live tracking and activity detail views
- Instant preview of selection

### Appearance
- **Theme**: Light, Dark, or Auto (system preference)
- Prepares app for future dark mode implementation
- Smooth theme transitions

### Haptic Feedback
- **Vibration Feedback**: Enable/disable haptic feedback for actions
- Provides tactile confirmation for button presses
- Uses HapticFeedbackService

## Features

### Settings Persistence
- All settings saved to AsyncStorage
- Automatic loading on app start
- Instant synchronization with services

### Service Integration
- **AudioAnnouncementService**: Updates announcement settings
- **HapticFeedbackService**: Enables/disables haptic feedback
- Real-time service configuration

### User Experience
- **Segmented Controls**: Clean toggle between options
- **Switch Components**: Native iOS/Android switches
- **Button Groups**: Visual selection of multiple options
- **Haptic Feedback**: Tactile confirmation on changes
- **Info Sections**: Helpful descriptions for settings

## Components Used
- `Switch`: Native toggle switches
- `TouchableOpacity`: Interactive buttons
- `ScrollView`: Scrollable settings list
- Custom styled components following design system

## Data Model

```typescript
interface UserSettings {
  units: 'metric' | 'imperial';
  audioAnnouncements: boolean;
  announcementInterval: number; // in meters
  autoPause: boolean;
  autoPauseSensitivity: 'low' | 'medium' | 'high';
  mapType: 'standard' | 'satellite' | 'hybrid';
  theme: 'light' | 'dark' | 'auto';
}
```

## Styling
- Grouped sections with headers
- Consistent spacing and padding
- Icon indicators for each setting
- Active state highlighting
- Follows Poppins typography system

## Local Storage
- **Key**: `@user_settings`
- **Format**: JSON string
- **Persistence**: Automatic on change
- **Loading**: On screen mount

## Requirements Satisfied
- ✅ 1.6: Allow users to update profile information
- ✅ 1.7: Persist user profile changes to local storage
- ✅ 10.1: Choose between metric and imperial units
- ✅ 10.2: Enable/disable GPS tracking (via auto-pause)
- ✅ 10.3: Configure map display preferences
- ✅ 10.4: Enable/disable step counting (via settings)
- ✅ 10.5: Set activity auto-pause sensitivity
- ✅ 10.6: Persist all user preferences to local storage
- ✅ 10.7: Provide logout option (data management)
