import { Request, Response, NextFunction } from 'express';
import * as fc from 'fast-check';
import { authMiddleware, optionalAuth, AuthenticatedRequest } from '../auth';
import { getAuth } from '../../config/firebase';
import { ApiError } from '../errorHandler';

// Mock Firebase Admin
jest.mock('../../config/firebase');

describe('Authentication Middleware', () => {
  let mockRequest: Partial<AuthenticatedRequest>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {};
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('authMiddleware', () => {
    describe('Unit Tests', () => {
      it('should successfully authenticate with valid token', async () => {
        const mockDecodedToken = {
          uid: 'test-user-123',
          email: 'test@example.com',
        };

        mockRequest.headers = {
          authorization: 'Bearer valid-token-123',
        };

        (getAuth as jest.Mock).mockReturnValue({
          verifyIdToken: jest.fn().mockResolvedValue(mockDecodedToken),
        });

        await authMiddleware(
          mockRequest as AuthenticatedRequest,
          mockResponse as Response,
          mockNext
        );

        expect(mockRequest.user).toEqual({
          uid: 'test-user-123',
          email: 'test@example.com',
        });
        expect(mockNext).toHaveBeenCalledWith();
      });

      it('should reject request with no authorization header', async () => {
        mockRequest.headers = {};

        await authMiddleware(
          mockRequest as AuthenticatedRequest,
          mockResponse as Response,
          mockNext
        );

        expect(mockNext).toHaveBeenCalledWith(
          expect.objectContaining({
            statusCode: 401,
            message: 'No token provided',
          })
        );
      });

      it('should reject request with invalid authorization format', async () => {
        mockRequest.headers = {
          authorization: 'InvalidFormat token-123',
        };

        await authMiddleware(
          mockRequest as AuthenticatedRequest,
          mockResponse as Response,
          mockNext
        );

        expect(mockNext).toHaveBeenCalledWith(
          expect.objectContaining({
            statusCode: 401,
            message: 'No token provided',
          })
        );
      });

      it('should reject request with empty token', async () => {
        mockRequest.headers = {
          authorization: 'Bearer ',
        };

        await authMiddleware(
          mockRequest as AuthenticatedRequest,
          mockResponse as Response,
          mockNext
        );

        expect(mockNext).toHaveBeenCalledWith(
          expect.objectContaining({
            statusCode: 401,
            message: 'Invalid token format',
          })
        );
      });

      it('should handle expired token', async () => {
        mockRequest.headers = {
          authorization: 'Bearer expired-token',
        };

        const error: any = new Error('Token expired');
        error.code = 'auth/id-token-expired';

        (getAuth as jest.Mock).mockReturnValue({
          verifyIdToken: jest.fn().mockRejectedValue(error),
        });

        await authMiddleware(
          mockRequest as AuthenticatedRequest,
          mockResponse as Response,
          mockNext
        );

        expect(mockNext).toHaveBeenCalledWith(
          expect.objectContaining({
            statusCode: 401,
            message: 'Token expired',
          })
        );
      });

      it('should handle invalid token', async () => {
        mockRequest.headers = {
          authorization: 'Bearer invalid-token',
        };

        const error: any = new Error('Invalid token');
        error.code = 'auth/argument-error';

        (getAuth as jest.Mock).mockReturnValue({
          verifyIdToken: jest.fn().mockRejectedValue(error),
        });

        await authMiddleware(
          mockRequest as AuthenticatedRequest,
          mockResponse as Response,
          mockNext
        );

        expect(mockNext).toHaveBeenCalledWith(
          expect.objectContaining({
            statusCode: 401,
            message: 'Invalid token',
          })
        );
      });

      it('should handle generic authentication errors', async () => {
        mockRequest.headers = {
          authorization: 'Bearer some-token',
        };

        (getAuth as jest.Mock).mockReturnValue({
          verifyIdToken: jest.fn().mockRejectedValue(new Error('Unknown error')),
        });

        await authMiddleware(
          mockRequest as AuthenticatedRequest,
          mockResponse as Response,
          mockNext
        );

        expect(mockNext).toHaveBeenCalledWith(
          expect.objectContaining({
            statusCode: 401,
            message: 'Authentication failed',
          })
        );
      });
    });

    describe('Property-Based Tests', () => {
      /**
       * Feature: social-fitness-platform, Property 1: Authentication Token Verification
       * 
       * For any API request to a protected endpoint, the backend should verify the 
       * authentication token and reject requests with invalid or missing tokens with 
       * a 401 status code.
       * 
       * Validates: Requirements 2.4, 2.6, 11.1
       */
      it('should reject any request without valid Bearer token format', async () => {
        await fc.assert(
          fc.asyncProperty(
            fc.oneof(
              fc.constant(undefined), // No header
              fc.constant(null), // Null header
              fc.string(), // Random string without Bearer prefix
              fc.string().map(s => `Basic ${s}`), // Wrong auth type
              fc.string().map(s => `Token ${s}`), // Wrong auth type
              fc.constant('Bearer'), // Bearer without token
              fc.constant('Bearer ') // Bearer with empty token
            ),
            async (authHeader) => {
              const req: Partial<AuthenticatedRequest> = {
                headers: authHeader ? { authorization: authHeader } : {},
              };
              const res: Partial<Response> = {};
              const next = jest.fn();

              await authMiddleware(
                req as AuthenticatedRequest,
                res as Response,
                next
              );

              // Should call next with an error
              expect(next).toHaveBeenCalled();
              const error = next.mock.calls[0][0];
              expect(error).toBeInstanceOf(ApiError);
              expect(error.statusCode).toBe(401);
            }
          ),
          { numRuns: 100 }
        );
      });

      it('should reject any request with invalid Firebase token', async () => {
        await fc.assert(
          fc.asyncProperty(
            fc.string({ minLength: 1, maxLength: 100 }), // Random token strings
            async (token) => {
              const req: Partial<AuthenticatedRequest> = {
                headers: { authorization: `Bearer ${token}` },
              };
              const res: Partial<Response> = {};
              const next = jest.fn();

              // Mock Firebase to reject all tokens
              (getAuth as jest.Mock).mockReturnValue({
                verifyIdToken: jest.fn().mockRejectedValue(new Error('Invalid token')),
              });

              await authMiddleware(
                req as AuthenticatedRequest,
                res as Response,
                next
              );

              // Should call next with an error
              expect(next).toHaveBeenCalled();
              const error = next.mock.calls[0][0];
              expect(error).toBeInstanceOf(ApiError);
              expect(error.statusCode).toBe(401);
            }
          ),
          { numRuns: 100 }
        );
      });

      it('should attach user context for any valid token', async () => {
        await fc.assert(
          fc.asyncProperty(
            fc.record({
              uid: fc.string({ minLength: 1, maxLength: 50 }),
              email: fc.emailAddress(),
            }),
            fc.string({ minLength: 10, maxLength: 100 }),
            async (userData, token) => {
              const req: Partial<AuthenticatedRequest> = {
                headers: { authorization: `Bearer ${token}` },
              };
              const res: Partial<Response> = {};
              const next = jest.fn();

              // Mock Firebase to return the user data
              (getAuth as jest.Mock).mockReturnValue({
                verifyIdToken: jest.fn().mockResolvedValue(userData),
              });

              await authMiddleware(
                req as AuthenticatedRequest,
                res as Response,
                next
              );

              // Should attach user to request
              expect(req.user).toEqual({
                uid: userData.uid,
                email: userData.email,
              });
              // Should call next without error
              expect(next).toHaveBeenCalledWith();
            }
          ),
          { numRuns: 100 }
        );
      });

      it('should handle any Firebase error code appropriately', async () => {
        await fc.assert(
          fc.asyncProperty(
            fc.oneof(
              fc.constant('auth/id-token-expired'),
              fc.constant('auth/argument-error'),
              fc.constant('auth/invalid-id-token'),
              fc.string() // Any other error code
            ),
            async (errorCode) => {
              const req: Partial<AuthenticatedRequest> = {
                headers: { authorization: 'Bearer some-token' },
              };
              const res: Partial<Response> = {};
              const next = jest.fn();

              const error: any = new Error('Firebase error');
              error.code = errorCode;

              (getAuth as jest.Mock).mockReturnValue({
                verifyIdToken: jest.fn().mockRejectedValue(error),
              });

              await authMiddleware(
                req as AuthenticatedRequest,
                res as Response,
                next
              );

              // Should always call next with 401 error
              expect(next).toHaveBeenCalled();
              const callError = next.mock.calls[0][0];
              expect(callError).toBeInstanceOf(ApiError);
              expect(callError.statusCode).toBe(401);

              // Check specific error messages
              if (errorCode === 'auth/id-token-expired') {
                expect(callError.message).toBe('Token expired');
              } else if (errorCode === 'auth/argument-error') {
                expect(callError.message).toBe('Invalid token');
              } else {
                expect(callError.message).toBe('Authentication failed');
              }
            }
          ),
          { numRuns: 100 }
        );
      });
    });
  });

  describe('optionalAuth', () => {
    it('should attach user context if valid token is provided', async () => {
      const mockDecodedToken = {
        uid: 'test-user-123',
        email: 'test@example.com',
      };

      mockRequest.headers = {
        authorization: 'Bearer valid-token-123',
      };

      (getAuth as jest.Mock).mockReturnValue({
        verifyIdToken: jest.fn().mockResolvedValue(mockDecodedToken),
      });

      await optionalAuth(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockRequest.user).toEqual({
        uid: 'test-user-123',
        email: 'test@example.com',
      });
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should continue without user context if no token is provided', async () => {
      mockRequest.headers = {};

      await optionalAuth(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockRequest.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should continue without user context if token is invalid', async () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-token',
      };

      (getAuth as jest.Mock).mockReturnValue({
        verifyIdToken: jest.fn().mockRejectedValue(new Error('Invalid token')),
      });

      await optionalAuth(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockRequest.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalledWith();
    });
  });
});
