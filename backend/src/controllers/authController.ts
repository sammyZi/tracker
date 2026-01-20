import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { getAuth, getFirestore } from '../config/firebase';
import { ApiError } from '../middleware/errorHandler';
import { User, PrivacySettings } from '../types';

/**
 * Auth Controller
 * Handles authentication-related operations
 */

/**
 * POST /api/auth/google
 * Verify Google OAuth token and create/retrieve user account
 */
export const googleAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      throw new ApiError(400, 'ID token is required');
    }

    // Verify the Google OAuth token with Firebase
    const decodedToken = await getAuth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    if (!email) {
      throw new ApiError(400, 'Email is required from Google account');
    }

    const db = getFirestore();
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();

    let isNewUser = false;
    let userData: User;

    if (!userDoc.exists) {
      // Create new user
      isNewUser = true;

      const defaultPrivacySettings: PrivacySettings = {
        showAge: true,
        showWeight: false,
        showHeight: false,
      };

      userData = {
        id: uid,
        email,
        displayName: name || email.split('@')[0],
        photoURL: picture,
        privacySettings: defaultPrivacySettings,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await userRef.set({
        email: userData.email,
        displayName: userData.displayName,
        photoURL: userData.photoURL,
        privacySettings: userData.privacySettings,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
      });
    } else {
      // Retrieve existing user
      const data = userDoc.data();
      userData = {
        id: uid,
        email: data?.email || email,
        displayName: data?.displayName || name || email.split('@')[0],
        photoURL: data?.photoURL || picture,
        profile: data?.profile,
        privacySettings: data?.privacySettings || {
          showAge: true,
          showWeight: false,
          showHeight: false,
        },
        createdAt: data?.createdAt?.toDate() || new Date(),
        updatedAt: new Date(),
      };

      // Update last access time
      await userRef.update({
        updatedAt: new Date(),
      });
    }

    // Generate a custom token (optional - client can use the Firebase token directly)
    // For this implementation, we'll return the Firebase token
    res.status(200).json({
      success: true,
      data: {
        user: userData,
        token: idToken,
        isNewUser,
      },
      message: isNewUser ? 'User created successfully' : 'User authenticated successfully',
    });
  } catch (error: any) {
    if (error instanceof ApiError) {
      return next(error);
    }

    // Handle Firebase-specific errors
    if (error.code === 'auth/id-token-expired') {
      return next(new ApiError(401, 'Token expired'));
    } else if (error.code === 'auth/argument-error') {
      return next(new ApiError(401, 'Invalid token'));
    } else if (error.code === 'auth/invalid-id-token') {
      return next(new ApiError(401, 'Invalid token'));
    }

    console.error('Google auth error:', error);
    return next(new ApiError(500, 'Authentication failed'));
  }
};
