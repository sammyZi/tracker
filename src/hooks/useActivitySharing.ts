/**
 * useActivitySharing Hook
 * Provides activity sharing functionality (text and image)
 */

import { useState } from 'react';
import { Activity, UnitSystem } from '../types';
import SharingService from '../services/sharing/SharingService';

export const useActivitySharing = () => {
  const [isSharing, setIsSharing] = useState(false);

  /**
   * Share activity as text
   */
  const shareActivityText = async (activity: Activity, units: UnitSystem) => {
    try {
      setIsSharing(true);
      await SharingService.shareActivityText(activity, units);
    } catch (error) {
      console.error('Error sharing activity:', error);
      throw error;
    } finally {
      setIsSharing(false);
    }
  };

  /**
   * Share activity as image
   */
  const shareActivityImage = async (imageUri: string) => {
    try {
      setIsSharing(true);
      await SharingService.shareActivityImage(imageUri);
    } catch (error) {
      console.error('Error sharing activity image:', error);
      throw error;
    } finally {
      setIsSharing(false);
    }
  };

  /**
   * Get activity summary card data for rendering
   */
  const getActivitySummaryCard = (activity: Activity, units: UnitSystem) => {
    return SharingService.generateActivitySummaryCard(activity, units);
  };

  return {
    isSharing,
    shareActivityText,
    shareActivityImage,
    getActivitySummaryCard,
  };
};
