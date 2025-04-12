import { Request, Response, NextFunction } from 'express';
import { contextMiddleware } from './context';
import { appContext } from '@/context';

jest.mock('@/context', () => ({
  appContext: {
    db: {
      user: {},
    },
  },
}));

describe('Context Middleware', () => {
  it('should attach appContext to request object', () => {
    const mockRequest: Partial<Request> = {};
    const mockResponse: Partial<Response> = {};
    const mockNext: jest.Mock = jest.fn();

    contextMiddleware(mockRequest as Request, mockResponse as Response, mockNext as NextFunction);

    expect(mockRequest.context).toBe(appContext);
    expect(mockNext).toHaveBeenCalled();
  });
});
