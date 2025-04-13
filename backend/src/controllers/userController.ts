import { Request, Response } from 'express';
import * as userService from '../services/userService';
import logger from '../config/logger';
import { Errors } from '@/utils/AppError/AppError';
import { AuthErrors } from '@/utils/errorCases/errorCases';

export const register = async (req: Request, res: Response) => {
  const userData = req.body;
  logger.debug('Registration attempt', { username: userData.username });

  const result = await userService.registerUser(req.context, userData);

  logger.info('User registered successfully', {
    userId: result.data?.user.id,
    username: result.data?.user.username,
  });

  res.status(201).json({
    message: result.message,
    token: result.data?.token,
    needsVerification: result.data?.needsVerification,
  });
};

export const login = async (req: Request, res: Response) => {
  const { identifier, password } = req.body;

  const result = await userService.loginUser(req.context, identifier, password);

  logger.info('User logged in successfully', {
    userId: result.data?.user.id,
    username: result.data?.user.username,
  });

  res.json({
    message: result.message,
    token: result.data?.token,
    isVerified: result.data?.isVerified,
  });
};

export const verifyAccount = async (req: Request, res: Response) => {
  const { otp } = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    throw Errors.Unauthorized(AuthErrors.TokenMissing());
  }

  const result = await userService.verifyUserAccount(req.context, userId, otp);

  res.json({ message: result.message });
};

export const resendVerification = async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw Errors.Unauthorized(AuthErrors.TokenMissing());
  }

  const result = await userService.resendVerificationCode(req.context, userId);

  res.json({ message: result.message });
};

export const requestPasswordReset = async (req: Request, res: Response) => {
  const { identifier } = req.body;

  const result = await userService.requestPasswordResetToken(req.context, identifier);

  res.json({ message: result.message });
};

export const resetPassword = async (req: Request, res: Response) => {
  const { identifier, token, newPassword } = req.body;

  const result = await userService.resetUserPassword(req.context, identifier, token, newPassword);

  res.json({ message: result.message });
};

export const getProfile = async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw Errors.Unauthorized(AuthErrors.TokenMissing());
  }

  const result = await userService.getUserProfile(req.context, userId);

  res.json(result.data);
};

export const updateProfile = async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw Errors.Unauthorized(AuthErrors.TokenMissing());
  }

  const profileData = req.body;

  const result = await userService.updateUserProfile(req.context, userId, profileData);

  res.json({
    message: result.message,
    user: result.data,
  });
};

export const changePassword = async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw Errors.Unauthorized(AuthErrors.TokenMissing());
  }

  const { currentPassword, newPassword } = req.body;

  const result = await userService.changeUserPassword(req.context, userId, currentPassword, newPassword);

  res.json({ message: result.message });
};
