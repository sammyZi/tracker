/**
 * Battery Optimization Service
 * 
 * Handles battery optimization exemption requests for Android devices.
 * Checks if app has unrestricted battery access and prompts users when needed.
 * 
 * Key behaviour:
 * - ALWAYS prompts before starting background tracking (no cooldown)
 * - Uses REQUEST_IGNORE_BATTERY_OPTIMIZATIONS intent for a direct system dialog
 * - Resets cached status after the user returns from settings
 * - General prompts (on app start, in settings) still respect a cooldown
 */

import { Platform, Alert, Linking } from 'react-native';
import * as IntentLauncher from 'expo-intent-launcher';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BATTERY_CONFIG, STORAGE_CONFIG } from '@/config/tracking';

/**
 * Callback signature for showing battery alert dialogs.
 * The service defers all user-facing prompts to this handler so the UI layer
 * can use ConfirmModal instead of the native Alert.
 *
 * @param title   - Dialog title
 * @param message - Dialog body
 * @param buttons - Array of { text, onPress, style } objects
 */
export type BatteryAlertHandler = (
  title: string,
  message: string,
  buttons: Array<{ text: string; onPress?: () => void; style?: string }>,
) => void;

export interface BatteryOptimizationStatus {
  isOptimized: boolean;
  canRequestExemption: boolean;
  lastChecked: number;
}

class BatteryOptimizationService {
  private lastCheckTime: number = 0;
  private cachedStatus: boolean | null = null;
  /** Optional UI-layer handler; falls back to native Alert if unset. */
  private alertHandler: BatteryAlertHandler | null = null;

  /**
   * Register a custom alert handler (call from a React component with
   * access to ConfirmModal). Pass `null` to revert to native Alert.
   */
  setAlertHandler(handler: BatteryAlertHandler | null): void {
    this.alertHandler = handler;
  }

  /** Show a dialog through the registered handler or native Alert. */
  private showAlert(
    title: string,
    message: string,
    buttons: Array<{ text: string; onPress?: () => void; style?: string }>,
  ): void {
    if (this.alertHandler) {
      this.alertHandler(title, message, buttons);
    } else {
      Alert.alert(title, message, buttons as any);
    }
  }

  /**
   * Check if the app is currently battery optimized (restricted).
   * Returns true if battery optimization is enabled (app is restricted).
   * 
   * NOTE: Without a custom native module we cannot directly query
   * PowerManager.isIgnoringBatteryOptimizations(). The approach here
   * is to use the stored status which gets updated when the user
   * visits battery settings, or default to "optimized" (safe default).
   */
  async isAppBatteryOptimized(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return false; // iOS doesn't have battery optimization settings
    }

