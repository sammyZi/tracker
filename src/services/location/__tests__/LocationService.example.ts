/**
 * LocationService Usage Examples
 * 
 * This file demonstrates how to use the LocationService in your application.
 * These are example patterns, not automated tests.
 */

import locationService from '../LocationService';
import { Location } from '@/types';

/**
 * Example 1: Basic tracking setup
 */
export async function basicTrackingExample() {
  // Request permissions
  const hasPermission = await locationService.requestPermissions();
  
  if (!hasPermission) {
    console.error('Location permissions not granted');
    return;
  }

  // Start tracking
  await locationService.startTracking();
  console.log('Tracking started');

  // Subscribe to location updates
  const unsubscribe = locationService.onLocationUpdate((location: Location) => {
    console.log('Location update:', {
      lat: location.latitude.toFixed(6),
      lng: location.longitude.toFixed(6),
      accuracy: location.accuracy.toFixed(2),
      speed: location.speed?.toFixed(2) || 'N/A',
      heading: location.heading?.toFixed(2) || 'N/A',
    });
  });

  // Simulate tracking for some time, then stop
  setTimeout(async () => {
    await locationService.stopTracking();
    unsubscribe();
    console.log('Tracking stopped');
  }, 60000); // 1 minute
}

/**
 * Example 2: Monitoring GPS quality
 */
export async function gpsQualityMonitoringExample() {
  await locationService.startTracking();

  // Check GPS quality periodically
  const qualityCheckInterval = setInterval(() => {
    const status = locationService.getAccuracyStatus();
    
    console.log('GPS Status:', {
      accuracy: `${status.current.toFixed(2)}m`,
      quality: status.quality,
      signalStrength: `${status.gpsSignalStrength}%`,
    });

    // Alert user if quality is poor
    if (status.quality === 'poor') {
      console.warn('⚠️ Poor GPS signal. Move to an open area for better accuracy.');
    }
  }, 5000); // Check every 5 seconds

  // Cleanup
  setTimeout(() => {
    clearInterval(qualityCheckInterval);
    locationService.stopTracking();
  }, 60000);
}

/**
 * Example 3: Pause and resume tracking
 */
export async function pauseResumeExample() {
  await locationService.startTracking();

  let locationCount = 0;
  const unsubscribe = locationService.onLocationUpdate((location: Location) => {
    locationCount++;
    console.log(`Location ${locationCount}:`, location.latitude, location.longitude);
  });

  // Track for 10 seconds
  setTimeout(() => {
    console.log('Pausing tracking...');
    locationService.pauseTracking();
  }, 10000);

  // Resume after 5 seconds
  setTimeout(() => {
    console.log('Resuming tracking...');
    locationService.resumeTracking();
  }, 15000);

  // Stop after 30 seconds
  setTimeout(async () => {
    await locationService.stopTracking();
    unsubscribe();
    console.log(`Total locations received: ${locationCount}`);
  }, 30000);
}

/**
 * Example 4: Get single location
 */
export async function getSingleLocationExample() {
  const hasPermission = await locationService.hasPermissions();
  
  if (!hasPermission) {
    await locationService.requestPermissions();
  }

  try {
    const location = await locationService.getCurrentLocation();
    console.log('Current location:', {
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: location.accuracy,
      timestamp: new Date(location.timestamp).toISOString(),
    });
  } catch (error) {
    console.error('Failed to get location:', error);
  }
}

/**
 * Example 5: Track route with quality filtering
 */
export async function trackRouteExample() {
  const route: Location[] = [];
  let rejectedPoints = 0;

  await locationService.startTracking();

  const unsubscribe = locationService.onLocationUpdate((location: Location) => {
    // Only accept high-quality points (already filtered by service)
    route.push(location);
    
    const status = locationService.getAccuracyStatus();
    console.log(`Point ${route.length}: ${status.quality} quality (${status.current.toFixed(2)}m)`);
  });

  // Track for 2 minutes
  setTimeout(async () => {
    await locationService.stopTracking();
    unsubscribe();
    
    console.log('\nRoute Summary:');
    console.log(`Total points: ${route.length}`);
    console.log(`Rejected points: ${rejectedPoints}`);
    console.log(`Average accuracy: ${(route.reduce((sum, p) => sum + p.accuracy, 0) / route.length).toFixed(2)}m`);
  }, 120000);
}

/**
 * Example 6: Multiple subscribers
 */
export async function multipleSubscribersExample() {
  await locationService.startTracking();

  // Subscriber 1: Log coordinates
  const unsubscribe1 = locationService.onLocationUpdate((location) => {
    console.log('[Subscriber 1] Coordinates:', location.latitude, location.longitude);
  });

  // Subscriber 2: Monitor speed
  const unsubscribe2 = locationService.onLocationUpdate((location) => {
    if (location.speed !== null) {
      const speedKmh = location.speed * 3.6; // Convert m/s to km/h
      console.log('[Subscriber 2] Speed:', speedKmh.toFixed(2), 'km/h');
    }
  });

  // Subscriber 3: Track heading
  const unsubscribe3 = locationService.onLocationUpdate((location) => {
    if (location.heading !== null) {
      const direction = getCardinalDirection(location.heading);
      console.log('[Subscriber 3] Heading:', direction);
    }
  });

  // Cleanup after 30 seconds
  setTimeout(async () => {
    await locationService.stopTracking();
    unsubscribe1();
    unsubscribe2();
    unsubscribe3();
  }, 30000);
}

/**
 * Helper: Convert heading degrees to cardinal direction
 */
function getCardinalDirection(heading: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(heading / 45) % 8;
  return directions[index];
}

/**
 * Example 7: Error handling
 */
export async function errorHandlingExample() {
  try {
    // Try to start tracking without permissions
    const hasPermission = await locationService.hasPermissions();
    
    if (!hasPermission) {
      console.log('Requesting permissions...');
      const granted = await locationService.requestPermissions();
      
      if (!granted) {
        throw new Error('User denied location permissions');
      }
    }

    await locationService.startTracking();
    console.log('Tracking started successfully');

    // Handle location updates with error catching
    const unsubscribe = locationService.onLocationUpdate((location) => {
      try {
        // Process location
        processLocation(location);
      } catch (error) {
        console.error('Error processing location:', error);
      }
    });

    // Cleanup
    setTimeout(async () => {
      await locationService.stopTracking();
      unsubscribe();
    }, 30000);

  } catch (error) {
    console.error('Location tracking error:', error);
    // Handle error appropriately (show user message, etc.)
  }
}

function processLocation(location: Location): void {
  // Your location processing logic here
  console.log('Processing location:', location);
}
