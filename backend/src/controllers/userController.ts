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
    userId: result.user.id,
    username: result.user.username,
  });

  res.status(201).json({
    message: 'User registered successfully',
    token: result.token,
    needsVerification: result.needsVerification,
  });
};

export const login = async (req: Request, res: Response) => {
  const { identifier, password } = req.body;

  const result = await userService.loginUser(req.context, identifier, password);

  logger.info('User logged in successfully', {
    userId: result.user.id,
    username: result.user.username,
  });

  res.json({
    message: 'Login successful',
    token: result.token,
    isVerified: result.isVerified,
  });
};

export const verifyAccount = async (req: Request, res: Response) => {
  const { otp } = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    throw Errors.Unauthorized(AuthErrors.TokenMissing());
  }

  await userService.verifyUserAccount(req.context, userId, otp);

  res.json({ message: 'Account verified successfully' });
};

export const resendVerification = async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw Errors.Unauthorized(AuthErrors.TokenMissing());
  }

  await userService.resendVerificationCode(req.context, userId);

  res.json({ message: 'Verification code resent successfully' });
};

export const requestPasswordReset = async (req: Request, res: Response) => {
  const { identifier } = req.body;

  await userService.requestPasswordResetToken(req.context, identifier);

  res.json({ message: 'If the account exists, a reset code has been sent' });
};

export const resetPassword = async (req: Request, res: Response) => {
  const { identifier, token, newPassword } = req.body;

  await userService.resetUserPassword(req.context, identifier, token, newPassword);

  res.json({ message: 'Password has been reset successfully' });
};

export const getProfile = async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw Errors.Unauthorized(AuthErrors.TokenMissing());
  }

  const user = await userService.getUserProfile(req.context, userId);

  res.json(user);
};

export const updateProfile = async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw Errors.Unauthorized(AuthErrors.TokenMissing());
  }

  const profileData = req.body;

  const updatedUser = await userService.updateUserProfile(req.context, userId, profileData);

  res.json({
    message: 'Profile updated successfully',
    user: updatedUser,
  });
};

export const changePassword = async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw Errors.Unauthorized(AuthErrors.TokenMissing());
  }

  const { currentPassword, newPassword } = req.body;

  await userService.changeUserPassword(req.context, userId, currentPassword, newPassword);

  res.json({ message: 'Password changed successfully' });
};
