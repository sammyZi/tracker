/**
 * useActivityHistory Hook
 * Custom hook for managing activity history with filtering and pagination
 */

import { useState, useEffect, useCallback } from 'react';
import StorageService from '../services/storage/StorageService';
import { Activity, ActivityType, ActivityFilters } from '../types';

interface UseActivityHistoryOptions {
  itemsPerPage?: number;
  autoLoad?: boolean;
}

interface UseActivityHistoryReturn {
  activities: Activity[];
  loading: boolean;
  refreshing: boolean;
  hasMore: boolean;
  error: Error | null;
  activityTypeFilter: ActivityType | 'all';
  dateRangeFilter: 'all' | 'week' | 'month' | 'year';
  setActivityTypeFilter: (filter: ActivityType | 'all') => void;
  setDateRangeFilter: (filter: 'all' | 'week' | 'month' | 'year') => void;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  reload: () => Promise<void>;
}

export const useActivityHistory = (
  options: UseActivityHistoryOptions = {}
): UseActivityHistoryReturn => {
  const { itemsPerPage = 20, autoLoad = true } = options;

  const [allActivities, setAllActivities] = useState<Activity[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(autoLoad);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Filter states
  const [activityTypeFilter, setActivityTypeFilter] = useState<ActivityType | 'all'>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<'all' | 'week' | 'month' | 'year'>('all');

  /**
   * Load activities from storage with filters
   */
  const loadActivities = useCallback(
    async (reset: boolean = false) => {
      try {
        if (reset) {
          setLoading(true);
          setPage(1);
          setError(null);
        }

        const filters: ActivityFilters = {};

        // Apply date range filter
        if (dateRangeFilter !== 'all') {
          const now = Date.now();
          switch (dateRangeFilter) {
            case 'week':
              filters.startDate = now - 7 * 24 * 60 * 60 * 1000;
              break;
            case 'month':
              filters.startDate = now - 30 * 24 * 60 * 60 * 1000;
              break;
            case 'year':
              filters.startDate = now - 365 * 24 * 60 * 60 * 1000;
              break;
          }
        }

        // Apply activity type filter
        if (activityTypeFilter !== 'all') {
          filters.type = activityTypeFilter;
        }

        const fetchedActivities = await StorageService.getActivities(filters);
        setAllActivities(fetchedActivities);

        // Paginate
        const currentPage = reset ? 1 : page;
        const paginatedActivities = fetchedActivities.slice(0, currentPage * itemsPerPage);
        setActivities(paginatedActivities);
        setHasMore(paginatedActivities.length < fetchedActivities.length);
      } catch (err) {
        console.error('Error loading activities:', err);
        setError(err instanceof Error ? err : new Error('Failed to load activities'));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [dateRangeFilter, activityTypeFilter, page, itemsPerPage]
  );

  /**
   * Refresh activities (pull-to-refresh)
   */
  const refresh = useCallback(async () => {
    setRefreshing(true);
    await loadActivities(true);
  }, [loadActivities]);

  /**
   * Load more activities (pagination)
   */
  const loadMore = useCallback(async () => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  }, [loading, hasMore]);

  /**
   * Reload activities (force reload)
   */
  const reload = useCallback(async () => {
    await loadActivities(true);
  }, [loadActivities]);

  // Load activities when filters change
  useEffect(() => {
    if (autoLoad) {
      loadActivities(true);
    }
  }, [dateRangeFilter, activityTypeFilter]);

  // Load more when page changes
  useEffect(() => {
    if (page > 1) {
      loadActivities(false);
    }
  }, [page]);

  return {
    activities,
    loading,
    refreshing,
    hasMore,
    error,
    activityTypeFilter,
    dateRangeFilter,
    setActivityTypeFilter,
    setDateRangeFilter,
    refresh,
    loadMore,
    reload,
  };
};
