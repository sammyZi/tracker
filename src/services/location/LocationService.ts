/**
 * LocationService - High-accuracy GPS tracking with Kalman filtering
 * 
 * Features:
 * - BestForNavigation accuracy mode
 * - Accuracy filtering (rejects points > 20m)
 * - Kalman filter for path smoothing
 * - GPS signal quality monitoring
 * - Speed and heading data capture
 * - Stationary point detection
 */

import * as ExpoLocation from 'expo-location';
import { Location, AccuracyStatus, AccuracyQuality } from '@/types';

export type LocationUpdateCallback = (location: Location) => void;

interface KalmanState {
  latitude: number;
  longitude: number;
  variance: number;
}

class LocationService {
  private isTracking: boolean = false;
  private isPaused: boolean = false;
  private locationSubscription: ExpoLocation.LocationSubscription | null = null;
  private updateCallbacks: LocationUpdateCallback[] = [];
  private lastLocation: Location | null = null;
  private kalmanState: KalmanState | null = null;
  
  // Configuration constants
  private readonly ACCURACY_THRESHOLD = 20; // meters
  private readonly STATIONARY_SPEED_THRESHOLD = 0.5; // m/s
  private readonly KALMAN_Q = 3; // Process noise
  private readonly KALMAN_R = 10; // Measurement noise
  private readonly MIN_DISTANCE_BETWEEN_POINTS = 5; // meters

  /**
   * Request location permissions from the user
   */
  async requestPermissions(): Promise<boolean> {
    try {
      // Request foreground permission first
      const { status: foregroundStatus } = await ExpoLocation.requestForegroundPermissionsAsync();
      
      if (foregroundStatus !== 'granted') {
        console.warn('Foreground location permission denied');
        return false;
      }

      // Request background permission for continuous tracking
      const { status: backgroundStatus } = await ExpoLocation.requestBackgroundPermissionsAsync();
      
      if (backgroundStatus !== 'granted') {
        console.warn('Background location permission denied');
        // Still return true as foreground is sufficient for basic tracking
        return true;
      }

      return true;
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return false;
    }
  }

  /**
   * Check if location permissions are granted
   */
  async hasPermissions(): Promise<boolean> {
    try {
      const { status } = await ExpoLocation.getForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error checking location permissions:', error);
      return false;
    }
  }

  /**
   * Start high-accuracy GPS tracking
   */
  async startTracking(): Promise<void> {
    if (this.isTracking) {
      console.warn('Location tracking already started');
      return;
    }

    const hasPermission = await this.hasPermissions();
    if (!hasPermission) {
      throw new Error('Location permissions not granted');
    }

    try {
      // Start location updates with highest accuracy
      this.locationSubscription = await ExpoLocation.watchPositionAsync(
        {
          accuracy: ExpoLocation.Accuracy.BestForNavigation,
          timeInterval: 3000, // 3 seconds
          distanceInterval: 5, // 5 meters
        },
        (expoLocation) => {
          this.handleLocationUpdate(expoLocation);
        }
      );

      this.isTracking = true;
      this.isPaused = false;
      this.kalmanState = null; // Reset Kalman filter
      console.log('Location tracking started with high accuracy');
    } catch (error) {
      console.error('Error starting location tracking:', error);
      throw error;
    }
  }

  /**
   * Stop GPS tracking
   */
  async stopTracking(): Promise<void> {
    if (!this.isTracking) {
      return;
    }

    if (this.locationSubscription) {
      this.locationSubscription.remove();
      this.locationSubscription = null;
    }

    this.isTracking = false;
    this.isPaused = false;
    this.lastLocation = null;
    this.kalmanState = null;
    console.log('Location tracking stopped');
  }

  /**
   * Pause location tracking (stops emitting updates but keeps subscription)
   */
  pauseTracking(): void {
    if (!this.isTracking) {
      return;
    }
    this.isPaused = true;
    console.log('Location tracking paused');
  }

  /**
   * Resume location tracking
   */
  resumeTracking(): void {
    if (!this.isTracking) {
      return;
    }
    this.isPaused = false;
    console.log('Location tracking resumed');
  }

  /**
   * Get current location once
   */
  async getCurrentLocation(): Promise<Location> {
    const hasPermission = await this.hasPermissions();
    if (!hasPermission) {
      throw new Error('Location permissions not granted');
    }

    try {
      const expoLocation = await ExpoLocation.getCurrentPositionAsync({
        accuracy: ExpoLocation.Accuracy.BestForNavigation,
      });

      return this.convertExpoLocation(expoLocation);
    } catch (error) {
      console.error('Error getting current location:', error);
      throw error;
    }
  }

