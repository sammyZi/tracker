/**
 * PrivacyConsentScreen
 *
 * One-time privacy policy and data collection consent screen.
 * Shown before the permissions screen on first launch.
 * Lists all data the app collects and why, and requires the user
 * to accept before proceeding.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Text, Button } from '../../components/common';
import { Spacing, BorderRadius } from '../../constants/theme';
import { useTheme } from '../../hooks';

interface PrivacyConsentScreenProps {
  onAccept: () => void;
}

interface DataItem {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  title: string;
  description: string;
  required: boolean;
}

export const PrivacyConsentScreen: React.FC<PrivacyConsentScreenProps> = ({ onAccept }) => {
  const { colors, isDark } = useTheme();
  const styles = React.useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const [accepted, setAccepted] = useState(false);

  // Animated checkbox
  const checkScale = useSharedValue(0);

  useEffect(() => {
    checkScale.value = withSpring(accepted ? 1 : 0, { damping: 12, stiffness: 200 });
  }, [accepted]);

  const checkAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 0.8 + checkScale.value * 0.2 }],
    backgroundColor: checkScale.value > 0.5 ? colors.primary : 'transparent',
    borderColor: checkScale.value > 0.5 ? colors.primary : colors.textSecondary + '60',
  }));

  const dataItems: DataItem[] = [
    {
      icon: 'location',
      iconColor: '#6C63FF',
      title: 'Location Data',
      description:
        'GPS coordinates during active tracking to map your route, calculate distance, pace, and elevation.',
      required: true,
    },
    {
      icon: 'footsteps',
      iconColor: '#00D9A3',
      title: 'Activity & Motion',
      description:
        'Step counts and motion data to detect activity and provide accurate fitness metrics.',
      required: false,
    },
    {
      icon: 'person',
      iconColor: '#4ECDC4',
      title: 'Profile Info',
      description:
        'Optional weight, height, and preferences to improve calorie calculations.',
      required: false,
    },
    {
      icon: 'cloud-upload',
      iconColor: '#FF6B6B',
      title: 'Cloud Sync',
      description:
        'If you create an account, data syncs to our secure cloud for backup. Fully optional — works offline.',
      required: false,
    },
    {
      icon: 'fitness',
      iconColor: '#FFD93D',
      title: 'Fitness Metrics',
      description:
        'Distance, pace, calories, and elevation calculated from your location and motion data.',
      required: true,
    },
  ];

  const commitments = [
    { icon: 'close-circle', text: 'We never sell your data', negative: true },
    { icon: 'close-circle', text: 'No ads or trackers', negative: true },
    { icon: 'checkmark-circle', text: 'Location only during workouts', negative: false },
    { icon: 'checkmark-circle', text: 'All data encrypted', negative: false },
    { icon: 'checkmark-circle', text: 'Delete your data anytime', negative: false },
    { icon: 'checkmark-circle', text: 'Works fully offline', negative: false },
  ];

  const handlePrivacyPolicy = () => {
    Linking.openURL('https://github.com');
  };

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
          <View style={styles.shieldWrapper}>
            <View style={styles.shieldRing}>
              <Ionicons name="shield-checkmark" size={44} color={colors.primary} />
            </View>
          </View>
          <Text variant="large" weight="bold" color={colors.textPrimary} align="center">
            Your Privacy Matters
          </Text>
          <Text variant="regular" color={colors.textSecondary} align="center" style={styles.subtitle}>
            Here's what Stride collects and why
          </Text>
        </Animated.View>

        {/* Data Collection Cards */}
        <View style={styles.dataList}>
          {dataItems.map((item, index) => (
            <Animated.View
              key={index}
              entering={FadeInDown.duration(400).delay(200 + index * 80)}
            >
              <View style={styles.dataCard}>
                <View style={styles.dataCardLeft}>
                  <View style={[styles.dataIconCircle, { backgroundColor: item.iconColor + '14' }]}>
                    <Ionicons name={item.icon} size={20} color={item.iconColor} />
                  </View>
                </View>
                <View style={styles.dataCardContent}>
                  <View style={styles.dataCardTitleRow}>
                    <Text variant="regular" weight="semiBold" color={colors.textPrimary} style={styles.dataTitle}>
                      {item.title}
                    </Text>
                    <View style={[styles.badge, {
                      backgroundColor: item.required ? colors.primary + '15' : colors.textSecondary + '10',
                    }]}>
                      <Text
                        variant="small"
                        style={{
                          color: item.required ? colors.primary : colors.textSecondary,
                          fontSize: 9,
                          fontWeight: '700',
                          letterSpacing: 0.5,
                        }}
                      >
                        {item.required ? 'REQUIRED' : 'OPTIONAL'}
                      </Text>
                    </View>
                  </View>
                  <Text variant="small" color={colors.textSecondary} style={styles.dataDescription}>
                    {item.description}
                  </Text>
                </View>
              </View>
            </Animated.View>
          ))}
        </View>

        {/* Commitments */}
        <Animated.View entering={FadeInDown.duration(400).delay(650)} style={styles.commitmentsCard}>
          <Text variant="regular" weight="semiBold" color={colors.textPrimary} style={styles.commitmentsTitle}>
            Our Promises
          </Text>
          <View style={styles.commitmentsGrid}>
            {commitments.map((c, i) => (
              <View key={i} style={styles.commitmentChip}>
                <Ionicons
                  name={c.icon as any}
                  size={15}
                  color={c.negative ? colors.error : colors.success}
                />
                <Text variant="small" color={colors.textPrimary} style={styles.commitmentText}>
                  {c.text}
                </Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Privacy Policy Link */}
        <Animated.View entering={FadeIn.duration(400).delay(750)}>
          <TouchableOpacity style={styles.policyLink} onPress={handlePrivacyPolicy} activeOpacity={0.6}>
            <Ionicons name="document-text-outline" size={16} color={colors.primary} />
            <Text variant="small" weight="semiBold" color={colors.primary} style={styles.policyLinkText}>
              Read full Privacy Policy
            </Text>
            <Ionicons name="chevron-forward" size={14} color={colors.primary} />
          </TouchableOpacity>
        </Animated.View>

        {/* Consent Checkbox */}
        <Animated.View entering={FadeInDown.duration(400).delay(800)}>
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setAccepted(!accepted)}
            activeOpacity={0.7}
          >
            <Animated.View style={[styles.checkbox, checkAnimStyle]}>
              {accepted && <Ionicons name="checkmark" size={14} color="#fff" />}
            </Animated.View>
            <Text variant="small" color={colors.textSecondary} style={styles.checkboxText}>
              I understand and agree to how Stride collects and uses my data as described above.
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      {/* Action Button */}
      <Animated.View entering={FadeInDown.duration(400).delay(900)} style={styles.actions}>
        <Button
          title="Accept & Continue"
          variant="primary"
          size="large"
          fullWidth
          onPress={onAccept}
          disabled={!accepted}
          icon={accepted ? <Ionicons name="arrow-forward" size={18} color="#fff" /> : undefined}
          iconPosition="right"
          style={!accepted ? styles.buttonDisabled : undefined}
        />
      </Animated.View>
    </SafeAreaView>
  );
};

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
  shieldWrapper: {
    marginBottom: Spacing.lg,
  },
  shieldRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primary + '10',
    borderWidth: 2,
    borderColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    marginTop: Spacing.xs,
    lineHeight: 22,
    opacity: 0.8,
  },

  // ── Data Cards ──────────────────────────────────────
  dataList: {
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  dataCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: BorderRadius.medium,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: colors.border + (isDark ? '' : '80'),
  },
  dataCardLeft: {
    marginRight: Spacing.md,
    paddingTop: 2,
  },
  dataIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dataCardContent: {
    flex: 1,
  },
  dataCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  dataTitle: {
    flex: 1,
  },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: Spacing.sm,
  },
  dataDescription: {
    lineHeight: 17,
    opacity: 0.85,
  },

  // ── Commitments ─────────────────────────────────────
  commitmentsCard: {
    backgroundColor: colors.surface,
    borderRadius: BorderRadius.medium,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: colors.border + (isDark ? '' : '80'),
  },
  commitmentsTitle: {
    marginBottom: Spacing.md,
  },
  commitmentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  commitmentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 5,
  },
  commitmentText: {
    lineHeight: 16,
  },

  // ── Policy Link ─────────────────────────────────────
  policyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.sm,
  },
  policyLinkText: {
    // intentionally empty — weight/color set via props
  },

  // ── Checkbox ────────────────────────────────────────
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxText: {
    flex: 1,
    lineHeight: 19,
  },

  // ── Actions ─────────────────────────────────────────
  actions: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
});
