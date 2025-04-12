import { createMockContext, mockContextToAppContext } from '../../setup';
import * as userService from '@/services/userService';
import { createMockPrismaResponse, createMockUser } from '../../testData';
import { User } from '@/generated/client';

const mockCtx = createMockContext();
const ctx = mockContextToAppContext(mockCtx);

describe('updateUserProfile', () => {
  it('should update profile with email changes', async () => {
    const profileData = { email: 'newemail@example.com' };
    mockCtx.db.user.findFirst.mockResolvedValue(null);

    const updatedProfile = createMockUser({ id: '1', email: 'newemail@example.com' });

    mockCtx.db.user.update.mockResolvedValue(createMockPrismaResponse<User>(updatedProfile));

    const result = await userService.updateUserProfile(ctx, '1', profileData);

    expect(mockCtx.db.user.findFirst).toHaveBeenCalledWith({
      where: {
        OR: [{ email: 'newemail@example.com' }],
        NOT: { id: '1' },
      },
    });

    expect(mockCtx.db.user.update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: profileData,
      select: expect.objectContaining({ id: true, email: true }),
    });

    expect(result).toEqual(updatedProfile);
  });

  it('should update profile with phone number changes', async () => {
    const profileData = { phoneNumber: '+19876543210' };
    mockCtx.db.user.findFirst.mockResolvedValue(null);

    const updatedProfile = createMockUser({ id: '1', phoneNumber: '+19876543210' });
    mockCtx.db.user.update.mockResolvedValue(createMockPrismaResponse<User>(updatedProfile));

    const result = await userService.updateUserProfile(ctx, '1', profileData);

    expect(mockCtx.db.user.findFirst).toHaveBeenCalledWith({
      where: {
        OR: [{ phoneNumber: '+19876543210' }],
        NOT: { id: '1' },
      },
    });

    expect(mockCtx.db.user.update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: profileData,
      select: expect.any(Object),
    });

    expect(result).toEqual(updatedProfile);
  });

  it('should update profile with avatar URL only', async () => {
    const profileData = { avatarUrl: 'https://example.com/avatar.png' };

    const updatedProfile = createMockUser({ id: '1', avatarUrl: 'https://example.com/avatar.png' });
    mockCtx.db.user.update.mockResolvedValue(createMockPrismaResponse<User>(updatedProfile));

    const result = await userService.updateUserProfile(ctx, '1', profileData);

    expect(mockCtx.db.user.findFirst).not.toHaveBeenCalled();
    expect(mockCtx.db.user.update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: profileData,
      select: expect.any(Object),
    });

    expect(result).toEqual(updatedProfile);
  });

  it('should throw error if identifier is already in use', async () => {
    const profileData = { username: 'existinguser' };
    mockCtx.db.user.findFirst.mockResolvedValue(createMockUser({ id: '2' }));

    await expect(userService.updateUserProfile(ctx, '1', profileData)).rejects.toThrow(
      'Username, email, or phone number already in use'
    );

    expect(mockCtx.db.user.update).not.toHaveBeenCalled();
  });
});
