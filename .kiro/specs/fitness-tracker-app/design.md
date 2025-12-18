# Design Document - Fitness Tracker App

## Overview

The Fitness Tracker App is a React Native mobile application built with Expo that provides comprehensive activity tracking for walking and running. The app leverages device sensors (GPS, accelerometer) for real-time tracking, AsyncStorage for local data persistence, and React Native Maps for route visualization. The architecture follows a modular component-based design with clear separation between UI, business logic, and data layers. All data is stored locally on the device.

### Technology Stack

- **Framework**: React Native with Expo (managed workflow)
- **Language**: TypeScript for type safety
- **Storage**: AsyncStorage for local data persistence (all data stored on device)
- **Maps**: React Native Maps with Google Maps/Apple Maps
- **State Management**: React Context API + useReducer for global state
- **Navigation**: React Navigation (Stack + Bottom Tabs)
- **Location Services**: expo-location
- **Sensors**: expo-sensors (Pedometer)
- **Background Tasks**: expo-task-manager + expo-location
- **Notifications**: expo-notifications
- **Charts**: react-native-chart-kit
- **Fonts**: Poppins font family (expo-google-fonts)
- **UI Components**: Custom components with modern, aesthetic design
- **Animations**: react-native-reanimated for smooth transitions
- **Icons**: @expo/vector-icons (Ionicons, MaterialCommunityIcons)

## UI/UX Design Guidelines

### Design Philosophy

The app follows a modern, clean, and minimalist aesthetic with focus on readability and user experience. The design emphasizes clarity during workouts with large, easy-to-read metrics and intuitive controls.

### Typography

**Primary Font**: Poppins
- **Headings**: Poppins SemiBold (600) / Bold (700)
- **Body Text**: Poppins Regular (400)
- **Metrics/Numbers**: Poppins Medium (500) / SemiBold (600)
- **Captions**: Poppins Light (300)

**Font Sizes**:
- Extra Large (Metrics): 48-56px
- Large (Headings): 24-32px
- Medium (Subheadings): 18-20px
- Regular (Body): 14-16px
- Small (Captions): 12-14px

### Color Palette

**Primary Colors**:
- Primary: #6C63FF (Vibrant Purple) - Main actions, active states
- Primary Dark: #5548E8 - Pressed states
- Primary Light: #8B84FF - Backgrounds, highlights

**Secondary Colors**:
- Success/Running: #00D9A3 (Mint Green)
- Warning/Walking: #FFB800 (Amber)
- Error: #FF6B6B (Coral Red)
- Info: #4ECDC4 (Turquoise)

**Neutral Colors**:
- Background: #F8F9FA (Light Gray)
- Surface: #FFFFFF (White)
- Text Primary: #2D3436 (Dark Gray)
- Text Secondary: #636E72 (Medium Gray)
- Border: #DFE6E9 (Light Border)
- Disabled: #B2BEC3 (Gray)

**Dark Mode** (optional):
- Background: #1A1A2E
- Surface: #16213E
- Text Primary: #FFFFFF
- Text Secondary: #B2BEC3

### Component Styling

**Cards**:
- Border radius: 16-20px
- Shadow: subtle elevation (shadowOpacity: 0.1, shadowRadius: 8)
- Padding: 16-20px
- Background: White with slight gradient

**Buttons**:
- Primary: Rounded (borderRadius: 12px), solid color with shadow
- Secondary: Outlined with 2px border
- Icon buttons: Circular (50-60px diameter)
- Height: 48-56px for primary actions

**Input Fields**:
- Border radius: 12px
- Border: 1px solid border color
- Focus state: Primary color border with glow
- Padding: 12-16px

**Metrics Display**:
- Large cards with gradient backgrounds
- Bold numbers with Poppins SemiBold
- Icon + Label + Value layout
- Subtle animations on value changes

**Navigation**:
- Bottom tab bar with icons and labels
- Active state: Primary color with indicator
- Smooth transitions between screens
- Gesture-based navigation

### Layout Principles

1. **Spacing System**: 4px base unit (4, 8, 12, 16, 24, 32, 48)
2. **Grid**: 16px margins, 12px gutters
3. **Hierarchy**: Clear visual hierarchy with size, weight, and color
4. **Whitespace**: Generous spacing for breathing room
5. **Consistency**: Reusable component patterns

### Screen-Specific Design

