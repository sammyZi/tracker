import { Router } from 'express';
import { googleAuth } from '../controllers/authController';

const router = Router();

/**
 * POST /api/auth/google
 * Authenticate user with Google OAuth token
 */
router.post('/google', googleAuth);

export default router;
