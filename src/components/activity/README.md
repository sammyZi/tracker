# Activity Components

This directory contains UI components specific to activity tracking functionality.

## Components

### MetricCard
Displays a single metric with label, value, unit, and optional icon. Features:
- Semi-transparent background for overlay on map
- Large, readable numbers using Poppins font
- Icon support for visual identification
- Responsive sizing

**Props:**
- `label`: string - The metric label (e.g., "Time", "Distance")
- `value`: string - The metric value to display
- `unit?`: string - Optional unit (e.g., "km", "min/km")
- `icon?`: ReactNode - Optional icon component

### ActivityTypeSelector
Toggle selector for choosing between walking and running activities. Features:
- Two-option toggle design
- Visual feedback for selected state
- Icons for each activity type
- Smooth transitions

**Props:**
- `selectedType`: ActivityType - Currently selected activity type
- `onTypeChange`: (type: ActivityType) => void - Callback when selection changes

### FloatingActionButton
Large circular button for primary actions. Features:
- Multiple variants (primary, success, error)
- Size options (medium, large)
- Pulsing animation for active tracking
- Press feedback with scale animation
- Shadow elevation

**Props:**
- `icon`: keyof typeof Ionicons.glyphMap - Icon name from Ionicons
- `onPress`: () => void - Press handler
- `variant?`: 'primary' | 'success' | 'error' - Button color variant
- `size?`: 'medium' | 'large' - Button size
- `pulsing?`: boolean - Enable pulsing animation

### GPSSignalIndicator
Displays GPS signal quality and accuracy. Features:
- Visual signal bars (1-4 bars)
- Color-coded quality indicator
- Accuracy display in meters
- Compact design for overlay

**Props:**
- `quality`: AccuracyQuality - GPS signal quality level
- `accuracy?`: number - GPS accuracy in meters

## Usage Example

```tsx
import {
  MetricCard,
  ActivityTypeSelector,
  FloatingActionButton,
  GPSSignalIndicator,
} from '../../components/activity';

// In your component
<MetricCard
  label="Distance"
  value="5.23"
  unit="km"
  icon={<Ionicons name="navigate-outline" size={20} color={Colors.surface} />}
/>

<ActivityTypeSelector
  selectedType={activityType}
  onTypeChange={setActivityType}
/>

<FloatingActionButton
  icon="play"
  onPress={handleStart}
  variant="success"
  size="large"
/>

<GPSSignalIndicator
  quality="good"
  accuracy={15}
/>
```

## Design Guidelines

All components follow the app's design system:
- **Font**: Poppins family
- **Colors**: From theme constants
- **Spacing**: 4px base unit system
- **Border Radius**: 12-20px for modern look
- **Shadows**: Subtle elevation for depth
- **Animations**: Smooth, spring-based transitions

## Requirements Addressed

These components fulfill requirements:
- **2.3**: Real-time metrics display during activity
- **2.5**: Activity pause/resume controls
- **2.7**: Activity type selection (walking/running)
