/**
 * useConfirmModal Hook
 * Provides a simple API to show confirmation modals
 */

import { useState, useCallback } from 'react';
import { ConfirmModalButton } from '../components/common';

interface ConfirmModalState {
  visible: boolean;
  title: string;
  message: string;
  icon?: string;
  iconColor?: string;
  buttons: ConfirmModalButton[];
  loading?: boolean;
  loadingMessage?: string;
}

export const useConfirmModal = () => {
  const [modalState, setModalState] = useState<ConfirmModalState>({
    visible: false,
    title: '',
    message: '',
    buttons: [],
  });

  const showConfirm = useCallback(
    (
      title: string,
      message: string,
      buttons: ConfirmModalButton[],
      options?: {
        icon?: string;
        iconColor?: string;
      }
    ) => {
      setModalState({
        visible: true,
        title,
        message,
        buttons,
        icon: options?.icon,
        iconColor: options?.iconColor,
      });
    },
    []
  );

  const hideModal = useCallback(() => {
    setModalState((prev) => ({ ...prev, visible: false }));
  }, []);

  const setLoading = useCallback((loading: boolean, loadingMessage?: string) => {
    setModalState((prev) => ({ ...prev, loading, loadingMessage }));
  }, []);

  return {
    modalState,
    showConfirm,
    hideModal,
    setLoading,
  };
};
