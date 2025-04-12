import { FullUser } from '@/types/testTypes';

export const createMockUser = (overrides: Partial<FullUser> = {}): FullUser => {
  const now = new Date();

  return {
    id: '1',
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
    accountStatus: 'ACTIVE',
    role: 'USER',
    lastLogin: null,
    notificationPreference: 'IN_APP',
    createdAt: now,
    updatedAt: now,

    friendships: [],
    friendOf: [],
    groupMemberships: [],
    ownedGroups: [],
    ownedLists: [],
    assignedItems: [],
    completedItems: [],
    listCollaborations: [],
    uploadedAttachments: [],
    preferences: null,

    ...overrides,
  };
};

export const createMockPrismaResponse = <T, D = unknown>(data: D): T => {
  return data as unknown as T;
};
