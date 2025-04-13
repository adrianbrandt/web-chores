import { GroupType, GroupMemberRole } from '@/generated/client';

export interface CreateGroupData {
  name: string;
  description?: string;
  type?: GroupType;
  createdById: string;
}

export interface UpdateGroupData {
  name?: string;
  description?: string;
  type?: GroupType;
}
