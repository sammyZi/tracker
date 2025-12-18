# Activity History Screen

This directory contains the Activity History screen implementation for the Fitness Tracker App.

## Components

### ActivityHistoryScreen

The main screen component that displays a scrollable list of past activities with filtering and pagination capabilities.

**Features:**
- Scrollable activity list with pull-to-refresh
- Activity type filtering (All, Walking, Running)
- Date range filtering (All Time, Last Week, Last Month, Last Year)
- Pagination for large activity lists (20 items per page)
- Empty state with motivational message
- Filter modal with clear and apply actions
- Visual filter indicator badge

**Usage:**
```tsx
import { ActivityHistoryScreen } from './screens/history/ActivityHistoryScreen';

// In navigation
<Tab.Screen
  name="History"
  component={ActivityHistoryScreen}
/>
```

## Custom Hook

### useActivityHistory

A custom React hook that manages activity history state, filtering, and pagination.

**Features:**
- Automatic loading of activities from local storage
- Activity type and date range filtering
- Pagination support
- Pull-to-refresh functionality
- Error handling
- Loading states

**Usage:**
```tsx
import { useActivityHistory } from '../../hooks';

const {
  activities,
  loading,
  refreshing,
  hasMore,
  activityTypeFilter,
  dateRangeFilter,
  setActivityTypeFilter,
  setDateRangeFilter,
  refresh,
  loadMore,
} = useActivityHistory();
```

## Related Components

### ActivityCard

Displays a summary card for an activity with:
- Thumbnail map (or placeholder)
- Activity type icon and name
- Date
- Key metrics (distance, duration, pace)
- Steps and calories
- Activity type indicator bar

### EmptyState

Generic empty state component used when no activities are found:
- Icon
- Title
- Message
- Optional action button

## Data Flow

1. **Load Activities**: Activities are loaded from AsyncStorage via StorageService
2. **Apply Filters**: Date range and activity type filters are applied
3. **Pagination**: Activities are paginated (20 per page)
4. **Display**: Activities are rendered in a FlatList with ActivityCard components
5. **Refresh**: Pull-to-refresh reloads activities from storage
6. **Load More**: Scrolling to the end loads the next page

## Filter Options

### Activity Type
- All (default)
- Walking
- Running

### Date Range
- All Time (default)
- Last Week (7 days)
- Last Month (30 days)
- Last Year (365 days)

## Requirements Satisfied

This implementation satisfies the following requirements from the design document:

- **Requirement 4.1**: Display list of all completed activities sorted by date
- **Requirement 4.4**: Retrieve activity history from local storage
- **Requirement 4.5**: Filter activities by date range
- **Requirement 4.6**: Filter activities by type (walking/running)

## Future Enhancements

- Navigate to activity detail screen on card press
- Swipe actions for quick delete
- Search functionality
- Sort options (date, distance, duration)
- Export filtered activities
- Activity statistics summary at top
