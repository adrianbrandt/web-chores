import { Request, Response, NextFunction } from 'express';
import { authMiddleware, authorizeRole } from './auth';
import jwt from 'jsonwebtoken';
import { UserRole } from '@/generated/client';
import { JwtPayload } from '@/types';

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
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

    jest.clearAllMocks();
  });

  describe('authMiddleware', () => {
    it('should call next() with valid token', () => {
      (mockRequest.header as jest.Mock).mockReturnValue('valid-token');

      const mockPayload = { userId: 1, username: 'testuser', role: UserRole.USER };
      (jwt.verify as jest.Mock).mockReturnValue(mockPayload);

      authMiddleware(mockRequest as Request, mockResponse as Response, mockNext as NextFunction);

      expect(mockRequest.header).toHaveBeenCalledWith('x-auth-token');
      expect(jwt.verify).toHaveBeenCalledWith('valid-token', expect.any(String));
      expect(mockRequest.user).toEqual(mockPayload);
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should return 401 when no token is provided', () => {
      (mockRequest.header as jest.Mock).mockReturnValue(null);

      authMiddleware(mockRequest as Request, mockResponse as Response, mockNext as NextFunction);

      expect(mockRequest.header).toHaveBeenCalledWith('x-auth-token');
      expect(jwt.verify).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'No token, authorization denied' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when token is invalid', () => {
      (mockRequest.header as jest.Mock).mockReturnValue('invalid-token');

      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Token is invalid');
      });

      authMiddleware(mockRequest as Request, mockResponse as Response, mockNext as NextFunction);

      expect(mockRequest.header).toHaveBeenCalledWith('x-auth-token');
      expect(jwt.verify).toHaveBeenCalledWith('invalid-token', expect.any(String));
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Token is not valid' });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('authorizeRole', () => {
    beforeEach(() => {
      mockRequest.user = { userId: '1', username: 'testuser', role: UserRole.USER };
    });

    it('should call next() when user has allowed role', () => {
      const middleware = authorizeRole([UserRole.USER, UserRole.ADMIN]);

      middleware(mockRequest as Request, mockResponse as Response, mockNext as NextFunction);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should return 401 when user is not authenticated', () => {
      mockRequest.user = undefined;

      const middleware = authorizeRole([UserRole.USER]);

      middleware(mockRequest as Request, mockResponse as Response, mockNext as NextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Authorization denied' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 403 when user lacks required role', () => {
      mockRequest.user = { userId: '1', username: 'testuser', role: UserRole.USER };

      const middleware = authorizeRole([UserRole.ADMIN]);

      middleware(mockRequest as Request, mockResponse as Response, mockNext as NextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Permission denied' });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
