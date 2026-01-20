import { Router } from 'express';
import authRoutes from './auth';
import userRoutes from './user';
import activityRoutes from './activity';

const router = Router();

/**
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

/**
 * API info endpoint
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Social Fitness Platform API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      user: '/api/user',
      activities: '/api/activities',
      friends: '/api/friends',
      feed: '/api/feed',
      competitions: '/api/competitions',
    },
  });
});

/**
 * Mount route modules
 */
router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/activities', activityRoutes);

export default router;
