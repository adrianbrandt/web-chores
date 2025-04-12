import { createMockContext, mockContextToAppContext } from '../setup';
import * as adminService from '../../services/adminService';
import { UserRole, AccountStatus, User } from '@/generated/client';
import { createMockPrismaResponse, createMockUser } from '../testData';

describe('Admin Service', () => {
  const mockCtx = createMockContext();
  const ctx = mockContextToAppContext(mockCtx);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const mockUsers = [
        createMockUser({ username: 'user1' }),
        createMockUser({ username: 'user2' }),
        createMockUser({ username: 'user3' }),
      ];

      mockCtx.db.user.findMany.mockResolvedValue(mockUsers);

      const result = await adminService.getAllUsers(ctx);

      expect(mockCtx.db.user.findMany).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUsers);
    });
  });

  describe('getUserByUsername', () => {
    it('should return a user when valid username is provided', async () => {
      const mockUser = createMockUser({ username: 'testuser' });

      mockCtx.db.user.findUnique.mockResolvedValue(createMockPrismaResponse<User>(mockUser));

      const result = await adminService.getUserByUsername(ctx, 'testuser');

      expect(mockCtx.db.user.findUnique).toHaveBeenCalledWith({
        where: { username: 'testuser' },
        select: expect.objectContaining({
          id: true,
          username: true,
        }),
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFound error when user does not exist', async () => {
      mockCtx.db.user.findUnique.mockResolvedValue(null);

      await expect(adminService.getUserByUsername(ctx, 'nonexistentuser')).rejects.toThrow('User not found');

      expect(mockCtx.db.user.findUnique).toHaveBeenCalledWith({
        where: { username: 'nonexistentuser' },
        select: expect.any(Object),
      });
    });
  });

  describe('updateUserStatus', () => {
    it('should update user status when valid data is provided', async () => {
      const mockUser = createMockUser({ username: 'testuser' });
      const updatedUser = createMockUser({
        username: 'testuser',
        accountStatus: AccountStatus.INACTIVE,
      });

      mockCtx.db.user.findUnique.mockResolvedValue(mockUser);
      mockCtx.db.user.update.mockResolvedValue(updatedUser);

      const result = await adminService.updateUserStatus(ctx, 'testuser', AccountStatus.INACTIVE);

      expect(mockCtx.db.user.findUnique).toHaveBeenCalledWith({
        where: { username: 'testuser' },
      });

      expect(mockCtx.db.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { accountStatus: AccountStatus.INACTIVE },
        select: expect.objectContaining({
          id: true,
          username: true,
          accountStatus: true,
        }),
      });

      expect(result).toEqual(updatedUser);
    });

    it('should throw BadRequest error when username is missing', async () => {
      await expect(adminService.updateUserStatus(ctx, '', AccountStatus.INACTIVE)).rejects.toThrow('Invalid username');

      expect(mockCtx.db.user.findUnique).not.toHaveBeenCalled();
      expect(mockCtx.db.user.update).not.toHaveBeenCalled();
    });

    it('should throw BadRequest error when invalid status is provided', async () => {
      // @ts-expect-error - Intentionally passing invalid status for testing
      await expect(adminService.updateUserStatus(ctx, 'testuser', 'INVALID_STATUS')).rejects.toThrow(
        'Invalid status value'
      );

      expect(mockCtx.db.user.findUnique).not.toHaveBeenCalled();
      expect(mockCtx.db.user.update).not.toHaveBeenCalled();
    });

    it('should throw NotFound error when user does not exist', async () => {
      mockCtx.db.user.findUnique.mockResolvedValue(null);

      await expect(adminService.updateUserStatus(ctx, 'nonexistentuser', AccountStatus.INACTIVE)).rejects.toThrow(
        'User not found'
      );

      expect(mockCtx.db.user.findUnique).toHaveBeenCalled();
      expect(mockCtx.db.user.update).not.toHaveBeenCalled();
    });
  });

  describe('updateUserRole', () => {
    it('should update user role when valid data is provided', async () => {
      const mockUser = createMockUser({ username: 'testuser' });

      const updatedUser = createMockUser({
        username: 'testuser',
        role: UserRole.ADMIN,
      });

      mockCtx.db.user.findUnique.mockResolvedValue(mockUser);
      mockCtx.db.user.update.mockResolvedValue(updatedUser);

      const result = await adminService.updateUserRole(ctx, 'testuser', UserRole.ADMIN);

      expect(mockCtx.db.user.findUnique).toHaveBeenCalledWith({
        where: { username: 'testuser' },
      });

      expect(mockCtx.db.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { role: UserRole.ADMIN },
        select: expect.objectContaining({
          id: true,
          username: true,
          role: true,
        }),
      });

      expect(result).toEqual(updatedUser);
    });

    it('should throw BadRequest error when username is missing', async () => {
      await expect(adminService.updateUserRole(ctx, '', UserRole.ADMIN)).rejects.toThrow('Invalid username');

      expect(mockCtx.db.user.findUnique).not.toHaveBeenCalled();
      expect(mockCtx.db.user.update).not.toHaveBeenCalled();
    });

    it('should throw BadRequest error when invalid role is provided', async () => {
      // @ts-expect-error - Intentionally passing invalid role for testing
      await expect(adminService.updateUserRole(ctx, 'testuser', 'INVALID_ROLE')).rejects.toThrow('Invalid role value');

      expect(mockCtx.db.user.findUnique).not.toHaveBeenCalled();
      expect(mockCtx.db.user.update).not.toHaveBeenCalled();
    });

    it('should throw NotFound error when user does not exist', async () => {
      mockCtx.db.user.findUnique.mockResolvedValue(null);

      await expect(adminService.updateUserRole(ctx, 'nonexistentuser', UserRole.ADMIN)).rejects.toThrow(
        'User not found'
      );

      expect(mockCtx.db.user.findUnique).toHaveBeenCalled();
      expect(mockCtx.db.user.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteUser', () => {
    it('should delete a user when valid username is provided', async () => {
      const mockUser = createMockUser({ username: 'testuser' });

      mockCtx.db.user.findUnique.mockResolvedValue(mockUser);
      mockCtx.db.user.delete.mockResolvedValue(mockUser);

      const result = await adminService.deleteUser(ctx, 'testuser');

      expect(mockCtx.db.user.findUnique).toHaveBeenCalledWith({
        where: { username: 'testuser' },
      });
      expect(mockCtx.db.user.delete).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
      expect(result).toBe(true);
    });

    it('should throw BadRequest error when username is missing', async () => {
      await expect(adminService.deleteUser(ctx, '')).rejects.toThrow('Invalid username');

      expect(mockCtx.db.user.findUnique).not.toHaveBeenCalled();
      expect(mockCtx.db.user.delete).not.toHaveBeenCalled();
    });

    it('should throw NotFound error when user does not exist', async () => {
      mockCtx.db.user.findUnique.mockResolvedValue(null);

      await expect(adminService.deleteUser(ctx, 'nonexistentuser')).rejects.toThrow('User not found');

      expect(mockCtx.db.user.findUnique).toHaveBeenCalled();
      expect(mockCtx.db.user.delete).not.toHaveBeenCalled();
    });
  });
});
