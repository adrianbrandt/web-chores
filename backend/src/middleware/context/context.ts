import { Request, Response, NextFunction } from 'express';
import { appContext } from '@/context';

export const contextMiddleware = (req: Request, res: Response, next: NextFunction) => {
  req.context = appContext;
  next();
};
