/**
 * ConfirmModal
 * Reusable confirmation modal component to replace Alert.alert
 */

import React from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './Text';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/theme';

export interface ConfirmModalButton {
  text: string;
  onPress: () => void | Promise<void>;
  style?: 'default' | 'cancel' | 'destructive';
}

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  buttons: ConfirmModalButton[];
  loading?: boolean;
  loadingMessage?: string;
  onRequestClose?: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  title,
  message,
  icon = 'alert-circle',
  iconColor = Colors.primary,
  buttons,
  loading = false,
  loadingMessage = 'Processing...',
  onRequestClose,
}) => {
  const [processingIndex, setProcessingIndex] = React.useState<number | null>(null);

  const handleButtonPress = async (button: ConfirmModalButton, index: number) => {
    try {
      setProcessingIndex(index);
      await button.onPress();
    } finally {
      setProcessingIndex(null);
    }
  };

  const getButtonStyle = (style?: string) => {
    switch (style) {
      case 'destructive':
        return styles.buttonDestructive;
      case 'cancel':
        return styles.buttonCancel;
      default:
        return styles.buttonDefault;
    }
  };

  const getButtonTextColor = (style?: string) => {
    switch (style) {
      case 'destructive':
        return '#FFFFFF';
      case 'cancel':
        return Colors.textPrimary;
      default:
        return Colors.primary;
    }
  };

  const isProcessing = loading || processingIndex !== null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onRequestClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={[styles.iconContainer, { backgroundColor: iconColor + '15' }]}>
            <Ionicons name={icon} size={48} color={iconColor} />
          </View>

          <Text variant="large" weight="bold" color={Colors.textPrimary} style={styles.title}>
            {title}
          </Text>

          <Text variant="regular" color={Colors.textSecondary} style={styles.message}>
            {message}
          </Text>

          {isProcessing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text variant="regular" color={Colors.textSecondary} style={styles.loadingText}>
                {loadingMessage}
              </Text>
            </View>
          ) : (
            <View style={styles.buttonsContainer}>
              {buttons.map((button, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.button, getButtonStyle(button.style)]}
                  onPress={() => handleButtonPress(button, index)}
                >
                  <Text
                    variant="regular"
                    weight="semiBold"
                    color={getButtonTextColor(button.style)}
                  >
                    {button.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  content: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.large,
    padding: Spacing.xl,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    ...Shadows.large,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDefault: {
    backgroundColor: Colors.primary + '15',
  },
  buttonCancel: {
    backgroundColor: Colors.border,
  },
  buttonDestructive: {
    backgroundColor: Colors.error,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  loadingText: {
    marginTop: Spacing.md,
  },
});
