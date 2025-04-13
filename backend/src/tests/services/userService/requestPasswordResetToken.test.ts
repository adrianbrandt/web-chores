import { createMockContext, mockContextToAppContext } from '../../setup';
import * as userService from '@/services/userService';
import { createMockUser } from '../../testData';

const mockCtx = createMockContext();
const ctx = mockContextToAppContext(mockCtx);

describe('requestPasswordResetToken', () => {
  it('should create reset token for existing user', async () => {
    const user = createMockUser();
    mockCtx.db.user.findFirst.mockResolvedValue(user);

    await userService.requestPasswordResetToken(ctx, 'user@example.com');

    expect(mockCtx.db.user.findFirst).toHaveBeenCalledWith({
      where: {
        OR: [{ email: 'user@example.com' }, { phoneNumber: 'user@example.com' }, { username: 'user@example.com' }],
      },
    });

    expect(mockCtx.db.user.update).toHaveBeenCalledWith({
      where: { id: user.id },
      data: {
        passwordResetToken: expect.any(String),
        passwordResetExpires: expect.any(Date),
      },
    });
  });

  it('should return success even if user does not exist (for security)', async () => {
    mockCtx.db.user.findFirst.mockResolvedValue(null);

    const { data: result } = await userService.requestPasswordResetToken(ctx, 'nonexistent@example.com');

    expect(result).toBe(true);
    expect(mockCtx.db.user.update).not.toHaveBeenCalled();
  });

  it('should create reset token and send via email if available', async () => {
    const user = createMockUser({
      email: 'user@example.com',
      phoneNumber: '+11234567890',
    });
    mockCtx.db.user.findFirst.mockResolvedValue(user);

    await userService.requestPasswordResetToken(ctx, 'user@example.com');

    expect(mockCtx.db.user.update).toHaveBeenCalledWith({
      where: { id: user.id },
      data: {
        passwordResetToken: expect.any(String),
        passwordResetExpires: expect.any(Date),
      },
    });
  });

  it('should create reset token and send via SMS if no email available', async () => {
    const user = createMockUser({
      email: null,
      phoneNumber: '+11234567890',
    });
    mockCtx.db.user.findFirst.mockResolvedValue(user);

    await userService.requestPasswordResetToken(ctx, 'username');

    expect(mockCtx.db.user.update).toHaveBeenCalledWith({
      where: { id: user.id },
      data: {
        passwordResetToken: expect.any(String),
        passwordResetExpires: expect.any(Date),
      },
    });
  });

  it('should handle case when user has neither email nor phone', async () => {
    const user = createMockUser({
      email: null,
      phoneNumber: null,
    });
    mockCtx.db.user.findFirst.mockResolvedValue(user);

    const { data: result } = await userService.requestPasswordResetToken(ctx, 'username');

    expect(mockCtx.db.user.update).toHaveBeenCalledWith({
      where: { id: user.id },
      data: {
        passwordResetToken: expect.any(String),
        passwordResetExpires: expect.any(Date),
      },
    });

    expect(result).toBe(true);
  });

  it('should throw error if no identifier is provided', async () => {
    await expect(userService.requestPasswordResetToken(ctx, '')).rejects.toThrow(
      'Please provide email, phone number, or username'
    );

    expect(mockCtx.db.user.findFirst).not.toHaveBeenCalled();
  });
});
