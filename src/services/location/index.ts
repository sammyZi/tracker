/**
 * Location Service Module
 * 
 * Exports the LocationService for high-accuracy GPS tracking
 * and background location task utilities
 */

export { locationService, default } from './LocationService';
export type { LocationUpdateCallback } from './LocationService';

// Export background location task utilities
export {
  BACKGROUND_LOCATION_TASK,
  startBackgroundLocationTracking,
  stopBackgroundLocationTracking,
  isBackgroundLocationTrackingActive,
  setBackgroundLocationCallback,
  clearBackgroundLocationCallback,
  resetBackgroundState,
} from './BackgroundLocationTask';