    try {
      // Check cached status if checked very recently (within 30 seconds)
      const now = Date.now();
      if (this.cachedStatus !== null && (now - this.lastCheckTime) < 30 * 1000) {
        return this.cachedStatus;
      }

      // Get stored status
      const storedStatus = await AsyncStorage.getItem(STORAGE_CONFIG.BATTERY_STATUS_KEY);
      if (storedStatus) {
        const status = JSON.parse(storedStatus);
        this.cachedStatus = status.isOptimized;
        this.lastCheckTime = status.lastChecked || 0;

        // If status is recent (within 5 minutes), trust it
        if (now - this.lastCheckTime < 5 * 60 * 1000) {
          return this.cachedStatus ?? true;
        }
      }

      // Default: assume optimized so we always prompt when it matters
      this.cachedStatus = true;
      this.lastCheckTime = now;
      
      await this.saveBatteryStatus(true);
      
      return true;
    } catch (error) {
      console.error('Error checking battery optimization:', error);
      return true; // Assume optimized to be safe
    }
  }

  /**
   * Mark battery optimization as disabled (user confirmed in settings)
   */
  async markBatteryOptimizationDisabled(): Promise<void> {
    this.cachedStatus = false;
    this.lastCheckTime = Date.now();
    await this.saveBatteryStatus(false);
  }

  /**
   * Reset battery optimization status (force recheck next time)
   */
  async resetBatteryStatus(): Promise<void> {
    this.cachedStatus = null;
    this.lastCheckTime = 0;
    await AsyncStorage.removeItem(STORAGE_CONFIG.BATTERY_STATUS_KEY);
  }

  /**
   * Request battery optimization exemption with user explanation.
   * 
   * @param context - Context for the request ('tracking' or 'general')
   * @param skipCooldown - Skip the cooldown check (used for tracking context)
   */
  async requestBatteryOptimizationExemption(
    context: 'tracking' | 'general' = 'tracking',
    skipCooldown: boolean = false
  ): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true; // iOS doesn't need this
    }

    // Check if battery optimization is already disabled
    const isOptimized = await this.isAppBatteryOptimized();
    if (!isOptimized) {
      return true; // Already exempted
    }

    // Check cooldown only if not skipping it
    if (!skipCooldown) {
      const lastAsked = await this.getLastExemptionRequestTime();
      const now = Date.now();
      const hoursSinceLastRequest = (now - lastAsked) / (1000 * 60 * 60);

      // Don't ask more than once per configured cooldown period
      if (hoursSinceLastRequest < BATTERY_CONFIG.REQUEST_COOLDOWN_HOURS) {
        return false;
      }
    }

    const message = this.getExemptionMessage(context);

    // Save the request time (for cooldown in non-tracking contexts)
    await this.saveExemptionRequestTime();

    return new Promise((resolve) => {
      this.showAlert(
        'Battery Optimization Required',
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
              // Reset cached status so we re-check after the user returns
              await this.resetBatteryStatus();
              resolve(success);
            },
          },
        ],
      );
    });
  }

  /**
   * Open Android battery optimization settings.
   * Uses the direct REQUEST_IGNORE_BATTERY_OPTIMIZATIONS intent which
   * shows a simple "Allow" / "Deny" system dialog for the app.
   */
  async openBatteryOptimizationSettings(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return false;
    }

    try {
      const packageName = this.getPackageName();

      // Try to open the direct "Allow unrestricted battery" dialog
      await IntentLauncher.startActivityAsync(
        IntentLauncher.ActivityAction.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS,
        {
          data: `package:${packageName}`,
        }
      );

      // After returning from the system dialog, reset cached status
      // so the next check will re-evaluate
      await this.resetBatteryStatus();

      return true;
    } catch (error) {
      console.error('Error opening battery optimization settings:', error);
      
      // Fallback: Try to open general battery settings
      try {
        await IntentLauncher.startActivityAsync(
          IntentLauncher.ActivityAction.IGNORE_BATTERY_OPTIMIZATION_SETTINGS
        );
        await this.resetBatteryStatus();
        return true;
      } catch (fallbackError) {
        console.error('Error opening fallback settings:', fallbackError);
        
        // Last resort: Open app settings
        await Linking.openSettings();
        await this.resetBatteryStatus();
        return true;
      }
    }
  }

  /**
   * Ensure battery optimization is unrestricted before starting tracking.
   * 
   * CRITICAL: This method ALWAYS prompts if optimization is enabled.
   * There is NO cooldown for the tracking context — the user must
   * either disable optimization or explicitly dismiss the prompt
   * each time they start an activity.
   * 
   * This is the method to call before EVERY background tracking session.
   */
  async ensureBatteryExemptionForTracking(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true;
    }

    // Always reset cached status before checking for tracking
    // This ensures we don't rely on stale cached data
    this.cachedStatus = null;
    this.lastCheckTime = 0;

    const isOptimized = await this.isAppBatteryOptimized();
    if (!isOptimized) {
      return true; // Already unrestricted
    }

    // Skip cooldown for tracking — always prompt
    return await this.requestBatteryOptimizationExemption('tracking', true);
  }

  /**
   * General-purpose battery exemption check (respects cooldown).
   * Use this for non-critical contexts like app start or settings.
   */
  async ensureBatteryExemption(
    context: 'tracking' | 'general' = 'tracking',
    forcePrompt: boolean = false
  ): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true;
    }

    // For tracking context, use the dedicated method (always prompts)
    if (context === 'tracking') {
      return this.ensureBatteryExemptionForTracking();
    }

    const isOptimized = await this.isAppBatteryOptimized();
    if (!isOptimized && !forcePrompt) {
      return true;
    }

    const shouldRequest = forcePrompt || await this.shouldRequestExemption(!forcePrompt);
    if (!shouldRequest) {
      return false;
    }

    return await this.requestBatteryOptimizationExemption(context, forcePrompt);
  }

  /**
   * Check if battery optimization exemption should be requested.
   * @param respectCooldown - Whether to respect the cooldown period
   */
  async shouldRequestExemption(respectCooldown: boolean = true): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return false;
    }

    const isOptimized = await this.isAppBatteryOptimized();
    if (!isOptimized) {
      return false;
    }

    if (respectCooldown) {
      const lastAsked = await this.getLastExemptionRequestTime();
      const now = Date.now();
      const hoursSinceLastRequest = (now - lastAsked) / (1000 * 60 * 60);

      if (hoursSinceLastRequest < BATTERY_CONFIG.REQUEST_COOLDOWN_HOURS) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check battery optimization status on app start.
   * Shows a one-time prompt if battery optimization is enabled (respects cooldown).
   */
  async checkOnAppStart(): Promise<void> {
    if (!BATTERY_CONFIG.CHECK_ON_APP_START || Platform.OS !== 'android') {
      return;
    }

    const isOptimized = await this.isAppBatteryOptimized();
    if (isOptimized) {
      const shouldRequest = await this.shouldRequestExemption(true);
      if (shouldRequest) {
        await this.requestBatteryOptimizationExemption('general', false);
      }
    }
  }

  /**
   * Check battery optimization before starting tracking.
   * ALWAYS prompts if optimization is still enabled — no cooldown.
   */
  async checkBeforeTracking(): Promise<boolean> {
    if (!BATTERY_CONFIG.CHECK_BEFORE_TRACKING || Platform.OS !== 'android') {
      return true;
    }

    return await this.ensureBatteryExemptionForTracking();
  }

  /**
   * Show informational dialog about battery optimization
   */
  showBatteryOptimizationInfo(): void {
    this.showAlert(
      'About Battery Optimization',
      'For accurate activity tracking, we recommend disabling battery optimization for this app.\n\n' +
      'Battery optimization can:\n' +
      '• Stop background location tracking\n' +
      '• Delay activity updates\n' +
      '• Reduce tracking accuracy\n\n' +
      'Disabling it ensures reliable tracking without interruptions.\n\n' +
      'Note: The app will still use battery efficiently.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Settings',
          onPress: () => this.openBatteryOptimizationSettings(),
        },
      ]
    );
  }

  /**
   * Get current battery optimization status with details
   */
  async getBatteryStatus(): Promise<BatteryOptimizationStatus> {
    const isOptimized = await this.isAppBatteryOptimized();
    const lastChecked = this.lastCheckTime;
    
    return {
      isOptimized,
      canRequestExemption: Platform.OS === 'android',
      lastChecked,
    };
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  private async saveBatteryStatus(isOptimized: boolean): Promise<void> {
    try {
      const status = {
        isOptimized,
        lastChecked: Date.now(),
      };
      await AsyncStorage.setItem(
        STORAGE_CONFIG.BATTERY_STATUS_KEY,
        JSON.stringify(status)
      );
    } catch (error) {
      console.error('Error saving battery status:', error);
    }
  }

  private getExemptionMessage(context: 'tracking' | 'general'): string {
    if (context === 'tracking') {
      return (
        '⚠️ Battery optimization is currently enabled for this app.\n\n' +
        'To track your activities accurately in the background, please disable battery optimization.\n\n' +
        'This ensures:\n' +
        '✓ Continuous GPS tracking\n' +
        '✓ Accurate distance and route recording\n' +
        '✓ Real-time activity updates\n\n' +
        'Your battery life will not be significantly affected.\n\n' +
        'In the next screen, select "Don\'t optimize" or "Unrestricted".'
      );
    }

    return (
      '⚠️ Battery optimization is currently enabled.\n\n' +
      'For the best experience, please disable battery optimization for this app.\n\n' +
      'This allows the app to run smoothly in the background without interruptions.\n\n' +
      'Select "Don\'t optimize" or "Unrestricted" in the next screen.'
    );
  }

  private getPackageName(): string {
    // Return the correct package name for the Stride app
    return 'com.fittracker.app';
  }

  private async getLastExemptionRequestTime(): Promise<number> {
    try {
      const value = await AsyncStorage.getItem(STORAGE_CONFIG.BATTERY_EXEMPTION_KEY);
      return value ? parseInt(value, 10) : 0;
    } catch (error) {
      console.error('Error getting last exemption request time:', error);
      return 0;
    }
  }

  private async saveExemptionRequestTime(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_CONFIG.BATTERY_EXEMPTION_KEY,
        Date.now().toString()
      );
    } catch (error) {
      console.error('Error saving exemption request time:', error);
    }
  }
}

export default new BatteryOptimizationService();
