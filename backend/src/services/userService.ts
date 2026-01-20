import { getFirestore } from '../config/firebase';
import { User, UserProfile, PrivacySettings } from '../types';
import { ApiError } from '../middleware/errorHandler';

/**
 * User Service
 * Handles user profile operations and Firestore interactions
 */

/**
 * Get user profile by user ID
 */
export const getUserProfile = async (userId: string): Promise<User | null> => {
  const db = getFirestore();
  const userRef = db.collection('users').doc(userId);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    return null;
  }

  const data = userDoc.data();
  if (!data) {
    return null;
  }

  return {
    id: userId,
    email: data.email,
    displayName: data.displayName,
    photoURL: data.photoURL,
    profile: data.profile,
    privacySettings: data.privacySettings,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  };
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
  userId: string,
  updates: {
    displayName?: string;
    photoURL?: string;
    profile?: UserProfile;
    privacySettings?: PrivacySettings;
  }
): Promise<User> => {
  const db = getFirestore();
  const userRef = db.collection('users').doc(userId);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    throw new ApiError(404, 'User not found');
  }

  // Validate profile data if provided
  if (updates.profile) {
    validateUserProfile(updates.profile);
  }

  // Prepare update data
  const updateData: any = {
    updatedAt: new Date(),
  };

  if (updates.displayName !== undefined) {
    updateData.displayName = updates.displayName;
  }

  if (updates.photoURL !== undefined) {
    updateData.photoURL = updates.photoURL;
  }

  if (updates.profile !== undefined) {
    updateData.profile = updates.profile;
  }

  if (updates.privacySettings !== undefined) {
    updateData.privacySettings = updates.privacySettings;
  }

  // Update in Firestore
  await userRef.update(updateData);

  // Fetch and return updated user
  const updatedUser = await getUserProfile(userId);
  if (!updatedUser) {
    throw new ApiError(500, 'Failed to retrieve updated user');
  }

  return updatedUser;
};

/**
 * Validate user profile data
 */
export const validateUserProfile = (profile: UserProfile): void => {
  // Validate age (13-120)
  if (profile.age < 13 || profile.age > 120) {
    throw new ApiError(400, 'Age must be between 13 and 120');
  }

  // Validate weight based on unit
  if (profile.weightUnit === 'kg') {
    if (profile.weight < 20 || profile.weight > 300) {
      throw new ApiError(400, 'Weight must be between 20 and 300 kg');
    }
  } else if (profile.weightUnit === 'lbs') {
    if (profile.weight < 44 || profile.weight > 660) {
      throw new ApiError(400, 'Weight must be between 44 and 660 lbs');
    }
  }

  // Validate height if provided
  if (profile.height !== undefined && profile.heightUnit) {
    if (profile.heightUnit === 'cm') {
      if (profile.height < 50 || profile.height > 250) {
        throw new ApiError(400, 'Height must be between 50 and 250 cm');
      }
    } else if (profile.heightUnit === 'ft') {
      if (profile.height < 1.5 || profile.height > 8.5) {
        throw new ApiError(400, 'Height must be between 1.5 and 8.5 ft');
      }
    }
  }
};

/**
 * Get user profile with privacy filtering
 * Returns only fields that are visible based on privacy settings
 */
export const getUserProfileWithPrivacy = async (
  userId: string,
  requesterId: string,
  areFriends: boolean
): Promise<Partial<User> | null> => {
  const user = await getUserProfile(userId);
  
  if (!user) {
    return null;
  }

  // If requesting own profile, return everything
  if (userId === requesterId) {
    return user;
  }

  // If not friends, return only basic info
  if (!areFriends) {
    return {
      id: user.id,
      displayName: user.displayName,
      photoURL: user.photoURL,
    };
  }

  // If friends, apply privacy settings
  const filteredUser: Partial<User> = {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    privacySettings: user.privacySettings,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  // Apply privacy filters to profile fields
  if (user.profile) {
    const filteredProfile: Partial<UserProfile> = {};

    if (user.privacySettings.showAge) {
      filteredProfile.age = user.profile.age;
    }

    if (user.privacySettings.showWeight) {
      filteredProfile.weight = user.profile.weight;
      filteredProfile.weightUnit = user.profile.weightUnit;
    }

    if (user.privacySettings.showHeight && user.profile.height) {
      filteredProfile.height = user.profile.height;
      filteredProfile.heightUnit = user.profile.heightUnit;
    }

    // Gender is always visible to friends
    if (user.profile.gender) {
      filteredProfile.gender = user.profile.gender;
    }

    if (Object.keys(filteredProfile).length > 0) {
      filteredUser.profile = filteredProfile as UserProfile;
    }
  }

  return filteredUser;
};

/**
 * Delete user account and all associated data
 */
export const deleteUserAccount = async (userId: string): Promise<void> => {
  const db = getFirestore();
  const batch = db.batch();

  // Delete user document
  const userRef = db.collection('users').doc(userId);
  batch.delete(userRef);

  // Note: In a production system, we would also need to:
  // - Delete all user activities
  // - Remove user from all friendships
  // - Remove user from all competitions
  // - Delete all user reactions
  // - Delete all user notifications
  // This will be implemented in later tasks

  await batch.commit();
};
