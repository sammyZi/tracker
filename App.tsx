import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from './src/hooks';
import { Text, Button, Card } from './src/components';
import { Colors } from './src/constants/theme';

export default function App() {
  const { fontsLoaded, error } = useFonts();

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
          <Button title="Get Started" variant="primary" fullWidth style={styles.button} />
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
  button: {
    marginTop: 16,
  },
});
