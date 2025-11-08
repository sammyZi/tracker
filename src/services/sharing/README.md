# Sharing Service

The Sharing Service provides functionality for sharing activities and exporting data in various formats.

## Features

### 1. Share Activity as Text
Share activity summary with metrics via any sharing method (SMS, email, social media, etc.)

```typescript
await SharingService.shareActivityText(activity, units);
```

### 2. Export Activity as GPX
Export activity route as GPX file for use with other fitness apps and GPS software.

```typescript
await SharingService.exportActivityGPX(activity);
```

GPX format includes:
- GPS coordinates (latitude, longitude)
- Elevation data (if available)
- Timestamps for each point
- Activity metadata

### 3. Export Activity as JSON
Export complete activity data including all metrics and route information.

```typescript
await SharingService.exportActivityJSON(activity);
```

### 4. Export All Data as Backup
Export all activities, profile, settings, and goals as a single JSON backup file.

```typescript
await SharingService.exportAllActivitiesBackup();
```

### 5. Import Backup
Import previously exported backup data.

```typescript
await SharingService.importBackup(fileUri);
```

## Usage with Hook

The `useActivitySharing` hook provides a convenient way to use sharing functionality in components:

```typescript
import { useActivitySharing } from '../../hooks/useActivitySharing';

const MyComponent = () => {
  const {
    shareActivityText,
    exportGPX,
    exportJSON,
    exportBackup,
    showExportOptions,
    isSharing,
    isExporting,
  } = useActivitySharing();

  // Share activity
  const handleShare = () => {
    shareActivityText(activity, units);
  };

  // Show export options dialog
  const handleExport = () => {
    showExportOptions(activity);
  };

  // Export backup
  const handleBackup = () => {
    exportBackup();
  };
};
```

## File Storage

All exported files are temporarily stored in the app's cache directory and shared using the native sharing dialog. Files are automatically cleaned up by the system when needed.

## Supported Formats

### GPX (GPS Exchange Format)
- Standard format for GPS data
- Compatible with most fitness and mapping applications
- Includes route coordinates, elevation, and timestamps

### JSON
- Complete activity data
- All metrics and metadata
- Easy to parse and process programmatically

## Platform Support

- **iOS**: Uses native share sheet with all available sharing options
- **Android**: Uses native share dialog with installed apps

## Error Handling

All methods throw errors that should be caught and handled appropriately:

```typescript
try {
  await SharingService.exportActivityGPX(activity);
} catch (error) {
  Alert.alert('Error', 'Failed to export activity');
}
```
