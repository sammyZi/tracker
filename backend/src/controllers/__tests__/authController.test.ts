import request from 'supertest';
import { createApp } from '../../app';
import { getAuth, getFirestore } from '../../config/firebase';

// Mock Firebase
jest.mock('../../config/firebase');

describe('Auth Controller', () => {
  let app: any;
  let mockFirestore: any;
  let mockAuth: any;

  beforeAll(() => {
    app = createApp();
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup Firestore mock
    mockFirestore = {
      collection: jest.fn().mockReturnThis(),
      doc: jest.fn().mockReturnThis(),
      get: jest.fn(),
      set: jest.fn(),
      update: jest.fn(),
    };

    // Setup Auth mock
    mockAuth = {
      verifyIdToken: jest.fn(),
    };

    (getFirestore as jest.Mock).mockReturnValue(mockFirestore);
    (getAuth as jest.Mock).mockReturnValue(mockAuth);
  });

  describe('POST /api/auth/google', () => {
    describe('Successful Authentication', () => {
      it('should successfully authenticate a new user', async () => {
        const mockToken = 'valid-google-token-123';
        const mockDecodedToken = {
          uid: 'new-user-123',
          email: 'newuser@example.com',
          name: 'New User',
          picture: 'https://example.com/photo.jpg',
        };

        // Mock Firebase Auth verification
        mockAuth.verifyIdToken.mockResolvedValue(mockDecodedToken);

        // Mock Firestore - user doesn't exist
        mockFirestore.get.mockResolvedValue({
          exists: false,
        });
        mockFirestore.set.mockResolvedValue({});

        const response = await request(app)
          .post('/api/auth/google')
          .send({ idToken: mockToken })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.user).toMatchObject({
          id: 'new-user-123',
          email: 'newuser@example.com',
          displayName: 'New User',
          photoURL: 'https://example.com/photo.jpg',
        });
        expect(response.body.data.isNewUser).toBe(true);
        expect(response.body.data.token).toBe(mockToken);
        expect(response.body.message).toBe('User created successfully');

        // Verify Firestore set was called
        expect(mockFirestore.set).toHaveBeenCalled();
      });

      it('should successfully authenticate an existing user', async () => {
        const mockToken = 'valid-google-token-456';
        const mockDecodedToken = {
          uid: 'existing-user-456',
          email: 'existing@example.com',
          name: 'Existing User',
          picture: 'https://example.com/existing.jpg',
        };

        const existingUserData = {
          email: 'existing@example.com',
          displayName: 'Existing User',
          photoURL: 'https://example.com/existing.jpg',
          privacySettings: {
            showAge: true,
            showWeight: false,
            showHeight: false,
          },
          createdAt: { toDate: () => new Date('2024-01-01') },
        };

        // Mock Firebase Auth verification
        mockAuth.verifyIdToken.mockResolvedValue(mockDecodedToken);

        // Mock Firestore - user exists
        mockFirestore.get.mockResolvedValue({
          exists: true,
          data: () => existingUserData,
        });
        mockFirestore.update.mockResolvedValue({});

        const response = await request(app)
          .post('/api/auth/google')
          .send({ idToken: mockToken })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.user).toMatchObject({
          id: 'existing-user-456',
          email: 'existing@example.com',
          displayName: 'Existing User',
        });
        expect(response.body.data.isNewUser).toBe(false);
        expect(response.body.message).toBe('User authenticated successfully');

        // Verify Firestore update was called (to update last access time)
        expect(mockFirestore.update).toHaveBeenCalled();
        expect(mockFirestore.set).not.toHaveBeenCalled();
      });

      it('should create user with default display name if name is not provided', async () => {
        const mockToken = 'valid-google-token-789';
        const mockDecodedToken = {
          uid: 'user-without-name',
          email: 'noname@example.com',
          // No name field
        };

        mockAuth.verifyIdToken.mockResolvedValue(mockDecodedToken);
        mockFirestore.get.mockResolvedValue({ exists: false });
        mockFirestore.set.mockResolvedValue({});

        const response = await request(app)
          .post('/api/auth/google')
          .send({ idToken: mockToken })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.user.displayName).toBe('noname');
        expect(response.body.data.isNewUser).toBe(true);
      });

      it('should set default privacy settings for new users', async () => {
        const mockToken = 'valid-token';
        const mockDecodedToken = {
          uid: 'new-user',
          email: 'test@example.com',
          name: 'Test User',
        };

        mockAuth.verifyIdToken.mockResolvedValue(mockDecodedToken);
        mockFirestore.get.mockResolvedValue({ exists: false });
        mockFirestore.set.mockResolvedValue({});

        const response = await request(app)
          .post('/api/auth/google')
          .send({ idToken: mockToken })
          .expect(200);

        expect(response.body.data.user.privacySettings).toEqual({
          showAge: true,
          showWeight: false,
          showHeight: false,
        });
      });
    });

    describe('Invalid Token Handling', () => {
      it('should reject request without idToken', async () => {
        const response = await request(app)
          .post('/api/auth/google')
          .send({})
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('ID token is required');
      });

      it('should reject request with expired token', async () => {
        const mockToken = 'expired-token';
        const error: any = new Error('Token expired');
        error.code = 'auth/id-token-expired';

        mockAuth.verifyIdToken.mockRejectedValue(error);

        const response = await request(app)
          .post('/api/auth/google')
          .send({ idToken: mockToken })
          .expect(401);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Token expired');
      });

      it('should reject request with invalid token format', async () => {
        const mockToken = 'invalid-token';
        const error: any = new Error('Invalid token');
        error.code = 'auth/argument-error';

        mockAuth.verifyIdToken.mockRejectedValue(error);

        const response = await request(app)
          .post('/api/auth/google')
          .send({ idToken: mockToken })
          .expect(401);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Invalid token');
      });

      it('should reject request with invalid id token', async () => {
        const mockToken = 'bad-token';
        const error: any = new Error('Invalid ID token');
        error.code = 'auth/invalid-id-token';

        mockAuth.verifyIdToken.mockRejectedValue(error);

        const response = await request(app)
          .post('/api/auth/google')
          .send({ idToken: mockToken })
          .expect(401);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Invalid token');
      });

      it('should handle generic authentication errors', async () => {
        const mockToken = 'problematic-token';
        mockAuth.verifyIdToken.mockRejectedValue(new Error('Unknown error'));

        const response = await request(app)
          .post('/api/auth/google')
          .send({ idToken: mockToken })
          .expect(500);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Authentication failed');
      });
    });

    describe('Edge Cases', () => {
      it('should reject token without email', async () => {
        const mockToken = 'token-without-email';
        const mockDecodedToken = {
          uid: 'user-123',
          // No email
          name: 'User Without Email',
        };

        mockAuth.verifyIdToken.mockResolvedValue(mockDecodedToken);

        const response = await request(app)
          .post('/api/auth/google')
          .send({ idToken: mockToken })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Email is required from Google account');
      });

      it('should handle Firestore errors gracefully', async () => {
        const mockToken = 'valid-token';
        const mockDecodedToken = {
          uid: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
        };

        mockAuth.verifyIdToken.mockResolvedValue(mockDecodedToken);
        mockFirestore.get.mockRejectedValue(new Error('Firestore error'));

        const response = await request(app)
          .post('/api/auth/google')
          .send({ idToken: mockToken })
          .expect(500);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Authentication failed');
      });

      it('should preserve existing user profile data', async () => {
        const mockToken = 'valid-token';
        const mockDecodedToken = {
          uid: 'user-with-profile',
          email: 'profile@example.com',
          name: 'Profile User',
        };

        const existingUserData = {
          email: 'profile@example.com',
          displayName: 'Profile User',
          profile: {
            age: 30,
            weight: 70,
            weightUnit: 'kg',
          },
          privacySettings: {
            showAge: false,
            showWeight: false,
            showHeight: true,
          },
          createdAt: { toDate: () => new Date('2024-01-01') },
        };

        mockAuth.verifyIdToken.mockResolvedValue(mockDecodedToken);
        mockFirestore.get.mockResolvedValue({
          exists: true,
          data: () => existingUserData,
        });
        mockFirestore.update.mockResolvedValue({});

        const response = await request(app)
          .post('/api/auth/google')
          .send({ idToken: mockToken })
          .expect(200);

        expect(response.body.data.user.profile).toEqual({
          age: 30,
          weight: 70,
          weightUnit: 'kg',
        });
        expect(response.body.data.user.privacySettings).toEqual({
          showAge: false,
          showWeight: false,
          showHeight: true,
        });
      });
    });
  });
});
