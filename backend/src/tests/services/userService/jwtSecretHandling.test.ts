import jwt from 'jsonwebtoken';
import * as userService from '@/services/userService';
import { UserRole } from '@/generated/client';

describe('User Service - JWT Secret handling', () => {
  it('should use JWT_SECRET from environment if available', () => {
    process.env.JWT_SECRET = 'mySuperSecret';

    const payload = {
      userId: '123',
      username: 'testuser',
      role: UserRole.USER,
    };
    userService.generateToken(payload);

    expect(jwt.sign).toHaveBeenCalledWith(payload, 'mySuperSecret', { expiresIn: '1h' });
  });
});
