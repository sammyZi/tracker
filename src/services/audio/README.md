# Audio Announcement Service

The Audio Announcement Service provides text-to-speech announcements during activity tracking to keep users informed without looking at their phone.

## Features

- **Distance Milestones**: Announces when user completes configurable distance intervals (0.5km, 1km, 1 mile, 2km)
- **Pace Information**: Includes current pace in announcements
- **Activity Events**: Announces start, pause, resume, and completion
- **Configurable**: Enable/disable and set custom intervals
- **Unit Support**: Works with both metric and imperial units

## Usage

### Initialize the Service

```typescript
import AudioAnnouncementService from '@/services/audio';

// Initialize with default settings
AudioAnnouncementService.initialize({
  enabled: true,
  interval: 1000, // 1km in meters
  units: 'metric',
});
```

### Check for Milestones

```typescript
// In your activity tracking loop
if (AudioAnnouncementService.shouldAnnounce(currentDistance)) {
  await AudioAnnouncementService.announceDistance(currentDistance, currentPace);
}
```

### Activity Events

```typescript
// Start
await AudioAnnouncementService.announceStart('running');

// Pause
await AudioAnnouncementService.announcePause();

// Resume
await AudioAnnouncementService.announceResume();

// Completion
await AudioAnnouncementService.announceCompletion(distance, duration, pace);
```

### Configuration

```typescript
// Enable/disable
AudioAnnouncementService.enable();
AudioAnnouncementService.disable();

// Set interval (in meters)
AudioAnnouncementService.setInterval(1000); // 1km

// Set units
AudioAnnouncementService.setUnits('imperial');

// Update all settings
AudioAnnouncementService.updateSettings({
  enabled: true,
  interval: 1609, // 1 mile
  units: 'imperial',
});
```

### Reset

```typescript
// Reset for new activity (clears last announced distance)
AudioAnnouncementService.reset();
```

## Announcement Intervals

Common intervals:
- **0.5 km**: 500 meters
- **1 km**: 1000 meters (default)
- **1 mile**: 1609 meters
- **2 km**: 2000 meters

## Speech Settings

The service uses the following speech parameters:
- **Language**: en-US
- **Pitch**: 1.0 (normal)
- **Rate**: 0.9 (slightly slower for clarity)
- **Volume**: 1.0 (maximum)

## Requirements

- Requirement 7.1: Audio feedback for distance milestones
- Requirement 7.2: Enable/disable in settings
- Requirement 7.4: Configurable announcement intervals

## Dependencies

- `expo-speech`: Text-to-speech functionality
- `@/utils/formatting`: Distance and pace formatting