**Activity Tracking Screen**:
- Full-screen map with overlay metrics
- Floating action button for controls (large, circular)
- Semi-transparent metric cards over map
- Gradient overlay for better text readability
- Pulsing animation on active tracking indicator

**Activity History**:
- Card-based list with thumbnail maps
- Swipe actions for quick access
- Pull-to-refresh with custom animation
- Empty state with motivational illustration

**Statistics Screen**:
- Tab-based navigation (Week/Month/All Time)
- Colorful charts with smooth animations
- Summary cards in grid layout
- Personal records with trophy icons

**Profile Screen**:
- Circular profile picture with edit overlay
- Stats summary at top
- Settings in grouped lists
- Clean, organized sections

### Animations & Interactions

1. **Micro-interactions**:
   - Button press feedback (scale + opacity)
   - Card tap animations
   - Loading states with skeleton screens
   - Success/error feedback with haptics

2. **Transitions**:
   - Smooth screen transitions (300ms)
   - Fade + slide combinations
   - Shared element transitions for images

3. **Activity Tracking**:
   - Pulsing dot for active tracking
   - Smooth metric value updates
   - Route polyline drawing animation

4. **Charts**:
   - Animated data entry
   - Interactive tooltips
   - Smooth scrolling

### Accessibility

- Minimum touch target: 44x44px
- High contrast ratios (WCAG AA)
- Screen reader support
- Haptic feedback for important actions
- Clear focus indicators

### Illustrations & Icons

- Custom activity type icons (walking, running)
- Empty state illustrations
- Achievement badges
- Consistent icon style (rounded, outlined)
- Colorful, friendly illustrations

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                       │
│  (React Native Components, Screens, Navigation)              │
└─────────────────┬───────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────┐
│                    Business Logic Layer                      │
│  (Hooks, Context, Services, Utilities)                       │
└─────────────────┬───────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────┐
│                      Data Layer                              │
│  (AsyncStorage - Local Device Storage, Device Sensors)       │
└─────────────────────────────────────────────────────────────┘
```

### Application Structure

```
fitness-tracker-app/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── common/          # Generic components (Button, Card, etc.)
│   │   ├── activity/        # Activity-specific components
│   │   ├── map/             # Map-related components
│   │   └── charts/          # Chart components
│   ├── screens/             # Screen components
│   │   ├── auth/            # Authentication screens
│   │   ├── activity/        # Activity tracking screens
│   │   ├── history/         # Activity history screens
│   │   ├── stats/           # Statistics screens
│   │   ├── profile/         # Profile screens
│   │   └── settings/        # Settings screens
│   ├── navigation/          # Navigation configuration
│   ├── services/            # Business logic services
│   │   ├── location/        # Location tracking service
│   │   ├── activity/        # Activity management service
│   │   └── storage/         # Local storage service (AsyncStorage)
│   ├── hooks/               # Custom React hooks
│   ├── context/             # React Context providers
│   ├── utils/               # Utility functions
│   ├── constants/           # App constants
│   ├── types/               # TypeScript type definitions
│   └── config/              # Configuration files
├── assets/                  # Images, fonts, icons
├── app.json                 # Expo configuration
└── package.json
```

## Components and Interfaces

### Core Components

#### 1. Profile Components

**ProfileScreen**
- Display user information (stored locally)
- Edit profile functionality
- Profile picture selection and storage
- User preferences management

#### 2. Activity Tracking Components

**ActivityTrackingScreen**
- Real-time metrics display (time, distance, pace, steps)
- Start/Pause/Resume/Stop controls
- Live map with route polyline
- Activity type selector (walk/run)
- Background tracking initialization

**MetricsDisplay**
- Large, readable metric cards
- Dynamic updates during activity
- Unit conversion (metric/imperial)

**ActivityControls**
- Start button with activity type selection
- Pause/Resume toggle
- Stop button with confirmation
- Visual feedback for state changes

#### 3. Map Components

**LiveRouteMap**
- Real-time high-accuracy location tracking
- Smooth polyline rendering with anti-aliasing
- Animated current location marker with accuracy circle
- GPS signal quality indicator
- Auto-centering with smooth camera transitions
- Map controls (zoom, center on user, map type)
- Start/end markers with custom icons
- Pace-based route coloring (gradient from slow to fast)
- Accuracy visualization: show confidence radius

**StaticRouteMap**
- Display completed activity route with full detail
- High-resolution polyline (no simplification for routes < 10km)
- Interactive zoom and pan
- Route statistics overlay (distance markers every km)
- Elevation profile if available
- Start/end markers with timestamps
- Pace heatmap overlay option
- Export route as high-quality image

#### 4. History and Reports Components

**ActivityHistoryScreen**
- Scrollable list of past activities
- Filter controls (date range, activity type)
- Summary cards for each activity
- Pull-to-refresh functionality

**ActivityDetailScreen**
- Complete activity metrics
- Route map visualization
- Share and export options
- Delete activity option

**ActivityCard**
- Compact activity summary
- Date, duration, distance, pace
- Activity type icon
- Thumbnail map preview

#### 5. Statistics Components

**StatsScreen**
- Tab navigation (Week, Month, All Time)
- Summary statistics cards
- Charts for trends
- Personal records section

**StatisticsCharts**
- Line charts for distance over time
- Bar charts for weekly/monthly comparison
- Pace trend visualization

**PersonalRecords**
- Longest distance
- Fastest pace
- Longest duration
- Total lifetime stats

#### 6. Settings Components

**SettingsScreen**
- Unit preferences (metric/imperial)
- Audio announcement settings
- Notification preferences
- GPS accuracy settings
- Auto-pause sensitivity
- Account management

### Service Layer

#### LocationService

```typescript
interface LocationService {
  startTracking(): Promise<void>;
  stopTracking(): Promise<void>;
  pauseTracking(): void;
  resumeTracking(): void;
  getCurrentLocation(): Promise<Location>;
  getLocationUpdates(): Observable<Location>;
  requestPermissions(): Promise<boolean>;
  getAccuracyStatus(): AccuracyStatus;
}

