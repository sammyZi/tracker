# Location Service

High-accuracy GPS tracking service with advanced filtering and smoothing capabilities.

## Features

- **High-Accuracy Tracking**: Uses `BestForNavigation` mode for maximum GPS precision
- **Accuracy Filtering**: Automatically rejects GPS points with accuracy > 20 meters
- **Kalman Filtering**: Smooths GPS jitter while maintaining path accuracy
- **Stationary Detection**: Filters out points when user is not moving (speed < 0.5 m/s)
- **GPS Quality Monitoring**: Real-time signal quality assessment
- **Speed & Heading**: Captures velocity and direction data
- **Permission Management**: Handles foreground and background location permissions

## Usage

```typescript
import locationService from '@/services/location';

// Request permissions
const hasPermission = await locationService.requestPermissions();

if (hasPermission) {
  // Start tracking
  await locationService.startTracking();
  
  // Subscribe to location updates
  const unsubscribe = locationService.onLocationUpdate((location) => {
    console.log('New location:', location);
  });
  
  // Check GPS quality
  const accuracy = locationService.getAccuracyStatus();
  console.log('GPS Quality:', accuracy.quality);
  
  // Pause tracking
  locationService.pauseTracking();
  
  // Resume tracking
  locationService.resumeTracking();
  
  // Stop tracking
  await locationService.stopTracking();
  
  // Cleanup
  unsubscribe();
}
```

## Configuration

The service uses the following default settings:

- **Accuracy Threshold**: 20 meters (points with worse accuracy are rejected)
- **Stationary Speed Threshold**: 0.5 m/s (slower speeds are considered stationary)
- **Time Interval**: 3 seconds between updates
- **Distance Interval**: 5 meters minimum movement
- **Kalman Filter Q**: 3 (process noise)
- **Kalman Filter R**: 10 (measurement noise)

## GPS Quality Levels

- **Excellent**: ≤ 5 meters accuracy (100% signal strength)
- **Good**: ≤ 10 meters accuracy (75% signal strength)
- **Fair**: ≤ 20 meters accuracy (50% signal strength)
- **Poor**: > 20 meters accuracy (25% signal strength)

## Kalman Filter

The service implements a Kalman filter to smooth GPS coordinates while maintaining accuracy:

1. **Prediction Step**: Uses the previous state with added process noise
2. **Update Step**: Combines prediction with new measurement based on their relative uncertainties
3. **Result**: Smoother path with reduced GPS jitter

The filter is particularly effective at:
- Reducing GPS bounce when stationary
- Smoothing zigzag patterns in straight paths
- Maintaining accuracy during turns and direction changes

## Stationary Detection

The service detects when the user is stationary using two methods:

1. **Speed-based**: If GPS provides speed data < 0.5 m/s
2. **Distance-based**: If calculated speed from position changes < 0.5 m/s

Stationary points are filtered out to prevent route pollution.

## Requirements Satisfied

- **2.1**: GPS tracking with location coordinates at regular intervals
- **2.2**: Real-time location data capture during active sessions
- **2.3**: High-accuracy position data for metrics calculation
- **2.4**: Speed and heading data for pace calculation
- **6.1**: Background location tracking capability
- **6.4**: Permission handling for location services
