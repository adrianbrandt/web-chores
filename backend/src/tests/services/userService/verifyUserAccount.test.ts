import { createMockContext, mockContextToAppContext } from '../../setup';
import * as userService from '@/services/userService';
import { createMockUser } from '../../testData';

const mockCtx = createMockContext();
const ctx = mockContextToAppContext(mockCtx);

describe('verifyUserAccount', () => {
  it('should verify account successfully', async () => {
    const unverifiedUser = createMockUser({
      isVerified: false,
      verificationCode: '123456',
      verificationExpires: new Date(Date.now() + 100000),
    });
    mockCtx.db.user.findUnique.mockResolvedValue(unverifiedUser);

    const verifiedUser = {
      ...unverifiedUser,
      isVerified: true,
      verificationCode: null,
      verificationExpires: null,
    };
    mockCtx.db.user.update.mockResolvedValue(verifiedUser);

    await userService.verifyUserAccount(ctx, '1', '123456');

    expect(mockCtx.db.user.findUnique).toHaveBeenCalledWith({ where: { id: '1' } });
    expect(mockCtx.db.user.update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: {
        isVerified: true,
        verificationCode: null,
        verificationExpires: null,
      },
    });
  });

  it('should throw error if OTP is missing', async () => {
    await expect(userService.verifyUserAccount(ctx, '1', '')).rejects.toThrow('Please provide verification code');

    expect(mockCtx.db.user.findUnique).not.toHaveBeenCalled();
  });

  it('should throw error if user does not exist', async () => {
    mockCtx.db.user.findUnique.mockResolvedValue(null);

    await expect(userService.verifyUserAccount(ctx, '999', '123456')).rejects.toThrow('User not found');

    expect(mockCtx.db.user.update).not.toHaveBeenCalled();
  });

  it('should throw error if account is already verified', async () => {
    const verifiedUser = createMockUser({ isVerified: true });
    mockCtx.db.user.findUnique.mockResolvedValue(verifiedUser);

    await expect(userService.verifyUserAccount(ctx, '1', '123456')).rejects.toThrow('Account already verified');

    expect(mockCtx.db.user.update).not.toHaveBeenCalled();
  });

  it('should throw error if verification code is invalid', async () => {
    const unverifiedUser = createMockUser({
      isVerified: false,
      verificationCode: '123456',
      verificationExpires: new Date(Date.now() + 100000),
    });
    mockCtx.db.user.findUnique.mockResolvedValue(unverifiedUser);

    await expect(userService.verifyUserAccount(ctx, '1', 'wrong-otp')).rejects.toThrow('Invalid verification code');
  });

  it('should throw error if verification code has expired', async () => {
    const unverifiedUser = createMockUser({
      isVerified: false,
      verificationCode: '123456',
      verificationExpires: new Date(Date.now() - 100000),
    });
    mockCtx.db.user.findUnique.mockResolvedValue(unverifiedUser);

    await expect(userService.verifyUserAccount(ctx, '1', '123456')).rejects.toThrow('Verification code has expired');
  });
});