interface Location {
  latitude: number;
  longitude: number;
  altitude: number | null;
  accuracy: number;  // in meters
  timestamp: number;
  speed: number | null;  // in m/s
  heading: number | null;  // in degrees
}

interface AccuracyStatus {
  current: number;  // current accuracy in meters
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  gpsSignalStrength: number;
}
```

**Responsibilities:**
- Request and manage location permissions (Always + When In Use)
- Start/stop high-accuracy GPS tracking
- Provide location updates stream with accuracy filtering
- Handle background location tracking with foreground service
- Calculate distance between coordinates using Haversine formula
- Filter out inaccurate GPS points (accuracy > 20 meters)
- Implement Kalman filtering for smooth, accurate paths
- Monitor GPS signal quality and notify user of poor accuracy
- Use best available location provider (GPS + Network + Passive)

**High Accuracy Configuration:**
- Accuracy: Location.Accuracy.BestForNavigation (highest available)
- Time interval: 3-5 seconds for optimal balance
- Distance interval: 5-10 meters to capture route details
- Accuracy threshold: Reject points with accuracy > 20 meters
- Path smoothing: Apply Kalman filter to reduce GPS jitter
- Speed-based filtering: Detect and remove stationary points

#### ActivityService

```typescript
interface ActivityService {
  startActivity(type: ActivityType): Promise<string>;
  pauseActivity(activityId: string): Promise<void>;
  resumeActivity(activityId: string): Promise<void>;
  stopActivity(activityId: string): Promise<Activity>;
  getCurrentActivity(): Activity | null;
  calculateMetrics(activity: Activity): ActivityMetrics;
}

interface Activity {
  id: string;
  userId: string;
  type: 'walking' | 'running';
  startTime: number;
  endTime: number | null;
  duration: number;
  distance: number;
  steps: number;
  route: Location[];
  averagePace: number;
  calories: number;
  status: 'active' | 'paused' | 'completed';
}

interface ActivityMetrics {
  currentPace: number;
  averagePace: number;
  distance: number;
  duration: number;
  steps: number;
  calories: number;
}
```

**Responsibilities:**
- Manage activity lifecycle
- Calculate real-time metrics
- Aggregate location data into routes
- Calculate pace, distance, duration
- Estimate calories burned
- Handle activity state transitions

#### StepCounterService

```typescript
interface StepCounterService {
  startCounting(): Promise<void>;
  stopCounting(): Promise<number>;
  getCurrentSteps(): number;
  isAvailable(): Promise<boolean>;
}
```

**Responsibilities:**
- Interface with device pedometer
- Count steps during activity
- Handle step counter availability
- Reset step count for new activities



#### StorageService

```typescript
interface StorageService {
  // Activities
  saveActivity(activity: Activity): Promise<void>;
  getActivities(filters?: ActivityFilters): Promise<Activity[]>;
  getActivity(activityId: string): Promise<Activity | null>;
  deleteActivity(activityId: string): Promise<void>;
  clearAllActivities(): Promise<void>;
  
