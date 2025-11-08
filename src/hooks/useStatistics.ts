/**
 * useStatistics Hook
 * Custom hook for fetching and managing statistics data
 */

import { useState, useEffect, useCallback } from 'react';
import StorageService from '../services/storage/StorageService';
import { Statistics, StatsPeriod } from '../types';

interface UseStatisticsReturn {
  stats: Statistics | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export const useStatistics = (period: StatsPeriod): UseStatisticsReturn => {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadStatistics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const statistics = await StorageService.getStatistics(period);
      setStats(statistics);
    } catch (err) {
      console.error('Error loading statistics:', err);
      setError(err instanceof Error ? err : new Error('Failed to load statistics'));
    } finally {
      setLoading(false);
    }
  }, [period]);

  const refresh = useCallback(async () => {
    await loadStatistics();
  }, [loadStatistics]);

  useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);

  return {
    stats,
    loading,
    error,
    refresh,
  };
};
