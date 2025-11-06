/**
 * ActivityHistoryScreen
 * Displays a scrollable list of past activities with filtering and pull-to-refresh
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../components/common';
import { ActivityCard } from '../../components/activity';
import { EmptyState } from '../../components/common';
import { useActivityHistory } from '../../hooks';
import { Activity, ActivityType, UnitSystem } from '../../types';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../constants/theme';
import StorageService from '../../services/storage/StorageService';

interface ActivityHistoryScreenProps {
  navigation: any;
}

export const ActivityHistoryScreen: React.FC<ActivityHistoryScreenProps> = ({ navigation }) => {
  const {
    activities,
    loading,
    refreshing,
    hasMore,
    activityTypeFilter,
    dateRangeFilter,
    setActivityTypeFilter,
    setDateRangeFilter,
    refresh,
    loadMore,
  } = useActivityHistory();

  // Filter modal state
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [units, setUnits] = useState<UnitSystem>('metric');

  // Load units from settings
  useEffect(() => {
    const loadSettings = async () => {
      const settings = await StorageService.getSettings();
      setUnits(settings?.units || 'metric');
    };
    loadSettings();
  }, []);

  const handleActivityPress = (activity: Activity) => {
    navigation.navigate('ActivityDetail', { activityId: activity.id });
  };

  const renderActivityCard = ({ item }: { item: Activity }) => (
    <ActivityCard
      activity={item}
      onPress={() => handleActivityPress(item)}
      units={units}
    />
  );

  const handleRefresh = () => {
    refresh();
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadMore();
    }
  };

  const renderListHeader = () => (
    <View style={styles.header}>
      <Text variant="large" weight="bold" color={Colors.textPrimary}>
        Activity History
      </Text>
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setFilterModalVisible(true)}
      >
        <Ionicons name="filter" size={20} color={Colors.primary} />
        {(activityTypeFilter !== 'all' || dateRangeFilter !== 'all') && (
          <View style={styles.filterBadge} />
        )}
      </TouchableOpacity>
    </View>
  );

  const renderListFooter = () => {
    if (!hasMore || activities.length === 0) return null;
    
    return (
      <View style={styles.footer}>
        <Text variant="small" color={Colors.textSecondary}>
          {loading ? 'Loading more...' : 'Pull to load more'}
        </Text>
      </View>
    );
  };

  const renderEmptyState = () => (
    <EmptyState
      icon="fitness-outline"
      title="No Activities Yet"
      message="Start tracking your walks and runs to see them here!"
      actionText="Start Activity"
      onAction={() => {
        // TODO: Navigate to activity tracking screen
        console.log('Navigate to activity tracking');
      }}
    />
  );

  const renderFilterModal = () => (
    <Modal
      visible={filterModalVisible}
      transparent
      animationType="fade"
      onRequestClose={() => setFilterModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text variant="medium" weight="semiBold">
              Filter Activities
            </Text>
            <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
              <Ionicons name="close" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Activity Type Filter */}
          <View style={styles.filterSection}>
            <Text variant="regular" weight="medium" style={styles.filterLabel}>
              Activity Type
            </Text>
            <View style={styles.filterOptions}>
              {(['all', 'walking', 'running'] as const).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.filterOption,
                    activityTypeFilter === type && styles.filterOptionActive,
                  ]}
                  onPress={() => setActivityTypeFilter(type)}
                >
                  <Text
                    variant="regular"
                    weight={activityTypeFilter === type ? 'semiBold' : 'regular'}
                    color={activityTypeFilter === type ? Colors.surface : Colors.textPrimary}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Date Range Filter */}
          <View style={styles.filterSection}>
            <Text variant="regular" weight="medium" style={styles.filterLabel}>
              Date Range
            </Text>
            <View style={styles.filterOptions}>
              {(['all', 'week', 'month', 'year'] as const).map((range) => (
                <TouchableOpacity
                  key={range}
                  style={[
                    styles.filterOption,
                    dateRangeFilter === range && styles.filterOptionActive,
                  ]}
                  onPress={() => setDateRangeFilter(range)}
                >
                  <Text
                    variant="regular"
                    weight={dateRangeFilter === range ? 'semiBold' : 'regular'}
                    color={dateRangeFilter === range ? Colors.surface : Colors.textPrimary}
                  >
                    {range === 'all' ? 'All Time' : `Last ${range.charAt(0).toUpperCase() + range.slice(1)}`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => {
                setActivityTypeFilter('all');
                setDateRangeFilter('all');
              }}
            >
              <Text variant="regular" weight="medium" color={Colors.textSecondary}>
                Clear Filters
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => setFilterModalVisible(false)}
            >
              <Text variant="regular" weight="semiBold" color={Colors.surface}>
                Apply
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={activities}
        renderItem={renderActivityCard}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderListHeader}
        ListFooterComponent={renderListFooter}
        ListEmptyComponent={!loading ? renderEmptyState : null}
        contentContainerStyle={[
          styles.listContent,
          activities.length === 0 && styles.emptyListContent,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
      />
      {renderFilterModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  header: {
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.medium,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.small,
  },
  filterBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.error,
  },
  footer: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.extraLarge,
    borderTopRightRadius: BorderRadius.extraLarge,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxxl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  filterSection: {
    marginBottom: Spacing.xl,
  },
  filterLabel: {
    marginBottom: Spacing.md,
    color: Colors.textSecondary,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  filterOption: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.medium,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterOptionActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  clearButton: {
    flex: 1,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.medium,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButton: {
    flex: 1,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.medium,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.medium,
  },
});
