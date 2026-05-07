/**
 * ActivityDetailScreen
 * Displays complete activity information with route map, metrics, and actions
 * Premium flat editorial design — no shadows, no cards, no gradients
 */

import React, { useState, useRef, useLayoutEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { captureRef } from 'react-native-view-shot';
import { Text, ShareModal, ShareOption } from '../../components/common';
import { StaticRouteMap } from '../../components/map';
import { ActivityShareCard } from '../../components/activity/ActivityShareCard';
import { Activity, UnitSystem } from '../../types';
import {
  formatDistance,
  formatDuration,
  formatPace,
  formatDate,
  formatDateTime,
} from '../../utils/formatting';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import StorageService from '../../services/storage/StorageService';
import { useActivitySharing } from '../../hooks/useActivitySharing';

// Activity type config for icons and accent colors
const ACTIVITY_CONFIG: Record<string, { icon: string; color: string }> = {
  running: { icon: 'fitness', color: Colors.success },
  walking: { icon: 'walk', color: Colors.warning },
  default: { icon: 'fitness', color: Colors.primary },
};

const getActivityConfig = (type: string) =>
  ACTIVITY_CONFIG[type] || ACTIVITY_CONFIG.default;

export const ActivityDetailScreen: React.FC<any> = ({
  route,
  navigation,
}) => {
  const { activityId } = route.params;
  const [activity, setActivity] = useState<Activity | null>(null);
  const [units, setUnits] = useState<UnitSystem>('metric');
  const [showPaceHeatmap, setShowPaceHeatmap] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [renderShareCard, setRenderShareCard] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const activityCardRef = useRef<View>(null);
  const shareCardRef = useRef<View>(null);

  const {
    shareActivityText,
    shareActivityImage,
    isSharing,
  } = useActivitySharing();

  // Load data immediately on mount
  useLayoutEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        const [loadedActivity, settings] = await Promise.all([
          StorageService.getActivity(activityId),
          StorageService.getSettings(),
        ]);

        if (mounted) {
          setActivity(loadedActivity);
          if (settings) {
            setUnits(settings.units);
          }
          setIsReady(true);
        }
      } catch (error) {
        console.error('Error loading activity:', error);
        if (mounted) {
          setIsReady(true);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [activityId]);

  // Memoize computed values
  const computedStats = useMemo(() => {
    if (!activity) return null;
    return {
      speed: ((activity.distance / 1000) / (activity.duration / 3600)).toFixed(1),
      cadence: Math.round((activity.steps / activity.duration) * 60),
      stride: ((activity.distance / activity.steps) * 100).toFixed(0),
      avgAccuracy: (activity.route.reduce((sum, p) => sum + p.accuracy, 0) / activity.route.length).toFixed(1),
    };
  }, [activity]);

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      setIsDeleting(true);
      await StorageService.deleteActivity(activityId);
      setShowDeleteModal(false);

      // Navigate back and trigger refresh
      navigation.navigate('ActivityHistory', { refresh: true });
    } catch (error) {
      console.error('Error deleting activity:', error);
      setIsDeleting(false);
    }
  }

  const cancelDelete = () => {
    setShowDeleteModal(false);
  };

  const handleShare = () => {
    if (!activity) return;
    setShowShareModal(true);
  };

  const handleShareAsImage = async () => {
    if (!activity) return;

    try {
      setGeneratingImage(true);
      setRenderShareCard(true);

      await new Promise(resolve => setTimeout(resolve, 1000));

      if (!shareCardRef.current) {
        throw new Error('Share card not rendered');
      }

      const uri = await captureRef(shareCardRef, {
        format: 'png',
        quality: 1.0,
        result: 'tmpfile',
      });

      setRenderShareCard(false);
      setGeneratingImage(false);

      await shareActivityImage(uri);
    } catch (error) {
      console.error('Error sharing as image:', error);
      setRenderShareCard(false);
      setGeneratingImage(false);
    }
  };

  const handleShareAsText = async () => {
    if (!activity) return;

    try {
      await shareActivityText(activity, units);
    } catch (error) {
      console.error('Error sharing as text:', error);
    }
  };

  const shareOptions: ShareOption[] = [
    {
      id: 'image',
      label: 'Share as Image',
      icon: 'image-outline',
      color: Colors.primary,
      onPress: handleShareAsImage,
    },
    {
      id: 'text',
      label: 'Share as Text',
      icon: 'text-outline',
      color: Colors.success,
      onPress: handleShareAsText,
    },
  ];

  // ── Shared header for loading/error states ──
  const renderHeader = (showActions = false) => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.headerButton}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
      </TouchableOpacity>
      <Text variant="mediumLarge" weight="semiBold" color={Colors.textPrimary}>
        Activity
      </Text>
      {showActions ? (
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={handleShare} activeOpacity={0.7}>
            <Ionicons name="share-outline" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleDelete} activeOpacity={0.7}>
            <Ionicons name="trash-outline" size={22} color={Colors.error} />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.headerButtonPlaceholder} />
      )}
    </View>
  );

  // Show loading state
  if (!isReady) {
    return (
      <View style={styles.screen}>
        <View style={styles.statusBarSpacer} />
        {renderHeader()}
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </View>
    );
  }

  // Show error state
  if (!activity) {
    return (
      <View style={styles.screen}>
        <View style={styles.statusBarSpacer} />
        {renderHeader()}
        <View style={styles.centered}>
          <View style={styles.emptyIcon}>
            <Ionicons name="alert-circle-outline" size={44} color={Colors.disabled} />
          </View>
          <Text variant="regular" weight="medium" color={Colors.textSecondary} style={{ marginTop: Spacing.md }}>
            Activity not found
          </Text>
        </View>
      </View>
    );
  }

  const config = getActivityConfig(activity.type);
  const distanceParts = formatDistance(activity.distance, units, 2).split(' ');
  const paceParts = formatPace(activity.averagePace, units).split(' ');

  return (
    <View style={styles.screen}>
      <View style={styles.statusBarSpacer} />
      {renderHeader(true)}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Capturable Activity Card */}
        <View ref={activityCardRef} style={styles.capturable} collapsable={false}>

          {/* ── Hero Section ── */}
          <View style={styles.heroSection}>
            <View style={styles.heroTop}>
              <View style={[styles.activityBadge, { backgroundColor: config.color + '15' }]}>
                <Ionicons name={config.icon as any} size={20} color={config.color} />
                <Text variant="small" weight="semiBold" color={config.color} style={{ marginLeft: 6 }}>
                  {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                </Text>
              </View>
              <Text variant="small" color={Colors.textSecondary}>
                {formatDateTime(activity.startTime)}
              </Text>
            </View>

            {/* Big distance number */}
            <View style={styles.heroMetric}>
              <Text style={styles.heroValue}>{distanceParts[0]}</Text>
              <Text variant="regular" weight="medium" color={Colors.textSecondary} style={{ marginLeft: 6, marginBottom: 10 }}>
                {distanceParts[1]}
              </Text>
            </View>

            {/* Quick stats row */}
            <View style={styles.heroStatsRow}>
              <View style={styles.heroStat}>
                <Text variant="extraSmall" color={Colors.textSecondary} style={styles.heroStatLabel}>
                  Duration
                </Text>
                <Text variant="mediumLarge" weight="bold" color={Colors.textPrimary}>
                  {formatDuration(activity.duration)}
                </Text>
              </View>
              <View style={styles.heroStatDivider} />
              <View style={styles.heroStat}>
                <Text variant="extraSmall" color={Colors.textSecondary} style={styles.heroStatLabel}>
                  Pace
                </Text>
                <Text variant="mediumLarge" weight="bold" color={Colors.textPrimary}>
                  {paceParts[0]}
                </Text>
              </View>
              <View style={styles.heroStatDivider} />
              <View style={styles.heroStat}>
                <Text variant="extraSmall" color={Colors.textSecondary} style={styles.heroStatLabel}>
                  Calories
                </Text>
                <Text variant="mediumLarge" weight="bold" color={Colors.textPrimary}>
                  {Math.round(activity.calories)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.sectionDivider} />

          {/* ── Key Metrics ── */}
          <View style={styles.section}>
            <Text variant="extraSmall" weight="semiBold" color={Colors.primary} style={styles.sectionLabel}>
              KEY METRICS
            </Text>
            <View style={styles.metricsRow}>
              <View style={styles.metricItem}>
                <View style={[styles.metricDot, { backgroundColor: Colors.primary }]} />
                <Text variant="extraSmall" color={Colors.textSecondary}>Steps</Text>
                <Text variant="mediumLarge" weight="bold" color={Colors.textPrimary}>
                  {activity.steps.toLocaleString()}
                </Text>
              </View>
              {computedStats && (
                <>
                  <View style={styles.metricItem}>
                    <View style={[styles.metricDot, { backgroundColor: Colors.success }]} />
                    <Text variant="extraSmall" color={Colors.textSecondary}>Speed</Text>
                    <Text variant="mediumLarge" weight="bold" color={Colors.textPrimary}>
                      {computedStats.speed}
                      <Text variant="extraSmall" color={Colors.textSecondary}>
                        {' '}{units === 'metric' ? 'km/h' : 'mph'}
                      </Text>
                    </Text>
                  </View>
                  <View style={styles.metricItem}>
                    <View style={[styles.metricDot, { backgroundColor: Colors.info }]} />
                    <Text variant="extraSmall" color={Colors.textSecondary}>Cadence</Text>
                    <Text variant="mediumLarge" weight="bold" color={Colors.textPrimary}>
                      {computedStats.cadence}
                      <Text variant="extraSmall" color={Colors.textSecondary}> spm</Text>
                    </Text>
                  </View>
                  <View style={styles.metricItem}>
                    <View style={[styles.metricDot, { backgroundColor: Colors.warning }]} />
                    <Text variant="extraSmall" color={Colors.textSecondary}>Stride</Text>
                    <Text variant="mediumLarge" weight="bold" color={Colors.textPrimary}>
                      {computedStats.stride}
                      <Text variant="extraSmall" color={Colors.textSecondary}> cm</Text>
                    </Text>
                  </View>
                </>
              )}
            </View>
          </View>

          <View style={styles.sectionDivider} />

          {/* ── Route Map ── */}
          <View style={styles.section}>
            <View style={styles.mapHeaderRow}>
              <View>
                <Text variant="extraSmall" weight="semiBold" color={Colors.primary} style={styles.sectionLabel}>
                  ROUTE
                </Text>
                <Text variant="extraSmall" color={Colors.textSecondary}>
                  {activity.route.length} GPS points
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.paceToggle, showPaceHeatmap && styles.paceToggleActive]}
                onPress={() => setShowPaceHeatmap(!showPaceHeatmap)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={showPaceHeatmap ? 'color-palette' : 'color-palette-outline'}
                  size={16}
                  color={showPaceHeatmap ? '#FFFFFF' : Colors.textSecondary}
                />
                <Text
                  variant="extraSmall"
                  weight="medium"
                  color={showPaceHeatmap ? '#FFFFFF' : Colors.textSecondary}
                  style={{ marginLeft: 4 }}
                >
                  Pace
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.mapContainer}>
              {activity.route && activity.route.length > 0 && (
                <StaticRouteMap
                  route={activity.route}
                  units={units}
                  showDistanceMarkers={true}
                  showPaceHeatmap={showPaceHeatmap}
                  averagePace={activity.averagePace}
                />
              )}
            </View>

            {/* Map metadata */}
            {computedStats && (
              <View style={styles.mapMeta}>
                <View style={styles.mapMetaItem}>
                  <Ionicons name="locate-outline" size={14} color={Colors.success} />
                  <Text variant="extraSmall" color={Colors.textSecondary} style={{ marginLeft: 4 }}>
                    {computedStats.avgAccuracy}m accuracy
                  </Text>
                </View>
                {activity.elevationGain !== undefined && activity.elevationGain > 0 && (
                  <View style={styles.mapMetaItem}>
                    <Ionicons name="arrow-up-outline" size={14} color={Colors.warning} />
                    <Text variant="extraSmall" color={Colors.textSecondary} style={{ marginLeft: 4 }}>
                      +{activity.elevationGain.toFixed(0)}m elevation
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>

          <View style={styles.sectionDivider} />

          {/* ── Details ── */}
          <View style={styles.section}>
            <Text variant="extraSmall" weight="semiBold" color={Colors.primary} style={styles.sectionLabel}>
              DETAILS
            </Text>

            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={18} color={Colors.primary} />
              <View style={styles.detailContent}>
                <Text variant="extraSmall" color={Colors.textSecondary}>Date</Text>
                <Text variant="regular" weight="medium" color={Colors.textPrimary}>
                  {formatDate(activity.startTime, 'long')}
                </Text>
              </View>
            </View>

            <View style={styles.detailDivider} />

            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={18} color={Colors.success} />
              <View style={styles.detailContent}>
                <Text variant="extraSmall" color={Colors.textSecondary}>Time Range</Text>
                <Text variant="regular" weight="medium" color={Colors.textPrimary}>
                  {formatDate(activity.startTime, 'time')} – {formatDate(activity.endTime, 'time')}
                </Text>
              </View>
            </View>

            <View style={styles.detailDivider} />

            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={18} color={Colors.info} />
              <View style={styles.detailContent}>
                <Text variant="extraSmall" color={Colors.textSecondary}>GPS Tracking</Text>
                <Text variant="regular" weight="medium" color={Colors.textPrimary}>
                  {activity.route.length} points · {computedStats?.avgAccuracy}m avg
                </Text>
              </View>
            </View>

            {activity.elevationGain !== undefined && activity.elevationGain > 0 && (
              <>
                <View style={styles.detailDivider} />
                <View style={styles.detailRow}>
                  <Ionicons name="trending-up-outline" size={18} color={Colors.warning} />
                  <View style={styles.detailContent}>
                    <Text variant="extraSmall" color={Colors.textSecondary}>Elevation Gain</Text>
                    <Text variant="regular" weight="medium" color={Colors.textPrimary}>
                      {activity.elevationGain.toFixed(0)} meters
                    </Text>
                  </View>
                </View>
              </>
            )}
          </View>

          {/* Branding Footer for Shared Image */}
          <View style={styles.brandingFooter}>
            <Ionicons name="fitness" size={16} color={Colors.primary} />
            <Text variant="extraSmall" weight="medium" color={Colors.disabled} style={{ marginLeft: 6 }}>
              Tracked with Stride
            </Text>
          </View>
        </View>
        {/* End Capturable Card */}
      </ScrollView>

      {/* Share Modal */}
      <ShareModal
        visible={showShareModal || generatingImage}
        onClose={() => !generatingImage && setShowShareModal(false)}
        title={generatingImage ? "Generating Image..." : "Share Activity"}
        options={shareOptions}
        loading={isSharing || generatingImage}
        loadingMessage={generatingImage ? "Creating high-quality image with route map" : "Sharing..."}
      />

      {/* Off-screen Share Card for Image Generation */}
      {renderShareCard && activity && (
        <View style={styles.offscreenContainer}>
          <View ref={shareCardRef} collapsable={false}>
            <ActivityShareCard activity={activity} units={units} />
          </View>
        </View>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={cancelDelete}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconWrap}>
              <Ionicons name="trash" size={36} color={Colors.error} />
            </View>

            <Text variant="mediumLarge" weight="bold" color={Colors.textPrimary} style={styles.modalTitle}>
              Delete Activity
            </Text>

            <Text variant="regular" color={Colors.textSecondary} style={styles.modalMessage}>
              Are you sure you want to delete this activity? This action cannot be undone.
            </Text>

            {isDeleting ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="large" color={Colors.error} />
                <Text variant="regular" color={Colors.textSecondary} style={{ marginTop: Spacing.md }}>
                  Deleting...
                </Text>
              </View>
            ) : (
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.modalBtnCancel]}
                  onPress={cancelDelete}
                  activeOpacity={0.7}
                >
                  <Text variant="regular" weight="semiBold" color={Colors.textPrimary}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalBtn, styles.modalBtnDelete]}
                  onPress={confirmDelete}
                  activeOpacity={0.7}
                >
                  <Text variant="regular" weight="semiBold" color="#FFFFFF">
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  statusBarSpacer: {
    height: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 44,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.border + '60',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Header ──
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
  },
  headerButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
  },
  headerButtonPlaceholder: {
    width: 38,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 2,
  },

  // ── Scroll ──
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 48,
  },
  capturable: {
    backgroundColor: Colors.surface,
  },

  // ── Hero ──
  heroSection: {
    paddingHorizontal: 20,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  activityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  heroMetric: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: Spacing.xl,
  },
  heroValue: {
    fontSize: 56,
    fontFamily: 'Poppins_700Bold',
    color: Colors.textPrimary,
    lineHeight: 62,
    includeFontPadding: false,
  },
  heroStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroStat: {
    flex: 1,
    alignItems: 'center',
  },
  heroStatLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  heroStatDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.border,
  },

  // ── Sections ──
  section: {
    paddingHorizontal: 20,
    paddingVertical: Spacing.xl,
  },
  sectionLabel: {
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: Spacing.lg,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 20,
  },

  // ── Key Metrics ──
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  metricItem: {
    width: '47%',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.background,
    borderRadius: 14,
    gap: 2,
  },
  metricDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginBottom: 4,
  },

  // ── Map ──
  mapHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  paceToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.background,
  },
  paceToggleActive: {
    backgroundColor: Colors.primary,
  },
  mapContainer: {
    height: 280,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Colors.background,
  },
  mapMeta: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginTop: Spacing.md,
  },
  mapMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // ── Details ──
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  detailContent: {
    flex: 1,
    gap: 1,
  },
  detailDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
    marginLeft: 34,
  },

  // ── Branding ──
  brandingFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
  },

  // ── Off-screen ──
  offscreenContainer: {
    position: 'absolute',
    left: -10000,
    top: 0,
  },

  // ── Delete Modal ──
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: Spacing.xl,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  modalIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.error + '12',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  modalMessage: {
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: BorderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnCancel: {
    backgroundColor: Colors.background,
  },
  modalBtnDelete: {
    backgroundColor: Colors.error,
  },
  modalLoading: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
});
