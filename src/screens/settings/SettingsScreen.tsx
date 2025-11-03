/**
 * Settings Screen
 * 
 * Allows users to configure app settings including:
 * - Audio announcements
 * - Announcement intervals
 * - Unit system
 * - Haptic feedback
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import StorageService from '../../services/storage/StorageService';
import AudioAnnouncementService from '../../services/audio';
import HapticFeedbackService from '../../services/haptic';
import { UserSettings, UnitSystem } from '../../types';

const ANNOUNCEMENT_INTERVALS = [
  { label: '0.5 km', value: 500, imperial: 0.31 },
  { label: '1 km', value: 1000, imperial: 0.62 },
  { label: '1 mile', value: 1609, imperial: 1 },
  { label: '2 km', value: 2000, imperial: 1.24 },
];

export const SettingsScreen: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings>({
    units: 'metric',
    audioAnnouncements: true,
    announcementInterval: 1000,
    autoPause: false,
    autoPauseSensitivity: 'medium',
    mapType: 'standard',
    theme: 'light',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await StorageService.getSettings();
      if (savedSettings) {
        setSettings(savedSettings);
        
        // Apply settings to services
        AudioAnnouncementService.updateSettings({
          enabled: savedSettings.audioAnnouncements,
          interval: savedSettings.announcementInterval,
          units: savedSettings.units,
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: UserSettings) => {
    try {
      await StorageService.saveSettings(newSettings);
      setSettings(newSettings);
      
      // Apply settings to services
      AudioAnnouncementService.updateSettings({
        enabled: newSettings.audioAnnouncements,
        interval: newSettings.announcementInterval,
        units: newSettings.units,
      });
      
      await HapticFeedbackService.success();
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings');
      await HapticFeedbackService.error();
    }
  };

  const toggleAudioAnnouncements = async (value: boolean) => {
    const newSettings = { ...settings, audioAnnouncements: value };
    await saveSettings(newSettings);
    
    if (value) {
      AudioAnnouncementService.enable();
    } else {
      AudioAnnouncementService.disable();
    }
  };

  const setAnnouncementInterval = async (interval: number) => {
    await HapticFeedbackService.selection();
    const newSettings = { ...settings, announcementInterval: interval };
    await saveSettings(newSettings);
    AudioAnnouncementService.setInterval(interval);
  };

  const toggleUnits = async (units: UnitSystem) => {
    await HapticFeedbackService.selection();
    const newSettings = { ...settings, units };
    await saveSettings(newSettings);
    AudioAnnouncementService.setUnits(units);
  };

  const getIntervalLabel = (interval: number, units: UnitSystem): string => {
    const intervalOption = ANNOUNCEMENT_INTERVALS.find(i => i.value === interval);
    if (!intervalOption) return 'Custom';
    
    if (units === 'imperial') {
      return `${intervalOption.imperial} mi`;
    }
    return intervalOption.label;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Units Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Units</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="speedometer-outline" size={24} color={Colors.primary} />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>Unit System</Text>
                <Text style={styles.settingDescription}>
                  {settings.units === 'metric' ? 'Kilometers' : 'Miles'}
                </Text>
              </View>
            </View>
            <View style={styles.segmentedControl}>
              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  settings.units === 'metric' && styles.segmentButtonActive,
                ]}
                onPress={() => toggleUnits('metric')}
              >
                <Text
                  style={[
                    styles.segmentButtonText,
                    settings.units === 'metric' && styles.segmentButtonTextActive,
                  ]}
                >
                  Metric
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  settings.units === 'imperial' && styles.segmentButtonActive,
                ]}
                onPress={() => toggleUnits('imperial')}
              >
                <Text
                  style={[
                    styles.segmentButtonText,
                    settings.units === 'imperial' && styles.segmentButtonTextActive,
                  ]}
                >
                  Imperial
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Audio Announcements Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Audio Announcements</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="volume-high-outline" size={24} color={Colors.primary} />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>Enable Announcements</Text>
                <Text style={styles.settingDescription}>
                  Hear distance and pace updates
                </Text>
              </View>
            </View>
            <Switch
              value={settings.audioAnnouncements}
              onValueChange={toggleAudioAnnouncements}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor="#fff"
            />
          </View>

          {settings.audioAnnouncements && (
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="timer-outline" size={24} color={Colors.primary} />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingLabel}>Announcement Interval</Text>
                  <Text style={styles.settingDescription}>
                    Current: {getIntervalLabel(settings.announcementInterval, settings.units)}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {settings.audioAnnouncements && (
            <View style={styles.intervalOptions}>
              {ANNOUNCEMENT_INTERVALS.map((interval) => (
                <TouchableOpacity
                  key={interval.value}
                  style={[
                    styles.intervalButton,
                    settings.announcementInterval === interval.value &&
                      styles.intervalButtonActive,
                  ]}
                  onPress={() => setAnnouncementInterval(interval.value)}
                >
                  <Text
                    style={[
                      styles.intervalButtonText,
                      settings.announcementInterval === interval.value &&
                        styles.intervalButtonTextActive,
                    ]}
                  >
                    {settings.units === 'imperial'
                      ? `${interval.imperial} mi`
                      : interval.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Haptic Feedback Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Haptic Feedback</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="phone-portrait-outline" size={24} color={Colors.primary} />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>Vibration Feedback</Text>
                <Text style={styles.settingDescription}>
                  Feel haptic feedback for actions
                </Text>
              </View>
            </View>
            <Switch
              value={HapticFeedbackService.isEnabled()}
              onValueChange={(value) => {
                if (value) {
                  HapticFeedbackService.enable();
                  HapticFeedbackService.success();
                } else {
                  HapticFeedbackService.disable();
                }
              }}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Ionicons name="information-circle-outline" size={20} color={Colors.textSecondary} />
          <Text style={styles.infoText}>
            Audio announcements will play during your activities to keep you informed
            without looking at your phone. Haptic feedback provides tactile confirmation
            for your actions.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Poppins_700Bold',
    color: Colors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textPrimary,
  },
  settingDescription: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 2,
  },
  segmentButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  segmentButtonActive: {
    backgroundColor: Colors.primary,
  },
  segmentButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textSecondary,
  },
  segmentButtonTextActive: {
    color: '#fff',
  },
  intervalOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 8,
  },
  intervalButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  intervalButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  intervalButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textPrimary,
  },
  intervalButtonTextActive: {
    color: '#fff',
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: 16,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
