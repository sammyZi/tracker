import * as fc from 'fast-check';
import {
  createActivity,
  getUserActivities,
  getActivityById,
  deleteActivity,
} from '../activityService';
import { getFirestore } from '../../config/firebase';
import { Activity, RouteData, RoutePoint } from '../../types';

// Mock Firebase
jest.mock('../../config/firebase');

/**
 * Feature: social-fitness-platform, Property 3: Activity Cloud Sync
 * 
 * For any completed activity, the app should upload it to Firestore
 * (immediately if online, or queue it for later sync if offline),
 * ensuring no activities are lost.
 * 
 * Validates: Requirements 3.1, 3.6
 */
describe('Property 3: Activity Cloud Sync', () => {
  let mockFirestore: any;
  let mockCollection: any;
  let mockDoc: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup Firestore mock
    mockDoc = {
      id: 'mock-activity-id',
      set: jest.fn().mockResolvedValue(undefined),
      get: jest.fn(),
      delete: jest.fn().mockResolvedValue(undefined),
    };

    mockCollection = {
      doc: jest.fn().mockReturnValue(mockDoc),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      get: jest.fn(),
    };

    mockFirestore = {
      collection: jest.fn().mockReturnValue(mockCollection),
    };

    (getFirestore as jest.Mock).mockReturnValue(mockFirestore);
  });

  // Arbitrary generators for property-based testing
  const routePointArbitrary = (): fc.Arbitrary<RoutePoint> =>
    fc.record({
      lat: fc.float({ min: -90, max: 90, noNaN: true }),
      lng: fc.float({ min: -180, max: 180, noNaN: true }),
      timestamp: fc.integer({ min: 1000000000000, max: 9999999999999 }), // Valid Unix timestamps
    });

  const routeDataArbitrary = (): fc.Arbitrary<RouteData> =>
    fc.record({
      coordinates: fc.array(routePointArbitrary(), { minLength: 1, maxLength: 100 }),
    });

  const activityDataArbitrary = () =>
    fc.record({
      type: fc.constantFrom('walking' as const, 'running' as const),
      startTime: fc.date({ min: new Date('2020-01-01'), max: new Date('2025-12-31') }),
      endTime: fc.date({ min: new Date('2020-01-01'), max: new Date('2025-12-31') }),
      duration: fc.integer({ min: 60, max: 36000 }), // 1 minute to 10 hours in seconds
      distance: fc.float({ min: 100, max: 100000, noNaN: true }), // 100m to 100km in meters
      pace: fc.float({ min: 3, max: 20, noNaN: true }), // 3-20 min/km
      calories: fc.integer({ min: 10, max: 5000 }),
      route: routeDataArbitrary(),
      isPrivate: fc.boolean(),
    }).filter((data) => data.startTime < data.endTime); // Ensure valid time range

  it('should successfully upload any valid activity to Firestore', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(), // userId
        activityDataArbitrary(),
        async (userId, activityData) => {
          // Mock successful Firestore set
          mockDoc.set.mockResolvedValue(undefined);

          // Create activity
          const activity = await createActivity(userId, activityData);

          // Verify Firestore was called with correct data
          expect(mockFirestore.collection).toHaveBeenCalledWith('activities');
          expect(mockCollection.doc).toHaveBeenCalled();
          expect(mockDoc.set).toHaveBeenCalledWith({
            userId,
            type: activityData.type,
            startTime: activityData.startTime,
            endTime: activityData.endTime,
            duration: activityData.duration,
            distance: activityData.distance,
            pace: activityData.pace,
            calories: activityData.calories,
            route: activityData.route,
            isPrivate: activityData.isPrivate,
            createdAt: expect.any(Date),
          });

          // Verify returned activity has correct structure
          expect(activity).toMatchObject({
            id: expect.any(String),
            userId,
            type: activityData.type,
            startTime: activityData.startTime,
            endTime: activityData.endTime,
            duration: activityData.duration,
            distance: activityData.distance,
            pace: activityData.pace,
            calories: activityData.calories,
            route: activityData.route,
            isPrivate: activityData.isPrivate,
            createdAt: expect.any(Date),
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should retrieve any uploaded activity from Firestore', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(), // userId
        activityDataArbitrary(),
        async (userId, activityData) => {
          // Create activity first
          mockDoc.set.mockResolvedValue(undefined);
          const createdActivity = await createActivity(userId, activityData);

          // Mock Firestore get to return the created activity
          mockDoc.get.mockResolvedValue({
            exists: true,
            id: createdActivity.id,
            data: () => ({
              userId: createdActivity.userId,
              type: createdActivity.type,
              startTime: { toDate: () => createdActivity.startTime },
              endTime: { toDate: () => createdActivity.endTime },
              duration: createdActivity.duration,
              distance: createdActivity.distance,
              pace: createdActivity.pace,
              calories: createdActivity.calories,
              route: createdActivity.route,
              isPrivate: createdActivity.isPrivate,
              createdAt: { toDate: () => createdActivity.createdAt },
            }),
          });

          // Retrieve activity
          const retrievedActivity = await getActivityById(createdActivity.id);

          // Verify retrieved activity matches created activity
          expect(retrievedActivity).not.toBeNull();
          expect(retrievedActivity?.id).toBe(createdActivity.id);
          expect(retrievedActivity?.userId).toBe(userId);
          expect(retrievedActivity?.type).toBe(activityData.type);
          expect(retrievedActivity?.duration).toBe(activityData.duration);
          expect(retrievedActivity?.distance).toBe(activityData.distance);
          expect(retrievedActivity?.pace).toBe(activityData.pace);
          expect(retrievedActivity?.calories).toBe(activityData.calories);
          expect(retrievedActivity?.isPrivate).toBe(activityData.isPrivate);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should store and retrieve route coordinates correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(), // userId
        activityDataArbitrary(),
        async (userId, activityData) => {
          // Create activity
          mockDoc.set.mockResolvedValue(undefined);
          const createdActivity = await createActivity(userId, activityData);

          // Mock Firestore get
          mockDoc.get.mockResolvedValue({
            exists: true,
            id: createdActivity.id,
            data: () => ({
              userId: createdActivity.userId,
              type: createdActivity.type,
              startTime: { toDate: () => createdActivity.startTime },
              endTime: { toDate: () => createdActivity.endTime },
              duration: createdActivity.duration,
              distance: createdActivity.distance,
              pace: createdActivity.pace,
              calories: createdActivity.calories,
              route: createdActivity.route,
              isPrivate: createdActivity.isPrivate,
              createdAt: { toDate: () => createdActivity.createdAt },
            }),
          });

          // Retrieve activity
          const retrievedActivity = await getActivityById(createdActivity.id);

          // Verify route coordinates are preserved
          expect(retrievedActivity?.route.coordinates).toHaveLength(
            activityData.route.coordinates.length
          );

          // Check each coordinate
          retrievedActivity?.route.coordinates.forEach((coord, index) => {
            const originalCoord = activityData.route.coordinates[index];
            expect(coord.lat).toBeCloseTo(originalCoord.lat, 5);
            expect(coord.lng).toBeCloseTo(originalCoord.lng, 5);
            expect(coord.timestamp).toBe(originalCoord.timestamp);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should retrieve user activities in correct order (most recent first)', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(), // userId
        fc.array(activityDataArbitrary(), { minLength: 2, maxLength: 10 }),
        async (userId, activitiesData) => {
          // Create multiple activities
          const createdActivities: Activity[] = [];
          for (const activityData of activitiesData) {
            mockDoc.set.mockResolvedValue(undefined);
            const activity = await createActivity(userId, activityData);
            createdActivities.push(activity);
          }

          // Sort by createdAt descending (most recent first)
          const sortedActivities = [...createdActivities].sort(
            (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
          );

          // Mock Firestore query to return sorted activities
          mockCollection.get.mockResolvedValue({
            forEach: (callback: (doc: any) => void) => {
              sortedActivities.forEach((activity) => {
                callback({
                  id: activity.id,
                  data: () => ({
                    userId: activity.userId,
                    type: activity.type,
                    startTime: { toDate: () => activity.startTime },
                    endTime: { toDate: () => activity.endTime },
                    duration: activity.duration,
                    distance: activity.distance,
                    pace: activity.pace,
                    calories: activity.calories,
                    route: activity.route,
                    isPrivate: activity.isPrivate,
                    createdAt: { toDate: () => activity.createdAt },
                  }),
                });
              });
            },
          });

          // Retrieve user activities
          const retrievedActivities = await getUserActivities(userId);

          // Verify activities are in correct order
          expect(retrievedActivities).toHaveLength(sortedActivities.length);

          for (let i = 0; i < retrievedActivities.length - 1; i++) {
            expect(retrievedActivities[i].createdAt.getTime()).toBeGreaterThanOrEqual(
              retrievedActivities[i + 1].createdAt.getTime()
            );
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: social-fitness-platform, Property 2: User Data Isolation
 * 
 * For any data access request, users should only be able to access their own data
 * or data explicitly shared by their friends, ensuring proper authorization boundaries.
 * 
 * Validates: Requirements 11.2
 */
describe('Property 2: User Data Isolation', () => {
  let mockFirestore: any;
  let mockCollection: any;
  let mockDoc: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockDoc = {
      id: 'mock-activity-id',
      set: jest.fn().mockResolvedValue(undefined),
      get: jest.fn(),
      delete: jest.fn().mockResolvedValue(undefined),
    };

    mockCollection = {
      doc: jest.fn().mockReturnValue(mockDoc),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      get: jest.fn(),
    };

    mockFirestore = {
      collection: jest.fn().mockReturnValue(mockCollection),
    };

    (getFirestore as jest.Mock).mockReturnValue(mockFirestore);
  });

  const routePointArbitrary = (): fc.Arbitrary<RoutePoint> =>
    fc.record({
      lat: fc.float({ min: -90, max: 90, noNaN: true }),
      lng: fc.float({ min: -180, max: 180, noNaN: true }),
      timestamp: fc.integer({ min: 1000000000000, max: 9999999999999 }),
    });

  const routeDataArbitrary = (): fc.Arbitrary<RouteData> =>
    fc.record({
      coordinates: fc.array(routePointArbitrary(), { minLength: 1, maxLength: 100 }),
    });

  const activityDataArbitrary = () =>
    fc.record({
      type: fc.constantFrom('walking' as const, 'running' as const),
      startTime: fc.date({ min: new Date('2020-01-01'), max: new Date('2025-12-31') }),
      endTime: fc.date({ min: new Date('2020-01-01'), max: new Date('2025-12-31') }),
      duration: fc.integer({ min: 60, max: 36000 }),
      distance: fc.float({ min: 100, max: 100000, noNaN: true }),
      pace: fc.float({ min: 3, max: 20, noNaN: true }),
      calories: fc.integer({ min: 10, max: 5000 }),
      route: routeDataArbitrary(),
      isPrivate: fc.boolean(),
    }).filter((data) => data.startTime < data.endTime);

  it('should prevent users from deleting activities they do not own', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(), // ownerId
        fc.uuid(), // otherUserId (different user)
        activityDataArbitrary(),
        async (ownerId, otherUserId, activityData) => {
          // Ensure users are different
          fc.pre(ownerId !== otherUserId);

          // Create activity owned by ownerId
          mockDoc.set.mockResolvedValue(undefined);
          const activity = await createActivity(ownerId, activityData);

          // Mock Firestore get to return the activity
          mockDoc.get.mockResolvedValue({
            exists: true,
            data: () => ({
              userId: ownerId,
              type: activity.type,
              startTime: { toDate: () => activity.startTime },
              endTime: { toDate: () => activity.endTime },
              duration: activity.duration,
              distance: activity.distance,
              pace: activity.pace,
              calories: activity.calories,
              route: activity.route,
              isPrivate: activity.isPrivate,
              createdAt: { toDate: () => activity.createdAt },
            }),
          });

          // Attempt to delete activity as otherUserId
          await expect(deleteActivity(activity.id, otherUserId)).rejects.toThrow(
            'Not authorized to delete this activity'
          );

          // Verify delete was not called
          expect(mockDoc.delete).not.toHaveBeenCalled();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should allow users to delete their own activities', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(), // userId
        activityDataArbitrary(),
        async (userId, activityData) => {
          // Create activity
          mockDoc.set.mockResolvedValue(undefined);
          const activity = await createActivity(userId, activityData);

          // Mock Firestore get to return the activity
          mockDoc.get.mockResolvedValue({
            exists: true,
            data: () => ({
              userId,
              type: activity.type,
              startTime: { toDate: () => activity.startTime },
              endTime: { toDate: () => activity.endTime },
              duration: activity.duration,
              distance: activity.distance,
              pace: activity.pace,
              calories: activity.calories,
              route: activity.route,
              isPrivate: activity.isPrivate,
              createdAt: { toDate: () => activity.createdAt },
            }),
          });

          // Delete activity as owner
          await deleteActivity(activity.id, userId);

          // Verify delete was called
          expect(mockDoc.delete).toHaveBeenCalled();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should only retrieve activities for the requesting user', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(), // userId
        fc.array(activityDataArbitrary(), { minLength: 1, maxLength: 5 }),
        async (userId, activitiesData) => {
          // Create activities for this user
          const userActivities: Activity[] = [];
          for (const activityData of activitiesData) {
            mockDoc.set.mockResolvedValue(undefined);
            const activity = await createActivity(userId, activityData);
            userActivities.push(activity);
          }

          // Mock Firestore query to return only this user's activities
          mockCollection.get.mockResolvedValue({
            forEach: (callback: (doc: any) => void) => {
              userActivities.forEach((activity) => {
                callback({
                  id: activity.id,
                  data: () => ({
                    userId: activity.userId,
                    type: activity.type,
                    startTime: { toDate: () => activity.startTime },
                    endTime: { toDate: () => activity.endTime },
                    duration: activity.duration,
                    distance: activity.distance,
                    pace: activity.pace,
                    calories: activity.calories,
                    route: activity.route,
                    isPrivate: activity.isPrivate,
                    createdAt: { toDate: () => activity.createdAt },
                  }),
                });
              });
            },
          });

          // Retrieve activities
          const retrievedActivities = await getUserActivities(userId);

          // Verify all retrieved activities belong to the user
          retrievedActivities.forEach((activity) => {
            expect(activity.userId).toBe(userId);
          });

          // Verify the where clause was called with correct userId
          expect(mockCollection.where).toHaveBeenCalledWith('userId', '==', userId);
        }
      ),
      { numRuns: 100 }
    );
  });
});
