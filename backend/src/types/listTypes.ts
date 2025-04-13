import { ListCollaboratorRole, ListItemStatus, ListType, Priority, RecurrenceFrequency } from '@/generated/client';

export interface CreateListData {
  name: string;
  type: ListType;
  description?: string;
  isShared: boolean;
  groupId?: string;
  ownerId: string;
  recurrence?: {
    frequency: RecurrenceFrequency;
    customInterval?: number;
    startDate: Date;
    endDate?: Date;
  };
  collaborators?: {
    userId: string;
    role: ListCollaboratorRole;
  }[];
}

export interface UpdateListData {
  name?: string;
  description?: string;
  type?: ListType;
  isShared?: boolean;
  recurrence?: {
    frequency?: RecurrenceFrequency;
    customInterval?: number;
    startDate?: Date;
    endDate?: Date;
  };
}

export interface CreateListItemData {
  title: string;
  description?: string;
  assignedToId?: string;
  quantity?: number;
  timeEstimate?: number;
  priority?: Priority;
  dueDate?: Date;
}

export interface UpdateListItemData {
  title?: string;
  description?: string;
  status?: ListItemStatus;
  assignedToId?: string;
  completedById?: string;
  completedAt?: Date;
  quantity?: number;
  timeEstimate?: number;
  priority?: Priority;
  dueDate?: Date;
}
