/**
 * PermissionsScreen
 * Requests all necessary permissions when app first loads.
 * Premium onboarding UI with staggered animations.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Location from 'expo-location';
import { Pedometer } from 'expo-sensors';
import { Text, Button, ConfirmModal } from '../../components/common';
import { useConfirmModal } from '../../hooks/useConfirmModal';
import { Spacing, BorderRadius } from '../../constants/theme';
import BatteryOptimizationService from '../../services/battery/BatteryOptimizationService';
import { useTheme } from '../../hooks';

interface PermissionsScreenProps {
  onComplete: () => void;
}

type PermState = 'pending' | 'granted' | 'denied';

interface PermissionStatus {
  location: PermState;
  backgroundLocation: PermState;
  motion: PermState;
}

// ── Permission card config ──────────────────────────────────────────────────

interface PermCardConfig {
  key: keyof PermissionStatus;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  title: string;
  subtitle: string;
  description: string;
}

export const PermissionsScreen: React.FC<PermissionsScreenProps> = ({ onComplete }) => {
  const { colors, isDark } = useTheme();
  const styles = React.useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const { modalState, showConfirm, hideModal } = useConfirmModal();
  const [permissions, setPermissions] = useState<PermissionStatus>({
    location: 'pending',
    backgroundLocation: 'pending',
    motion: 'pending',
  });
  const [isRequesting, setIsRequesting] = useState(false);

  // Button pulse animation
  const buttonScale = useSharedValue(1);

  useEffect(() => {
    const pulse = setInterval(() => {
      if (!isRequesting) {
        buttonScale.value = withSpring(1.02, { damping: 8 });
        setTimeout(() => {
          buttonScale.value = withSpring(1, { damping: 8 });
        }, 400);
      }
    }, 3000);
    return () => clearInterval(pulse);
  }, [isRequesting]);

  const buttonAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const permCards: PermCardConfig[] = [
    {
      key: 'location',
      icon: 'location',
      color: colors.primary,
      title: 'Location Access',
      subtitle: 'Required',
      description: 'Track your route, distance, speed, and pace during workouts.',
    },
    {
      key: 'backgroundLocation',
      icon: 'navigate',
      color: colors.info,
      title: 'Background Location',
      subtitle: 'Recommended',
      description: 'Keep tracking when screen is off or using other apps.',
    },
    {
      key: 'motion',
      icon: 'footsteps',
      color: colors.success,
      title: 'Motion & Fitness',
      subtitle: 'Optional',
      description: 'Step counting and activity recognition for detailed insights.',
    },
  ];

  useEffect(() => {
    checkExistingPermissions();
  }, []);

  const checkExistingPermissions = async () => {
    try {
      const { status: locationStatus } = await Location.getForegroundPermissionsAsync();
      const { status: backgroundStatus } = await Location.getBackgroundPermissionsAsync();

      let motionStatus: PermState = 'pending';
      try {
        if (Platform.OS === 'android' && Platform.Version >= 29) {
          const granted = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION
          );
          motionStatus = granted ? 'granted' : 'pending';
        } else {
          const available = await Pedometer.isAvailableAsync();
          motionStatus = available ? 'granted' : 'denied';
        }
      } catch {
        motionStatus = 'denied';
      }

      setPermissions({
        location: locationStatus === 'granted' ? 'granted' : 'pending',
        backgroundLocation: backgroundStatus === 'granted' ? 'granted' : 'pending',
        motion: motionStatus,
      });

      if (
        locationStatus === 'granted' &&
        backgroundStatus === 'granted' &&
        motionStatus === 'granted'
      ) {
        setTimeout(onComplete, 500);
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
    }
  };

  const requestAllPermissions = async () => {
    setIsRequesting(true);

    try {
      // 1. Foreground location
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      setPermissions(prev => ({
        ...prev,
        location: locationStatus === 'granted' ? 'granted' : 'denied',
      }));

      if (locationStatus !== 'granted') {
        showConfirm(
          'Location Permission Required',
          'Location permission is required to track your activities. Please enable it in settings.',
          [{ text: 'OK', onPress: hideModal, style: 'default' }],
          { icon: 'location', iconColor: colors.error }
        );
        setIsRequesting(false);
        return;
      }

      // 2. Background location
      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      setPermissions(prev => ({
        ...prev,
        backgroundLocation: backgroundStatus === 'granted' ? 'granted' : 'denied',
      }));

      // 3. Motion/activity recognition
      try {
        if (Platform.OS === 'android' && Platform.Version >= 29) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION,
            {
              title: 'Activity Recognition Permission',
              message: 'This app needs access to your physical activity to count steps.',
              buttonPositive: 'OK',
              buttonNegative: 'Cancel',
            }
          );
          setPermissions(prev => ({
            ...prev,
            motion: granted === PermissionsAndroid.RESULTS.GRANTED ? 'granted' : 'denied',
          }));
        } else {
          const available = await Pedometer.isAvailableAsync();
          setPermissions(prev => ({
            ...prev,
            motion: available ? 'granted' : 'denied',
          }));
        }
      } catch {
        setPermissions(prev => ({ ...prev, motion: 'denied' }));
      }

      // If location granted, proceed
      if (locationStatus === 'granted') {
        if (Platform.OS === 'android' && backgroundStatus === 'granted') {
          try {
            await BatteryOptimizationService.ensureBatteryExemption('tracking', true);
          } catch (error) {
            console.log('Battery optimization request error:', error);
          }
        }
        setTimeout(onComplete, 500);
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
      showConfirm(
        'Error',
        'Failed to request permissions. Please try again.',
        [{ text: 'OK', onPress: hideModal, style: 'default' }],
        { icon: 'alert-circle', iconColor: colors.error }
      );
    } finally {
      setIsRequesting(false);
    }
  };

  const getStatusConfig = (status: PermState) => {
    switch (status) {
      case 'granted':
        return { icon: 'checkmark-circle' as const, color: colors.success, label: 'Granted' };
      case 'denied':
        return { icon: 'close-circle' as const, color: colors.error, label: 'Denied' };
      default:
        return { icon: 'ellipse-outline' as const, color: colors.textSecondary + '60', label: 'Pending' };
    }
  };

  const allGranted = permissions.location === 'granted';
  const grantedCount = Object.values(permissions).filter(v => v === 'granted').length;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(500).delay(100)} style={styles.header}>
          <View style={styles.iconRing}>
            <Ionicons name="key" size={40} color={colors.primary} />
          </View>
          <Text variant="large" weight="bold" color={colors.textPrimary} align="center">
            Set Up Permissions
          </Text>
          <Text variant="regular" color={colors.textSecondary} align="center" style={styles.subtitle}>
            Stride needs a few permissions for accurate tracking
          </Text>
        </Animated.View>

        {/* Progress indicator */}
        <Animated.View entering={FadeIn.duration(400).delay(250)} style={styles.progressRow}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${(grantedCount / 3) * 100}%`, backgroundColor: colors.primary }]} />
          </View>
          <Text variant="small" color={colors.textSecondary} style={styles.progressLabel}>
            {grantedCount}/3 granted
          </Text>
        </Animated.View>

        {/* Permission Cards */}
        <View style={styles.permList}>
          {permCards.map((card, index) => {
            const status = getStatusConfig(permissions[card.key]);
            const isGranted = permissions[card.key] === 'granted';

            return (
              <Animated.View
                key={card.key}
                entering={FadeInDown.duration(400).delay(300 + index * 100)}
              >
                <View style={[
                  styles.permCard,
                  isGranted && styles.permCardGranted,
                ]}>
                  {/* Left icon */}
                  <View style={[styles.permIconWrap, { backgroundColor: card.color + '12' }]}>
                    <Ionicons name={card.icon} size={24} color={card.color} />
                  </View>

                  {/* Content */}
                  <View style={styles.permContent}>
                    <View style={styles.permTitleRow}>
                      <Text variant="regular" weight="semiBold" color={colors.textPrimary}>
                        {card.title}
                      </Text>
                      <View style={[styles.statusBadge, { backgroundColor: status.color + '15' }]}>
                        <Ionicons name={status.icon} size={13} color={status.color} />
                        <Text variant="small" style={{ color: status.color, fontSize: 10, fontWeight: '600' }}>
                          {status.label}
                        </Text>
                      </View>
                    </View>
                    <Text variant="small" color={colors.textSecondary} style={styles.permSubtitle}>
                      {card.subtitle}
                    </Text>
                    <Text variant="small" color={colors.textSecondary} style={styles.permDescription}>
                      {card.description}
                    </Text>
                  </View>
                </View>
              </Animated.View>
            );
          })}
        </View>

        {/* Info cards */}
        <Animated.View entering={FadeInDown.duration(400).delay(650)} style={styles.infoRow}>
          <View style={styles.infoChip}>
            <Ionicons name="lock-closed" size={16} color={colors.success} />
            <Text variant="small" color={colors.textPrimary} style={styles.infoChipText}>
              Privacy first — data stays on device
            </Text>
          </View>
          <View style={styles.infoChip}>
            <Ionicons name="battery-charging" size={16} color={colors.primary} />
            <Text variant="small" color={colors.textPrimary} style={styles.infoChipText}>
              Battery optimized tracking
            </Text>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Action Buttons */}
      <Animated.View entering={FadeInDown.duration(400).delay(750)} style={styles.actions}>
        {allGranted ? (
          <Button
            title="Continue"
            variant="primary"
            size="large"
            fullWidth
            onPress={onComplete}
            icon={<Ionicons name="arrow-forward" size={18} color="#fff" />}
            iconPosition="right"
          />
        ) : (
          <>
            <Animated.View style={buttonAnimStyle}>
              <Button
                title={isRequesting ? "Requesting..." : "Grant Permissions"}
                variant="primary"
                size="large"
                fullWidth
                onPress={requestAllPermissions}
                disabled={isRequesting}
                loading={isRequesting}
                icon={!isRequesting ? <Ionicons name="shield-checkmark" size={18} color="#fff" /> : undefined}
                iconPosition="left"
              />
            </Animated.View>
            <TouchableOpacity
              style={styles.skipBtn}
              onPress={onComplete}
              disabled={isRequesting}
              activeOpacity={0.6}
            >
              <Text variant="regular" color={colors.textSecondary} style={styles.skipText}>
                Skip for now
              </Text>
            </TouchableOpacity>
          </>
        )}
      </Animated.View>

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

// ── Styles ───────────────────────────────────────────────────────────────────

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },

  // ── Header ──────────────────────────────────────────
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  iconRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primary + '10',
    borderWidth: 2,
    borderColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  subtitle: {
    marginTop: Spacing.xs,
    lineHeight: 22,
    opacity: 0.8,
  },

  // ── Progress ────────────────────────────────────────
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressLabel: {
    minWidth: 60,
    textAlign: 'right',
  },

  // ── Permission Cards ────────────────────────────────
  permList: {
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  permCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: BorderRadius.medium,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: colors.border + (isDark ? '' : '80'),
  },
  permCardGranted: {
    borderColor: colors.success + '40',
    backgroundColor: isDark ? colors.surface : colors.success + '04',
  },
  permIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  permContent: {
    flex: 1,
  },
  permTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  permSubtitle: {
    marginTop: 1,
    opacity: 0.65,
    fontSize: 11,
  },
  permDescription: {
    marginTop: 6,
    lineHeight: 18,
    opacity: 0.85,
  },

  // ── Info chips ──────────────────────────────────────
  infoRow: {
    gap: Spacing.sm,
  },
  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: BorderRadius.medium,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: colors.border + (isDark ? '' : '80'),
  },
  infoChipText: {
    flex: 1,
    lineHeight: 18,
  },

  // ── Actions ─────────────────────────────────────────
  actions: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    marginTop: Spacing.xs,
  },
  skipText: {
    opacity: 0.7,
  },
});
