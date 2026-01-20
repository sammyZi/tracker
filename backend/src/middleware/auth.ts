import { Request, Response, NextFunction } from 'express';
import { getAuth } from '../config/firebase';
import { ApiError } from './errorHandler';

/**
 * Extended Request interface with user information
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
  };
}

/**
 * Authentication middleware
 * Verifies Firebase token and attaches user info to request
 */
export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'No token provided');
    }

    const token = authHeader.split('Bearer ')[1];

    if (!token) {
      throw new ApiError(401, 'Invalid token format');
    }

    // Verify token with Firebase
    const decodedToken = await getAuth().verifyIdToken(token);

    // Attach user info to request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
    };

    next();
  } catch (error: any) {
    if (error instanceof ApiError) {
      next(error);
    } else if (error.code === 'auth/id-token-expired') {
      next(new ApiError(401, 'Token expired'));
    } else if (error.code === 'auth/argument-error') {
      next(new ApiError(401, 'Invalid token'));
    } else {
      next(new ApiError(401, 'Authentication failed'));
    }
  }
};

/**
 * Optional authentication middleware
 * Attaches user info if token is present, but doesn't require it
 */
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split('Bearer ')[1];
      const decodedToken = await getAuth().verifyIdToken(token);

      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
      };
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};
