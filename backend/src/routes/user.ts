import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { getProfile, updateProfile, uploadProfilePhoto } from '../controllers/userController';

const router = Router();

/**
 * All user routes require authentication
 */
router.use(authMiddleware);

/**
 * GET /api/user/profile
 * Retrieve user profile data
 */
router.get('/profile', getProfile);

/**
 * PUT /api/user/profile
 * Update user profile data
 */
router.put('/profile', updateProfile);

/**
 * POST /api/user/profile/photo
 * Upload profile photo
 */
router.post('/profile/photo', uploadProfilePhoto);

export default router;
