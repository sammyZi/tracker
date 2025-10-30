import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from './src/hooks';
import { Text, Button, Card } from './src/components';
import { Colors } from './src/constants/theme';
import { locationService } from './src/services/location';
import { useState } from 'react';

export default function App() {
  const { fontsLoaded, error } = useFonts();
  const [permissionStatus, setPermissionStatus] = useState<string>('Not requested');

  if (!fontsLoaded) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text variant="medium" color={Colors.error}>
          Error loading fonts
        </Text>
      </SafeAreaView>
    );
  }

  const handleRequestPermissions = async () => {
    try {
      setPermissionStatus('Requesting foreground...');
      
      // Request foreground permission
      const hasForeground = await locationService.requestPermissions();
      
      if (!hasForeground) {
        setPermissionStatus('Foreground permission denied');
        Alert.alert(
          'Permission Denied',
          'Location permission is required to track your activity.'
        );
        return;
      }

      setPermissionStatus('Foreground granted, requesting background...');

      // Request background permission
      const hasBackground = await locationService.requestBackgroundPermissions();
      
      if (!hasBackground) {
        setPermissionStatus('Foreground granted, background denied');
        Alert.alert(
          'Background Permission',
          'Background permission denied. You can still track with the app open.\n\nTo enable background tracking, go to Settings and select "Always" for location access.'
        );
        return;
      }

      setPermissionStatus('All permissions granted!');
      Alert.alert(
        'Success',
        'All location permissions granted! You can now track activities in the background.'
      );
    } catch (error) {
      console.error('Error requesting permissions:', error);
      setPermissionStatus('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
      Alert.alert('Error', 'Failed to request permissions');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        <Card style={styles.card}>
          <Text variant="large" weight="bold" align="center" style={styles.title}>
            Fitness Tracker
          </Text>
          <Text variant="regular" color={Colors.textSecondary} align="center" style={styles.subtitle}>
            Typography and design system ready!
          </Text>
          
          <View style={styles.permissionSection}>
            <Text variant="medium" weight="semiBold" style={styles.sectionTitle}>
              Location Permissions
            </Text>
            <Text variant="small" color={Colors.textSecondary} align="center" style={styles.statusText}>
              Status: {permissionStatus}
            </Text>
            <Button 
              title="Request Permissions" 
              variant="primary" 
              fullWidth 
              style={styles.button}
              onPress={handleRequestPermissions}
            />
          </View>
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 400,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 24,
  },
  permissionSection: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  sectionTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  statusText: {
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
  },
});
