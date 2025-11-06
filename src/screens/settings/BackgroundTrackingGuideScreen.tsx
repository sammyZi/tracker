/**
 * Background Tracking Guide Screen
 * 
 * Displays comprehensive guide for preventing the app from closing in background
 * Includes manufacturer-specific instructions and troubleshooting steps
 */

import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../components/common';
import { Colors, Spacing } from '../../constants/theme';
import { useTheme } from '../../hooks';

interface GuideStepProps {
  number: number;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const GuideStep: React.FC<GuideStepProps> = ({ number, title, description, icon }) => {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.stepContainer, { backgroundColor: colors.surface }]}>
      <View style={styles.stepHeader}>
        <View style={[styles.stepNumber, { backgroundColor: Colors.primary }]}>
          <Text style={styles.stepNumberText}>{number}</Text>
        </View>
        <Ionicons name={icon} size={24} color={Colors.primary} style={styles.stepIcon} />
        <Text style={styles.stepTitle}>{title}</Text>
      </View>
      <Text style={styles.stepDescription}>{description}</Text>
    </View>
  );
};

interface ManufacturerGuideProps {
  manufacturer: string;
  steps: string[];
  icon: keyof typeof Ionicons.glyphMap;
}

const ManufacturerGuide: React.FC<ManufacturerGuideProps> = ({ manufacturer, steps, icon }) => {
  const { colors } = useTheme();
  const [expanded, setExpanded] = React.useState(false);

  return (
    <View style={[styles.manufacturerContainer, { backgroundColor: colors.surface }]}>
      <TouchableOpacity
        style={styles.manufacturerHeader}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={styles.manufacturerTitleRow}>
          <Ionicons name={icon} size={24} color={Colors.primary} />
          <Text style={styles.manufacturerTitle}>{manufacturer}</Text>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={24}
          color={Colors.textSecondary}
        />
      </TouchableOpacity>
      
      {expanded && (
        <View style={styles.manufacturerSteps}>
          {steps.map((step, index) => (
            <View key={index} style={styles.manufacturerStep}>
              <View style={styles.bulletPoint} />
              <Text style={styles.manufacturerStepText}>{step}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export const BackgroundTrackingGuideScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors } = useTheme();

  const openBatterySettings = () => {
    if (Platform.OS === 'android') {
      Linking.openSettings();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text variant="large" weight="bold" color={colors.textPrimary}>Background Tracking</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Introduction */}
        <View style={[styles.introSection, { backgroundColor: Colors.primaryLight }]}>
          <Ionicons name="information-circle" size={32} color={Colors.primary} />
          <Text style={styles.introTitle}>Keep Your Workouts Running</Text>
          <Text style={styles.introText}>
            Android aggressively manages battery by closing background apps. Follow these steps to ensure your workouts continue tracking even when the app is in the background.
          </Text>
        </View>

        {/* Automatic Setup */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✓ Automatic Setup</Text>
          <Text style={styles.sectionDescription}>
            The app automatically handles these for you:
          </Text>
          
          <View style={[styles.autoFeature, { backgroundColor: colors.surface }]}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
            <Text style={styles.autoFeatureText}>Battery optimization exemption request</Text>
          </View>
          <View style={[styles.autoFeature, { backgroundColor: colors.surface }]}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
            <Text style={styles.autoFeatureText}>Foreground service with notification</Text>
          </View>
          <View style={[styles.autoFeature, { backgroundColor: colors.surface }]}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
            <Text style={styles.autoFeatureText}>Separate background process</Text>
          </View>
        </View>

        {/* Manual Steps */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Manual Steps (If App Still Closes)</Text>
          
          <GuideStep
            number={1}
            title="Disable Battery Optimization"
            description="Settings → Apps → Fitness Tracker → Battery → Battery optimization → Select 'All apps' → Find 'Fitness Tracker' → Select 'Don't optimize'"
            icon="battery-charging"
          />

          <GuideStep
            number={2}
            title="Allow Background Activity"
            description="Settings → Apps → Fitness Tracker → Battery → Enable 'Allow background activity' and 'Unrestricted data usage'"
            icon="play-circle"
          />

          <GuideStep
            number={3}
            title="Lock App in Recent Apps"
            description="Open Recent Apps (square button) → Find Fitness Tracker → Tap app icon → Select 'Lock' or 'Pin'"
            icon="lock-closed"
          />

          <TouchableOpacity
            style={[styles.settingsButton, { backgroundColor: Colors.primary }]}
            onPress={openBatterySettings}
            activeOpacity={0.8}
          >
            <Ionicons name="settings" size={20} color="#fff" />
            <Text style={styles.settingsButtonText}>Open App Settings</Text>
          </TouchableOpacity>
        </View>

        {/* Manufacturer-Specific */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Manufacturer-Specific Settings</Text>
          <Text style={styles.sectionDescription}>
            Some manufacturers have additional battery optimization. Tap your device brand:
          </Text>

          <ManufacturerGuide
            manufacturer="Samsung"
            icon="phone-portrait"
            steps={[
              'Settings → Apps → Fitness Tracker → Battery → Set to "Unrestricted"',
              'Settings → Device care → Battery → Background usage limits',
              'Remove app from "Sleeping apps" and "Deep sleeping apps"',
            ]}
          />

          <ManufacturerGuide
            manufacturer="Xiaomi / MIUI"
            icon="phone-portrait"
            steps={[
              'Settings → Apps → Manage apps → Fitness Tracker',
              'Autostart: Enable',
              'Battery saver: No restrictions',
              'Settings → Battery & performance → App battery saver',
              'Find app and set to "No restrictions"',
            ]}
          />

          <ManufacturerGuide
            manufacturer="Huawei"
            icon="phone-portrait"
            steps={[
              'Settings → Apps → Apps → Fitness Tracker',
              'Battery → App launch: Manual, enable all three options',
              'Settings → Battery → App launch',
              'Find app and disable "Manage automatically"',
            ]}
          />

          <ManufacturerGuide
            manufacturer="OnePlus / Oppo"
            icon="phone-portrait"
            steps={[
              'Settings → Battery → Battery optimization',
              'Find app and select "Don\'t optimize"',
              'Settings → Apps → Fitness Tracker → Battery',
              'Enable "Allow background activity"',
            ]}
          />

          <ManufacturerGuide
            manufacturer="Vivo"
            icon="phone-portrait"
            steps={[
              'Settings → Battery → Background power consumption management',
              'Find app and enable "Allow high background power consumption"',
            ]}
          />
        </View>

        {/* Verification */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Verification Steps</Text>
          <Text style={styles.sectionDescription}>
            To verify background tracking is working:
          </Text>

          <View style={[styles.verificationStep, { backgroundColor: colors.surface }]}>
            <Text style={styles.verificationNumber}>1</Text>
            <Text style={styles.verificationText}>Start a workout</Text>
          </View>
          <View style={[styles.verificationStep, { backgroundColor: colors.surface }]}>
            <Text style={styles.verificationNumber}>2</Text>
            <Text style={styles.verificationText}>Press home button (don't swipe away)</Text>
          </View>
          <View style={[styles.verificationStep, { backgroundColor: colors.surface }]}>
            <Text style={styles.verificationNumber}>3</Text>
            <Text style={styles.verificationText}>You should see a persistent notification</Text>
          </View>
          <View style={[styles.verificationStep, { backgroundColor: colors.surface }]}>
            <Text style={styles.verificationNumber}>4</Text>
            <Text style={styles.verificationText}>Wait 2-3 minutes</Text>
          </View>
          <View style={[styles.verificationStep, { backgroundColor: colors.surface }]}>
            <Text style={styles.verificationNumber}>5</Text>
            <Text style={styles.verificationText}>Return to app - distance should have increased</Text>
          </View>
        </View>

        {/* Troubleshooting */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Troubleshooting</Text>

          <View style={[styles.troubleshootItem, { backgroundColor: colors.surface }]}>
            <Ionicons name="alert-circle" size={24} color={Colors.warning} />
            <View style={styles.troubleshootContent}>
              <Text style={styles.troubleshootTitle}>App still closes after 5-10 minutes</Text>
              <Text style={styles.troubleshootText}>
                • Complete ALL steps above{'\n'}
                • Try disabling Adaptive Battery{'\n'}
                • Ensure location is "Allow all the time"
              </Text>
            </View>
          </View>

          <View style={[styles.troubleshootItem, { backgroundColor: colors.surface }]}>
            <Ionicons name="alert-circle" size={24} color={Colors.warning} />
            <View style={styles.troubleshootContent}>
              <Text style={styles.troubleshootTitle}>No notification showing</Text>
              <Text style={styles.troubleshootText}>
                • Check notification permissions are enabled{'\n'}
                • The notification is required for foreground service
              </Text>
            </View>
          </View>

          <View style={[styles.troubleshootItem, { backgroundColor: colors.surface }]}>
            <Ionicons name="alert-circle" size={24} color={Colors.warning} />
            <View style={styles.troubleshootContent}>
              <Text style={styles.troubleshootTitle}>GPS not accurate</Text>
              <Text style={styles.troubleshootText}>
                • Make sure you're outdoors with clear sky view{'\n'}
                • Wait 30-60 seconds for GPS to lock{'\n'}
                • Check "High accuracy" location mode is enabled
              </Text>
            </View>
          </View>
        </View>

        {/* Technical Details */}
        <View style={[styles.technicalSection, { backgroundColor: colors.surface }]}>
          <Ionicons name="code-slash" size={24} color={Colors.textSecondary} />
          <Text style={styles.technicalTitle}>Technical Details</Text>
          <Text style={styles.technicalText}>
            This app uses foreground services with persistent notifications, separate background processes, battery optimization exemptions, and wake locks. These are standard practices for fitness and navigation apps that require continuous location tracking.
          </Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 60,
    paddingHorizontal: Spacing.lg,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  introSection: {
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  introTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.primary,
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  introText: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  autoFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  autoFeatureText: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textPrimary,
    marginLeft: 12,
  },
  stepContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: '#fff',
  },
  stepIcon: {
    marginLeft: 12,
  },
  stepTitle: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.textPrimary,
    marginLeft: 8,
    flex: 1,
  },
  stepDescription: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    lineHeight: 20,
    marginLeft: 40,
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  settingsButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#fff',
    marginLeft: 8,
  },
  manufacturerContainer: {
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  manufacturerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  manufacturerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  manufacturerTitle: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.textPrimary,
    marginLeft: 12,
  },
  manufacturerSteps: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  manufacturerStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginTop: 7,
    marginRight: 12,
  },
  manufacturerStepText: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    lineHeight: 20,
    flex: 1,
  },
  verificationStep: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  verificationNumber: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.primary,
    marginRight: 12,
    width: 24,
  },
  verificationText: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textPrimary,
    flex: 1,
  },
  troubleshootItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  troubleshootContent: {
    flex: 1,
    marginLeft: 12,
  },
  troubleshootTitle: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  troubleshootText: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  technicalSection: {
    padding: 20,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  technicalTitle: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.textSecondary,
    marginTop: 8,
    marginBottom: 8,
  },
  technicalText: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 40,
  },
});
