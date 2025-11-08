/**
 * GoalsService - Business logic for goal management
 * Handles goal progress calculation and achievement detection
 */

import { Goal, Activity, GoalType, GoalPeriod } from '../../types';
import StorageService from '../storage/StorageService';

class GoalsService {
  /**
   * Calculate progress for a goal based on activities
   */
  async calculateGoalProgress(goal: Goal): Promise<number> {
    try {
      const activities = await StorageService.getActivities({
        startDate: goal.startDate,
        endDate: goal.endDate,
      });

      let progress = 0;

      switch (goal.type) {
        case 'distance':
          // Sum total distance in meters
          progress = activities.reduce((sum, a) => sum + a.distance, 0);
          break;

        case 'frequency':
          // Count number of activities
          progress = activities.length;
          break;

        case 'duration':
          // Sum total duration in seconds
          progress = activities.reduce((sum, a) => sum + a.duration, 0);
          break;
      }

      return progress;
    } catch (error) {
      console.error('Error calculating goal progress:', error);
      return 0;
    }
  }

  /**
   * Update progress for all active goals
   */
  async updateAllGoalsProgress(): Promise<void> {
    try {
      const goals = await StorageService.getGoals();
      const now = Date.now();

      for (const goal of goals) {
        // Only update active goals (not expired)
        if (goal.endDate >= now) {
          const progress = await this.calculateGoalProgress(goal);
          const achieved = progress >= goal.target;

          await StorageService.updateGoal(goal.id, {
            progress,
            achieved,
          });
        }
      }
    } catch (error) {
      console.error('Error updating goals progress:', error);
    }
  }

  /**
   * Check if a new activity causes any goals to be achieved
   */
  async checkGoalAchievements(activityId: string): Promise<Goal[]> {
    try {
      const activity = await StorageService.getActivity(activityId);
      if (!activity) return [];

      const goals = await StorageService.getGoals();
      const achievedGoals: Goal[] = [];

      for (const goal of goals) {
        // Skip already achieved goals
        if (goal.achieved) continue;

        // Check if activity falls within goal period
        if (activity.startTime >= goal.startDate && activity.startTime <= goal.endDate) {
          const progress = await this.calculateGoalProgress(goal);
          const wasAchieved = goal.progress < goal.target;
          const isNowAchieved = progress >= goal.target;

          if (wasAchieved && isNowAchieved) {
            await StorageService.updateGoal(goal.id, {
              progress,
              achieved: true,
            });

            const updatedGoal = { ...goal, progress, achieved: true };
            achievedGoals.push(updatedGoal);
          } else if (progress !== goal.progress) {
            await StorageService.updateGoal(goal.id, { progress });
          }
        }
      }

      return achievedGoals;
    } catch (error) {
      console.error('Error checking goal achievements:', error);
      return [];
    }
  }

  /**
   * Get active goals (not expired)
   */
  async getActiveGoals(): Promise<Goal[]> {
    try {
      const goals = await StorageService.getGoals();
      const now = Date.now();
      return goals.filter(g => g.endDate >= now);
    } catch (error) {
      console.error('Error getting active goals:', error);
      return [];
    }
  }

  /**
   * Get achieved goals
   */
  async getAchievedGoals(): Promise<Goal[]> {
    try {
      const goals = await StorageService.getGoals();
      return goals.filter(g => g.achieved);
    } catch (error) {
      console.error('Error getting achieved goals:', error);
      return [];
    }
  }

  /**
   * Create date range for goal period
   */
  createGoalPeriod(period: GoalPeriod): { startDate: number; endDate: number } {
    const now = new Date();
    const startDate = new Date(now);
    const endDate = new Date(now);

    if (period === 'weekly') {
      // Start from beginning of current week (Monday)
      const dayOfWeek = startDate.getDay();
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      startDate.setDate(startDate.getDate() + diff);
      startDate.setHours(0, 0, 0, 0);

      // End at end of week (Sunday)
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    } else {
      // Start from beginning of current month
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);

      // End at end of month
      endDate.setMonth(endDate.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
    }

    return {
      startDate: startDate.getTime(),
      endDate: endDate.getTime(),
    };
  }

  /**
   * Format goal target based on type
   */
  formatGoalTarget(goal: Goal, units: 'metric' | 'imperial'): string {
    switch (goal.type) {
      case 'distance':
        // Convert meters to km or miles
        const distance = units === 'imperial' ? goal.target / 1609.34 : goal.target / 1000;
        return `${distance.toFixed(1)} ${units === 'imperial' ? 'mi' : 'km'}`;

      case 'frequency':
        return `${goal.target} ${goal.target === 1 ? 'activity' : 'activities'}`;

      case 'duration':
        // Convert seconds to hours
        const hours = Math.floor(goal.target / 3600);
        const minutes = Math.floor((goal.target % 3600) / 60);
        if (hours > 0) {
          return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;

      default:
        return String(goal.target);
    }
  }

  /**
   * Format goal progress based on type
   */
  formatGoalProgress(goal: Goal, units: 'metric' | 'imperial'): string {
    switch (goal.type) {
      case 'distance':
        const distance = units === 'imperial' ? goal.progress / 1609.34 : goal.progress / 1000;
        return `${distance.toFixed(1)} ${units === 'imperial' ? 'mi' : 'km'}`;

      case 'frequency':
        return `${goal.progress} ${goal.progress === 1 ? 'activity' : 'activities'}`;

      case 'duration':
        const hours = Math.floor(goal.progress / 3600);
        const minutes = Math.floor((goal.progress % 3600) / 60);
        if (hours > 0) {
          return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;

      default:
        return String(goal.progress);
    }
  }

  /**
   * Get goal progress percentage
   */
  getProgressPercentage(goal: Goal): number {
    if (goal.target === 0) return 0;
    return Math.min((goal.progress / goal.target) * 100, 100);
  }
}

export default new GoalsService();
