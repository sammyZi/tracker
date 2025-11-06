/**
 * ShareModal Component
 * Reusable modal for sharing options
 */

import React from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './Text';
import { Colors, Spacing, BorderRadius, Shadows, Typography } from '../../constants/theme';

export interface ShareOption {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
  onPress: () => void;
}

interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  options: ShareOption[];
  loading?: boolean;
  loadingMessage?: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  visible,
  onClose,
  title = 'Share Activity',
  options,
  loading = false,
  loadingMessage = 'Processing...',
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              {/* Header */}
              <View style={styles.header}>
                <Text variant="mediumLarge" weight="semiBold" color={Colors.textPrimary}>
                  {title}
                </Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={onClose}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={24} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Options */}
              <View style={styles.optionsContainer}>
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text variant="regular" color={Colors.textPrimary} weight="medium" style={styles.loadingText}>
                      {loadingMessage}
                    </Text>
                    <Text variant="small" color={Colors.textSecondary} style={styles.loadingSubtext}>
                      This may take a few seconds...
                    </Text>
                  </View>
                ) : (
                  options.map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      style={styles.option}
                      onPress={() => {
                        option.onPress();
                        onClose();
                      }}
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          styles.optionIcon,
                          { backgroundColor: (option.color || Colors.primary) + '15' },
                        ]}
                      >
                        <Ionicons
                          name={option.icon}
                          size={24}
                          color={option.color || Colors.primary}
                        />
                      </View>
                      <Text variant="regular" weight="medium" color={Colors.textPrimary}>
                        {option.label}
                      </Text>
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={Colors.textSecondary}
                        style={styles.chevron}
                      />
                    </TouchableOpacity>
                  ))
                )}
              </View>

              {/* Cancel Button */}
              {!loading && (
                <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                  <Text variant="regular" weight="semiBold" color={Colors.textSecondary}>
                    Cancel
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.extraLarge,
    borderTopRightRadius: BorderRadius.extraLarge,
    paddingBottom: Spacing.xl,
    ...Shadows.large,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionsContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.medium,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.background,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  chevron: {
    marginLeft: 'auto',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
  },
  loadingText: {
    marginTop: Spacing.md,
  },
  loadingSubtext: {
    marginTop: Spacing.xs,
  },
  cancelButton: {
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.lg,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    borderRadius: BorderRadius.medium,
    backgroundColor: Colors.background,
  },
});
