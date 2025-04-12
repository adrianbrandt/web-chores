import { PrismaClient } from '@/generated/client';
import prisma from './prisma';

export interface AppContext {
  db: PrismaClient;
}

export const createContext = (): AppContext => {
  return {
    db: prisma,
  };
};

export const appContext = createContext();
