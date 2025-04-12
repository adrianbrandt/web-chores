import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { UserRole } from '@/generated/client';
import { JwtPayload } from '@/types';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('x-auth-token');

  if (!token) {
    res.status(401).json({ message: 'No token, authorization denied' });
    return;
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET) as JwtPayload;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

export const authorizeRole = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ message: 'Authorization denied' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ message: 'Permission denied' });
      return;
    }

    next();
  };
};
