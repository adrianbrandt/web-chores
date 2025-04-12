import { createMockContext, mockContextToAppContext } from '../../setup';
import * as userService from '@/services/userService';
import { createMockPrismaResponse, createMockUser } from '../../testData';
import { User } from '@/generated/client';

const mockCtx = createMockContext();
const ctx = mockContextToAppContext(mockCtx);

describe('getUserProfile', () => {
  it('should return user profile successfully', async () => {
    const userProfile = createMockUser();
    mockCtx.db.user.findUnique.mockResolvedValue(createMockPrismaResponse<User>(userProfile));

    const result = await userService.getUserProfile(ctx, '1');

    expect(mockCtx.db.user.findUnique).toHaveBeenCalledWith({
      where: { id: '1' },
      select: expect.objectContaining({
        id: true,
        name: true,
        username: true,
      }),
    });

    expect(result).toEqual(userProfile);
  });

  it('should throw error if user does not exist', async () => {
    mockCtx.db.user.findUnique.mockResolvedValue(null);

    await expect(userService.getUserProfile(ctx, '999')).rejects.toThrow('User not found');
  });
});
