import { AppError, Errors } from './AppError';

describe('AppError', () => {
  describe('AppError class', () => {
    it('should create an AppError with the correct properties', () => {
      const error = new AppError('Test error', 400, true, 'TEST_ERROR');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
      expect(error.errorCode).toBe('TEST_ERROR');
      expect(error.stack).toBeDefined();
    });

    it('should create an AppError without an error code', () => {
      const error = new AppError('Test error', 400, true);

      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
      expect(error.errorCode).toBeUndefined();
    });

    it('should create an AppError with non-operational flag', () => {
      const error = new AppError('Test error', 500, false, 'TEST_ERROR');

      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(false);
      expect(error.errorCode).toBe('TEST_ERROR');
    });

    it('should properly capture stack trace', () => {
      const originalCaptureStackTrace = Error.captureStackTrace;
      Error.captureStackTrace = jest.fn();

      try {
        new AppError('Test error', 400);
        expect(Error.captureStackTrace).toHaveBeenCalled();
      } finally {
        Error.captureStackTrace = originalCaptureStackTrace;
      }
    });
  });

  describe('Errors factory', () => {
    it('should create BadRequest error', () => {
      const error = Errors.BadRequest({ message: 'Bad request', errorCode: 'BAD_REQUEST' });

      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Bad request');
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
      expect(error.errorCode).toBe('BAD_REQUEST');
    });

    it('should create Unauthorized error', () => {
      const error = Errors.Unauthorized({ message: 'Unauthorized' });

      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Unauthorized');
      expect(error.statusCode).toBe(401);
      expect(error.isOperational).toBe(true);
      expect(error.errorCode).toBeUndefined();
    });

    it('should create Forbidden error', () => {
      const error = Errors.Forbidden({ message: 'Forbidden', errorCode: 'FORBIDDEN' });

      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Forbidden');
      expect(error.statusCode).toBe(403);
      expect(error.isOperational).toBe(true);
      expect(error.errorCode).toBe('FORBIDDEN');
    });

    it('should create NotFound error', () => {
      const error = Errors.NotFound({ message: 'Not found' });

      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Not found');
      expect(error.statusCode).toBe(404);
      expect(error.isOperational).toBe(true);
    });

    it('should create Conflict error', () => {
      const error = Errors.Conflict({ message: 'Conflict', errorCode: 'CONFLICT' });

      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Conflict');
      expect(error.statusCode).toBe(409);
      expect(error.isOperational).toBe(true);
      expect(error.errorCode).toBe('CONFLICT');
    });

    it('should create Validation error', () => {
      const error = Errors.Validation({ message: 'Validation error' });

      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Validation error');
      expect(error.statusCode).toBe(422);
      expect(error.isOperational).toBe(true);
    });

    it('should create Internal error (non-operational)', () => {
      const error = Errors.Internal({ message: 'Internal error' });

      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Internal error');
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(false);
    });
  });
});
