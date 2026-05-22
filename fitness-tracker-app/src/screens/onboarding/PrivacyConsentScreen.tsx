/**
 * PrivacyConsentScreen
 *
 * One-time privacy policy and data collection consent screen.
 * Shown before the permissions screen on first launch.
 * Lists all data the app collects and why, and requires the user
 * to accept before proceeding.
 */

import React, { useState } from 'react';
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
import { Text, Button } from '../../components/common';
import { Spacing, BorderRadius, Shadows } from '../../constants/theme';
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
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const [accepted, setAccepted] = useState(false);

  const dataItems: DataItem[] = [
    {
      icon: 'location',
      iconColor: '#6C63FF',
      title: 'Location Data',
      description:
        'GPS coordinates are collected during active tracking sessions to map your route, calculate distance, pace, and elevation. Background location is used only during active workouts.',
      required: true,
    },
    {
      icon: 'footsteps',
      iconColor: '#00D9A3',
      title: 'Activity & Motion Data',
      description:
        'Step counts and motion sensor data are used to detect walking/running activity and provide accurate fitness metrics like calories burned.',
      required: false,
    },
    {
      icon: 'person',
      iconColor: '#4ECDC4',
      title: 'Profile Information',
      description:
        'Weight, height, and fitness preferences you optionally provide to improve calorie calculations. Your email is collected if you create an account.',
      required: false,
    },
    {
      icon: 'cloud-upload',
      iconColor: '#FF6B6B',
      title: 'Cloud Sync Data',
      description:
        'If you create an account, your activities, goals, and profile are synced to our secure cloud (Supabase) so you can back up and restore your data. This is optional — the app works fully offline.',
      required: false,
    },
    {
      icon: 'fitness',
      iconColor: '#FFD93D',
      title: 'Health & Fitness Metrics',
      description:
        'Distance, pace, speed, duration, calories, and elevation are calculated from your location and motion data and stored as part of your activity history.',
      required: true,
    },
  ];

  const handlePrivacyPolicy = () => {
    // Open the privacy policy — for now open in-app
    // In production, this would link to the hosted URL
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
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="shield-checkmark" size={56} color={colors.primary} />
          </View>
          <Text variant="extraLarge" weight="bold" color={colors.textPrimary} align="center">
            Your Privacy Matters
          </Text>
          <Text variant="regular" color={colors.textSecondary} align="center" style={styles.subtitle}>
            Before you get started, here's exactly what data Stride collects and how it's used.
          </Text>
        </View>

        {/* Data Collection List */}
        <View style={styles.dataList}>
          {dataItems.map((item, index) => (
            <View key={index} style={styles.dataCard}>
              <View style={styles.dataHeader}>
                <View style={[styles.dataIconContainer, { backgroundColor: item.iconColor + '18' }]}>
                  <Ionicons name={item.icon} size={24} color={item.iconColor} />
                </View>
                <View style={styles.dataInfo}>
                  <Text variant="medium" weight="semiBold" color={colors.textPrimary}>
                    {item.title}
                  </Text>
                  <View style={[styles.badge, {
                    backgroundColor: item.required ? colors.primary + '20' : colors.textSecondary + '15',
                  }]}>
                    <Text
                      variant="small"
                      style={{
                        color: item.required ? colors.primary : colors.textSecondary,
                        fontSize: 10,
                        fontWeight: '600',
                      }}
                    >
                      {item.required ? 'REQUIRED' : 'OPTIONAL'}
                    </Text>
                  </View>
                </View>
              </View>
              <Text variant="small" color={colors.textSecondary} style={styles.dataDescription}>
                {item.description}
              </Text>
            </View>
          ))}
        </View>

        {/* Commitments */}
        <View style={styles.commitmentsSection}>
          <Text variant="medium" weight="semiBold" color={colors.textPrimary} style={styles.commitmentsTitle}>
            Our Commitments
          </Text>
          <View style={styles.commitmentsList}>
            {[
              { icon: 'close-circle', text: 'We never sell your data to third parties', color: '#EF4444' },
              { icon: 'close-circle', text: 'No ads or advertising trackers', color: '#EF4444' },
              { icon: 'checkmark-circle', text: 'Location is only tracked during active workouts', color: '#00D9A3' },
              { icon: 'checkmark-circle', text: 'All data is encrypted in transit and at rest', color: '#00D9A3' },
              { icon: 'checkmark-circle', text: 'You can delete all your data at any time', color: '#00D9A3' },
              { icon: 'checkmark-circle', text: 'Works fully offline without an account', color: '#00D9A3' },
            ].map((commitment, index) => (
              <View key={index} style={styles.commitmentRow}>
                <Ionicons name={commitment.icon as any} size={18} color={commitment.color} />
                <Text variant="small" color={colors.textPrimary} style={styles.commitmentText}>
                  {commitment.text}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Privacy Policy Link */}
        <TouchableOpacity style={styles.policyLink} onPress={handlePrivacyPolicy}>
          <Ionicons name="document-text-outline" size={18} color={colors.primary} />
          <Text variant="small" color={colors.primary} style={styles.policyLinkText}>
            Read full Privacy Policy
          </Text>
          <Ionicons name="open-outline" size={14} color={colors.primary} />
        </TouchableOpacity>

        {/* Consent Checkbox */}
        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setAccepted(!accepted)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, {
            backgroundColor: accepted ? colors.primary : 'transparent',
            borderColor: accepted ? colors.primary : colors.textSecondary,
          }]}>
            {accepted && <Ionicons name="checkmark" size={16} color="#fff" />}
          </View>
          <Text variant="small" color={colors.textPrimary} style={styles.checkboxText}>
            I understand and agree to how Stride collects and uses my data as described above and in the Privacy Policy.
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Action Button */}
      <View style={styles.actions}>
        <Button
          title="Accept & Continue"
          variant="primary"
          onPress={onAccept}
          disabled={!accepted}
          style={[styles.button, !accepted && styles.buttonDisabled]}
        />
      </View>
    </SafeAreaView>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  subtitle: {
    marginTop: Spacing.sm,
    lineHeight: 22,
    paddingHorizontal: Spacing.md,
  },
  dataList: {
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  dataCard: {
    backgroundColor: colors.surface,
    borderRadius: BorderRadius.large,
    padding: Spacing.md,
    ...Shadows.small,
  },
  dataHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  dataIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  dataInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  dataDescription: {
    lineHeight: 18,
    marginTop: 4,
  },
  commitmentsSection: {
    marginBottom: Spacing.xl,
  },
  commitmentsTitle: {
    marginBottom: Spacing.md,
  },
  commitmentsList: {
    backgroundColor: colors.surface,
    borderRadius: BorderRadius.large,
    padding: Spacing.md,
    gap: Spacing.sm,
    ...Shadows.small,
  },
  commitmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  commitmentText: {
    flex: 1,
    lineHeight: 20,
  },
  policyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.md,
  },
  policyLinkText: {
    fontWeight: '600',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxText: {
    flex: 1,
    lineHeight: 20,
  },
  actions: {
    padding: Spacing.xl,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  button: {
    marginBottom: 0,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