  // User Profile
  saveUserProfile(profile: UserProfile): Promise<void>;
  getUserProfile(): Promise<UserProfile | null>;
  
  // Settings
  saveSettings(settings: UserSettings): Promise<void>;
  getSettings(): Promise<UserSettings | null>;
  
  // Goals
  saveGoal(goal: Goal): Promise<void>;
  getGoals(): Promise<Goal[]>;
  updateGoal(goalId: string, updates: Partial<Goal>): Promise<void>;
  deleteGoal(goalId: string): Promise<void>;
  
  // Statistics
  getStatistics(period: 'week' | 'month' | 'allTime'): Promise<Statistics>;
}

interface ActivityFilters {
  startDate?: number;
  endDate?: number;
  type?: 'walking' | 'running';
  limit?: number;
}
```

**Responsibilities:**
- All data persistence using AsyncStorage
- CRUD operations for activities
- User profile management
- Settings persistence
- Goal management
- Statistics calculation from stored activities
- Data export/import functionality



#### NotificationService

```typescript
interface NotificationService {
  showActivityNotification(metrics: ActivityMetrics): Promise<void>;
  updateActivityNotification(metrics: ActivityMetrics): Promise<void>;
  dismissActivityNotification(): Promise<void>;
  scheduleDistanceAnnouncement(distance: number, pace: number): Promise<void>;
  showGoalAchievement(goal: Goal): Promise<void>;
  requestPermissions(): Promise<boolean>;
}
```

**Responsibilities:**
- Display persistent notification during activities
- Update notification with real-time metrics
- Provide notification controls
- Schedule audio announcements
- Show achievement notifications

#### CalculationService

```typescript
interface CalculationService {
  calculateDistance(route: Location[]): number;
  calculatePace(distance: number, duration: number): number;
  calculateCalories(distance: number, duration: number, weight: number, type: ActivityType): number;
  formatPace(pace: number, unit: 'metric' | 'imperial'): string;
  formatDistance(distance: number, unit: 'metric' | 'imperial'): string;
  formatDuration(seconds: number): string;
}
```

**Responsibilities:**
- Distance calculations using Haversine formula
- Pace calculations (min/km or min/mile)
- Calorie estimation algorithms
- Unit conversions
- Metric formatting

## Data Models

### AsyncStorage Keys Structure

```
@user_profile: UserProfile
@user_settings: UserSettings
@activities: Activity[]
@goals: Goal[]
@activity_{activityId}: Activity (individual activity cache)
```

### TypeScript Interfaces

```typescript
interface UserProfile {
  id: string;
  name: string;
  profilePictureUri?: string;  // Local file URI
  weight?: number;  // in kg
  height?: number;  // in cm
  createdAt: number;
  updatedAt: number;
}

interface UserSettings {
  units: 'metric' | 'imperial';
  audioAnnouncements: boolean;
  announcementInterval: number;  // in meters
  autoPause: boolean;
  autoPauseSensitivity: 'low' | 'medium' | 'high';
  mapType: 'standard' | 'satellite' | 'hybrid';
  theme: 'light' | 'dark' | 'auto';
}

interface Activity {
  id: string;
  type: 'walking' | 'running';
  startTime: number;
  endTime: number;
  duration: number;  // in seconds
  distance: number;  // in meters
  steps: number;
  route: RoutePoint[];
  averagePace: number;  // in seconds per km
  maxPace: number;
  calories: number;
  elevationGain?: number;
  status: 'completed';
  createdAt: number;
}

interface RoutePoint {
  latitude: number;
  longitude: number;
  altitude?: number;
  timestamp: number;
  accuracy: number;
}

interface Goal {
  id: string;
  type: 'distance' | 'frequency' | 'duration';
  target: number;
  period: 'weekly' | 'monthly';
  startDate: number;
  endDate: number;
  progress: number;
  achieved: boolean;
  createdAt: number;
}

interface Statistics {
  period: 'week' | 'month' | 'allTime';
  totalDistance: number;
  totalDuration: number;
  totalActivities: number;
  totalSteps: number;
  totalCalories: number;
  averagePace: number;
  personalRecords: PersonalRecords;
}

interface PersonalRecords {
  longestDistance: ActivityRecord;
  fastestPace: ActivityRecord;
  longestDuration: ActivityRecord;
  mostSteps: ActivityRecord;
}

