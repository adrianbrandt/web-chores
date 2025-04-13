// src/types/serviceTypes.ts
import { User, Group, List, ListItem, ListItemStatus } from '@/generated/client';

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
export type UserAuthResponse = ServiceResponse<{
  user: Partial<User>;
  token: string;
  isVerified?: boolean;
  needsVerification?: boolean;
}>;

export type UserProfileResponse = ServiceResponse<Partial<User>>;

// Group-related responses
export type GroupResponse = ServiceResponse<Group>;
export type GroupsListResponse = ServiceResponse<Group[]>;
export type GroupMemberResponse = ServiceResponse<{
  groupId: string;
  userId: string;
  role: string;
}>;

// List-related responses
export type ListResponse = ServiceResponse<List>;
export type ListsListResponse = ServiceResponse<List[]>;
export type ListItemResponse = ServiceResponse<ListItem>;

// Define specific type for stats to remove any
export interface ListStats {
  totalItems: number;
  completedItems: number;
  completionPercentage: number;
  itemsByStatus: Record<ListItemStatus, number>;
  userContributions?: Array<{
    userId: string;
    completedItems: number;
    completionPercentage: number;
  }>;
  lastCompletedAt?: Date;
}

export type ListStatsResponse = ServiceResponse<ListStats>;
