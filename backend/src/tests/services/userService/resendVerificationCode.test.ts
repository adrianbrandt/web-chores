import { createMockContext, mockContextToAppContext } from '../../setup';
import * as userService from '@/services/userService';
import { createMockUser } from '../../testData';

const mockCtx = createMockContext();
const ctx = mockContextToAppContext(mockCtx);

describe('resendVerificationCode', () => {
  it('should resend verification code successfully with email', async () => {
    const user = createMockUser({
      isVerified: false,
      email: 'user@example.com',
      phoneNumber: null,
    });
    mockCtx.db.user.findUnique.mockResolvedValue(user);
    mockCtx.db.user.update.mockResolvedValue({
      ...user,
      verificationCode: '123456',
      verificationExpires: new Date(),
    });

    const result = await userService.resendVerificationCode(ctx, '1');

    expect(mockCtx.db.user.findUnique).toHaveBeenCalledWith({
      where: { id: '1' },
    });
    expect(mockCtx.db.user.update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: {
        verificationCode: expect.any(String),
        verificationExpires: expect.any(Date),
      },
    });
    expect(result).toBe(true);
  });

  it('should resend verification code successfully with phone number', async () => {
    const user = createMockUser({
      isVerified: false,
      email: null,
      phoneNumber: '+11234567890',
    });
    mockCtx.db.user.findUnique.mockResolvedValue(user);
    mockCtx.db.user.update.mockResolvedValue({
      ...user,
      verificationCode: '123456',
      verificationExpires: new Date(),
    });

    const result = await userService.resendVerificationCode(ctx, '1');

    expect(mockCtx.db.user.findUnique).toHaveBeenCalledWith({
      where: { id: '1' },
    });
    expect(mockCtx.db.user.update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: {
        verificationCode: expect.any(String),
        verificationExpires: expect.any(Date),
      },
    });
    expect(result).toBe(true);
  });

  it('should throw error if user does not exist', async () => {
    mockCtx.db.user.findUnique.mockResolvedValue(null);

    await expect(userService.resendVerificationCode(ctx, '999')).rejects.toThrow('User not found');

    expect(mockCtx.db.user.update).not.toHaveBeenCalled();
  });

  it('should throw error if account is already verified', async () => {
    const verifiedUser = createMockUser({ isVerified: true });
    mockCtx.db.user.findUnique.mockResolvedValue(verifiedUser);

    await expect(userService.resendVerificationCode(ctx, '1')).rejects.toThrow('Account already verified');

    expect(mockCtx.db.user.update).not.toHaveBeenCalled();
  });
});
