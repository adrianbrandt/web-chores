import { Request, Response } from 'express';
import logger from '../../config/logger';
import { AppError } from '@/utils/AppError/AppError';

export const errorMiddleware = (err: Error | AppError, req: Request, res: Response) => {
  if (err instanceof AppError) {
    logger.error(`${err.statusCode} - ${err.message}`, {
      path: req.path,
      method: req.method,
      isOperational: err.isOperational,
      errorCode: err.errorCode,
      stack: err.stack,
    });

    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      ...(err.errorCode && { errorCode: err.errorCode }),
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  }

  logger.error('Unhandled error:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
