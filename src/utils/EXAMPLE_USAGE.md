# Calculation Utilities - Example Usage

This file demonstrates how to use the calculation and formatting utilities in the Fitness Tracker App.

## Basic Distance Calculation

```typescript
import { calculateDistance, formatDistance } from '@/utils';

// Calculate distance between two GPS points
const startLat = 40.7128;
const startLon = -74.0060;
const endLat = 40.7589;
const endLon = -73.9851;

const distanceInMeters = calculateDistance(startLat, startLon, endLat, endLon);
console.log(`Distance: ${distanceInMeters} meters`);

// Format for display
console.log(formatDistance(distanceInMeters, 'metric')); // "5.23 km"
console.log(formatDistance(distanceInMeters, 'imperial')); // "3.25 mi"
```

## Route Distance Calculation

```typescript
import { calculateRouteDistance, formatDistance } from '@/utils';

const route = [
  { latitude: 40.7128, longitude: -74.0060, timestamp: Date.now(), accuracy: 10 },
  { latitude: 40.7200, longitude: -74.0050, timestamp: Date.now(), accuracy: 8 },
  { latitude: 40.7300, longitude: -74.0040, timestamp: Date.now(), accuracy: 12 },
  { latitude: 40.7589, longitude: -73.9851, timestamp: Date.now(), accuracy: 9 },
];

const totalDistance = calculateRouteDistance(route);
console.log(formatDistance(totalDistance, 'metric')); // Total distance in km
```

## Pace Calculation

```typescript
import { calculatePace, formatPace } from '@/utils';

// User ran 5km in 25 minutes (1500 seconds)
const distance = 5000; // meters
const duration = 1500; // seconds

const paceInSecondsPerKm = calculatePace(distance, duration);
console.log(`Pace: ${paceInSecondsPerKm} seconds per km`);

// Format for display
console.log(formatPace(paceInSecondsPerKm, 'metric')); // "5:00 /km"
console.log(formatPace(paceInSecondsPerKm, 'imperial')); // "8:03 /mi"
```

## Calorie Calculation

```typescript
import { calculateCalories, calculateCaloriesWithPace } from '@/utils';

const distance = 5000; // 5km in meters
const duration = 1800; // 30 minutes in seconds
const userWeight = 70; // kg
const activityType = 'running';

// Basic calorie calculation
const basicCalories = calculateCalories(distance, duration, userWeight, activityType);
console.log(`Calories burned: ${basicCalories}`);

// More accurate calculation with pace adjustment
const accurateCalories = calculateCaloriesWithPace(distance, duration, userWeight, activityType);
console.log(`Calories burned (pace-adjusted): ${accurateCalories}`);
```

## Real-time Activity Tracking Example

```typescript
import {
  calculateRouteDistance,
  calculatePace,
  calculateCaloriesWithPace,
  formatDistance,
  formatPace,
  formatDuration,
  formatCalories,
} from '@/utils';

// Simulating an active tracking session
const activityData = {
  route: [
    { latitude: 40.7128, longitude: -74.0060, timestamp: Date.now() - 600000, accuracy: 10 },
    { latitude: 40.7200, longitude: -74.0050, timestamp: Date.now() - 300000, accuracy: 8 },
    { latitude: 40.7300, longitude: -74.0040, timestamp: Date.now(), accuracy: 12 },
  ],
  startTime: Date.now() - 600000, // Started 10 minutes ago
  userWeight: 75, // kg
  activityType: 'running' as const,
};

// Calculate metrics
const distance = calculateRouteDistance(activityData.route);
const duration = (Date.now() - activityData.startTime) / 1000; // seconds
const pace = calculatePace(distance, duration);
const calories = calculateCaloriesWithPace(
  distance,
  duration,
  activityData.userWeight,
  activityData.activityType
);

// Display formatted metrics
console.log('=== Activity Metrics ===');
console.log(`Distance: ${formatDistance(distance, 'metric')}`);
console.log(`Duration: ${formatDuration(duration)}`);
console.log(`Pace: ${formatPace(pace, 'metric')}`);
console.log(`Calories: ${formatCalories(calories)}`);
```

