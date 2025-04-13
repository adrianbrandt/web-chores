import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { UserRole } from '@/generated/client';
import { JwtPayload } from '@/types';
import { Errors } from '@/utils/AppError';
import { AuthErrors, ServerErrors } from '@/utils/errorCases';

dotenv.config();

export const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw Errors.Internal(ServerErrors.MissingJwtSecret());
  }
  return secret;
};

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('x-auth-token');

    if (!token) {
      throw Errors.Unauthorized(AuthErrors.TokenMissing());
    }

    req.user = jwt.verify(token, getJwtSecret()) as JwtPayload;
    next();
  } catch (err) {
    next(err);
  }
};

export const authorizeRole = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw Errors.Unauthorized(AuthErrors.TokenMissing());
      }

      if (!roles.includes(req.user.role)) {
        throw Errors.Forbidden(AuthErrors.InsufficientRole());
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};
