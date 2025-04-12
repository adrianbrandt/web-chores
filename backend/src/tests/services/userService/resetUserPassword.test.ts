import { createMockContext, mockContextToAppContext } from '../../setup';
import * as userService from '@/services/userService';
import { createMockUser } from '../../testData';

const mockCtx = createMockContext();
const ctx = mockContextToAppContext(mockCtx);

describe('resetUserPassword', () => {
  it('should reset password successfully', async () => {
    const user = createMockUser({
      passwordResetToken: '123456',
      passwordResetExpires: new Date(Date.now() + 100000),
    });
    mockCtx.db.user.findFirst.mockResolvedValue(user);

    await userService.resetUserPassword(ctx, 'user@example.com', '123456', 'NewPassword123');

    expect(mockCtx.db.user.update).toHaveBeenCalledWith({
      where: { id: user.id },
      data: {
        password: 'hashedPassword',
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });
  });

  it('should throw error if any required field is missing', async () => {
    await expect(userService.resetUserPassword(ctx, '', '123456', 'NewPassword')).rejects.toThrow(
      'Please provide all required fields'
    );

    await expect(userService.resetUserPassword(ctx, 'user@example.com', '', 'NewPassword')).rejects.toThrow(
      'Please provide all required fields'
    );

    await expect(userService.resetUserPassword(ctx, 'user@example.com', '123456', '')).rejects.toThrow(
      'Please provide all required fields'
    );
  });

  it('should throw error if user not found', async () => {
    mockCtx.db.user.findFirst.mockResolvedValue(null);

    await expect(
      userService.resetUserPassword(ctx, 'nonexistent@example.com', '123456', 'NewPassword')
    ).rejects.toThrow('Invalid reset information');
  });

  it('should throw error if reset token is invalid', async () => {
    const user = createMockUser({
      passwordResetToken: '123456',
      passwordResetExpires: new Date(Date.now() + 100000),
    });
    mockCtx.db.user.findFirst.mockResolvedValue(user);

    await expect(userService.resetUserPassword(ctx, 'user@example.com', 'wrong-token', 'NewPassword')).rejects.toThrow(
      'Invalid reset token'
    );
  });

  it('should throw error if reset token has expired', async () => {
    const user = createMockUser({
      passwordResetToken: '123456',
      passwordResetExpires: new Date(Date.now() - 100000),
    });
    mockCtx.db.user.findFirst.mockResolvedValue(user);

    await expect(userService.resetUserPassword(ctx, 'user@example.com', '123456', 'NewPassword')).rejects.toThrow(
      'Reset token has expired'
    );
  });

  it('should handle null passwordResetExpires field', async () => {
    const user = createMockUser({
      passwordResetToken: '123456',
      passwordResetExpires: null,
    });
    mockCtx.db.user.findFirst.mockResolvedValue(user);

    await userService.resetUserPassword(ctx, 'user@example.com', '123456', 'NewPassword123');

    expect(mockCtx.db.user.update).toHaveBeenCalledWith({
      where: { id: user.id },
      data: {
        password: 'hashedPassword',
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });
  });
});
