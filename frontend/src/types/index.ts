// User types
export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser extends User {
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  name: string;
}

// Chore types
export interface Chore {
  id: number;
  title: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  createdAt: string;
  updatedAt: string;
  createdBy: number;
  instances?: ChoreInstance[];
}

export interface ChoreInstance {
  id: number;
  choreId: number;
  userId: number;
  dueDate: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  chore?: Chore;
}

export interface CreateChoreDto {
  title: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
}

// List types
export interface List {
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
  createdBy: number;
  items?: ListItem[];
  shared?: ListShare[];
  user?: User;
}

export interface ListItem {
  id: number;
  listId: number;
  content: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  list?: List;
}

export interface ListShare {
  id: number;
  listId: number;
  userId: number;
}

export interface CreateListDto {
  title: string;
}

export interface CreateListItemDto {
  content: string;
}

export interface ShareListDto {
  email: string;
}