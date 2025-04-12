"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = void 0;
const logger_1 = __importDefault(require("../../config/logger"));
const AppError_1 = require("@/utils/AppError/AppError");
const errorMiddleware = (err, req, res) => {
    if (err instanceof AppError_1.AppError) {
        logger_1.default.error(`${err.statusCode} - ${err.message}`, {
            path: req.path,
            method: req.method,
            isOperational: err.isOperational,
            errorCode: err.errorCode,
            stack: err.stack,
        });
        res.status(err.statusCode).json(Object.assign(Object.assign({ status: 'error', message: err.message }, (err.errorCode && { errorCode: err.errorCode })), (process.env.NODE_ENV === 'development' && { stack: err.stack })));
    }
    logger_1.default.error('Unhandled error:', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
    });
    res.status(500).json(Object.assign({ status: 'error', message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong' }, (process.env.NODE_ENV === 'development' && { stack: err.stack })));
};
exports.errorMiddleware = errorMiddleware;