  /**
   * Subscribe to location updates
   */
  onLocationUpdate(callback: LocationUpdateCallback): () => void {
    this.updateCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.updateCallbacks = this.updateCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Get GPS signal quality status
   */
  getAccuracyStatus(): AccuracyStatus {
    if (!this.lastLocation) {
      return {
        current: 0,
        quality: 'poor',
        gpsSignalStrength: 0,
      };
    }

    const accuracy = this.lastLocation.accuracy;
    let quality: AccuracyQuality;
    let signalStrength: number;

    if (accuracy <= 5) {
      quality = 'excellent';
      signalStrength = 100;
    } else if (accuracy <= 10) {
      quality = 'good';
      signalStrength = 75;
    } else if (accuracy <= 20) {
      quality = 'fair';
      signalStrength = 50;
    } else {
      quality = 'poor';
      signalStrength = 25;
    }

    return {
      current: accuracy,
      quality,
      gpsSignalStrength: signalStrength,
    };
  }

  /**
   * Check if currently tracking
   */
  isCurrentlyTracking(): boolean {
    return this.isTracking && !this.isPaused;
  }

  /**
   * Get the last recorded location
   */
  getLastLocation(): Location | null {
    return this.lastLocation;
  }

  /**
   * Handle incoming location updates
   */
  private handleLocationUpdate(expoLocation: ExpoLocation.LocationObject): void {
    if (this.isPaused) {
      return;
    }

    const location = this.convertExpoLocation(expoLocation);

    // Filter out inaccurate points
    if (!this.isAccurate(location)) {
      console.log(`Rejected inaccurate location: ${location.accuracy}m`);
      return;
    }

    // Detect stationary points
    if (this.isStationary(location)) {
      console.log('Stationary point detected, skipping');
      return;
    }

    // Apply Kalman filter for smoothing
    const smoothedLocation = this.applyKalmanFilter(location);

    // Check minimum distance from last point
    if (this.lastLocation && !this.hasMovedEnough(smoothedLocation, this.lastLocation)) {
      return;
    }

    this.lastLocation = smoothedLocation;

    // Notify all subscribers
    this.updateCallbacks.forEach(callback => {
      try {
        callback(smoothedLocation);
      } catch (error) {
        console.error('Error in location update callback:', error);
      }
    });
  }

  /**
   * Convert Expo location to our Location type
   */
  private convertExpoLocation(expoLocation: ExpoLocation.LocationObject): Location {
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
  private isAccurate(location: Location): boolean {
    return location.accuracy <= this.ACCURACY_THRESHOLD;
  }

  /**
   * Detect if the user is stationary
   */
  private isStationary(location: Location): boolean {
    // If speed is available and below threshold, consider stationary
    if (location.speed !== null && location.speed < this.STATIONARY_SPEED_THRESHOLD) {
      return true;
    }

    // If no speed data, check distance from last location
    if (this.lastLocation) {
      const distance = this.calculateDistance(
        this.lastLocation.latitude,
        this.lastLocation.longitude,
        location.latitude,
        location.longitude
      );
      
      const timeDiff = (location.timestamp - this.lastLocation.timestamp) / 1000; // seconds
      const speed = distance / timeDiff;
      
      return speed < this.STATIONARY_SPEED_THRESHOLD;
    }

    return false;
  }

  /**
   * Check if location has moved enough from last point
   */
  private hasMovedEnough(current: Location, last: Location): boolean {
    const distance = this.calculateDistance(
      last.latitude,
      last.longitude,
      current.latitude,
      current.longitude
    );
    
    return distance >= this.MIN_DISTANCE_BETWEEN_POINTS;
  }

  /**
   * Apply Kalman filter for GPS smoothing
   * Reduces GPS jitter while maintaining accuracy
   */
  private applyKalmanFilter(measurement: Location): Location {
    if (!this.kalmanState) {
      // Initialize Kalman state with first measurement
      this.kalmanState = {
        latitude: measurement.latitude,
        longitude: measurement.longitude,
        variance: measurement.accuracy * measurement.accuracy,
      };
      return measurement;
    }

    // Prediction step (assume no movement prediction, just use last state)
    const predictedVariance = this.kalmanState.variance + this.KALMAN_Q;

    // Update step
    const measurementVariance = measurement.accuracy * measurement.accuracy;
    const kalmanGain = predictedVariance / (predictedVariance + measurementVariance + this.KALMAN_R);

    // Update state
    const newLatitude = this.kalmanState.latitude + kalmanGain * (measurement.latitude - this.kalmanState.latitude);
    const newLongitude = this.kalmanState.longitude + kalmanGain * (measurement.longitude - this.kalmanState.longitude);
    const newVariance = (1 - kalmanGain) * predictedVariance;

    this.kalmanState = {
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
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
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
}

// Export singleton instance
export const locationService = new LocationService();
export default locationService;
