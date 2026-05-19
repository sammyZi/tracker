/**
 * usePersonalRecords Hook
 * Custom hook for fetching and managing personal records
 */

import { useState, useEffect, useCallback } from 'react';
import StorageService from '../services/storage/StorageService';
import { PersonalRecords } from '../types';
import { useSync } from '../context';

interface UsePersonalRecordsReturn {
  records: PersonalRecords | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

/**
 * Hook to fetch and manage personal records
 * @returns Personal records data and loading state
 */
export const usePersonalRecords = (): UsePersonalRecordsReturn => {
  const { syncVersion } = useSync();
  const [records, setRecords] = useState<PersonalRecords | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadRecords = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const personalRecords = await StorageService.getPersonalRecords();
      setRecords(personalRecords);
    } catch (err) {
      console.error('Error loading personal records:', err);
      setError(err instanceof Error ? err : new Error('Failed to load personal records'));
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await loadRecords();
  }, [loadRecords]);

  // Load records on mount and when cloud data is downloaded
  useEffect(() => {
    loadRecords();
  }, [loadRecords, syncVersion]);

  return {
    records,
    loading,
    error,
    refresh,
  };
};
