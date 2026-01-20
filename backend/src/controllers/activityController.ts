import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { ApiError } from '../middleware/errorHandler';
import {
  createActivity,
  getUserActivities,
  getActivityById,
  deleteActivity,
} from '../services/activityService';
import { RouteData } from '../types';

/**
 * Activity Controller
 * Handles activity management operations
 */

/**
 * POST /api/activities
 * Create a new activity
 */
export const createActivityHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.uid;

    if (!userId) {
      throw new ApiError(401, 'User not authenticated');
    }

    const {
      type,
      startTime,
      endTime,
      duration,
      distance,
      pace,
      calories,
      route,
      isPrivate,
    } = req.body;

    // Validate required fields
    if (!type || !startTime || !endTime || duration === undefined || distance === undefined || 
        pace === undefined || calories === undefined || !route || isPrivate === undefined) {
      throw new ApiError(400, 'Missing required fields');
    }

    // Validate types
    if (!['walking', 'running'].includes(type)) {
      throw new ApiError(400, 'Activity type must be walking or running');
    }

    if (typeof duration !== 'number' || typeof distance !== 'number' || 
        typeof pace !== 'number' || typeof calories !== 'number') {
      throw new ApiError(400, 'Duration, distance, pace, and calories must be numbers');
    }

    if (typeof isPrivate !== 'boolean') {
      throw new ApiError(400, 'isPrivate must be a boolean');
    }

    // Parse dates
    const parsedStartTime = new Date(startTime);
    const parsedEndTime = new Date(endTime);

    if (isNaN(parsedStartTime.getTime()) || isNaN(parsedEndTime.getTime())) {
      throw new ApiError(400, 'Invalid date format for startTime or endTime');
    }

    // Validate route structure
    if (!route.coordinates || !Array.isArray(route.coordinates)) {
      throw new ApiError(400, 'Route must have a coordinates array');
    }

    // Create activity
    const activity = await createActivity(userId, {
      type,
      startTime: parsedStartTime,
      endTime: parsedEndTime,
      duration,
      distance,
      pace,
      calories,
      route: route as RouteData,
      isPrivate,
    });

    res.status(201).json({
      success: true,
      data: activity,
      message: 'Activity created successfully',
    });
  } catch (error: any) {
    if (error instanceof ApiError) {
      return next(error);
    }

    console.error('Create activity error:', error);
    return next(new ApiError(500, 'Failed to create activity'));
  }
};

/**
 * GET /api/activities
 * Retrieve user's activity history
 */
export const getActivitiesHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.uid;

    if (!userId) {
      throw new ApiError(401, 'User not authenticated');
    }

    // Parse limit from query params
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;

    if (isNaN(limit) || limit <= 0 || limit > 100) {
      throw new ApiError(400, 'Limit must be a number between 1 and 100');
    }

    const activities = await getUserActivities(userId, limit);

    res.status(200).json({
      success: true,
      data: activities,
      message: 'Activities retrieved successfully',
    });
  } catch (error: any) {
    if (error instanceof ApiError) {
      return next(error);
    }

    console.error('Get activities error:', error);
    return next(new ApiError(500, 'Failed to retrieve activities'));
  }
};

/**
 * GET /api/activities/:id
 * Retrieve a specific activity
 */
export const getActivityByIdHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.uid;

    if (!userId) {
      throw new ApiError(401, 'User not authenticated');
    }

    const { id } = req.params;

    if (!id) {
      throw new ApiError(400, 'Activity ID is required');
    }

    const activity = await getActivityById(id);

    if (!activity) {
      throw new ApiError(404, 'Activity not found');
    }

    // Verify ownership (users can only view their own activities for now)
    // In future tasks, we'll add logic to allow friends to view non-private activities
    if (activity.userId !== userId) {
      throw new ApiError(403, 'Not authorized to view this activity');
    }

    res.status(200).json({
      success: true,
      data: activity,
      message: 'Activity retrieved successfully',
    });
  } catch (error: any) {
    if (error instanceof ApiError) {
      return next(error);
    }

    console.error('Get activity by ID error:', error);
    return next(new ApiError(500, 'Failed to retrieve activity'));
  }
};

/**
 * DELETE /api/activities/:id
 * Delete an activity
 */
export const deleteActivityHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.uid;

    if (!userId) {
      throw new ApiError(401, 'User not authenticated');
    }

    const { id } = req.params;

    if (!id) {
      throw new ApiError(400, 'Activity ID is required');
    }

    await deleteActivity(id, userId);

    res.status(200).json({
      success: true,
      message: 'Activity deleted successfully',
    });
  } catch (error: any) {
    if (error instanceof ApiError) {
      return next(error);
    }

    console.error('Delete activity error:', error);
    return next(new ApiError(500, 'Failed to delete activity'));
  }
};
