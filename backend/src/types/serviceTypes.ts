// src/types/serviceTypes.ts
import { User, Group, List, ListItem } from '@/generated/client';

// Base response for all services
export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    details?: string;
  };
}

// User-related responses
export interface UserAuthResponse
  extends ServiceResponse<{
    user: Partial<User>;
    token: string;
    isVerified?: boolean;
    needsVerification?: boolean;
  }> {}

export interface UserProfileResponse extends ServiceResponse<Partial<User>> {}

// Group-related responses
export interface GroupResponse extends ServiceResponse<Group> {}
export interface GroupsListResponse extends ServiceResponse<Group[]> {}
export interface GroupMemberResponse
  extends ServiceResponse<{
    groupId: string;
    userId: string;
    role: string;
  }> {}

// List-related responses
export interface ListResponse extends ServiceResponse<List> {}
export interface ListsListResponse extends ServiceResponse<List[]> {}
export interface ListItemResponse extends ServiceResponse<ListItem> {}
export interface ListStatsResponse
  extends ServiceResponse<{
    totalItems: number;
    completedItems: number;
    completionPercentage: number;
    [key: string]: any;
  }> {}
