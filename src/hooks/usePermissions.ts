/**
 * usePermissions Hook
 * Manages app permissions state
 */

import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { Pedometer } from 'expo-sensors';

const PERMISSIONS_KEY = '@permissions_requested';

interface PermissionsState {
  hasRequestedPermissions: boolean;
  hasLocationPermission: boolean;
  hasBackgroundLocationPermission: boolean;
  hasMotionPermission: boolean;
  loading: boolean;
}

export const usePermissions = () => {
  const [state, setState] = useState<PermissionsState>({
    hasRequestedPermissions: false,
    hasLocationPermission: false,
    hasBackgroundLocationPermission: false,
    hasMotionPermission: false,
    loading: true,
  });

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      // Check if we've requested permissions before
      const requested = await AsyncStorage.getItem(PERMISSIONS_KEY);
      
      // Check current permission status
      const { status: locationStatus } = await Location.getForegroundPermissionsAsync();
      const { status: backgroundStatus } = await Location.getBackgroundPermissionsAsync();
      
      let motionAvailable = false;
      try {
        motionAvailable = await Pedometer.isAvailableAsync();
      } catch {
        motionAvailable = false;
      }

      setState({
        hasRequestedPermissions: requested === 'true',
        hasLocationPermission: locationStatus === 'granted',
        hasBackgroundLocationPermission: backgroundStatus === 'granted',
        hasMotionPermission: motionAvailable,
        loading: false,
      });
    } catch (error) {
      console.error('Error checking permissions:', error);
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const markPermissionsRequested = async () => {
    try {
      await AsyncStorage.setItem(PERMISSIONS_KEY, 'true');
      setState(prev => ({ ...prev, hasRequestedPermissions: true }));
    } catch (error) {
      console.error('Error marking permissions requested:', error);
    }
  };

  const recheckPermissions = async () => {
    setState(prev => ({ ...prev, loading: true }));
    await checkPermissions();
  };

  return {
    ...state,
    markPermissionsRequested,
    recheckPermissions,
  };
};
