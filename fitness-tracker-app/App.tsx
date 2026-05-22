import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Animated } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, useTheme, usePermissions } from './src/hooks';
import { Text } from './src/components';
import { AppNavigator } from './src/navigation';
import { SettingsProvider, AuthProvider, SyncProvider, useAuth } from './src/context';
import { SyncToastOverlay } from './src/components';
import { PermissionsScreen } from './src/screens/onboarding/PermissionsScreen';
import storageService from './src/services/storage/StorageService';
import notificationService from './src/services/notification/NotificationService';
import { configurePerformance } from './src/utils/performance';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Initialize performance optimizations for 120 FPS
configurePerformance();

// Minimum time (ms) to show splash screen for a premium feel
const MIN_SPLASH_DURATION = 2000;

function AppContent() {
  const { fontsLoaded, error } = useFonts();
  const { colors, isDark } = useTheme();
  const {
    hasRequestedPermissions,
    hasLocationPermission,
    loading: permissionsLoading,
    markPermissionsRequested,
  } = usePermissions();
  
  const { isLoading: authLoading } = useAuth();

  const [showPermissions, setShowPermissions] = useState(false);
  const [storageInitialized, setStorageInitialized] = useState(false);
  const [notificationsInitialized, setNotificationsInitialized] = useState(false);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const [splashHidden, setSplashHidden] = useState(false);

  // Start minimum splash timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, MIN_SPLASH_DURATION);
    return () => clearTimeout(timer);
  }, []);

  // Initialize storage on app launch
  useEffect(() => {
    const initStorage = async () => {
      try {
        await storageService.initialize();
      } catch (error) {
        console.error('Failed to initialize storage:', error);
      } finally {
        setStorageInitialized(true);
      }
    };
    initStorage();
  }, []);

  // Initialize notifications
  useEffect(() => {
    const initNotifications = async () => {
      try {
        await notificationService.initialize();
      } catch (error) {
        console.error('Failed to initialize notifications:', error);
      } finally {
        setNotificationsInitialized(true);
      }
    };
    initNotifications();
  }, []);

  useEffect(() => {
    if (!permissionsLoading && !hasRequestedPermissions) {
      setShowPermissions(true);
    }
  }, [permissionsLoading, hasRequestedPermissions]);

  // All services must be ready AND minimum time must have elapsed
  const allServicesReady = 
    (fontsLoaded || error) && 
    !permissionsLoading && 
    storageInitialized && 
    notificationsInitialized &&
    !authLoading;

  const isAppReady = allServicesReady && minTimeElapsed;

  // Hide splash screen when everything is ready
  useEffect(() => {
    if (isAppReady && !splashHidden) {
      const hideSplash = async () => {
        await SplashScreen.hideAsync();
        setSplashHidden(true);
      };
      hideSplash();
    }
  }, [isAppReady, splashHidden]);

  if (!isAppReady) {
    return null;
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text variant="medium" color={colors.error}>
          Error loading fonts
        </Text>
      </SafeAreaView>
    );
  }

  // Show permissions screen if not requested yet
  if (showPermissions) {
    return (
      <>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <PermissionsScreen
          onComplete={() => {
            markPermissionsRequested();
            setShowPermissions(false);
          }}
        />
      </>
    );
  }

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <AppNavigator />
      <SyncToastOverlay />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <AuthProvider>
          <SyncProvider>
            <AppContent />
          </SyncProvider>
        </AuthProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}



const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
  },
});
