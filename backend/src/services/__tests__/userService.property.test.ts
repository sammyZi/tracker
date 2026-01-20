import * as fc from 'fast-check';
import { getUserProfileWithPrivacy, validateUserProfile } from '../userService';
import { getFirestore } from '../../config/firebase';
import { UserProfile, PrivacySettings, User } from '../../types';

// Mock Firebase
jest.mock('../../config/firebase');

/**
 * Feature: social-fitness-platform, Property 9: Profile Privacy Controls
 * 
 * For any profile view request, only fields marked as visible in privacy settings
 * should be shown to friends, and private fields should be hidden.
 * 
 * Validates: Requirements 5.6, 5.7
 */
describe('Property 9: Profile Privacy Controls', () => {
  let mockFirestore: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup Firestore mock
    mockFirestore = {
      collection: jest.fn().mockReturnThis(),
      doc: jest.fn().mockReturnThis(),
      get: jest.fn(),
    };

    (getFirestore as jest.Mock).mockReturnValue(mockFirestore);
  });

  // Arbitrary generators for property-based testing
  const userProfileArbitrary = (): fc.Arbitrary<UserProfile> =>
    fc.record({
      age: fc.integer({ min: 13, max: 120 }),
      weight: fc.float({ min: 20, max: 300, noNaN: true }),
      weightUnit: fc.constantFrom('kg' as const, 'lbs' as const),
      height: fc.option(fc.float({ min: 50, max: 250, noNaN: true })),
      heightUnit: fc.option(fc.constantFrom('cm' as const, 'ft' as const)),
      gender: fc.option(fc.constantFrom('male' as const, 'female' as const, 'other' as const)),
    });

  const privacySettingsArbitrary = (): fc.Arbitrary<PrivacySettings> =>
    fc.record({
      showAge: fc.boolean(),
      showWeight: fc.boolean(),
      showHeight: fc.boolean(),
    });

  const userArbitrary = (): fc.Arbitrary<User> =>
    fc.record({
      id: fc.uuid(),
      email: fc.emailAddress(),
      displayName: fc.string({ minLength: 1, maxLength: 50 }),
      photoURL: fc.option(fc.webUrl()),
      profile: fc.option(userProfileArbitrary()),
      privacySettings: privacySettingsArbitrary(),
      createdAt: fc.date(),
      updatedAt: fc.date(),
    });

  it('should hide age field when showAge is false for friends', async () => {
    await fc.assert(
      fc.asyncProperty(
        userArbitrary(),
        fc.uuid(), // requesterId (different from userId)
        async (user, requesterId) => {
          // Ensure user has a profile with age
          if (!user.profile) {
            user.profile = {
              age: 25,
              weight: 70,
              weightUnit: 'kg',
            };
          }

          // Set showAge to false
          user.privacySettings.showAge = false;

          // Mock Firestore to return this user
          mockFirestore.get.mockResolvedValue({
            exists: true,
            data: () => ({
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              profile: user.profile,
              privacySettings: user.privacySettings,
              createdAt: { toDate: () => user.createdAt },
              updatedAt: { toDate: () => user.updatedAt },
            }),
          });

          // Get profile with privacy filtering (as a friend)
          const filteredProfile = await getUserProfileWithPrivacy(user.id, requesterId, true);

          // Age should not be present in the filtered profile
          expect(filteredProfile?.profile?.age).toBeUndefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should show age field when showAge is true for friends', async () => {
    await fc.assert(
      fc.asyncProperty(
        userArbitrary(),
        fc.uuid(), // requesterId (different from userId)
        async (user, requesterId) => {
          // Ensure user has a profile with age
          if (!user.profile) {
            user.profile = {
              age: 25,
              weight: 70,
              weightUnit: 'kg',
            };
          }

          // Set showAge to true
          user.privacySettings.showAge = true;

          // Mock Firestore to return this user
          mockFirestore.get.mockResolvedValue({
            exists: true,
            data: () => ({
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              profile: user.profile,
              privacySettings: user.privacySettings,
              createdAt: { toDate: () => user.createdAt },
              updatedAt: { toDate: () => user.updatedAt },
            }),
          });

          // Get profile with privacy filtering (as a friend)
          const filteredProfile = await getUserProfileWithPrivacy(user.id, requesterId, true);

          // Age should be present in the filtered profile
          expect(filteredProfile?.profile?.age).toBe(user.profile.age);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should hide weight field when showWeight is false for friends', async () => {
    await fc.assert(
      fc.asyncProperty(
        userArbitrary(),
        fc.uuid(), // requesterId (different from userId)
        async (user, requesterId) => {
          // Ensure user has a profile with weight
          if (!user.profile) {
            user.profile = {
              age: 25,
              weight: 70,
              weightUnit: 'kg',
            };
          }

          // Set showWeight to false
          user.privacySettings.showWeight = false;

          // Mock Firestore to return this user
          mockFirestore.get.mockResolvedValue({
            exists: true,
            data: () => ({
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              profile: user.profile,
              privacySettings: user.privacySettings,
              createdAt: { toDate: () => user.createdAt },
              updatedAt: { toDate: () => user.updatedAt },
            }),
          });

          // Get profile with privacy filtering (as a friend)
          const filteredProfile = await getUserProfileWithPrivacy(user.id, requesterId, true);

          // Weight should not be present in the filtered profile
          expect(filteredProfile?.profile?.weight).toBeUndefined();
          expect(filteredProfile?.profile?.weightUnit).toBeUndefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should show weight field when showWeight is true for friends', async () => {
    await fc.assert(
      fc.asyncProperty(
        userArbitrary(),
        fc.uuid(), // requesterId (different from userId)
        async (user, requesterId) => {
          // Ensure user has a profile with weight
          if (!user.profile) {
            user.profile = {
              age: 25,
              weight: 70,
              weightUnit: 'kg',
            };
          }

          // Set showWeight to true
          user.privacySettings.showWeight = true;

          // Mock Firestore to return this user
          mockFirestore.get.mockResolvedValue({
            exists: true,
            data: () => ({
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              profile: user.profile,
              privacySettings: user.privacySettings,
              createdAt: { toDate: () => user.createdAt },
              updatedAt: { toDate: () => user.updatedAt },
            }),
          });

          // Get profile with privacy filtering (as a friend)
          const filteredProfile = await getUserProfileWithPrivacy(user.id, requesterId, true);

          // Weight should be present in the filtered profile
          expect(filteredProfile?.profile?.weight).toBe(user.profile.weight);
          expect(filteredProfile?.profile?.weightUnit).toBe(user.profile.weightUnit);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should hide height field when showHeight is false for friends', async () => {
    await fc.assert(
      fc.asyncProperty(
        userArbitrary(),
        fc.uuid(), // requesterId (different from userId)
        async (user, requesterId) => {
          // Ensure user has a profile with height
          if (!user.profile) {
            user.profile = {
              age: 25,
              weight: 70,
              weightUnit: 'kg',
              height: 180,
              heightUnit: 'cm',
            };
          } else if (!user.profile.height) {
            user.profile.height = 180;
            user.profile.heightUnit = 'cm';
          }

          // Set showHeight to false
          user.privacySettings.showHeight = false;

          // Mock Firestore to return this user
          mockFirestore.get.mockResolvedValue({
            exists: true,
            data: () => ({
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              profile: user.profile,
              privacySettings: user.privacySettings,
              createdAt: { toDate: () => user.createdAt },
              updatedAt: { toDate: () => user.updatedAt },
            }),
          });

          // Get profile with privacy filtering (as a friend)
          const filteredProfile = await getUserProfileWithPrivacy(user.id, requesterId, true);

          // Height should not be present in the filtered profile
          expect(filteredProfile?.profile?.height).toBeUndefined();
          expect(filteredProfile?.profile?.heightUnit).toBeUndefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should show height field when showHeight is true for friends', async () => {
    await fc.assert(
      fc.asyncProperty(
        userArbitrary(),
        fc.uuid(), // requesterId (different from userId)
        async (user, requesterId) => {
          // Ensure user has a profile with height
          if (!user.profile) {
            user.profile = {
              age: 25,
              weight: 70,
              weightUnit: 'kg',
              height: 180,
              heightUnit: 'cm',
            };
          } else if (!user.profile.height) {
            user.profile.height = 180;
            user.profile.heightUnit = 'cm';
          }

          // Set showHeight to true
          user.privacySettings.showHeight = true;

          // Mock Firestore to return this user
          mockFirestore.get.mockResolvedValue({
            exists: true,
            data: () => ({
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              profile: user.profile,
              privacySettings: user.privacySettings,
              createdAt: { toDate: () => user.createdAt },
              updatedAt: { toDate: () => user.updatedAt },
            }),
          });

          // Get profile with privacy filtering (as a friend)
          const filteredProfile = await getUserProfileWithPrivacy(user.id, requesterId, true);

          // Height should be present in the filtered profile
          expect(filteredProfile?.profile?.height).toBe(user.profile.height);
          expect(filteredProfile?.profile?.heightUnit).toBe(user.profile.heightUnit);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return only basic info for non-friends', async () => {
    await fc.assert(
      fc.asyncProperty(
        userArbitrary(),
        fc.uuid(), // requesterId (different from userId)
        async (user, requesterId) => {
          // Ensure user has a profile
          if (!user.profile) {
            user.profile = {
              age: 25,
              weight: 70,
              weightUnit: 'kg',
            };
          }

          // Mock Firestore to return this user
          mockFirestore.get.mockResolvedValue({
            exists: true,
            data: () => ({
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              profile: user.profile,
              privacySettings: user.privacySettings,
              createdAt: { toDate: () => user.createdAt },
              updatedAt: { toDate: () => user.updatedAt },
            }),
          });

          // Get profile with privacy filtering (NOT a friend)
          const filteredProfile = await getUserProfileWithPrivacy(user.id, requesterId, false);

          // Should only have basic info
          expect(filteredProfile).toEqual({
            id: user.id,
            displayName: user.displayName,
            photoURL: user.photoURL,
          });

          // Should not have email, profile, or other sensitive data
          expect(filteredProfile?.email).toBeUndefined();
          expect(filteredProfile?.profile).toBeUndefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return full profile when requesting own profile', async () => {
    await fc.assert(
      fc.asyncProperty(userArbitrary(), async (user) => {
        // Ensure user has a profile
        if (!user.profile) {
          user.profile = {
            age: 25,
            weight: 70,
            weightUnit: 'kg',
          };
        }

        // Mock Firestore to return this user
        mockFirestore.get.mockResolvedValue({
          exists: true,
          data: () => ({
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            profile: user.profile,
            privacySettings: user.privacySettings,
            createdAt: { toDate: () => user.createdAt },
            updatedAt: { toDate: () => user.updatedAt },
          }),
        });

        // Get own profile (userId === requesterId)
        const fullProfile = await getUserProfileWithPrivacy(user.id, user.id, true);

        // Should have all fields regardless of privacy settings
        expect(fullProfile?.id).toBe(user.id);
        expect(fullProfile?.email).toBe(user.email);
        expect(fullProfile?.displayName).toBe(user.displayName);
        expect(fullProfile?.profile?.age).toBe(user.profile.age);
        expect(fullProfile?.profile?.weight).toBe(user.profile.weight);
      }),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: social-fitness-platform, Property 7: Profile Field Validation
 * 
 * For any user profile input, age should be validated to be between 13 and 120,
 * weight should be within reasonable ranges for the selected unit, and height
 * should be within reasonable ranges for the selected unit.
 * 
 * Validates: Requirements 4.4, 4.5, 4.6
 */
describe('Property 7: Profile Field Validation', () => {
  it('should accept valid age values between 13 and 120', () => {
    fc.assert(
      fc.property(fc.integer({ min: 13, max: 120 }), (age) => {
        const profile: UserProfile = {
          age,
          weight: 70,
          weightUnit: 'kg',
        };

        // Should not throw
        expect(() => validateUserProfile(profile)).not.toThrow();
      }),
      { numRuns: 100 }
    );
  });

  it('should reject age values below 13', () => {
    fc.assert(
      fc.property(fc.integer({ min: -100, max: 12 }), (age) => {
        const profile: UserProfile = {
          age,
          weight: 70,
          weightUnit: 'kg',
        };

        // Should throw
        expect(() => validateUserProfile(profile)).toThrow('Age must be between 13 and 120');
      }),
      { numRuns: 100 }
    );
  });

  it('should reject age values above 120', () => {
    fc.assert(
      fc.property(fc.integer({ min: 121, max: 200 }), (age) => {
        const profile: UserProfile = {
          age,
          weight: 70,
          weightUnit: 'kg',
        };

        // Should throw
        expect(() => validateUserProfile(profile)).toThrow('Age must be between 13 and 120');
      }),
      { numRuns: 100 }
    );
  });

  it('should accept valid weight values in kg (20-300)', () => {
    fc.assert(
      fc.property(fc.float({ min: 20, max: 300, noNaN: true }), (weight) => {
        const profile: UserProfile = {
          age: 25,
          weight,
          weightUnit: 'kg',
        };

        // Should not throw
        expect(() => validateUserProfile(profile)).not.toThrow();
      }),
      { numRuns: 100 }
    );
  });

  it('should reject weight values in kg below 20', () => {
    fc.assert(
      fc.property(fc.float({ min: Math.fround(0.1), max: Math.fround(19.9), noNaN: true }), (weight) => {
        const profile: UserProfile = {
          age: 25,
          weight,
          weightUnit: 'kg',
        };

        // Should throw
        expect(() => validateUserProfile(profile)).toThrow('Weight must be between 20 and 300 kg');
      }),
      { numRuns: 100 }
    );
  });

  it('should reject weight values in kg above 300', () => {
    fc.assert(
      fc.property(fc.float({ min: Math.fround(300.1), max: Math.fround(500), noNaN: true }), (weight) => {
        const profile: UserProfile = {
          age: 25,
          weight,
          weightUnit: 'kg',
        };

        // Should throw
        expect(() => validateUserProfile(profile)).toThrow('Weight must be between 20 and 300 kg');
      }),
      { numRuns: 100 }
    );
  });

  it('should accept valid weight values in lbs (44-660)', () => {
    fc.assert(
      fc.property(fc.float({ min: 44, max: 660, noNaN: true }), (weight) => {
        const profile: UserProfile = {
          age: 25,
          weight,
          weightUnit: 'lbs',
        };

        // Should not throw
        expect(() => validateUserProfile(profile)).not.toThrow();
      }),
      { numRuns: 100 }
    );
  });

  it('should reject weight values in lbs below 44', () => {
    fc.assert(
      fc.property(fc.float({ min: Math.fround(1), max: Math.fround(43.9), noNaN: true }), (weight) => {
        const profile: UserProfile = {
          age: 25,
          weight,
          weightUnit: 'lbs',
        };

        // Should throw
        expect(() => validateUserProfile(profile)).toThrow('Weight must be between 44 and 660 lbs');
      }),
      { numRuns: 100 }
    );
  });

  it('should reject weight values in lbs above 660', () => {
    fc.assert(
      fc.property(fc.float({ min: Math.fround(660.1), max: Math.fround(1000), noNaN: true }), (weight) => {
        const profile: UserProfile = {
          age: 25,
          weight,
          weightUnit: 'lbs',
        };

        // Should throw
        expect(() => validateUserProfile(profile)).toThrow('Weight must be between 44 and 660 lbs');
      }),
      { numRuns: 100 }
    );
  });

  it('should accept valid height values in cm (50-250)', () => {
    fc.assert(
      fc.property(fc.float({ min: 50, max: 250, noNaN: true }), (height) => {
        const profile: UserProfile = {
          age: 25,
          weight: 70,
          weightUnit: 'kg',
          height,
          heightUnit: 'cm',
        };

        // Should not throw
        expect(() => validateUserProfile(profile)).not.toThrow();
      }),
      { numRuns: 100 }
    );
  });

  it('should reject height values in cm below 50', () => {
    fc.assert(
      fc.property(fc.float({ min: Math.fround(1), max: Math.fround(49.9), noNaN: true }), (height) => {
        const profile: UserProfile = {
          age: 25,
          weight: 70,
          weightUnit: 'kg',
          height,
          heightUnit: 'cm',
        };

        // Should throw
        expect(() => validateUserProfile(profile)).toThrow('Height must be between 50 and 250 cm');
      }),
      { numRuns: 100 }
    );
  });

  it('should reject height values in cm above 250', () => {
    fc.assert(
      fc.property(fc.float({ min: Math.fround(250.1), max: Math.fround(400), noNaN: true }), (height) => {
        const profile: UserProfile = {
          age: 25,
          weight: 70,
          weightUnit: 'kg',
          height,
          heightUnit: 'cm',
        };

        // Should throw
        expect(() => validateUserProfile(profile)).toThrow('Height must be between 50 and 250 cm');
      }),
      { numRuns: 100 }
    );
  });

  it('should accept valid height values in ft (1.5-8.5)', () => {
    fc.assert(
      fc.property(fc.float({ min: 1.5, max: 8.5, noNaN: true }), (height) => {
        const profile: UserProfile = {
          age: 25,
          weight: 70,
          weightUnit: 'kg',
          height,
          heightUnit: 'ft',
        };

        // Should not throw
        expect(() => validateUserProfile(profile)).not.toThrow();
      }),
      { numRuns: 100 }
    );
  });

  it('should reject height values in ft below 1.5', () => {
    fc.assert(
      fc.property(fc.float({ min: Math.fround(0.1), max: Math.fround(1.49), noNaN: true }), (height) => {
        const profile: UserProfile = {
          age: 25,
          weight: 70,
          weightUnit: 'kg',
          height,
          heightUnit: 'ft',
        };

        // Should throw
        expect(() => validateUserProfile(profile)).toThrow('Height must be between 1.5 and 8.5 ft');
      }),
      { numRuns: 100 }
    );
  });

  it('should reject height values in ft above 8.5', () => {
    fc.assert(
      fc.property(fc.float({ min: Math.fround(8.51), max: Math.fround(15), noNaN: true }), (height) => {
        const profile: UserProfile = {
          age: 25,
          weight: 70,
          weightUnit: 'kg',
          height,
          heightUnit: 'ft',
        };

        // Should throw
        expect(() => validateUserProfile(profile)).toThrow('Height must be between 1.5 and 8.5 ft');
      }),
      { numRuns: 100 }
    );
  });
});
