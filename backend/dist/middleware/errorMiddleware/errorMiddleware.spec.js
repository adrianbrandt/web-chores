"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const errorMiddleware_1 = require("./errorMiddleware");
const AppError_1 = require("@/utils/AppError/AppError");
const logger_1 = __importDefault(require("@/config/logger"));
jest.mock('@/config/logger', () => ({
    error: jest.fn(),
}));
describe('Error Middleware', () => {
    let mockRequest;
    let mockResponse;
    beforeEach(() => {
        mockRequest = {
            path: '/test/path',
            method: 'GET',
        };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        jest.clearAllMocks();
    });
    it('should handle AppError correctly', () => {
        const appError = new AppError_1.AppError('Test operational error', 400, true, 'TEST_ERROR');
        (0, errorMiddleware_1.errorMiddleware)(appError, mockRequest, mockResponse);
        expect(logger_1.default.error).toHaveBeenCalledWith('400 - Test operational error', expect.objectContaining({
            path: '/test/path',
            method: 'GET',
            isOperational: true,
            errorCode: 'TEST_ERROR',
        }));
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            status: 'error',
            message: 'Test operational error',
            errorCode: 'TEST_ERROR',
        });
    });
    it('should handle regular Error correctly', () => {
        const error = new Error('Regular error');
        (0, errorMiddleware_1.errorMiddleware)(error, mockRequest, mockResponse);
        expect(logger_1.default.error).toHaveBeenCalledWith('Unhandled error:', expect.objectContaining({
            error: 'Regular error',
            path: '/test/path',
            method: 'GET',
        }));
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
            status: 'error',
            message: 'Something went wrong',
        });
    });
    it('should include stack trace in development environment', () => {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'development';
        const error = new Error('Development error');
        error.stack = 'Stack trace';
        (0, errorMiddleware_1.errorMiddleware)(error, mockRequest, mockResponse);
        expect(mockResponse.json).toHaveBeenCalledWith({
            status: 'error',
            message: 'Development error',
            stack: 'Stack trace',
        });
        process.env.NODE_ENV = originalEnv;
    });
    it('should hide stack trace in production environment', () => {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'production';
        const error = new Error('Production error');
        error.stack = 'Stack trace';
        (0, errorMiddleware_1.errorMiddleware)(error, mockRequest, mockResponse);
        expect(mockResponse.json).toHaveBeenCalledWith({
            status: 'error',
            message: 'Something went wrong',
        });
        process.env.NODE_ENV = originalEnv;
    });
});
