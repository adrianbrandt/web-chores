import { Request, Response, NextFunction } from 'express';

type RouteHandlerReturn =
  | void
  | Response<unknown, Record<string, unknown>>
  | Promise<void | Response<unknown, Record<string, unknown>>>;

type AsyncFunction = (req: Request, res: Response, next: NextFunction) => Promise<RouteHandlerReturn>;

export const asyncHandler = (fn: AsyncFunction) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
