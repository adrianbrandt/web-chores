export type ErrorParams = {
  message: string;
  errorCode?: string;
};

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errorCode?: string;

  constructor(message: string, statusCode: number, isOperational = true, errorCode?: string) {
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

const createError =
  (statusCode: number, isOperational: boolean) =>
  ({ message, errorCode }: ErrorParams) =>
    new AppError(message, statusCode, isOperational, errorCode);

export const Errors = {
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
