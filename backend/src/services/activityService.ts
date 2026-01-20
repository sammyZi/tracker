import { getFirestore } from '../config/firebase';
import { Activity, RouteData } from '../types';
import { ApiError } from '../middleware/errorHandler';

/**
 * Activity Service
 * Handles activity operations and Firestore interactions
 */

/**
 * Create a new activity
 */
export const createActivity = async (
  userId: string,
  activityData: {
    type: 'walking' | 'running';
    startTime: Date;
    endTime: Date;
    duration: number;
    distance: number;
    pace: number;
    calories: number;
    route: RouteData;
    isPrivate: boolean;
  }
): Promise<Activity> => {
  const db = getFirestore();
  
  // Validate activity data
  validateActivityData(activityData);

  // Create activity document
  const activityRef = db.collection('activities').doc();
  const activity: Activity = {
    id: activityRef.id,
    userId,
    type: activityData.type,
    startTime: activityData.startTime,
    endTime: activityData.endTime,
    duration: activityData.duration,
    distance: activityData.distance,
    pace: activityData.pace,
    calories: activityData.calories,
    route: activityData.route,
    isPrivate: activityData.isPrivate,
    createdAt: new Date(),
  };

  // Save to Firestore
  await activityRef.set({
    userId: activity.userId,
    type: activity.type,
    startTime: activity.startTime,
    endTime: activity.endTime,
    duration: activity.duration,
    distance: activity.distance,
    pace: activity.pace,
    calories: activity.calories,
    route: activity.route,
    isPrivate: activity.isPrivate,
    createdAt: activity.createdAt,
  });

  return activity;
};

/**
 * Get user activities
 */
export const getUserActivities = async (
  userId: string,
  limit: number = 50
): Promise<Activity[]> => {
  const db = getFirestore();
  
  const activitiesSnapshot = await db
    .collection('activities')
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .get();

  const activities: Activity[] = [];
  activitiesSnapshot.forEach((doc) => {
    const data = doc.data();
    activities.push({
      id: doc.id,
      userId: data.userId,
      type: data.type,
      startTime: data.startTime.toDate(),
      endTime: data.endTime.toDate(),
      duration: data.duration,
      distance: data.distance,
      pace: data.pace,
      calories: data.calories,
      route: data.route,
      isPrivate: data.isPrivate,
      createdAt: data.createdAt.toDate(),
    });
  });

  return activities;
};

/**
 * Get activity by ID
 */
export const getActivityById = async (
  activityId: string
): Promise<Activity | null> => {
  const db = getFirestore();
  const activityRef = db.collection('activities').doc(activityId);
  const activityDoc = await activityRef.get();

  if (!activityDoc.exists) {
    return null;
  }

  const data = activityDoc.data();
  if (!data) {
    return null;
  }

  return {
    id: activityDoc.id,
    userId: data.userId,
    type: data.type,
    startTime: data.startTime.toDate(),
    endTime: data.endTime.toDate(),
    duration: data.duration,
    distance: data.distance,
    pace: data.pace,
    calories: data.calories,
    route: data.route,
    isPrivate: data.isPrivate,
    createdAt: data.createdAt.toDate(),
  };
};

/**
 * Delete activity
 */
export const deleteActivity = async (
  activityId: string,
  userId: string
): Promise<void> => {
  const db = getFirestore();
  const activityRef = db.collection('activities').doc(activityId);
  const activityDoc = await activityRef.get();

  if (!activityDoc.exists) {
    throw new ApiError(404, 'Activity not found');
  }

  const data = activityDoc.data();
  
  // Verify ownership
  if (data?.userId !== userId) {
    throw new ApiError(403, 'Not authorized to delete this activity');
  }

  await activityRef.delete();
};

/**
 * Get activities in time range
 */
export const getActivitiesInTimeRange = async (
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<Activity[]> => {
  const db = getFirestore();
  
  const activitiesSnapshot = await db
    .collection('activities')
    .where('userId', '==', userId)
    .where('startTime', '>=', startDate)
    .where('startTime', '<=', endDate)
    .orderBy('startTime', 'desc')
    .get();

  const activities: Activity[] = [];
  activitiesSnapshot.forEach((doc) => {
    const data = doc.data();
    activities.push({
      id: doc.id,
      userId: data.userId,
      type: data.type,
      startTime: data.startTime.toDate(),
      endTime: data.endTime.toDate(),
      duration: data.duration,
      distance: data.distance,
      pace: data.pace,
      calories: data.calories,
      route: data.route,
      isPrivate: data.isPrivate,
      createdAt: data.createdAt.toDate(),
    });
  });

  return activities;
};

/**
 * Validate activity data
 */
const validateActivityData = (activityData: {
  type: 'walking' | 'running';
  startTime: Date;
  endTime: Date;
  duration: number;
  distance: number;
  pace: number;
  calories: number;
  route: RouteData;
  isPrivate: boolean;
}): void => {
  // Validate activity type
  if (!['walking', 'running'].includes(activityData.type)) {
    throw new ApiError(400, 'Activity type must be walking or running');
  }

  // Validate timestamps
  if (activityData.startTime >= activityData.endTime) {
    throw new ApiError(400, 'End time must be after start time');
  }

  // Validate duration (must be positive)
  if (activityData.duration <= 0) {
    throw new ApiError(400, 'Duration must be positive');
  }

  // Validate distance (must be positive)
  if (activityData.distance <= 0) {
    throw new ApiError(400, 'Distance must be positive');
  }

  // Validate pace (must be positive)
  if (activityData.pace <= 0) {
    throw new ApiError(400, 'Pace must be positive');
  }

  // Validate calories (must be non-negative)
  if (activityData.calories < 0) {
    throw new ApiError(400, 'Calories must be non-negative');
  }

  // Validate route has coordinates
  if (!activityData.route.coordinates || activityData.route.coordinates.length === 0) {
    throw new ApiError(400, 'Route must have at least one coordinate');
  }

  // Validate route coordinates
  activityData.route.coordinates.forEach((coord, index) => {
    if (typeof coord.lat !== 'number' || typeof coord.lng !== 'number' || typeof coord.timestamp !== 'number') {
      throw new ApiError(400, `Invalid coordinate at index ${index}`);
    }

    // Validate latitude range (-90 to 90)
    if (coord.lat < -90 || coord.lat > 90) {
      throw new ApiError(400, `Invalid latitude at index ${index}: must be between -90 and 90`);
    }

    // Validate longitude range (-180 to 180)
    if (coord.lng < -180 || coord.lng > 180) {
      throw new ApiError(400, `Invalid longitude at index ${index}: must be between -180 and 180`);
    }
  });
};
