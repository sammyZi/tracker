# Utility Functions

This directory contains utility functions for the Fitness Tracker App.

## Calculations (`calculations.ts`)

Core calculation functions for fitness tracking metrics.

### Distance Calculations

- **`calculateDistance(lat1, lon1, lat2, lon2)`** - Calculate distance between two coordinates using Haversine formula (returns meters)
- **`calculateRouteDistance(route)`** - Calculate total distance from an array of route points (returns meters)

### Pace Calculations

- **`calculatePace(distance, duration)`** - Calculate pace in seconds per kilometer
- **`calculatePacePerMile(distance, duration)`** - Calculate pace in seconds per mile
- **`calculateSpeed(distance, duration)`** - Calculate speed in km/h

### Calorie Calculations

- **`calculateCalories(distance, duration, weight, activityType)`** - Basic calorie estimation using MET values
- **`calculateCaloriesWithPace(distance, duration, weight, activityType)`** - More accurate calorie estimation that adjusts for pace/intensity

**MET Values Used:**
- Walking: 2.5-7.0 METs (based on speed)
- Running: 8.0-13.5 METs (based on speed)

### Unit Conversions

**Distance:**
- `metersToKilometers(meters)` / `kilometersToMeters(km)`
- `metersToMiles(meters)` / `milesToMeters(miles)`
- `kilometersToMiles(km)` / `milesToKilometers(miles)`

**Weight:**
- `kilogramsToPounds(kg)` / `poundsToKilograms(lbs)`

**Height:**
- `centimetersToFeetInches(cm)` - Returns `{ feet, inches }`
- `feetInchesToCentimeters(feet, inches)`

**Speed:**
- `metersPerSecondToKmPerHour(mps)`
- `metersPerSecondToMilesPerHour(mps)`

## Formatting (`formatting.ts`)

Functions for formatting values for display in the UI.

### Distance Formatting

- **`formatDistance(meters, units, decimals)`** - Format distance with unit (e.g., "5.23 km" or "3.25 mi")
- **`formatDistanceValue(meters, units, decimals)`** - Format distance value only (without unit)
- **`getDistanceUnit(units)`** - Get distance unit label ("km" or "mi")

### Pace Formatting

- **`formatPace(secondsPerKm, units)`** - Format pace with unit (e.g., "5:30 /km" or "8:52 /mi")
- **`formatPaceValue(secondsPerKm, units)`** - Format pace value only (e.g., "5:30")
- **`getPaceUnit(units)`** - Get pace unit label ("/km" or "/mi")

### Duration Formatting

- **`formatDuration(seconds, alwaysShowHours)`** - Format as HH:MM:SS or MM:SS (e.g., "1:23:45" or "23:45")
- **`formatDurationHuman(seconds)`** - Human-readable format (e.g., "1h 23m 45s")
- **`getDurationComponents(seconds)`** - Get duration as `{ hours, minutes, seconds }`

### Other Formatting

- **`formatSpeed(metersPerSecond, units)`** - Format speed (e.g., "10.5 km/h" or "6.5 mph")
- **`formatCalories(calories)`** - Format calories (e.g., "245 cal")
- **`formatSteps(steps)`** - Format steps with thousands separator (e.g., "5,432 steps")
- **`formatWeight(kg, units)`** - Format weight (e.g., "70.5 kg" or "155.4 lbs")
- **`formatHeight(cm, units)`** - Format height (e.g., "175 cm" or "5'9\"")

### Date/Time Formatting

- **`formatDate(timestamp, format)`** - Format date ('short', 'long', or 'time')
- **`formatDateTime(timestamp)`** - Format date and time (e.g., "Jan 15, 2024 at 2:30 PM")
- **`formatRelativeTime(timestamp)`** - Relative time (e.g., "2 hours ago", "yesterday")

## Usage Examples

```typescript
import {
  calculateDistance,
  calculateRouteDistance,
  calculatePace,
  calculateCalories,
  formatDistance,
  formatPace,
  formatDuration,
} from '@/utils';

// Calculate distance between two points
const distance = calculateDistance(40.7128, -74.0060, 40.7589, -73.9851);
console.log(distance); // Distance in meters

// Calculate total route distance
const route = [
  { latitude: 40.7128, longitude: -74.0060, timestamp: Date.now(), accuracy: 10 },
  { latitude: 40.7589, longitude: -73.9851, timestamp: Date.now(), accuracy: 10 },
];
const totalDistance = calculateRouteDistance(route);

// Calculate pace
const pace = calculatePace(5000, 1500); // 5km in 25 minutes
console.log(formatPace(pace, 'metric')); // "5:00 /km"

// Calculate calories
const calories = calculateCalories(5000, 1500, 70, 'running');
console.log(calories); // Estimated calories burned

// Format distance
console.log(formatDistance(5234, 'metric')); // "5.23 km"
console.log(formatDistance(5234, 'imperial')); // "3.25 mi"

// Format duration
console.log(formatDuration(3665)); // "1:01:05"
console.log(formatDurationHuman(3665)); // "1h 1m 5s"
```

## Requirements Coverage

These utilities fulfill the following requirements:

- **Requirement 2.3**: Real-time metrics calculation (distance, pace)
- **Requirement 2.4**: Pace calculation in min/km or min/mile
- **Requirement 2.8**: Activity metrics including distance and pace
- **Requirement 10.1**: Unit preferences (metric/imperial)
- **Requirement 12.1**: Calorie estimation calculation
- **Requirement 12.2**: Calorie calculation using weight, distance, duration, and activity type
