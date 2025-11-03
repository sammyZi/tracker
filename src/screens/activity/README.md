# Activity Tracking Screen

## Overview

The ActivityTrackingScreen is the main screen for tracking walking and running activities. It provides a full-screen map view with overlaid metrics and controls.

## Features

### Full-Screen Map
- Uses React Native Maps with Google Maps provider
- Shows user's current location
- Displays route as a colored polyline
- Auto-follows user location during tracking
- Semi-transparent gradient overlay for better text readability

### GPS Signal Indicator
- Positioned at top-right of screen
- Shows real-time GPS quality (excellent/good/fair/poor)
- Displays accuracy in meters
- Visual signal bars for quick reference

### Metric Display Cards
- Large, easy-to-read metrics with Poppins font
- Semi-transparent background for visibility over map
- Four key metrics displayed:
  - **Time**: Elapsed duration (HH:MM:SS)
  - **Distance**: Total distance covered (km/miles)
  - **Pace**: Current pace (min/km or min/mile)
  - **Steps**: Step count from pedometer
- Icons for visual identification
- Only visible during active tracking

### Activity Type Selector
- Toggle between Walking and Running
- Visible before starting activity
- Affects route color and calorie calculations

### Floating Action Buttons
- **Start Button**: Large green button with play icon
- **Pause/Resume Button**: Medium purple button
- **Stop Button**: Large red button with pulsing animation
- Smooth press animations with scale feedback
- Clear visual hierarchy

### UI States

1. **Idle State** (Not Tracking)
   - Activity type selector visible
   - Single start button
   - No metrics displayed

2. **Active State** (Tracking)
   - Metrics cards visible
   - Pause and Stop buttons
   - Pulsing animation on stop button
   - GPS indicator active

3. **Paused State**
   - Metrics frozen
   - Resume and Stop buttons
   - No pulsing animation

## Layout Structure

```
┌─────────────────────────────────────┐
│  GPS Indicator              [Top]   │
│                                     │
│                                     │
│  ┌─────────┐    ┌─────────┐       │
│  │  Time   │    │Distance │ [Mid] │
│  └─────────┘    └─────────┘       │
│  ┌─────────┐    ┌─────────┐       │
│  │  Pace   │    │  Steps  │       │
│  └─────────┘    └─────────┘       │
│                                     │
│                                     │
│  ┌─────────────────────────┐       │
│  │  Activity Type Selector │       │
│  └─────────────────────────┘       │
│           (  ●  )           [Bot]  │
│        Start Button                │
└─────────────────────────────────────┘
```

## Design Specifications

### Colors
- **Running**: Mint Green (#00D9A3)
- **Walking**: Amber (#FFB800)
- **Overlay**: Semi-transparent black (rgba(0,0,0,0.4))
- **Gradient**: Subtle dark overlay (rgba(0,0,0,0.1))

### Typography
- **Metric Values**: 56px, Poppins SemiBold
- **Metric Labels**: 12px, Poppins Regular, uppercase
- **Units**: 16px, Poppins Regular

### Spacing
- Screen padding: 16-24px
- Metric card gap: 12px
- Bottom controls spacing: 24px

### Animations
- Button press: Scale to 0.9-0.95
- Pulsing indicator: Scale 1.0 to 1.1 (1s cycle)
- Smooth spring animations for all interactions

## Requirements Addressed

This screen fulfills the following requirements:

- **2.3**: Display real-time metrics (time, distance, pace, steps)
- **2.5**: Provide pause and resume functionality
- **2.7**: Capture and display activity type (walking/running)

## Integration Points

The screen is designed to integrate with:
- **LocationService**: For GPS tracking and route data
- **ActivityService**: For activity state management
- **StepCounterService**: For step counting
- **CalculationService**: For pace and distance calculations

## Future Enhancements

- Connect to actual location tracking service
- Implement real-time metric updates
- Add route polyline rendering from GPS data
- Integrate step counter
- Add audio announcements
- Implement auto-pause detection
- Add haptic feedback
- Save activity on completion

## Usage

```tsx
import { ActivityTrackingScreen } from './src/screens';

// In your navigation or App.tsx
<ActivityTrackingScreen />
```

## Testing

To test the UI:
1. Run the app with `npm start`
2. Click "View Activity Tracking Screen" button
3. Verify all UI elements are visible and styled correctly
4. Test button interactions (start, pause, stop)
5. Test activity type selector
6. Verify responsive layout on different screen sizes
