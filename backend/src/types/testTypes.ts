import { User, UserRole, AccountStatus, Prisma } from '@/generated/client';

export type PartialUserWithRole = {
  id: number;
  username: string;
  role: UserRole;
};

export type PartialUserWithStatus = {
  id: number;
  username: string;
  accountStatus: AccountStatus;
};

export type UserOverrides = Partial<User>;

export type FullUser = Prisma.UserGetPayload<{
  include: {
    friendships: true;
    friendOf: true;
    groupMemberships: true;
    ownedGroups: true;
    ownedLists: true;
    assignedItems: true;
    completedItems: true;
    listCollaborations: true;
    uploadedAttachments: true;
    preferences: true;
  };
}>;
