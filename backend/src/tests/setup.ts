import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@/generated/client';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { AppContext } from '@/context';

jest.mock('bcrypt');
jest.mock('jsonwebtoken');

export type MockContext = {
  db: DeepMockProxy<PrismaClient>;
};

export const createMockContext = (): MockContext => {
  return {
    db: mockDeep<PrismaClient>(),
  };
};

export const mockContextToAppContext = (mockCtx: MockContext): AppContext => {
  return mockCtx as unknown as AppContext;
};

export const originalEnv = { ...process.env };

beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();

  (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
  (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
  (bcrypt.compare as jest.Mock).mockResolvedValue(true);
  (jwt.sign as jest.Mock).mockReturnValue('token');
});

afterAll(() => {
  process.env = originalEnv;
});

afterEach(() => {
  process.env = { ...originalEnv };
});
