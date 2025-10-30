/**
 * Background Location Task
 * 
 * Handles location tracking when the app is in the background or screen is off.
 * Uses expo-task-manager for background execution with high accuracy settings.
 * 
 * Features:
 * - High-accuracy GPS tracking in background
 * - Accuracy filtering (rejects points > 20m)
 * - Kalman filter for path smoothing
 * - Foreground service for Android
 * - Persistent notification with metrics
 */

import * as TaskManager from 'expo-task-manager';
import * as ExpoLocation from 'expo-location';
import { Location } from '@/types';

// Task name constant
export const BACKGROUND_LOCATION_TASK = 'background-location-task';

// Configuration constants
const ACCURACY_THRESHOLD = 20; // meters
const STATIONARY_SPEED_THRESHOLD = 0.5; // m/s
const MIN_DISTANCE_BETWEEN_POINTS = 5; // meters
const KALMAN_Q = 3; // Process noise
const KALMAN_R = 10; // Measurement noise

// Kalman filter state (persisted across task executions)
interface KalmanState {
  latitude: number;
  longitude: number;
  variance: number;
}

let kalmanState: KalmanState | null = null;
let lastLocation: Location | null = null;

// Callback for location updates (set by the service)
let locationUpdateCallback: ((location: Location) => void) | null = null;

/**
 * Set the callback for location updates
 */
export function setBackgroundLocationCallback(callback: (location: Location) => void): void {
  locationUpdateCallback = callback;
}

/**
 * Clear the callback
 */
export function clearBackgroundLocationCallback(): void {
  locationUpdateCallback = null;
}

/**
 * Reset background tracking state
 */
export function resetBackgroundState(): void {
  kalmanState = null;
  lastLocation = null;
}

/**
 * Define the background location task
 */
TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
  if (error) {
    console.error('Background location task error:', error);
    return;
  }

  if (data) {
    const { locations } = data as { locations: ExpoLocation.LocationObject[] };

    // Process each location update
    for (const expoLocation of locations) {
      const location = convertExpoLocation(expoLocation);

      // Filter out inaccurate points
      if (!isAccurate(location)) {
        console.log(`[Background] Rejected inaccurate location: ${location.accuracy}m`);
        continue;
      }

      // Detect stationary points
      if (isStationary(location)) {
        console.log('[Background] Stationary point detected, skipping');
        continue;
      }

      // Apply Kalman filter for smoothing
      const smoothedLocation = applyKalmanFilter(location);

      // Check minimum distance from last point
      if (lastLocation && !hasMovedEnough(smoothedLocation, lastLocation)) {
        continue;
      }

      lastLocation = smoothedLocation;

      // Notify callback if set
      if (locationUpdateCallback) {
        try {
          locationUpdateCallback(smoothedLocation);
        } catch (error) {
          console.error('[Background] Error in location update callback:', error);
        }
      }
    }
  }
});

/**
 * Start background location tracking
 */
export async function startBackgroundLocationTracking(): Promise<void> {
  // Check if task is already registered
  const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_LOCATION_TASK);
  
  if (isRegistered) {
    console.log('Background location task already registered');
    return;
  }

  try {
    await ExpoLocation.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
      // Use best available accuracy for navigation
      accuracy: ExpoLocation.Accuracy.BestForNavigation,
      
      // Optimal intervals for detailed tracking
      timeInterval: 3000,  // 3 seconds - frequent updates
      distanceInterval: 5,  // 5 meters - capture route details
      
      // Enable for continuous tracking
      showsBackgroundLocationIndicator: true,
      
      // Foreground service for Android
      foregroundService: {
        notificationTitle: 'Activity Tracking',
        notificationBody: 'Tracking your activity with high accuracy...',
        notificationColor: '#6C63FF',
      },
      
      // Additional accuracy settings
      deferredUpdatesInterval: 3000,
      deferredUpdatesDistance: 5,
    });

    console.log('Background location tracking started');
  } catch (error) {
    console.error('Error starting background location tracking:', error);
    throw error;
  }
}

/**
 * Stop background location tracking
 */
export async function stopBackgroundLocationTracking(): Promise<void> {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_LOCATION_TASK);
  
  if (!isRegistered) {
    console.log('Background location task not registered');
    return;
  }

  try {
    await ExpoLocation.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
    resetBackgroundState();
    console.log('Background location tracking stopped');
  } catch (error) {
    console.error('Error stopping background location tracking:', error);
    throw error;
  }
}

/**
 * Check if background location tracking is active
 */
export async function isBackgroundLocationTrackingActive(): Promise<boolean> {
  return await TaskManager.isTaskRegisteredAsync(BACKGROUND_LOCATION_TASK);
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Convert Expo location to our Location type
 */
function convertExpoLocation(expoLocation: ExpoLocation.LocationObject): Location {
  return {
    latitude: expoLocation.coords.latitude,
    longitude: expoLocation.coords.longitude,
    altitude: expoLocation.coords.altitude,
    accuracy: expoLocation.coords.accuracy || 999,
    timestamp: expoLocation.timestamp,
    speed: expoLocation.coords.speed,
    heading: expoLocation.coords.heading,
  };
}

/**
 * Check if location accuracy is acceptable
 */
function isAccurate(location: Location): boolean {
  return location.accuracy <= ACCURACY_THRESHOLD;
}

/**
 * Detect if the user is stationary
 */
function isStationary(location: Location): boolean {
  // If speed is available and below threshold, consider stationary
  if (location.speed !== null && location.speed < STATIONARY_SPEED_THRESHOLD) {
    return true;
  }

  // If no speed data, check distance from last location
  if (lastLocation) {
    const distance = calculateDistance(
      lastLocation.latitude,
      lastLocation.longitude,
      location.latitude,
      location.longitude
    );
    
    const timeDiff = (location.timestamp - lastLocation.timestamp) / 1000; // seconds
    const speed = distance / timeDiff;
    
    return speed < STATIONARY_SPEED_THRESHOLD;
  }

  return false;
}

/**
 * Check if location has moved enough from last point
 */
function hasMovedEnough(current: Location, last: Location): boolean {
  const distance = calculateDistance(
    last.latitude,
    last.longitude,
    current.latitude,
    current.longitude
  );
  
  return distance >= MIN_DISTANCE_BETWEEN_POINTS;
}

/**
 * Apply Kalman filter for GPS smoothing
 */
function applyKalmanFilter(measurement: Location): Location {
  if (!kalmanState) {
    // Initialize Kalman state with first measurement
    kalmanState = {
      latitude: measurement.latitude,
      longitude: measurement.longitude,
      variance: measurement.accuracy * measurement.accuracy,
    };
    return measurement;
  }

  // Prediction step
  const predictedVariance = kalmanState.variance + KALMAN_Q;

  // Update step
  const measurementVariance = measurement.accuracy * measurement.accuracy;
  const kalmanGain = predictedVariance / (predictedVariance + measurementVariance + KALMAN_R);

  // Update state
  const newLatitude = kalmanState.latitude + kalmanGain * (measurement.latitude - kalmanState.latitude);
  const newLongitude = kalmanState.longitude + kalmanGain * (measurement.longitude - kalmanState.longitude);
  const newVariance = (1 - kalmanGain) * predictedVariance;

  kalmanState = {
    latitude: newLatitude,
    longitude: newLongitude,
    variance: newVariance,
  };

  // Return smoothed location
  return {
    ...measurement,
    latitude: newLatitude,
    longitude: newLongitude,
    accuracy: Math.sqrt(newVariance),
  };
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}
