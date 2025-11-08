# Map Components

Live route mapping components for real-time activity tracking visualization.

## Components

### LiveRouteMap

Full-featured map component for displaying live activity tracking with route visualization.

**Features:**
- Real-time location display with animated marker
- Smooth polyline rendering with anti-aliasing
- Pace-based route coloring (gradient visualization)
- Auto-centering with smooth camera transitions
- Start/end markers with custom icons
- Map type controls (standard, satellite, hybrid)
- Accuracy circle around current location

**Props:**
```typescript
interface LiveRouteMapProps {
  currentLocation: RoutePoint | null;      // Current GPS location
  routePoints: RoutePoint[];               // Array of route points
  activityType: ActivityType;              // 'running' or 'walking'
  isTracking: boolean;                     // Whether tracking is active
  mapType?: MapType;                       // Map display type
  onMapTypeChange?: (mapType: MapType) => void;
  showAccuracyCircle?: boolean;            // Show GPS accuracy circle
  autoCenterEnabled?: boolean;             // Auto-center on location
}
```

**Usage:**
```tsx
import { LiveRouteMap } from '@/components/map';

<LiveRouteMap
  currentLocation={currentLocation}
  routePoints={routePoints}
  activityType="running"
  isTracking={true}
  mapType="standard"
  onMapTypeChange={setMapType}
  showAccuracyCircle={true}
  autoCenterEnabled={true}
/>
```

**Pace-Based Coloring:**
The route is colored based on pace performance:
- Green: Excellent pace
- Teal: Good pace
- Yellow: Moderate pace
- Orange: Slow pace
- Red: Very slow pace

Thresholds automatically adjust based on activity type (running vs walking).

### AnimatedLocationMarker

Animated marker component with pulsing effect for current location.

**Props:**
```typescript
interface AnimatedLocationMarkerProps {
  size?: number;        // Marker size (default: 40)
  color?: string;       // Marker color (default: primary)
}
```

**Usage:**
```tsx
import { AnimatedLocationMarker } from '@/components/map';

<Marker coordinate={location}>
  <AnimatedLocationMarker size={40} color="#6C63FF" />
</Marker>
```

## Map Type Controls

The LiveRouteMap includes a built-in map type toggle button that cycles through:
1. Standard - Default map view
2. Satellite - Satellite imagery
3. Hybrid - Satellite with labels

## Auto-Centering

When `autoCenterEnabled` is true and tracking is active:
- Map smoothly follows current location
- Camera transitions are animated (1 second duration)
- Maintains consistent zoom level (0.005 delta)

When tracking stops:
- Map automatically fits to show entire route
- Includes padding for better visualization

## GPS Accuracy Visualization

When `showAccuracyCircle` is true:
- Semi-transparent circle shows GPS accuracy radius
- Circle size matches reported accuracy in meters
- Helps users understand location precision

## Requirements Satisfied

This implementation satisfies the following requirements:
- **3.1**: Real-time location display with animated marker
- **3.2**: Smooth polyline rendering with pace-based coloring
- **3.4**: Auto-centering with smooth camera transitions
- **3.5**: Start/end markers with custom icons
- **3.6**: Map type controls and accuracy visualization

## Configuration

### Google Maps API Key

The app requires a Google Maps API Key configured in `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "react-native-maps",
        {
          "googleMapsApiKey": "YOUR_GOOGLE_MAPS_API_KEY"
        }
      ]
    ],
    "ios": {
      "config": {
        "googleMapsApiKey": "YOUR_GOOGLE_MAPS_API_KEY"
      }
    }
  }
}
```

### Rebuilding Native Code

After adding the react-native-maps plugin, rebuild the app:

```bash
# For development builds
npx expo prebuild
npx expo run:ios
npx expo run:android

# Or use EAS Build for production
eas build --platform all
```

## Performance Considerations

- Route segments are recalculated only when route points change
- Map animations use native drivers for smooth performance
- Polyline rendering uses anti-aliasing for smooth curves
- Auto-centering throttled to prevent excessive updates

## Future Enhancements

Potential improvements:
- Offline map caching
- Custom map styles/themes
- 3D terrain visualization
- Route elevation profile overlay
- Heatmap visualization for frequently traveled routes
