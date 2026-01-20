/**
 * Battery Optimization Service
 * 
 * Handles battery optimization exemption requests for Android devices.
 * Prompts users to disable battery optimization when background tracking is needed.
 * 
 * Features:
 * - Check if battery optimization is enabled
 * - Request exemption from battery restrictions
 * - Show user-friendly dialogs explaining why exemption is needed
 */

import { Platform, Alert, Linking } from 'react-native';
import * as IntentLauncher from 'expo-intent-launcher';

export interface BatteryOptimizationStatus {
  isOptimized: boolean;
  canRequestExemption: boolean;
}

class BatteryOptimizationService {
  /**
   * Check if the app is currently battery optimized (restricted)
   */
  async isAppBatteryOptimized(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return false; // iOS doesn't have battery optimization settings
    }

    try {
      // Use expo-intent-launcher to check battery optimization status
      const packageName = await this.getPackageName();
      
      // Note: We can't directly check the status without native module
      // So we'll assume it's optimized and let the user check
      return true;
    } catch (error) {
      console.error('Error checking battery optimization:', error);
      return true; // Assume optimized to be safe
    }
  }

  /**
   * Request battery optimization exemption with user explanation
   * @param context - Context for the request ('tracking' or 'general')
   * @param skipCooldown - Skip the 24-hour cooldown check (for onboarding)
   */
  async requestBatteryOptimizationExemption(
    context: 'tracking' | 'general' = 'tracking',
    skipCooldown: boolean = false
  ): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true; // iOS doesn't need this
    }

    // Check cooldown unless explicitly skipped
    if (!skipCooldown) {
      const lastAsked = await this.getLastExemptionRequestTime();
      const now = Date.now();
      const hoursSinceLastRequest = (now - lastAsked) / (1000 * 60 * 60);

      // Don't ask more than once per day
      if (hoursSinceLastRequest < 24) {
        return false;
      }
    }

    const message = this.getExemptionMessage(context);

    // Save the request time
    await this.saveExemptionRequestTime();

    return new Promise((resolve) => {
      Alert.alert(
        'Battery Optimization',
        message,
        [
          {
            text: 'Not Now',
            style: 'cancel',
            onPress: () => resolve(false),
          },
          {
            text: 'Open Settings',
            onPress: async () => {
              const success = await this.openBatteryOptimizationSettings();
              resolve(success);
            },
          },
        ],
        { cancelable: false }
      );
    });
  }

  /**
   * Open Android battery optimization settings
   */
  async openBatteryOptimizationSettings(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return false;
    }

    try {
      const packageName = await this.getPackageName();

      // Try to open battery optimization settings directly
      await IntentLauncher.startActivityAsync(
        IntentLauncher.ActivityAction.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS,
        {
          data: `package:${packageName}`,
        }
      );

      return true;
    } catch (error) {
      console.error('Error opening battery optimization settings:', error);
      
      // Fallback: Try to open general battery settings
      try {
        await IntentLauncher.startActivityAsync(
          IntentLauncher.ActivityAction.IGNORE_BATTERY_OPTIMIZATION_SETTINGS
        );
        return true;
      } catch (fallbackError) {
        console.error('Error opening fallback settings:', fallbackError);
        
        // Last resort: Open app settings
        await Linking.openSettings();
        return true;
      }
    }
  }

  /**
   * Check if battery optimization exemption should be requested
   * Call this before starting background tracking
   */
  async shouldRequestExemption(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return false;
    }

    // Check if we've already asked recently (within 24 hours)
    const lastAsked = await this.getLastExemptionRequestTime();
    const now = Date.now();
    const hoursSinceLastRequest = (now - lastAsked) / (1000 * 60 * 60);

    // Don't ask more than once per day
    if (hoursSinceLastRequest < 24) {
      return false;
    }

    // Check if app is battery optimized
    const isOptimized = await this.isAppBatteryOptimized();
    return isOptimized;
  }

  /**
   * Request exemption if needed before starting background operations
   * @param context - Context for the request
   * @param skipCooldown - Skip the 24-hour cooldown check
   */
  async ensureBatteryExemption(
    context: 'tracking' | 'general' = 'tracking',
    skipCooldown: boolean = false
  ): Promise<boolean> {
    if (!skipCooldown) {
      const shouldRequest = await this.shouldRequestExemption();
      
      if (!shouldRequest) {
        return true; // Already exempted or asked recently
      }
    }

    // Request exemption
    return await this.requestBatteryOptimizationExemption(context, skipCooldown);
  }

  /**
   * Show informational dialog about battery optimization
   */
  showBatteryOptimizationInfo(): void {
    Alert.alert(
      'About Battery Optimization',
      'For accurate activity tracking, we recommend disabling battery optimization for this app.\n\n' +
      'Battery optimization can:\n' +
      '• Stop background location tracking\n' +
      '• Delay activity updates\n' +
      '• Reduce tracking accuracy\n\n' +
      'Disabling it ensures reliable tracking without interruptions.',
      [{ text: 'Got It', style: 'default' }]
    );
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  private getExemptionMessage(context: 'tracking' | 'general'): string {
    if (context === 'tracking') {
      return (
        'To track your activities accurately in the background, please disable battery optimization for this app.\n\n' +
        'This ensures:\n' +
        '• Continuous GPS tracking\n' +
        '• Accurate distance and route recording\n' +
        '• Real-time activity updates\n\n' +
        'Your battery life will not be significantly affected.'
      );
    }

    return (
      'For the best experience, please disable battery optimization for this app.\n\n' +
      'This allows the app to run smoothly in the background without interruptions.'
    );
  }

  private async getPackageName(): Promise<string> {
    // Get package name from app.json or use default
    return 'com.yourcompany.fitnesstracker';
  }

  private async getLastExemptionRequestTime(): Promise<number> {
    try {
      const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
      const value = await AsyncStorage.getItem('battery_exemption_last_request');
      return value ? parseInt(value, 10) : 0;
    } catch (error) {
      console.error('Error getting last exemption request time:', error);
      return 0;
    }
  }

  private async saveExemptionRequestTime(): Promise<void> {
    try {
      const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
      await AsyncStorage.setItem('battery_exemption_last_request', Date.now().toString());
    } catch (error) {
      console.error('Error saving exemption request time:', error);
    }
  }
}

export default new BatteryOptimizationService();
