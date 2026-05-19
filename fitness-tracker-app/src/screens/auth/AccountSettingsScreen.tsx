/**
 * Account Settings Screen
 *
 * Displays the user's account information, cloud-sync toggle,
 * sync status / last sync time, and logout functionality.
 *
 * When cloud-sync is enabled for the first time the screen shows a
 * migration progress dialog that uploads all local data to Supabase.
 *
 * Requirements: 3.1, 4.3, 4.5, 8.1, 8.2, 8.3
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Text, Button } from '../../components/common';
import { ConfirmModal } from '../../components/common';
import { SyncStatusIndicator } from '../../components/sync';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { useAuth } from '../../context';
import { useTheme } from '../../hooks';
import { useConfirmModal } from '../../hooks/useConfirmModal';
import StorageService from '../../services/storage/StorageService';
import SyncService from '../../services/sync/SyncService';
import type { MigrationProgress } from '../../services/sync';

// ── Constants ────────────────────────────────────────────────────────────────

const LAST_SYNC_KEY = '@last_sync_time';
const MIGRATION_DONE_KEY = '@cloud_migration_done';

// ── Reusable sub-components (matching Settings screen) ──────────────────────

interface SectionProps {
  title: string;
  children: React.ReactNode;
  colors: any;
  isFirst?: boolean;
}

const Section: React.FC<SectionProps> = ({ title, children, colors, isFirst }) => (
  <View style={[styles.section, isFirst && { marginTop: 0 }]}>
    <Text style={[styles.sectionTitle, { color: colors.primary }]}>{title}</Text>
    <View style={[styles.sectionCard, { backgroundColor: colors.surface }]}>
      {children}
    </View>
  </View>
);

interface SettingRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  label: string;
  description: string;
  colors: any;
  right?: React.ReactNode;
  onPress?: () => void;
  isLast?: boolean;
  disabled?: boolean;
}

const SettingRow: React.FC<SettingRowProps> = ({
  icon, iconBg, label, description, colors, right, onPress, isLast, disabled,
}) => {
  const content = (
    <View style={[styles.settingRow, !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
      <View style={[styles.iconCircle, { backgroundColor: iconBg + '18' }]}>
        <Ionicons name={icon} size={20} color={iconBg} />
      </View>
      <View style={styles.settingTextContainer}>
        <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>{label}</Text>
        <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
          {description}
        </Text>
      </View>
      {right}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.6} onPress={onPress} disabled={disabled}>
        {content}
      </TouchableOpacity>
    );
  }
  return content;
};

// ── Component ────────────────────────────────────────────────────────────────

export const AccountSettingsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, isAuthenticated, signOut, signInWithGoogle } = useAuth();
  const { colors } = useTheme();
  const { modalState, showConfirm, hideModal } = useConfirmModal();

  // State
  const [cloudSyncEnabled, setCloudSyncEnabled] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [isTogglingSync, setIsTogglingSync] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Migration dialog state (15.3)
  const [showMigration, setShowMigration] = useState(false);
  const [migrationProgress, setMigrationProgress] = useState<MigrationProgress | null>(null);
  const [migrationDone, setMigrationDone] = useState(false);
  const [migrationError, setMigrationError] = useState<string | null>(null);
  const migrationRunning = useRef(false);

  // ── Load initial state ─────────────────────────────────────────────────

  useEffect(() => {
    const mode = StorageService.getStorageMode();
    setCloudSyncEnabled(mode === 'cloud-sync');

    AsyncStorage.getItem(LAST_SYNC_KEY).then((v) => {
      if (v) {
        setLastSyncTime(formatSyncTime(parseInt(v, 10)));
      }
    });
  }, []);

  // ── Helpers ────────────────────────────────────────────────────────────

  function formatSyncTime(timestamp: number): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - timestamp;

    if (diff < 60_000) return 'Just now';
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} min ago`;
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;

    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }

  // ── Migration logic (15.3) ────────────────────────────────────────────

  const runMigration = useCallback(async () => {
    if (migrationRunning.current || !user) return;
    migrationRunning.current = true;
    setMigrationDone(false);
    setMigrationError(null);
    setMigrationProgress({ phase: 'Preparing…', completedItems: 0, totalItems: 0, percent: 0 });

    try {
      // Initialize the sync service for this user
      await SyncService.initialize(user.id);

      const result = await SyncService.migrateLocalDataToCloud((progress) => {
        setMigrationProgress(progress);
      });

      if (result.success) {
        await AsyncStorage.setItem(MIGRATION_DONE_KEY, 'true');
        await AsyncStorage.setItem(LAST_SYNC_KEY, String(Date.now()));
        setLastSyncTime('Just now');
        setMigrationDone(true);
      } else {
        setMigrationError(
          result.errors.length > 0
            ? `Migration completed with ${result.errors.length} error(s). Your local data is preserved.`
            : 'Migration failed. Your local data is preserved. You can try again later.'
        );
        // Still mark partial success — cloud-sync stays enabled
        setMigrationDone(true);
      }
    } catch {
      setMigrationError('An unexpected error occurred. Your local data is preserved.');
      setMigrationDone(true);
    } finally {
      migrationRunning.current = false;
    }
  }, [user]);

  // ── Toggle cloud sync ──────────────────────────────────────────────────

  const handleToggleCloudSync = useCallback(async (value: boolean) => {
    if (!isAuthenticated || !user) {
      showConfirm(
        'Account Required',
        'Please sign in to enable cloud sync.',
        [{ text: 'OK', onPress: hideModal, style: 'default' }],
        { icon: 'person-circle-outline', iconColor: Colors.primary }
      );
      return;
    }

    setIsTogglingSync(true);
    try {
      if (value) {
        // Enable cloud sync
        await StorageService.enableCloudSync(user.id);
        setCloudSyncEnabled(true);

        // Check if migration has already been done
        const alreadyMigrated = await AsyncStorage.getItem(MIGRATION_DONE_KEY);
        if (alreadyMigrated !== 'true') {
          // First time — show migration dialog (15.3)
          setShowMigration(true);
          // Migration starts after dialog is shown
          setTimeout(() => runMigration(), 300);
        } else {
          // Already migrated — just initialize sync
          await SyncService.initialize(user.id);
        }
      } else {
        // Disable cloud sync — ask for confirmation
        showConfirm(
          'Disable Cloud Sync',
          'Your local data will be preserved, but changes will no longer sync to the cloud.',
          [
            { text: 'Cancel', onPress: () => { hideModal(); setIsTogglingSync(false); }, style: 'cancel' },
            {
              text: 'Disable',
              style: 'destructive',
              onPress: async () => {
                await SyncService.shutdown();
                await StorageService.disableCloudSync();
                setCloudSyncEnabled(false);
                setIsTogglingSync(false);
                hideModal();
              },
            },
          ],
          { icon: 'cloud-offline-outline', iconColor: Colors.warning }
        );
        return;
      }
    } catch {
      showConfirm(
        'Error',
        'Failed to update sync settings. Please try again.',
        [{ text: 'OK', onPress: hideModal, style: 'default' }],
        { icon: 'alert-circle', iconColor: Colors.error }
      );
    } finally {
      setIsTogglingSync(false);
    }
  }, [isAuthenticated, user, runMigration, showConfirm, hideModal]);

  // ── Logout ─────────────────────────────────────────────────────────────

  const handleLogout = useCallback(() => {
    showConfirm(
      'Log Out',
      'Are you sure you want to log out? Your data is safely backed up in the cloud.',
      [
        { text: 'Cancel', onPress: hideModal, style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            setIsLoggingOut(true);
            try {
              await SyncService.shutdown();

              // Clear all local user data so stale data doesn't persist
              // across user sessions. Cloud data is safe and will be
              // re-downloaded on next login.
              await StorageService.clearAllData();

              await signOut();
              hideModal();
            } catch {
              hideModal();
              setTimeout(() => {
                showConfirm(
                  'Error',
                  'Failed to log out. Please try again.',
                  [{ text: 'OK', onPress: hideModal, style: 'default' }],
                  { icon: 'alert-circle', iconColor: Colors.error }
                );
              }, 300);
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ],
      { icon: 'log-out-outline', iconColor: Colors.error }
    );
  }, [signOut, showConfirm, hideModal]);

  const switchTrackColor = { false: colors.border, true: colors.primary };

  // ── Render: Not authenticated ──────────────────────────────────────────

  if (!isAuthenticated || !user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        {/* Header — matching Settings */}
        <View style={[styles.header, { backgroundColor: colors.background }]}>
          <TouchableOpacity
            style={styles.headerBackBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text variant="large" weight="bold" color={colors.textPrimary}>Account</Text>
          <View style={{ width: 38 }} />
        </View>

        <View style={styles.emptyState}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.primary + '15' }]}>
            <Ionicons name="person-outline" size={48} color={colors.primary} />
          </View>
          <Text variant="large" weight="semiBold" color={colors.textPrimary} style={styles.emptyTitle}>
            Not Signed In
          </Text>
          <Text variant="regular" color={colors.textSecondary} style={styles.emptySubtitle}>
            Sign in to sync your data across devices and keep it safe in the cloud.
          </Text>

          <View style={{ marginTop: Spacing.xl, width: '100%', paddingHorizontal: Spacing.xl }}>
            <Button
              title="Log In / Sign Up"
              variant="primary"
              size="large"
              fullWidth
              onPress={async () => {
                // Remove the local-only flag from storage
                await AsyncStorage.removeItem('@auth_skipped');
                
                // Tell AppNavigator to drop the tabs and show the true Auth stack
                require('react-native').DeviceEventEmitter.emit('RESET_AUTH_SKIPPED');
              }}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ── Render: Authenticated ──────────────────────────────────────────────

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header — matching Settings page style */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={styles.headerBackBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text variant="large" weight="bold" color={colors.textPrimary}>Account</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Sync Status Indicator (16.1) */}
        <SyncStatusIndicator />

        {/* ── Account Info ─────────────────────────────────────────────── */}
        <Section title="Profile" colors={colors} isFirst>
          <SettingRow
            icon="person-circle-outline"
            iconBg={colors.primary}
            label={user.email}
            description={`Member since ${new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}`}
            colors={colors}
            isLast
          />
        </Section>

        {/* ── Cloud Sync ───────────────────────────────────────────────── */}
        <Section title="Cloud Sync" colors={colors}>
          <SettingRow
            icon="cloud-outline"
            iconBg={colors.primary}
            label="Enable Cloud Sync"
            description="Automatically back up your data to the cloud"
            colors={colors}
            right={
              isTogglingSync ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Switch
                  value={cloudSyncEnabled}
                  onValueChange={handleToggleCloudSync}
                  trackColor={switchTrackColor}
                  thumbColor="#fff"
                />
              )
            }
          />

          <SettingRow
            icon={cloudSyncEnabled ? 'cloud-done-outline' : 'phone-portrait-outline'}
            iconBg={cloudSyncEnabled ? Colors.success : colors.textSecondary}
            label="Storage Mode"
            description={cloudSyncEnabled ? 'Cloud Sync — data backed up online' : 'Local Only — data on this device'}
            colors={colors}
            right={
              <View style={[styles.badge, {
                backgroundColor: cloudSyncEnabled ? Colors.success + '18' : colors.border + '40',
              }]}>
                <Text variant="extraSmall" weight="semiBold" color={cloudSyncEnabled ? Colors.success : colors.textSecondary}>
                  {cloudSyncEnabled ? 'ACTIVE' : 'OFF'}
                </Text>
              </View>
            }
            isLast={!cloudSyncEnabled}
          />

          {cloudSyncEnabled && (
            <SettingRow
              icon="time-outline"
              iconBg="#FF9F43"
              label="Last Synced"
              description={lastSyncTime ?? 'Not yet synced'}
              colors={colors}
              isLast
            />
          )}
        </Section>

        {/* ── Account Actions ──────────────────────────────────────────── */}
        <Section title="Actions" colors={colors}>
          <SettingRow
            icon="log-out-outline"
            iconBg={Colors.error}
            label="Log Out"
            description="Sign out of your account"
            colors={colors}
            right={
              isLoggingOut ? (
                <ActivityIndicator size="small" color={Colors.error} />
              ) : (
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              )
            }
            onPress={handleLogout}
            disabled={isLoggingOut}
            isLast
          />
        </Section>

        {/* ── Info footer ──────────────────────────────────────────────── */}
        <View style={styles.infoFooter}>
          <Ionicons name="information-circle-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
          Your data is safely stored in the cloud when sync is enabled.
            Logging out clears local data, but it will be restored automatically on your next login.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── Migration Progress Dialog (15.3) ─────────────────────────────── */}
      <Modal
        visible={showMigration}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (migrationDone) setShowMigration(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.migrationDialog, { backgroundColor: colors.surface }]}>
            {/* Icon */}
            <View style={[styles.migrationIcon, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons
                name={migrationDone ? (migrationError ? 'alert-circle' : 'checkmark-circle') : 'cloud-upload-outline'}
                size={40}
                color={migrationDone && migrationError ? Colors.warning : colors.primary}
              />
            </View>

            {/* Title */}
            <Text variant="large" weight="bold" color={colors.textPrimary} style={styles.migrationTitle}>
              {migrationDone
                ? migrationError
                  ? 'Migration Complete'
                  : 'All Done!'
                : 'Migrating Data'}
            </Text>

            {/* Progress info */}
            {!migrationDone && migrationProgress && (
              <>
                <Text variant="regular" color={colors.textSecondary} style={styles.migrationPhase}>
                  {migrationProgress.phase}
                </Text>

                {/* Progress bar */}
                <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        backgroundColor: colors.primary,
                        width: `${migrationProgress.percent}%`,
                      },
                    ]}
                  />
                </View>

                <Text variant="small" color={colors.textSecondary}>
                  {migrationProgress.completedItems} / {migrationProgress.totalItems} items
                </Text>
              </>
            )}

            {/* Completion message */}
            {migrationDone && (
              <>
                {migrationError ? (
                  <Text variant="regular" color={Colors.warning} style={styles.migrationPhase}>
                    {migrationError}
                  </Text>
                ) : (
                  <Text variant="regular" color={colors.textSecondary} style={styles.migrationPhase}>
                    Your data has been successfully uploaded to the cloud.
                  </Text>
                )}

                <Button
                  title="Done"
                  variant="primary"
                  size="medium"
                  fullWidth
                  onPress={() => setShowMigration(false)}
                  style={styles.migrationButton}
                />

                {migrationError && (
                  <Button
                    title="Retry Migration"
                    variant="outline"
                    size="medium"
                    fullWidth
                    onPress={() => {
                      setMigrationDone(false);
                      setMigrationError(null);
                      setTimeout(() => runMigration(), 300);
                    }}
                    style={styles.migrationRetryButton}
                  />
                )}
              </>
            )}

            {/* Loading spinner when migration is running */}
            {!migrationDone && (
              <ActivityIndicator
                size="small"
                color={colors.primary}
                style={styles.migrationSpinner}
              />
            )}
          </View>
        </View>
      </Modal>

      <ConfirmModal
        visible={modalState.visible}
        title={modalState.title}
        message={modalState.message}
        icon={modalState.icon as any}
        iconColor={modalState.iconColor}
        buttons={modalState.buttons}
        loading={modalState.loading}
        loadingMessage={modalState.loadingMessage}
        onRequestClose={hideModal}
      />
    </SafeAreaView>
  );
};

// ── Styles (matching Settings screen) ────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  headerBackBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },

  // ── Sections (matching Settings) ───────────────────────────────────────
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },

  // ── Setting rows (matching Settings) ───────────────────────────────────
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  settingTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  settingLabel: {
    fontSize: 15,
    fontFamily: 'Poppins_500Medium',
  },
  settingDescription: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    marginTop: 1,
  },

  // ── Badge ──
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  // ── Info footer (matching Settings) ────────────────────────────────────
  infoFooter: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 4,
    paddingTop: 20,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    lineHeight: 18,
  },

  // ── Empty state ──
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  emptyTitle: {
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    textAlign: 'center',
    lineHeight: 22,
  },

  // ── Migration dialog ──
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  migrationDialog: {
    width: '100%',
    borderRadius: BorderRadius.extraLarge,
    padding: Spacing.xl,
    alignItems: 'center',
    ...Shadows.large,
  },
  migrationIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  migrationTitle: {
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  migrationPhase: {
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: 20,
  },
  progressBarBg: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  migrationButton: {
    marginTop: Spacing.md,
  },
  migrationRetryButton: {
    marginTop: Spacing.sm,
  },
  migrationSpinner: {
    marginTop: Spacing.md,
  },
});
