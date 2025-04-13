import { Request, Response } from 'express';
import * as groupService from '../services/groupService';
import logger from '../config/logger';
import { Errors } from '@/utils/AppError';
import { GroupErrors } from '@/utils/errorCases';
import { GroupMemberRole } from '@/generated/client';

export const createGroup = async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { name, description, type } = req.body;

  if (!userId) {
    throw Errors.Unauthorized(GroupErrors.InsufficientPermissions());
  }

  const result = await groupService.createGroup(req.context, {
    name,
    description,
    type,
    createdById: userId,
  });

  logger.info('Group created successfully', {
    groupId: result.data?.id,
    createdBy: userId,
  });

  res.status(201).json({
    message: result.message,
    group: result.data,
  });
};

export const addGroupMember = async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { groupId } = req.params;
  const { userId: memberToAddId, role } = req.body;

  if (!userId) {
    throw Errors.Unauthorized(GroupErrors.InsufficientPermissions());
  }

  const result = await groupService.addGroupMember(req.context, groupId, memberToAddId, role || GroupMemberRole.MEMBER);

  logger.info('Member added to group', {
    groupId,
    addedUserId: memberToAddId,
    addedByUserId: userId,
  });

  res.status(200).json({
    message: result.message,
    member: result.data,
  });
};

export const removeGroupMember = async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { groupId, memberId } = req.params;

  if (!userId) {
    throw Errors.Unauthorized(GroupErrors.InsufficientPermissions());
  }

  const result = await groupService.removeGroupMember(req.context, groupId, memberId, userId);

  logger.info('Member removed from group', {
    groupId,
    removedUserId: memberId,
    removedByUserId: userId,
  });

  res.status(200).json({
    message: result.message,
  });
};

export const updateGroupDetails = async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { groupId } = req.params;
  const { name, description, type } = req.body;

  if (!userId) {
    throw Errors.Unauthorized(GroupErrors.InsufficientPermissions());
  }

  const result = await groupService.updateGroupDetails(req.context, groupId, { name, description, type }, userId);

  logger.info('Group details updated', {
    groupId,
    updatedByUserId: userId,
  });

  res.status(200).json({
    message: result.message,
    group: result.data,
  });
};

export const getGroup = async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { groupId } = req.params;

  if (!userId) {
    throw Errors.Unauthorized(GroupErrors.InsufficientPermissions());
  }

  const result = await groupService.getGroupById(req.context, groupId);

  res.status(200).json(result.data);
};

export const listUserGroups = async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw Errors.Unauthorized(GroupErrors.InsufficientPermissions());
  }

  const result = await groupService.listUserGroups(req.context, userId);

  res.status(200).json(result.data);
};

export const generateInviteCode = async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { groupId } = req.params;

  if (!userId) {
    throw Errors.Unauthorized(GroupErrors.InsufficientPermissions());
  }

  const result = await groupService.generateGroupInviteCode(req.context, groupId, userId);

  logger.info('Group invite code regenerated', {
    groupId,
    regeneratedByUserId: userId,
  });

  res.status(200).json({
    message: result.message,
    inviteCode: result.data?.inviteCode,
  });
};
