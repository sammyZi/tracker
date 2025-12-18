# Profile Screen

## Overview
The ProfileScreen displays and allows editing of user profile information stored locally on the device.

## Features

### Profile Display
- **Profile Picture**: Display and edit profile picture from device gallery
- **User Information**: Name, weight, height
- **Stats Summary**: Total activities, distance, and time
- **Profile Details**: Organized view of all profile information

### Profile Editing
- **Modal Editor**: Clean modal interface for editing profile
- **Validation**: Input validation for weight (1-500 kg) and height (1-300 cm)
- **Image Picker**: Select profile picture from device gallery
- **Local Storage**: All data persisted to AsyncStorage

### Stats Display
- **Activity Count**: Total number of completed activities
- **Total Distance**: Formatted based on user's unit preference (km/mi)
- **Total Time**: Total duration across all activities
- **Real-time Updates**: Stats load from storage on screen mount

## Components Used
- `Text`: Custom text component with Poppins font
- `Button`: Primary and outline button variants
- `Card`: Elevated cards for content sections
- `TextInput`: Native input for form fields
- `Modal`: Bottom sheet modal for editing

## Data Flow
1. Load profile from `StorageService.getUserProfile()`
2. Load settings for unit preferences
3. Load statistics from `StorageService.getStatistics('allTime')`
4. Display formatted data
5. Save changes back to AsyncStorage

## Permissions
- **Media Library**: Required for profile picture selection
- Requests permission on first use
- Graceful handling if permission denied

## Styling
- Follows design system with Poppins font
- Uses theme colors and spacing
- Responsive layout with proper padding
- Smooth animations and transitions

## Local Storage Keys
- `@user_profile`: User profile data
- `@user_settings`: User settings (for unit preferences)
- `@activities`: Activity list (for stats calculation)
