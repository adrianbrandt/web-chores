import { Prisma } from '@/generated/client';

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
