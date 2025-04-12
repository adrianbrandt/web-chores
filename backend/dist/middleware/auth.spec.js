"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_1 = require("./auth");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@/generated/client");
// Mock JWT
jest.mock('jsonwebtoken', () => ({
    verify: jest.fn(),
}));
describe('Auth Middleware', () => {
    let mockRequest;
    let mockResponse;
    let mockNext;
    beforeEach(() => {
        mockRequest = {
            header: jest.fn(),
        };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        mockNext = jest.fn();
        // Clear mock calls
        jest.clearAllMocks();
    });
    describe('authMiddleware', () => {
        it('should call next() with valid token', () => {
            mockRequest.header.mockReturnValue('valid-token');
            const mockPayload = { userId: 1, username: 'testuser', role: client_1.UserRole.USER };
            jsonwebtoken_1.default.verify.mockReturnValue(mockPayload);
            (0, auth_1.authMiddleware)(mockRequest, mockResponse, mockNext);
            expect(mockRequest.header).toHaveBeenCalledWith('x-auth-token');
            expect(jsonwebtoken_1.default.verify).toHaveBeenCalledWith('valid-token', expect.any(String));
            expect(mockRequest.user).toEqual(mockPayload);
            expect(mockNext).toHaveBeenCalled();
            expect(mockResponse.status).not.toHaveBeenCalled();
        });
        it('should return 401 when no token is provided', () => {
            mockRequest.header.mockReturnValue(null);
            (0, auth_1.authMiddleware)(mockRequest, mockResponse, mockNext);
            expect(mockRequest.header).toHaveBeenCalledWith('x-auth-token');
            expect(jsonwebtoken_1.default.verify).not.toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'No token, authorization denied' });
            expect(mockNext).not.toHaveBeenCalled();
        });
        it('should return 401 when token is invalid', () => {
            mockRequest.header.mockReturnValue('invalid-token');
            jsonwebtoken_1.default.verify.mockImplementation(() => {
                throw new Error('Token is invalid');
            });
            (0, auth_1.authMiddleware)(mockRequest, mockResponse, mockNext);
            expect(mockRequest.header).toHaveBeenCalledWith('x-auth-token');
            expect(jsonwebtoken_1.default.verify).toHaveBeenCalledWith('invalid-token', expect.any(String));
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Token is not valid' });
            expect(mockNext).not.toHaveBeenCalled();
        });
    });
    describe('authorizeRole', () => {
        beforeEach(() => {
            // Setup user in request
            mockRequest.user = { userId: 1, username: 'testuser', role: client_1.UserRole.USER };
        });
        it('should call next() when user has allowed role', () => {
            const middleware = (0, auth_1.authorizeRole)([client_1.UserRole.USER, client_1.UserRole.ADMIN]);
            middleware(mockRequest, mockResponse, mockNext);
            expect(mockNext).toHaveBeenCalled();
            expect(mockResponse.status).not.toHaveBeenCalled();
        });
        it('should return 401 when user is not authenticated', () => {
            // Remove user from request
            mockRequest.user = undefined;
            const middleware = (0, auth_1.authorizeRole)([client_1.UserRole.USER]);
            middleware(mockRequest, mockResponse, mockNext);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Authorization denied' });
            expect(mockNext).not.toHaveBeenCalled();
        });
        it('should return 403 when user lacks required role', () => {
            // User is only USER role
            mockRequest.user = { userId: 1, username: 'testuser', role: client_1.UserRole.USER };
            const middleware = (0, auth_1.authorizeRole)([client_1.UserRole.ADMIN]);
            middleware(mockRequest, mockResponse, mockNext);
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Permission denied' });
            expect(mockNext).not.toHaveBeenCalled();
        });
    });
});