## Unit Conversion Examples

```typescript
import {
  metersToKilometers,
  metersToMiles,
  kilogramsToPounds,
  centimetersToFeetInches,
} from '@/utils';

// Distance conversions
console.log(`5000m = ${metersToKilometers(5000)} km`); // 5 km
console.log(`5000m = ${metersToMiles(5000)} miles`); // 3.107 miles

// Weight conversion
console.log(`70kg = ${kilogramsToPounds(70)} lbs`); // 154.32 lbs

// Height conversion
const height = centimetersToFeetInches(175);
console.log(`175cm = ${height.feet}'${height.inches}"`); // 5'9"
```

## Duration Formatting Examples

```typescript
import { formatDuration, formatDurationHuman } from '@/utils';

const duration = 3665; // 1 hour, 1 minute, 5 seconds

console.log(formatDuration(duration)); // "1:01:05"
console.log(formatDuration(duration, true)); // "1:01:05" (always show hours)
console.log(formatDurationHuman(duration)); // "1h 1m 5s"

// Shorter durations
console.log(formatDuration(125)); // "2:05"
console.log(formatDurationHuman(125)); // "2m 5s"
```

## Activity Summary Display

```typescript
import {
  formatDistance,
  formatPace,
  formatDuration,
  formatCalories,
  formatSteps,
  formatDateTime,
} from '@/utils';

const activity = {
  distance: 8450, // meters
  duration: 2700, // seconds (45 minutes)
  pace: 319.5, // seconds per km
  calories: 425,
  steps: 10234,
  startTime: Date.now() - 2700000,
};

console.log('=== Activity Summary ===');
console.log(`Date: ${formatDateTime(activity.startTime)}`);
console.log(`Distance: ${formatDistance(activity.distance, 'metric')}`);
console.log(`Duration: ${formatDuration(activity.duration)}`);
console.log(`Pace: ${formatPace(activity.pace, 'metric')}`);
console.log(`Calories: ${formatCalories(activity.calories)}`);
console.log(`Steps: ${formatSteps(activity.steps)}`);

// Output:
// === Activity Summary ===
// Date: Oct 30, 2025 at 2:30 PM
// Distance: 8.45 km
// Duration: 45:00
// Pace: 5:20 /km
// Calories: 425 cal
// Steps: 10,234 steps
```

## Integration with Activity Service

```typescript
import { ActivityService } from '@/services/activity';
import {
  calculateRouteDistance,
  calculatePace,
  calculateCaloriesWithPace,
  formatDistance,
  formatPace,
} from '@/utils';

// Example: Calculate metrics for current activity
function getActivityMetrics(activity: any, userWeight: number) {
  const distance = calculateRouteDistance(activity.route);
  const duration = (Date.now() - activity.startTime) / 1000;
  const pace = calculatePace(distance, duration);
  const calories = calculateCaloriesWithPace(
    distance,
    duration,
    userWeight,
    activity.type
  );

  return {
    distance,
    duration,
    pace,
    calories,
    // Formatted for display
    formatted: {
      distance: formatDistance(distance, 'metric'),
      pace: formatPace(pace, 'metric'),
    },
  };
}
```

## Testing Different Activity Types

```typescript
import { calculateCaloriesWithPace } from '@/utils';

// Walking 5km in 50 minutes
const walkingCalories = calculateCaloriesWithPace(
  5000,  // 5km
  3000,  // 50 minutes
  70,    // 70kg
  'walking'
);
console.log(`Walking calories: ${walkingCalories}`);

// Running 5km in 25 minutes
const runningCalories = calculateCaloriesWithPace(
  5000,  // 5km
  1500,  // 25 minutes
  70,    // 70kg
  'running'
);
console.log(`Running calories: ${runningCalories}`);

// Running burns significantly more calories due to higher intensity
```
