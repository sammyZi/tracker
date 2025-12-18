# Audio Announcement Service - Example Usage

## Basic Integration in Activity Tracking

```typescript
import AudioAnnouncementService from '@/services/audio';
import { ActivityMetrics } from '@/types';

// Initialize on app start or screen mount
useEffect(() => {
  AudioAnnouncementService.initialize({
    enabled: true,
    interval: 1000, // 1km
    units: 'metric',
  });
}, []);

// In your activity tracking loop
useEffect(() => {
  if (!isTracking) return;

  const unsubscribe = ActivityService.onMetricsUpdate((metrics: ActivityMetrics) => {
    // Update UI state
    setDistance(metrics.distance);
    setPace(metrics.currentPace);
    
    // Check for distance milestones
    if (AudioAnnouncementService.shouldAnnounce(metrics.distance)) {
      AudioAnnouncementService.announceDistance(
        metrics.distance,
        metrics.currentPace || metrics.averagePace
      );
    }
  });

  return () => unsubscribe();
}, [isTracking]);

// Handle activity start
const handleStart = async () => {
  await ActivityService.startActivity(activityType);
  
  // Reset for new activity
  AudioAnnouncementService.reset();
  
  // Announce start
  await AudioAnnouncementService.announceStart(activityType);
};

// Handle activity pause
const handlePause = async () => {
  await ActivityService.pauseActivity();
  await AudioAnnouncementService.announcePause();
};

// Handle activity resume
const handleResume = async () => {
  await ActivityService.resumeActivity();
  await AudioAnnouncementService.announceResume();
};

// Handle activity completion
const handleStop = async () => {
  const metrics = ActivityService.getCurrentMetrics();
  await ActivityService.stopActivity();
  
  // Announce completion with summary
  await AudioAnnouncementService.announceCompletion(
    metrics.distance,
    metrics.duration,
    metrics.averagePace
  );
};
```

## Settings Integration

```typescript
import AudioAnnouncementService from '@/services/audio';
import StorageService from '@/services/storage';

// Load settings on mount
useEffect(() => {
  loadSettings();
}, []);

const loadSettings = async () => {
  const settings = await StorageService.getSettings();
  if (settings) {
    AudioAnnouncementService.updateSettings({
      enabled: settings.audioAnnouncements,
      interval: settings.announcementInterval,
      units: settings.units,
    });
  }
};

// Toggle audio announcements
const toggleAudioAnnouncements = async (enabled: boolean) => {
  if (enabled) {
    AudioAnnouncementService.enable();
  } else {
    AudioAnnouncementService.disable();
  }
  
  // Save to storage
  const settings = await StorageService.getSettings();
  await StorageService.saveSettings({
    ...settings,
    audioAnnouncements: enabled,
  });
};

// Change announcement interval
const setAnnouncementInterval = async (interval: number) => {
  AudioAnnouncementService.setInterval(interval);
  
  // Save to storage
  const settings = await StorageService.getSettings();
  await StorageService.saveSettings({
    ...settings,
    announcementInterval: interval,
  });
};

// Change units
const setUnits = async (units: 'metric' | 'imperial') => {
  AudioAnnouncementService.setUnits(units);
  
  // Save to storage
  const settings = await StorageService.getSettings();
  await StorageService.saveSettings({
    ...settings,
    units,
  });
};
```

## Custom Announcements

```typescript
// Check if speech is available
const available = await AudioAnnouncementService.isSpeechAvailable();
if (!available) {
  console.warn('Text-to-speech not available on this device');
}

// Stop any ongoing speech
AudioAnnouncementService.stop();

// Check if enabled
const isEnabled = AudioAnnouncementService.isEnabled();
```

## Example Announcement Texts

### Distance Milestone (Metric)
- "1 kilometer completed. Current pace: 5 minutes and 30 seconds per kilometer"
- "2 kilometers completed. Current pace: 5 minutes and 15 seconds per kilometer"

### Distance Milestone (Imperial)
- "1 mile completed. Current pace: 8 minutes and 45 seconds per mile"

### Activity Events
- "Walk started"
- "Run started"
- "Activity paused"
- "Activity resumed"

### Completion
- "Activity complete. 5.2 kilometers in 28 minutes and 15 seconds. Average pace: 5 minutes and 25 seconds per kilometer"
