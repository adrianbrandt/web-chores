import { AppContext } from '@/context';
import { UserRole, AccountStatus } from '@/generated/client';
import { Errors } from '@/utils/AppError';
import { UserErrors } from '@/utils/errorCases';

export const getAllUsers = async (context: AppContext) => {
  return context.db.user.findMany({
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      phoneNumber: true,
      isVerified: true,
      accountStatus: true,
      role: true,
      lastLogin: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

export const getUserByUsername = async (context: AppContext, username: string) => {
  const user = await context.db.user.findUnique({
    where: { username },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      phoneNumber: true,
      avatarUrl: true,
      isVerified: true,
      accountStatus: true,
      role: true,
      lastLogin: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  if (!user) {
    throw Errors.NotFound(UserErrors.NotFound());
  }
  return user;
};

export const updateUserStatus = async (context: AppContext, username: string, status: AccountStatus) => {
  if (!username) {
    throw Errors.BadRequest(UserErrors.InvalidName());
  }
  if (!Object.values(AccountStatus).includes(status)) {
    throw Errors.BadRequest(UserErrors.InvalidStatus());
  }
  const user = await context.db.user.findUnique({
    where: { username },
  });
  if (!user) {
    throw Errors.NotFound(UserErrors.NotFound());
  }
  return context.db.user.update({
    where: { id: user.id },
    data: { accountStatus: status },
    select: {
      id: true,
      username: true,
      accountStatus: true,
    },
  });
};

export const updateUserRole = async (context: AppContext, username: string, role: UserRole) => {
  if (!username) {
    throw Errors.BadRequest(UserErrors.InvalidName());
  }
  if (!Object.values(UserRole).includes(role)) {
    throw Errors.BadRequest(UserErrors.InvalidRole());
  }
  const user = await context.db.user.findUnique({
    where: { username },
  });
  if (!user) {
    throw Errors.NotFound(UserErrors.NotFound());
  }
  return context.db.user.update({
    where: { id: user.id },
    data: { role },
    select: {
      id: true,
      username: true,
      role: true,
    },
  });
};

export const deleteUser = async (context: AppContext, username: string) => {
  if (!username) {
    throw Errors.BadRequest(UserErrors.InvalidName());
  }
  const user = await context.db.user.findUnique({
    where: { username },
  });
  if (!user) {
    throw Errors.NotFound(UserErrors.NotFound());
  }
  await context.db.user.delete({
    where: { id: user.id },
  });
  return true;
};
