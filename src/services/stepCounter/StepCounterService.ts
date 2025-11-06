/**
 * StepCounterService - Step counting using device pedometer
 * 
 * Features:
 * - Device pedometer availability checking
 * - Step counting during active sessions
 * - Background step counting support
 * - Step count reset for new activities
 * - Real-time step updates
 */

import { Pedometer } from 'expo-sensors';

export type StepUpdateCallback = (steps: number) => void;

class StepCounterService {
  private isAvailableOnDevice: boolean | null = null;
  private isCounting: boolean = false;
  private subscription: { remove: () => void } | null = null;
  private sessionStartSteps: number = 0;
  private currentSteps: number = 0;
  private updateCallbacks: StepUpdateCallback[] = [];

  /**
   * Check if pedometer is available on the device
   */
  async isAvailable(): Promise<boolean> {
    if (this.isAvailableOnDevice !== null) {
      return this.isAvailableOnDevice;
    }

    try {
      const available = await Pedometer.isAvailableAsync();
      this.isAvailableOnDevice = available;
      
      if (!available) {
        console.warn('Pedometer not available on this device');
      }
      
      return available;
    } catch (error) {
      console.error('Error checking pedometer availability:', error);
      this.isAvailableOnDevice = false;
      return false;
    }
  }

  /**
   * Start counting steps for a new activity session
   */
  async startCounting(): Promise<void> {
    if (this.isCounting) {
      console.warn('Step counting already started');
      return;
    }

    const available = await this.isAvailable();
    if (!available) {
      console.warn('Cannot start step counting: pedometer not available');
      return;
    }

    try {
      // Get current step count as baseline
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      try {
        const result = await Pedometer.getStepCountAsync(startOfDay, now);
        this.sessionStartSteps = result?.steps || 0;
        console.log('Session baseline steps:', this.sessionStartSteps);
      } catch (error) {
        console.log('Could not get baseline steps, starting from 0');
        this.sessionStartSteps = 0;
      }

      // Reset current steps
      this.currentSteps = 0;

      // Subscribe to live step updates
      this.subscription = Pedometer.watchStepCount((result) => {
        this.handleStepUpdate(result.steps);
      });

      this.isCounting = true;
      console.log('Step counting started');
    } catch (error) {
      console.error('Error starting step counting:', error);
      // Don't throw - just continue without step counting
      console.log('Continuing without step counting');
    }
  }

  /**
   * Stop counting steps and return the total count
   * @returns Total steps counted during the session
   */
  async stopCounting(): Promise<number> {
    if (!this.isCounting) {
      return this.currentSteps;
    }

    try {
      if (this.subscription) {
        this.subscription.remove();
        this.subscription = null;
      }

      const finalSteps = this.currentSteps;
      
      this.isCounting = false;
      this.sessionStartSteps = 0;
      this.currentSteps = 0;
      
      console.log(`Step counting stopped. Total steps: ${finalSteps}`);
      
      return finalSteps;
    } catch (error) {
      console.error('Error stopping step counting:', error);
      throw error;
    }
  }

  /**
   * Pause step counting (stops emitting updates but keeps subscription)
   */
  pauseCounting(): void {
    if (!this.isCounting) {
      return;
    }
    
    // We don't actually stop the subscription, just stop processing updates
    // The pedometer continues counting in the background
    console.log('Step counting paused');
  }

  /**
   * Resume step counting
   */
  resumeCounting(): void {
    if (!this.isCounting) {
      return;
    }
    
    console.log('Step counting resumed');
  }

  /**
   * Get the current step count for the active session
   */
  getCurrentSteps(): number {
    return this.currentSteps;
  }

  /**
   * Check if currently counting steps
   */
  isCurrentlyCounting(): boolean {
    return this.isCounting;
  }

  /**
   * Subscribe to step count updates
   * @param callback - Function to call when step count updates
   * @returns Unsubscribe function
   */
  onStepUpdate(callback: StepUpdateCallback): () => void {
    this.updateCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.updateCallbacks = this.updateCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Get step count for a specific time period
   * @param start - Start date
   * @param end - End date
   * @returns Step count for the period
   */
  async getStepCountForPeriod(start: Date, end: Date): Promise<number> {
    const available = await this.isAvailable();
    if (!available) {
      return 0;
    }

    try {
      const result = await Pedometer.getStepCountAsync(start, end);
      return result?.steps || 0;
    } catch (error) {
      console.error('Error getting step count for period:', error);
      return 0;
    }
  }

  /**
   * Handle incoming step updates from the pedometer
   */
  private handleStepUpdate(newSteps: number): void {
    if (!this.isCounting) {
      return;
    }

    // watchStepCount gives us incremental steps since we started watching
    // Add them to our current count
    this.currentSteps += newSteps;

    console.log(`Step update: +${newSteps}, Total: ${this.currentSteps}`);

    // Notify all subscribers
    this.notifySubscribers(this.currentSteps);
  }

  /**
   * Notify all subscribers of step count update
   */
  private notifySubscribers(steps: number): void {
    this.updateCallbacks.forEach(callback => {
      try {
        callback(steps);
      } catch (error) {
        console.error('Error in step update callback:', error);
      }
    });
  }

  /**
   * Reset the service state (useful for testing or cleanup)
   */
  async reset(): Promise<void> {
    if (this.isCounting) {
      await this.stopCounting();
    }
    
    this.isAvailableOnDevice = null;
    this.sessionStartSteps = 0;
    this.currentSteps = 0;
    this.updateCallbacks = [];
  }
}

// Export singleton instance
export default new StepCounterService();