interface ActivityRecord {
  value: number;
  activityId: string;
  date: number;
}
```

## State Management

### Context Providers

#### ActivityContext
- Current active activity
- Activity state (active, paused, stopped)
- Real-time metrics
- Activity controls

#### SettingsContext
- User preferences
- Unit system
- Notification settings
- Theme preferences

### Custom Hooks

```typescript
// Activity tracking
useActivityTracking(): {
  startActivity: (type: ActivityType) => Promise<void>;
  pauseActivity: () => void;
  resumeActivity: () => void;
  stopActivity: () => Promise<Activity>;
  currentActivity: Activity | null;
  metrics: ActivityMetrics;
  isTracking: boolean;
}

// Location
useLocation(): {
  currentLocation: Location | null;
  startTracking: () => Promise<void>;
  stopTracking: () => void;
  hasPermission: boolean;
  requestPermission: () => Promise<boolean>;
}

// Activity history
useActivityHistory(filters?: ActivityFilters): {
  activities: Activity[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
}

// Statistics
useStatistics(period: 'week' | 'month' | 'allTime'): {
  stats: Statistics;
  loading: boolean;
  error: Error | null;
}

// Goals
useGoals(): {
  goals: Goal[];
  createGoal: (goal: Omit<Goal, 'id'>) => Promise<void>;
  updateGoal: (goalId: string, updates: Partial<Goal>) => Promise<void>;
  deleteGoal: (goalId: string) => Promise<void>;
}
```

## Background Task Implementation

### Location Tracking Task

```typescript
// Background location task definition with high accuracy
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    // Handle error
    console.error('Location tracking error:', error);
    return;
  }
  
  if (data) {
    const { locations } = data;
    
    // Filter high-accuracy points only
    const accurateLocations = locations.filter(loc => 
      loc.coords.accuracy <= 20  // Only accept points within 20m accuracy
    );
    
    if (accurateLocations.length > 0) {
      // Apply Kalman filter for path smoothing
      const smoothedLocations = applyKalmanFilter(accurateLocations);
      
      // Update activity route with accurate points
      await updateActivityRoute(smoothedLocations);
      
      // Calculate metrics with high precision
      await calculateMetrics();
      
      // Update notification with current stats
      await updateNotification();
    }
  }
});

// Start background location updates with highest accuracy
await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
  // Use best available accuracy for navigation
  accuracy: Location.Accuracy.BestForNavigation,
  
  // Optimal intervals for detailed tracking
  timeInterval: 3000,  // 3 seconds - frequent updates
  distanceInterval: 5,  // 5 meters - capture route details
  
  // Enable for continuous tracking
  showsBackgroundLocationIndicator: true,
  
  // Foreground service for Android
  foregroundService: {
    notificationTitle: 'Activity Tracking',
    notificationBody: 'Tracking your activity with high accuracy...',
    notificationColor: '#6C63FF',
  },
  
  // Additional accuracy settings
  mayShowUserSettingsDialog: true,
  deferredUpdatesInterval: 3000,
  deferredUpdatesDistance: 5,
});

// Kalman filter implementation for smooth, accurate paths
function applyKalmanFilter(locations: Location[]): Location[] {
  // Reduces GPS jitter while maintaining accuracy
  // Smooths the path without losing detail
  // Returns filtered location points
}
```

## Navigation Structure

```
MainTabs
  ├── ActivityStack
  │   ├── ActivityTracking
  │   └── ActivitySummary
  ├── HistoryStack
  │   ├── ActivityHistory
  │   └── ActivityDetail
  ├── StatsStack
  │   └── Statistics
  └── ProfileStack
      ├── Profile
      ├── Settings
      └── Goals
