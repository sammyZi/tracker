/**
 * Haptic Feedback Service
 * 
 * Manages haptic feedback for user interactions:
 * - Activity control feedback (start, pause, stop)
 * - Success/error feedback
 * - Milestone achievements
 * - Button interactions
 */

import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

type FeedbackType = 
  | 'light'
  | 'medium'
  | 'heavy'
  | 'success'
  | 'warning'
  | 'error'
  | 'selection';

class HapticFeedbackService {
  private enabled: boolean = true;

  /**
   * Initialize the haptic feedback service
   * 
   * @param enabled - Whether haptic feedback is enabled
   */
  initialize(enabled: boolean = true): void {
    this.enabled = enabled;
  }

  /**
   * Enable haptic feedback
   */
  enable(): void {
    this.enabled = true;
  }

  /**
   * Disable haptic feedback
   */
  disable(): void {
    this.enabled = false;
  }

  /**
   * Check if haptic feedback is enabled
   * 
   * @returns True if enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Trigger haptic feedback for activity start
   */
  async activityStart(): Promise<void> {
    if (!this.enabled) return;

    try {
      await Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success
      );
    } catch (error) {
      console.error('Error triggering start haptic:', error);
    }
  }

  /**
   * Trigger haptic feedback for activity pause
   */
  async activityPause(): Promise<void> {
    if (!this.enabled) return;

    try {
      await Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Warning
      );
    } catch (error) {
      console.error('Error triggering pause haptic:', error);
    }
  }

  /**
   * Trigger haptic feedback for activity resume
   */
  async activityResume(): Promise<void> {
    if (!this.enabled) return;

    try {
      await Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success
      );
    } catch (error) {
      console.error('Error triggering resume haptic:', error);
    }
  }

  /**
   * Trigger haptic feedback for activity stop
   */
  async activityStop(): Promise<void> {
    if (!this.enabled) return;

    try {
      // Double tap pattern for stop
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      await new Promise(resolve => setTimeout(resolve, 100));
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (error) {
      console.error('Error triggering stop haptic:', error);
    }
  }

  /**
   * Trigger haptic feedback for distance milestone
   */
  async distanceMilestone(): Promise<void> {
    if (!this.enabled) return;

    try {
      await Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success
      );
    } catch (error) {
      console.error('Error triggering milestone haptic:', error);
    }
  }

  /**
   * Trigger haptic feedback for goal achievement
   */
  async goalAchievement(): Promise<void> {
    if (!this.enabled) return;

    try {
      // Triple tap pattern for achievement
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      await new Promise(resolve => setTimeout(resolve, 100));
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      await new Promise(resolve => setTimeout(resolve, 100));
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (error) {
      console.error('Error triggering achievement haptic:', error);
    }
  }

  /**
   * Trigger light haptic feedback (for button presses)
   */
  async light(): Promise<void> {
    if (!this.enabled) return;

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Error triggering light haptic:', error);
    }
  }

  /**
   * Trigger medium haptic feedback
   */
  async medium(): Promise<void> {
    if (!this.enabled) return;

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.error('Error triggering medium haptic:', error);
    }
  }

  /**
   * Trigger heavy haptic feedback
   */
  async heavy(): Promise<void> {
    if (!this.enabled) return;

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (error) {
      console.error('Error triggering heavy haptic:', error);
    }
  }

  /**
   * Trigger success haptic feedback
   */
  async success(): Promise<void> {
    if (!this.enabled) return;

    try {
      await Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success
      );
    } catch (error) {
      console.error('Error triggering success haptic:', error);
    }
  }

  /**
   * Trigger warning haptic feedback
   */
  async warning(): Promise<void> {
    if (!this.enabled) return;

    try {
      await Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Warning
      );
    } catch (error) {
      console.error('Error triggering warning haptic:', error);
    }
  }

  /**
   * Trigger error haptic feedback
   */
  async error(): Promise<void> {
    if (!this.enabled) return;

    try {
      await Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Error
      );
    } catch (error) {
      console.error('Error triggering error haptic:', error);
    }
  }

  /**
   * Trigger selection haptic feedback (for UI selections)
   */
  async selection(): Promise<void> {
    if (!this.enabled) return;

    try {
      await Haptics.selectionAsync();
    } catch (error) {
      console.error('Error triggering selection haptic:', error);
    }
  }

  /**
   * Trigger custom haptic feedback
   * 
   * @param type - Type of feedback
   */
  async trigger(type: FeedbackType): Promise<void> {
    if (!this.enabled) return;

    switch (type) {
      case 'light':
        await this.light();
        break;
      case 'medium':
        await this.medium();
        break;
      case 'heavy':
        await this.heavy();
        break;
      case 'success':
        await this.success();
        break;
      case 'warning':
        await this.warning();
        break;
      case 'error':
        await this.error();
        break;
      case 'selection':
        await this.selection();
        break;
      default:
        await this.light();
    }
  }

  /**
   * Check if haptic feedback is supported on the device
   * 
   * @returns True if supported
   */
  isSupported(): boolean {
    // Haptics are supported on iOS and most modern Android devices
    return Platform.OS === 'ios' || Platform.OS === 'android';
  }
}

// Export singleton instance
const hapticFeedbackService = new HapticFeedbackService();
export default hapticFeedbackService;
