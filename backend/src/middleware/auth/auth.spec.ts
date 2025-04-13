import { Request, Response, NextFunction } from 'express';
import { authMiddleware, authorizeRole } from './auth';
import jwt from 'jsonwebtoken';
import { UserRole } from '@/generated/client';
import { JwtPayload } from '@/types';

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
}));

jest.mock('@/utils/AppError', () => ({
  Errors: {
    Unauthorized: jest.fn().mockImplementation((params) => ({ ...params, statusCode: 401 })),
    Forbidden: jest.fn().mockImplementation((params) => ({ ...params, statusCode: 403 })),
    Internal: jest.fn(),
  },
}));

jest.mock('@/utils/errorCases', () => ({
  AuthErrors: {
    TokenMissing: jest.fn().mockReturnValue({ message: 'No token, authorization denied' }),
    TokenInvalid: jest.fn().mockReturnValue({ message: 'Token is not valid' }),
    InsufficientRole: jest.fn().mockReturnValue({ message: 'Permission denied' }),
  },
  ServerErrors: {
    MissingJwtSecret: jest.fn(),
  },
}));

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request & { user?: JwtPayload }>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      header: jest.fn(),
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();

    process.env.JWT_SECRET = 'test-secret';

    jest.clearAllMocks();
  });

  describe('authMiddleware', () => {
    it('should call next() with valid token', () => {
      (mockRequest.header as jest.Mock).mockReturnValue('valid-token');
      const mockPayload = { userId: '1', username: 'testuser', role: UserRole.USER };
      (jwt.verify as jest.Mock).mockReturnValue(mockPayload);

      authMiddleware(mockRequest as Request, mockResponse as Response, mockNext as NextFunction);

      expect(mockRequest.header).toHaveBeenCalledWith('x-auth-token');
      expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'test-secret');
      expect(mockRequest.user).toEqual(mockPayload);
      expect(mockNext).toHaveBeenCalledWith();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should call next with error when no token is provided', () => {
      (mockRequest.header as jest.Mock).mockReturnValue(null);

      authMiddleware(mockRequest as Request, mockResponse as Response, mockNext as NextFunction);

      expect(mockRequest.header).toHaveBeenCalledWith('x-auth-token');
      expect(jwt.verify).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: 'No token, authorization denied',
        })
      );
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should call next with error when token is invalid', () => {
      (mockRequest.header as jest.Mock).mockReturnValue('invalid-token');
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Token is invalid');
      });

      authMiddleware(mockRequest as Request, mockResponse as Response, mockNext as NextFunction);

      expect(mockRequest.header).toHaveBeenCalledWith('x-auth-token');
      expect(jwt.verify).toHaveBeenCalledWith('invalid-token', 'test-secret');
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });

  describe('authorizeRole', () => {
    beforeEach(() => {
      mockRequest.user = { userId: '1', username: 'testuser', role: UserRole.USER };
    });

    it('should call next() when user has allowed role', () => {
      const middleware = authorizeRole([UserRole.USER, UserRole.ADMIN]);

      middleware(mockRequest as Request, mockResponse as Response, mockNext as NextFunction);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should call next with error when user is not authenticated', () => {
      mockRequest.user = undefined;
      const middleware = authorizeRole([UserRole.USER]);

      middleware(mockRequest as Request, mockResponse as Response, mockNext as NextFunction);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: 'No token, authorization denied',
        })
      );
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should call next with error when user lacks required role', () => {
      mockRequest.user = { userId: '1', username: 'testuser', role: UserRole.USER };
      const middleware = authorizeRole([UserRole.ADMIN]);

      middleware(mockRequest as Request, mockResponse as Response, mockNext as NextFunction);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 403,
          message: 'Permission denied',
        })
      );
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });
});
