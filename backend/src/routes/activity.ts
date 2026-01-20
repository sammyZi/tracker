import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  createActivityHandler,
  getActivitiesHandler,
  getActivityByIdHandler,
  deleteActivityHandler,
} from '../controllers/activityController';

const router = Router();

/**
 * All activity routes require authentication
 */
router.use(authMiddleware);

/**
 * POST /api/activities
 * Create a new activity
 */
router.post('/', createActivityHandler);

/**
 * GET /api/activities
 * Retrieve user's activity history
 */
router.get('/', getActivitiesHandler);

/**
 * GET /api/activities/:id
 * Retrieve a specific activity
 */
router.get('/:id', getActivityByIdHandler);

/**
 * DELETE /api/activities/:id
 * Delete an activity
 */
router.delete('/:id', deleteActivityHandler);

export default router;
