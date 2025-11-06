/**
 * Profile Screen
 * 
 * Displays and allows editing of user profile information:
 * - Name, weight, height
 * - Profile picture
 * - Quick stats summary
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Text, ConfirmModal } from '../../components/common';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { useConfirmModal } from '../../hooks/useConfirmModal';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import StorageService from '../../services/storage/StorageService';
import { UserProfile, UserSettings } from '../../types';
import { formatDistanceValue, formatDuration } from '../../utils/formatting';

export const ProfileScreen: React.FC = () => {
  const { modalState, showConfirm, hideModal } = useConfirmModal();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [stats, setStats] = useState({
    totalActivities: 0,
    totalDistance: 0,
    totalDuration: 0,
  });
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  
  // Edit form state
  const [editName, setEditName] = useState('');
  const [editWeight, setEditWeight] = useState('');
  const [editHeight, setEditHeight] = useState('');

  useEffect(() => {
    loadProfile();
    loadStats();
  }, []);

  const loadProfile = async () => {
    try {
      const savedProfile = await StorageService.getUserProfile();
      const savedSettings = await StorageService.getSettings();
      
      if (savedProfile) {
        setProfile(savedProfile);
        setEditName(savedProfile.name);
        setEditWeight(savedProfile.weight?.toString() || '');
        setEditHeight(savedProfile.height?.toString() || '');
      } else {
        // Create default profile
        const defaultProfile: UserProfile = {
          id: Date.now().toString(),
          name: 'Fitness Enthusiast',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        await StorageService.saveUserProfile(defaultProfile);
        setProfile(defaultProfile);
        setEditName(defaultProfile.name);
      }
      
      setSettings(savedSettings);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const allTimeStats = await StorageService.getStatistics('allTime');
      setStats({
        totalActivities: allTimeStats.totalActivities,
        totalDistance: allTimeStats.totalDistance,
        totalDuration: allTimeStats.totalDuration,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        showConfirm(
          'Permission Required',
          'Please grant camera roll permissions to change your profile picture.',
          [{ text: 'OK', onPress: hideModal, style: 'default' }],
          { icon: 'camera', iconColor: Colors.primary }
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const updatedProfile: UserProfile = {
          ...profile!,
          profilePictureUri: result.assets[0].uri,
          updatedAt: Date.now(),
        };
        await StorageService.saveUserProfile(updatedProfile);
        setProfile(updatedProfile);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      showConfirm(
        'Error',
        'Failed to update profile picture',
        [{ text: 'OK', onPress: hideModal, style: 'default' }],
        { icon: 'alert-circle', iconColor: Colors.error }
      );
    }
  };

  const handleSaveProfile = async () => {
    try {
      if (!editName.trim()) {
        showConfirm(
          'Error',
          'Name cannot be empty',
          [{ text: 'OK', onPress: hideModal, style: 'default' }],
          { icon: 'alert-circle', iconColor: Colors.error }
        );
        return;
      }

      const weight = editWeight ? parseFloat(editWeight) : undefined;
      const height = editHeight ? parseFloat(editHeight) : undefined;

      if (weight && (weight <= 0 || weight > 500)) {
        showConfirm(
          'Error',
          'Please enter a valid weight (1-500 kg)',
          [{ text: 'OK', onPress: hideModal, style: 'default' }],
          { icon: 'alert-circle', iconColor: Colors.error }
        );
        return;
      }

      if (height && (height <= 0 || height > 300)) {
        showConfirm(
          'Error',
          'Please enter a valid height (1-300 cm)',
          [{ text: 'OK', onPress: hideModal, style: 'default' }],
          { icon: 'alert-circle', iconColor: Colors.error }
        );
        return;
      }

      const updatedProfile: UserProfile = {
        ...profile!,
        name: editName.trim(),
        weight,
        height,
        updatedAt: Date.now(),
      };

      await StorageService.saveUserProfile(updatedProfile);
      setProfile(updatedProfile);
      setEditModalVisible(false);
      showConfirm(
        'Success',
        'Profile updated successfully',
        [{ text: 'OK', onPress: hideModal, style: 'default' }],
        { icon: 'checkmark-circle', iconColor: Colors.success }
      );
    } catch (error) {
      console.error('Error saving profile:', error);
      showConfirm(
        'Error',
        'Failed to save profile',
        [{ text: 'OK', onPress: hideModal, style: 'default' }],
        { icon: 'alert-circle', iconColor: Colors.error }
      );
    }
  };

  const openEditModal = () => {
    setEditName(profile?.name || '');
    setEditWeight(profile?.weight?.toString() || '');
    setEditHeight(profile?.height?.toString() || '');
    setEditModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text variant="large" weight="bold" color={Colors.textPrimary}>
          Profile
        </Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Picture and Name */}
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <TouchableOpacity onPress={handlePickImage} style={styles.avatarContainer}>
              {profile?.profilePictureUri ? (
                <Image
                  source={{ uri: profile.profilePictureUri }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={40} color={Colors.primary} />
                </View>
              )}
              <View style={styles.editBadge}>
                <Ionicons name="camera" size={14} color={Colors.surface} />
              </View>
            </TouchableOpacity>

            <View style={styles.profileInfo}>
              <Text variant="medium" weight="bold" color={Colors.textPrimary}>
                {profile?.name}
              </Text>
              {profile?.weight && (
                <Text variant="small" color={Colors.textSecondary}>
                  {profile.weight} kg
                  {profile.height && ` • ${profile.height} cm`}
                </Text>
              )}
            </View>

            <TouchableOpacity onPress={openEditModal} style={styles.editButton}>
              <Ionicons name="create-outline" size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </Card>

        {/* Stats Summary */}
        <View style={styles.statsContainer}>
          <Text variant="medium" weight="semiBold" style={styles.sectionTitle}>
            Your Stats
          </Text>
          
          <View style={styles.statsGrid}>
            <Card style={styles.statCard}>
              <Ionicons name="fitness" size={24} color={Colors.primary} />
              <Text variant="mediumLarge" weight="bold" color={Colors.textPrimary}>
                {stats.totalActivities}
              </Text>
              <Text variant="extraSmall" color={Colors.textSecondary}>
                Activities
              </Text>
            </Card>

            <Card style={styles.statCard}>
              <Ionicons name="navigate" size={24} color={Colors.success} />
              <Text variant="mediumLarge" weight="bold" color={Colors.textPrimary}>
                {formatDistanceValue(stats.totalDistance, settings?.units || 'metric', 1)}
              </Text>
              <Text variant="extraSmall" color={Colors.textSecondary}>
                {settings?.units === 'imperial' ? 'Miles' : 'Kilometers'}
              </Text>
            </Card>

            <Card style={styles.statCard}>
              <Ionicons name="time" size={24} color={Colors.warning} />
              <Text variant="medium" weight="bold" color={Colors.textPrimary}>
                {formatDuration(stats.totalDuration)}
              </Text>
              <Text variant="extraSmall" color={Colors.textSecondary}>
                Total Time
              </Text>
            </Card>
          </View>
        </View>

        {/* Profile Details */}
        <View style={styles.detailsContainer}>
          <Text variant="medium" weight="semiBold" style={styles.sectionTitle}>
            Details
          </Text>

          <Card style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name="person-outline" size={18} color={Colors.primary} />
              </View>
              <View style={styles.detailContent}>
                <Text variant="small" color={Colors.textSecondary}>
                  Name
                </Text>
                <Text variant="regular" weight="medium" color={Colors.textPrimary}>
                  {profile?.name}
                </Text>
              </View>
            </View>

            {profile?.weight && (
              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <Ionicons name="scale-outline" size={18} color={Colors.primary} />
                </View>
                <View style={styles.detailContent}>
                  <Text variant="small" color={Colors.textSecondary}>
                    Weight
                  </Text>
                  <Text variant="regular" weight="medium" color={Colors.textPrimary}>
                    {profile.weight} kg
                  </Text>
                </View>
              </View>
            )}

            {profile?.height && (
              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <Ionicons name="resize-outline" size={18} color={Colors.primary} />
                </View>
                <View style={styles.detailContent}>
                  <Text variant="small" color={Colors.textSecondary}>
                    Height
                  </Text>
                  <Text variant="regular" weight="medium" color={Colors.textPrimary}>
                    {profile.height} cm
                  </Text>
                </View>
              </View>
            )}
          </Card>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text variant="medium" weight="bold" color={Colors.textPrimary}>
                Edit Profile
              </Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text variant="small" weight="medium" color={Colors.textSecondary}>
                  Name *
                </Text>
                <TextInput
                  style={styles.input}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Enter your name"
                  placeholderTextColor={Colors.disabled}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text variant="small" weight="medium" color={Colors.textSecondary}>
                  Weight (kg)
                </Text>
                <TextInput
                  style={styles.input}
                  value={editWeight}
                  onChangeText={setEditWeight}
                  placeholder="Enter your weight"
                  placeholderTextColor={Colors.disabled}
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text variant="small" weight="medium" color={Colors.textSecondary}>
                  Height (cm)
                </Text>
                <TextInput
                  style={styles.input}
                  value={editHeight}
                  onChangeText={setEditHeight}
                  placeholder="Enter your height"
                  placeholderTextColor={Colors.disabled}
                  keyboardType="decimal-pad"
                />
              </View>

              <Text variant="extraSmall" color={Colors.textSecondary} style={styles.helpText}>
                Weight and height are used for calorie calculations
              </Text>
            </ScrollView>

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => setEditModalVisible(false)}
                style={styles.modalButton}
              />
              <Button
                title="Save"
                variant="primary"
                onPress={handleSaveProfile}
                style={styles.modalButton}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
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
  header: {
    height: 60,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  profileCard: {
    margin: Spacing.lg,
    padding: Spacing.xl,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryLight + '30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  profileInfo: {
    flex: 1,
    marginLeft: Spacing.lg,
  },
  editButton: {
    padding: Spacing.sm,
  },
  statsContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
    padding: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  detailsContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  detailsCard: {
    padding: Spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  detailContent: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.extraLarge,
    borderTopRightRadius: BorderRadius.extraLarge,
    maxHeight: '80%',
    ...Shadows.large,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalForm: {
    padding: Spacing.xl,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.medium,
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textPrimary,
    backgroundColor: Colors.surface,
  },
  helpText: {
    marginTop: Spacing.sm,
    lineHeight: 18,
  },
  modalActions: {
    flexDirection: 'row',
    padding: Spacing.xl,
    gap: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  modalButton: {
    flex: 1,
  },
});
