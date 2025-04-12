import { AppContext } from '@/context';
import { Errors } from '@/utils/AppError';
import { GroupErrors } from '@/utils/errorCases';
import { CreateGroupData, UpdateGroupData } from '@/types';
import { GroupType, GroupMemberRole } from '@/generated/client';
import { randomBytes } from 'crypto';

export const createGroup = async (context: AppContext, data: CreateGroupData) => {
  const { name, description, type = GroupType.CUSTOM, createdById } = data;

  if (!name) {
    throw Errors.BadRequest(GroupErrors.MissingRequiredFields());
  }

  const inviteCode = randomBytes(8).toString('hex');

  return context.db.$transaction(async (tx) => {
    const group = await tx.group.create({
      data: {
        name,
        description,
        type,
        createdById,
        inviteCode,
      },
    });

    await tx.groupMember.create({
      data: {
        groupId: group.id,
        userId: createdById,
        role: GroupMemberRole.ADMIN,
      },
    });

    return group;
  });
};

export const addGroupMember = async (
  context: AppContext,
  groupId: string,
  userId: string,
  role: GroupMemberRole = GroupMemberRole.MEMBER
) => {
  return context.db.$transaction(async (tx) => {
    const group = await tx.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw Errors.NotFound(GroupErrors.NotFound());
    }

    const existingMember = await tx.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });

    if (existingMember) {
      throw Errors.Conflict(GroupErrors.MemberAlreadyExists());
    }

    return tx.groupMember.create({
      data: {
        groupId,
        userId,
        role,
      },
    });
  });
};

export const removeGroupMember = async (
  context: AppContext,
  groupId: string,
  userId: string,
  removingUserId: string
) => {
  return context.db.$transaction(async (tx) => {
    const group = await tx.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw Errors.NotFound(GroupErrors.NotFound());
    }

    const memberToRemove = await tx.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });

    if (!memberToRemove) {
      throw Errors.NotFound(GroupErrors.NotFound());
    }

    const owners = await tx.groupMember.count({
      where: {
        groupId,
        role: GroupMemberRole.ADMIN,
      },
    });

    if (memberToRemove.role === GroupMemberRole.ADMIN && owners <= 1) {
      throw Errors.BadRequest(GroupErrors.CannotRemoveLastOwner());
    }

    const removingMember = await tx.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: removingUserId,
        },
      },
    });

    if (
      !removingMember ||
      (removingMember.role !== GroupMemberRole.ADMIN && removingMember.role !== GroupMemberRole.OWNER)
    ) {
      throw Errors.Forbidden(GroupErrors.InsufficientPermissions());
    }

    return tx.groupMember.delete({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });
  });
};

export const updateGroupDetails = async (
  context: AppContext,
  groupId: string,
  updateData: UpdateGroupData,
  userId: string
) => {
  return context.db.$transaction(async (tx) => {
    const member = await tx.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });

    if (!member || (member.role !== GroupMemberRole.ADMIN && member.role !== GroupMemberRole.OWNER)) {
      throw Errors.Forbidden(GroupErrors.InsufficientPermissions());
    }

    return tx.group.update({
      where: { id: groupId },
      data: {
        ...(updateData.name && { name: updateData.name }),
        ...(updateData.description && { description: updateData.description }),
        ...(updateData.type && { type: updateData.type }),
      },
    });
  });
};

export const getGroupById = async (context: AppContext, groupId: string) => {
  const group = await context.db.group.findUnique({
    where: { id: groupId },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              email: true,
            },
          },
        },
      },
      lists: true,
    },
  });

  if (!group) {
    throw Errors.NotFound(GroupErrors.NotFound());
  }

  return group;
};

export const listUserGroups = async (context: AppContext, userId: string) => {
  return context.db.group.findMany({
    where: {
      members: {
        some: {
          userId,
        },
      },
    },
    include: {
      members: {
        where: {
          userId,
        },
        select: {
          role: true,
        },
      },
    },
  });
};

export const generateGroupInviteCode = async (context: AppContext, groupId: string, userId: string) => {
  return context.db.$transaction(async (tx) => {
    const member = await tx.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });

    if (!member || (member.role !== GroupMemberRole.ADMIN && member.role !== GroupMemberRole.OWNER)) {
      throw Errors.Forbidden(GroupErrors.InsufficientPermissions());
    }

    const newInviteCode = randomBytes(8).toString('hex');

    return tx.group.update({
      where: { id: groupId },
      data: { inviteCode: newInviteCode },
    });
  });
};
