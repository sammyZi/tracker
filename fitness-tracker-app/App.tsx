import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, useTheme, usePermissions } from './src/hooks';
import { Text } from './src/components';
import { AppNavigator } from './src/navigation';
import { SettingsProvider, AuthProvider, SyncProvider, useAuth } from './src/context';
import { SyncToastOverlay } from './src/components';
import { PermissionsScreen } from './src/screens/onboarding/PermissionsScreen';
import storageService from './src/services/storage/StorageService';
import { configurePerformance } from './src/utils/performance';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Initialize performance optimizations for 120 FPS
configurePerformance();


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

  // Initialize storage on app launch
  React.useEffect(() => {
    const initStorage = async () => {
      try {
        await storageService.initialize();
        setStorageInitialized(true);
      } catch (error) {
        console.error('Failed to initialize storage:', error);
        setStorageInitialized(true); // Continue anyway
      }
    };
    initStorage();
  }, []);

  React.useEffect(() => {
    if (!permissionsLoading && !hasRequestedPermissions) {
      setShowPermissions(true);
    }
  }, [permissionsLoading, hasRequestedPermissions]);

  const isAppReady = (fontsLoaded || error) && !permissionsLoading && storageInitialized && !authLoading;

  React.useEffect(() => {
    if (isAppReady) {
      SplashScreen.hideAsync();
    }
  }, [isAppReady]);

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
