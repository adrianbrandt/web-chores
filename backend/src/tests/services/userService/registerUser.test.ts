import { createMockContext, mockContextToAppContext } from '../../setup';
import * as userService from '@/services/userService';
import { createMockUser } from '../../testData';

const mockCtx = createMockContext();
const ctx = mockContextToAppContext(mockCtx);

describe('registerUser', () => {
  const userData = {
    name: 'Test User',
    username: 'testuser',
    email: 'user@example.com',
    password: 'Password123',
  };

  it('should register a new user successfully', async () => {
    mockCtx.db.user.findFirst.mockResolvedValue(null);
    const createdUser = createMockUser();
    mockCtx.db.user.create.mockResolvedValue(createdUser);

    const result = await userService.registerUser(ctx, userData);

    expect(mockCtx.db.user.findFirst).toHaveBeenCalledWith({
      where: {
        OR: [{ username: userData.username }, { email: userData.email }],
      },
    });

    expect(mockCtx.db.user.create).toHaveBeenCalled();
    expect(result).toHaveProperty('user');
    expect(result).toHaveProperty('token');
    expect(result).toHaveProperty('needsVerification', true);
  });

  it('should throw error if required fields are missing', async () => {
    const incompleteData: Omit<Parameters<typeof userService.registerUser>[1], 'email' | 'phoneNumber'> = {
      name: 'Test User',
      username: 'testuser',
      password: 'Password123',
    };

    await expect(userService.registerUser(ctx, incompleteData)).rejects.toThrow(
      'Please provide name, username, password, and either email or phone number'
    );

    expect(mockCtx.db.user.findFirst).not.toHaveBeenCalled();
  });

  it('should throw error if user already exists', async () => {
    mockCtx.db.user.findFirst.mockResolvedValue(createMockUser());

    await expect(userService.registerUser(ctx, userData)).rejects.toThrow('User already exists');

    expect(mockCtx.db.user.create).not.toHaveBeenCalled();
  });

  it('should register a user with phone number instead of email', async () => {
    const userData = {
      name: 'Test User',
      username: 'testuser',
      phoneNumber: '+11234567890',
      password: 'Password123',
    };

    mockCtx.db.user.findFirst.mockResolvedValue(null);
    const createdUser = createMockUser({
      email: null,
      phoneNumber: '+11234567890',
    });
    mockCtx.db.user.create.mockResolvedValue(createdUser);

    const result = await userService.registerUser(ctx, userData);

    expect(mockCtx.db.user.findFirst).toHaveBeenCalledWith({
      where: {
        OR: [{ username: userData.username }, { phoneNumber: userData.phoneNumber }],
      },
    });

    expect(result).toHaveProperty('user');
    expect(result).toHaveProperty('token');
    expect(result).toHaveProperty('needsVerification', true);
  });

  it('should throw error when neither email nor phone is provided', async () => {
    const userData: Omit<Parameters<typeof userService.registerUser>[1], 'email' | 'phoneNumber'> = {
      name: 'Test User',
      username: 'tester',
      password: 'Password123',
    };

    await expect(userService.registerUser(ctx, userData)).rejects.toThrow(
      'Please provide name, username, password, and either email or phone number'
    );
  });
});
