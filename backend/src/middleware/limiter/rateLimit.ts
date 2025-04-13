import rateLimit from 'express-rate-limit';
import { Errors } from '@/utils/AppError';
import { ServerErrors } from '@/utils/errorCases';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  legacyHeaders: false,
  handler: (_req, res, _next) => {
    res.status(Errors.TooManyRequests(ServerErrors.RateLimitExceed()).statusCode).json(ServerErrors.RateLimitExceed());
  },
});
