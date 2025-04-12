"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Errors = exports.AppError = void 0;
class AppError extends Error {
    constructor(message, statusCode, isOperational = true, errorCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.errorCode = errorCode;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
exports.AppError = AppError;
const createError = (statusCode, isOperational) => ({ message, errorCode }) => new AppError(message, statusCode, isOperational, errorCode);
exports.Errors = {
    BadRequest: createError(400, true),
    Unauthorized: createError(401, true),
    Forbidden: createError(403, true),
    NotFound: createError(404, true),
    Conflict: createError(409, true),
    Validation: createError(422, true),
    TooManyRequests: createError(429, true),
    Internal: createError(500, false),
    ServiceUnavailable: createError(503, false),
    GatewayTimeout: createError(504, false),
};
