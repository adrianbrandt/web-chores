import { UserRole } from '@/generated/client';

export interface JwtPayload {
  userId: string;
  username: string;
  role: UserRole;
}
