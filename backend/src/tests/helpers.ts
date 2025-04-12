import { UserRole, AccountStatus } from '@/generated/client';

export const createTestUser = (overrides = {}) => {
  return {
    id: 1,
    name: 'Test User',
    username: 'testuser',
    email: 'user@example.com',
    phoneNumber: '+1234567890',
    password: '$2b$10$dummyhashedpassword',
    avatarUrl: null,
    isVerified: false,
    verificationCode: null,
    verificationExpires: null,
    passwordResetToken: null,
    passwordResetExpires: null,
    accountStatus: AccountStatus.ACTIVE,
    role: UserRole.USER,
    lastLogin: null,
    createdAt: new Date('2025-04-11T00:00:00.000Z'),
    updatedAt: new Date('2025-04-11T00:00:00.000Z'),
    ...overrides,
  };
};

export const createTestUsers = (count: number, overridesFn?: (index: number) => object) => {
  return Array.from({ length: count }).map((_, index) =>
    createTestUser(overridesFn ? overridesFn(index) : { id: index + 1, username: `user${index + 1}` })
  );
};
