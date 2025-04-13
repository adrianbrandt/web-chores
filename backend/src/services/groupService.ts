import { AppContext } from '@/context';
import { Errors } from '@/utils/AppError';
import { GroupErrors } from '@/utils/errorCases';
import { CreateGroupData, UpdateGroupData } from '@/types';
import { GroupType, GroupMemberRole } from '@/generated/client';
import { randomBytes } from 'crypto';
import { GroupResponse, ServiceResponse, GroupsListResponse, GroupMemberResponse } from '@/types/serviceTypes';

export const createGroup = async (context: AppContext, data: CreateGroupData): Promise<GroupResponse> => {
  const { name, description, type = GroupType.CUSTOM, createdById } = data;

  if (!name) {
    throw Errors.BadRequest(GroupErrors.MissingRequiredFields());
  }

  const inviteCode = randomBytes(8).toString('hex');

  const group = await context.db.$transaction(async (tx) => {
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

  return {
    success: true,
    data: group,
    message: 'Group created successfully',
  };
};

export const addGroupMember = async (
  context: AppContext,
  groupId: string,
  userId: string,
  role: GroupMemberRole = GroupMemberRole.MEMBER
): Promise<GroupMemberResponse> => {
  const member = await context.db.$transaction(async (tx) => {
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

  return {
    success: true,
    data: {
      groupId: member.groupId,
      userId: member.userId,
      role: member.role,
    },
    message: 'Member added to group successfully',
  };
};

export const removeGroupMember = async (
  context: AppContext,
  groupId: string,
  userId: string,
  removingUserId: string
): Promise<ServiceResponse<boolean>> => {
  await context.db.$transaction(async (tx) => {
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

    await tx.groupMember.delete({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });
  });

  return {
    success: true,
    data: true,
    message: 'Member removed from group successfully',
  };
};

export const updateGroupDetails = async (
  context: AppContext,
  groupId: string,
  updateData: UpdateGroupData,
  userId: string
): Promise<GroupResponse> => {
  const updatedGroup = await context.db.$transaction(async (tx) => {
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

  return {
    success: true,
    data: updatedGroup,
    message: 'Group details updated successfully',
  };
};

export const getGroupById = async (context: AppContext, groupId: string): Promise<GroupResponse> => {
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

  return {
    success: true,
    data: group,
  };
};

export const listUserGroups = async (context: AppContext, userId: string): Promise<GroupsListResponse> => {
  const groups = await context.db.group.findMany({
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

  return {
    success: true,
    data: groups,
  };
};

export const generateGroupInviteCode = async (
  context: AppContext,
  groupId: string,
  userId: string
): Promise<GroupResponse> => {
  const group = await context.db.$transaction(async (tx) => {
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

  return {
    success: true,
    data: group,
    message: 'Invite code regenerated successfully',
  };
};
