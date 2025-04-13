import { createMockContext, mockContextToAppContext } from '../../setup';
import * as userService from '@/services/userService';
import { createMockUser } from '../../testData';
import { AccountStatus } from '@/generated/client';
import bcrypt from 'bcrypt';

const mockCtx = createMockContext();
const ctx = mockContextToAppContext(mockCtx);

describe('loginUser', () => {
  it('should log in a user successfully with username', async () => {
    const mockUser = createMockUser();
    mockCtx.db.user.findFirst.mockResolvedValue(mockUser);

    const { data: result } = await userService.loginUser(ctx, 'testuser', 'Password123');

    expect(mockCtx.db.user.findFirst).toHaveBeenCalledWith({
      where: {
        OR: [{ username: 'testuser' }, { email: 'testuser' }, { phoneNumber: 'testuser' }],
      },
    });

    expect(mockCtx.db.user.update).toHaveBeenCalledWith({
      where: { id: mockUser.id },
      data: { lastLogin: expect.any(Date) },
    });

    expect(result).toHaveProperty('user');
    expect(result).toHaveProperty('token');
    expect(result).toHaveProperty('isVerified', false);
  });

  it('should throw error when identifier or password is missing', async () => {
    await expect(userService.loginUser(ctx, '', 'password')).rejects.toThrow(
      'Please provide username/email/phone and password'
    );

    await expect(userService.loginUser(ctx, 'username', '')).rejects.toThrow(
      'Please provide username/email/phone and password'
    );
  });

  it('should throw error if credentials are invalid', async () => {
    mockCtx.db.user.findFirst.mockResolvedValue(null);

    await expect(userService.loginUser(ctx, 'wronguser', 'Password123')).rejects.toThrow('Invalid credentials');
  });

  it('should throw error if password is incorrect', async () => {
    mockCtx.db.user.findFirst.mockResolvedValue(createMockUser());
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(userService.loginUser(ctx, 'testuser', 'WrongPassword')).rejects.toThrow('Invalid credentials');
  });

  it('should throw error if account is suspended', async () => {
    const suspendedUser = createMockUser({ accountStatus: AccountStatus.SUSPENDED });
    mockCtx.db.user.findFirst.mockResolvedValue(suspendedUser);

    await expect(userService.loginUser(ctx, 'testuser', 'Password123')).rejects.toThrow('Account is suspended');
  });
});
