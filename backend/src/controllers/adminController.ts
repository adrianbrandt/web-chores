import { Request, Response } from 'express';
import * as adminService from '../services/adminService';
import logger from '../config/logger';
import { Errors } from '@/utils/AppError';
import { UserErrors } from '@/utils/errorCases';

export const getAllUsers = async (req: Request, res: Response) => {
  const users = await adminService.getAllUsers(req.context);

  logger.debug('Admin retrieved all users', {
    adminId: req.user?.userId,
    count: users.length,
  });

  res.json(users);
};

export const getUserByUsername = async (req: Request, res: Response) => {
  const { username } = req.params;

  if (!username) {
    throw Errors.BadRequest(UserErrors.InvalidName());
  }

  const user = await adminService.getUserByUsername(req.context, username);

  logger.debug('Admin retrieved user details', {
    adminId: req.user?.userId,
    targetUsername: username,
  });

  res.json(user);
};

export const updateUserStatus = async (req: Request, res: Response) => {
  const { username } = req.params;
  const { status } = req.body;

  if (!username) {
    throw Errors.BadRequest(UserErrors.InvalidName());
  }

  const updatedUser = await adminService.updateUserStatus(req.context, username, status);

  logger.info('Admin updated user status', {
    adminId: req.user?.userId,
    targetUsername: username,
    newStatus: status,
  });

  res.json({
    message: `User status updated to ${status.toLowerCase()}`,
    user: updatedUser,
  });
};

export const updateUserRole = async (req: Request, res: Response) => {
  const { username } = req.params;
  const { role } = req.body;

  if (!username) {
    throw Errors.BadRequest(UserErrors.InvalidName());
  }

  const updatedUser = await adminService.updateUserRole(req.context, username, role);

  logger.info('Admin updated user role', {
    adminId: req.user?.userId,
    targetUsername: username,
    newRole: role,
  });

  res.json({
    message: `User role updated to ${role.toLowerCase()}`,
    user: updatedUser,
  });
};

export const deleteUser = async (req: Request, res: Response) => {
  const { username } = req.params;

  if (!username) {
    throw Errors.BadRequest(UserErrors.InvalidName());
  }

  await adminService.deleteUser(req.context, username);

  logger.info('Admin deleted user', {
    adminId: req.user?.userId,
    targetUsername: username,
  });

  res.json({ message: 'User deleted successfully' });
};
