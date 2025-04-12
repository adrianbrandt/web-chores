import { createMockContext, mockContextToAppContext } from '../../setup';
import * as userService from '@/services/userService';
import { createMockUser } from '../../testData';
import bcrypt from 'bcrypt';

const mockCtx = createMockContext();
const ctx = mockContextToAppContext(mockCtx);

describe('changeUserPassword', () => {
  it('should change password successfully', async () => {
    const user = createMockUser();
    mockCtx.db.user.findUnique.mockResolvedValue(user);

    await userService.changeUserPassword(ctx, '1', 'CurrentPassword', 'NewPassword123');

    expect(mockCtx.db.user.findUnique).toHaveBeenCalledWith({ where: { id: '1' } });
    expect(mockCtx.db.user.update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: { password: expect.any(String) },
    });
  });

  it('should throw error if passwords are missing', async () => {
    await expect(userService.changeUserPassword(ctx, '1', '', 'NewPassword')).rejects.toThrow(
      'Please provide current and new password'
    );

    expect(mockCtx.db.user.findUnique).not.toHaveBeenCalled();
  });

  it('should throw error if user does not exist', async () => {
    mockCtx.db.user.findUnique.mockResolvedValue(null);

    await expect(userService.changeUserPassword(ctx, '999', 'CurrentPassword', 'NewPassword')).rejects.toThrow(
      'User not found'
    );
  });

  it('should throw error if current password is incorrect', async () => {
    mockCtx.db.user.findUnique.mockResolvedValue(createMockUser());
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(userService.changeUserPassword(ctx, '1', 'WrongPassword', 'NewPassword')).rejects.toThrow(
      'Current password is incorrect'
    );

    expect(mockCtx.db.user.update).not.toHaveBeenCalled();
  });
});
