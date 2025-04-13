import { AppContext } from '@/context';
import { UserRole, AccountStatus, User } from '@/generated/client';
import { Errors } from '@/utils/AppError';
import { UserErrors } from '@/utils/errorCases';
import { ServiceResponse } from '@/types/serviceTypes';

type PartialUserWithId = Pick<User, 'id' | 'username' | 'accountStatus'>;
type PartialUserWithRole = Pick<User, 'id' | 'username' | 'role'>;

type AdminUserResult = Pick<
  User,
  | 'id'
  | 'name'
  | 'username'
  | 'email'
  | 'phoneNumber'
  | 'isVerified'
  | 'accountStatus'
  | 'role'
  | 'lastLogin'
  | 'createdAt'
  | 'updatedAt'
>;

export const getAllUsers = async (context: AppContext): Promise<AdminUserResult[]> => {
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

export const getUserByUsername = async (context: AppContext, username: string): Promise<AdminUserResult> => {
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

export const updateUserStatus = async (
  context: AppContext,
  username: string,
  status: AccountStatus
): Promise<PartialUserWithId> => {
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

export const updateUserRole = async (
  context: AppContext,
  username: string,
  role: UserRole
): Promise<PartialUserWithRole> => {
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

export const deleteUser = async (context: AppContext, username: string): Promise<ServiceResponse<boolean>> => {
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
  return {
    success: true,
    data: true,
    message: 'User deleted successfully',
  };
};
