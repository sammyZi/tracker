import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { ApiError } from '../middleware/errorHandler';
import { getUserProfile, updateUserProfile } from '../services/userService';
import { UserProfile, PrivacySettings } from '../types';

/**
 * User Controller
 * Handles user profile management operations
 */

/**
 * GET /api/user/profile
 * Retrieve user profile data
 */
export const getProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.uid;

    if (!userId) {
      throw new ApiError(401, 'User not authenticated');
    }

    const user = await getUserProfile(userId);

    if (!user) {
      throw new ApiError(404, 'User profile not found');
    }

    res.status(200).json({
      success: true,
      data: user,
      message: 'Profile retrieved successfully',
    });
  } catch (error: any) {
    if (error instanceof ApiError) {
      return next(error);
    }

    console.error('Get profile error:', error);
    return next(new ApiError(500, 'Failed to retrieve profile'));
  }
};

/**
 * PUT /api/user/profile
 * Update user profile data
 */
export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.uid;

    if (!userId) {
      throw new ApiError(401, 'User not authenticated');
    }

    const { displayName, photoURL, profile, privacySettings } = req.body;

    // Validate that at least one field is being updated
    if (
      displayName === undefined &&
      photoURL === undefined &&
      profile === undefined &&
      privacySettings === undefined
    ) {
      throw new ApiError(400, 'No fields to update');
    }

    // Validate displayName if provided
    if (displayName !== undefined) {
      if (typeof displayName !== 'string' || displayName.trim().length === 0) {
        throw new ApiError(400, 'Display name must be a non-empty string');
      }
      if (displayName.length > 50) {
        throw new ApiError(400, 'Display name must be 50 characters or less');
      }
    }

    // Validate profile structure if provided
    if (profile !== undefined) {
      if (typeof profile !== 'object' || profile === null) {
        throw new ApiError(400, 'Profile must be an object');
      }

      // Validate required fields
      if (profile.age === undefined || profile.weight === undefined || profile.weightUnit === undefined) {
        throw new ApiError(400, 'Profile must include age, weight, and weightUnit');
      }

      // Validate types
      if (typeof profile.age !== 'number') {
        throw new ApiError(400, 'Age must be a number');
      }
      if (typeof profile.weight !== 'number') {
        throw new ApiError(400, 'Weight must be a number');
      }
      if (!['kg', 'lbs'].includes(profile.weightUnit)) {
        throw new ApiError(400, 'Weight unit must be kg or lbs');
      }

      // Validate optional fields
      if (profile.height !== undefined && typeof profile.height !== 'number') {
        throw new ApiError(400, 'Height must be a number');
      }
      if (profile.heightUnit !== undefined && !['cm', 'ft'].includes(profile.heightUnit)) {
        throw new ApiError(400, 'Height unit must be cm or ft');
      }
      if (profile.gender !== undefined && !['male', 'female', 'other'].includes(profile.gender)) {
        throw new ApiError(400, 'Gender must be male, female, or other');
      }
    }

    // Validate privacy settings if provided
    if (privacySettings !== undefined) {
      if (typeof privacySettings !== 'object' || privacySettings === null) {
        throw new ApiError(400, 'Privacy settings must be an object');
      }

      if (
        typeof privacySettings.showAge !== 'boolean' ||
        typeof privacySettings.showWeight !== 'boolean' ||
        typeof privacySettings.showHeight !== 'boolean'
      ) {
        throw new ApiError(400, 'Privacy settings must include boolean values for showAge, showWeight, and showHeight');
      }
    }

    // Update profile
    const updatedUser = await updateUserProfile(userId, {
      displayName,
      photoURL,
      profile,
      privacySettings,
    });

    res.status(200).json({
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully',
    });
  } catch (error: any) {
    if (error instanceof ApiError) {
      return next(error);
    }

    console.error('Update profile error:', error);
    return next(new ApiError(500, 'Failed to update profile'));
  }
};

/**
 * POST /api/user/profile/photo
 * Upload profile photo
 * Note: This is a placeholder implementation. In production, this would:
 * 1. Accept multipart/form-data file upload
 * 2. Upload to Firebase Storage or another cloud storage service
 * 3. Return the public URL
 * 4. Update the user's photoURL field
 * 
 * For now, we'll accept a photoURL string directly
 */
export const uploadProfilePhoto = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.uid;

    if (!userId) {
      throw new ApiError(401, 'User not authenticated');
    }

    const { photoURL } = req.body;

    if (!photoURL || typeof photoURL !== 'string') {
      throw new ApiError(400, 'Photo URL is required');
    }

    // Validate URL format (basic validation)
    try {
      new URL(photoURL);
    } catch {
      throw new ApiError(400, 'Invalid photo URL format');
    }

    // Update user's photo URL
    const updatedUser = await updateUserProfile(userId, {
      photoURL,
    });

    res.status(200).json({
      success: true,
      data: {
        photoURL: updatedUser.photoURL,
      },
      message: 'Profile photo updated successfully',
    });
  } catch (error: any) {
    if (error instanceof ApiError) {
      return next(error);
    }

    console.error('Upload profile photo error:', error);
    return next(new ApiError(500, 'Failed to upload profile photo'));
  }
};