```

## Error Handling

### Error Categories

1. **Permission Errors**
   - Location permission denied
   - Notification permission denied
   - Strategy: Show explanatory dialogs, guide users to settings

3. **Sensor Errors**
   - GPS unavailable
   - Pedometer unavailable
   - Strategy: Graceful degradation, inform user of limitations

4. **Data Errors**
   - Invalid activity data
   - Storage quota exceeded
   - Strategy: Validate data, show user-friendly error messages, offer data cleanup

### Error Handling Pattern

```typescript
try {
  // Operation
  await storageService.saveActivity(activity);
} catch (error) {
  if (error instanceof PermissionError) {
    // Show permission dialog
    showPermissionDialog(error.permission);
  } else if (error instanceof StorageError) {
    // Handle storage issues
    showToast('Storage full. Please delete old activities.');
  } else {
    // Generic error handling
    logError(error);
    showToast('An error occurred. Please try again.');
  }
}
```

## Testing Strategy

### Unit Testing
- Service layer functions
- Utility functions (calculations, formatting)
- Custom hooks logic
- Data transformations

### Integration Testing
- AsyncStorage operations
- Location tracking flow
- Activity lifecycle
- Data persistence

### Component Testing
- UI component rendering
- User interactions
- State updates
- Navigation flows

### End-to-End Testing
- Complete activity tracking flow
- Authentication flow
- Activity history and detail views
- Settings persistence

### Testing Tools
- Jest for unit tests
- React Native Testing Library for component tests
- Detox for E2E tests (optional)

## Performance Considerations

### Optimization Strategies

1. **High-Accuracy Location Tracking**
   - Use BestForNavigation accuracy mode for maximum precision
   - Filter GPS points: reject accuracy > 20 meters
   - Implement Kalman filtering to smooth GPS jitter
   - Combine GPS + Network + Passive providers for best results
   - Detect and remove stationary points (speed < 0.5 m/s)
   - Monitor GPS signal quality and alert user if poor
   - Use speed and heading data for better path accuracy
   - Adaptive sampling: increase frequency during turns
   - Store raw GPS data for post-processing if needed

2. **High-Quality Map Rendering**
   - Use vector maps for crisp display at any zoom level
   - Enable high-resolution satellite imagery when available
   - Render polylines with anti-aliasing for smooth paths
   - Use appropriate line width based on zoom level
   - Implement route simplification only for very long routes (>10km)
   - Preserve route detail: minimum 5-meter point spacing
   - Use gradient colors for pace visualization on route
   - Cache map tiles for offline viewing of completed routes
   - Smooth polyline rendering with cubic bezier curves

3. **Data Management**
   - Implement pagination for activity history
   - Efficient AsyncStorage read/write operations
   - Batch operations for better performance

4. **State Updates**
   - Debounce rapid state changes
   - Memoize expensive calculations
   - Use React.memo for pure components

5. **Image Handling**
   - Compress profile pictures before upload
   - Use appropriate image dimensions
   - Implement image caching

6. **Battery Optimization**
   - Configurable GPS accuracy
   - Efficient background task management
   - Minimize wake locks

## Security and Privacy Considerations

1. **Data Privacy**
   - All data stored locally on device
   - No cloud synchronization
   - User has full control over their data
   - Data export/import functionality for backups

2. **Location Data**
   - User consent for location tracking
   - Location data never leaves the device
   - Privacy-focused design

3. **Data Management**
   - Clear data deletion options
   - Storage usage monitoring
   - Data export for user backup

## Deployment and Configuration

### Expo Configuration (app.json)

```json
{
  "expo": {
    "name": "Fitness Tracker",
    "slug": "fitness-tracker",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.fitnesstracker",
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "We need your location to track your activities",
        "NSLocationAlwaysAndWhenInUseUsageDescription": "We need your location to track activities in the background",
        "NSMotionUsageDescription": "We need access to your motion sensors to count steps"
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.yourcompany.fitnesstracker",
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "ACCESS_BACKGROUND_LOCATION",
        "ACTIVITY_RECOGNITION",
        "FOREGROUND_SERVICE"
      ]
    },
    "plugins": [
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Allow Fitness Tracker to use your location to track activities."
        }
      ],
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#ffffff"
        }
      ]
    ]
  }
}
```

### Environment Variables

```
GOOGLE_MAPS_API_KEY=  # Optional - for enhanced map features
```

## Future Enhancements

1. **Data Backup & Sync**
   - Cloud backup option (optional)
   - Export to CSV/JSON
   - Import from other fitness apps

2. **Advanced Analytics**
   - Heart rate monitoring (with wearables)
   - VO2 max estimation
   - Training load analysis
   - Recovery recommendations

3. **Route Planning**
   - Create custom routes
   - Discover popular routes
   - Route recommendations

4. **Integration**
   - Apple Health / Google Fit sync
   - Wearable device support
   - Third-party app integration

5. **Gamification**
   - Badges and achievements
   - Streak tracking
   - Level system
   - Virtual races

6. **Premium Features**
   - Advanced training plans
   - Personalized coaching
   - Detailed analytics
   - Ad-free experience
