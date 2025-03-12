import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { Chore, ChoreInstance, CreateChoreDto } from '../types';

// Fetch all chores
export function useChores() {
  return useQuery({
    queryKey: ['chores'],
    queryFn: async () => {
      const response = await api.get<Chore[]>('/chores');
      return response.data;
    }
  });
}

// Fetch a single chore by ID
export function useChore(id: number) {
  return useQuery({
    queryKey: ['chores', id],
    queryFn: async () => {
      const response = await api.get<Chore>(`/chores/${id}`);
      return response.data;
    },
    enabled: !!id
  });
}

// Create a new chore
export function useCreateChore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (chore: CreateChoreDto) => {
      const response = await api.post<Chore>('/chores', chore);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chores'] });
    }
  });
}

// Update a chore
export function useUpdateChore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<CreateChoreDto> }) => {
      const response = await api.put<Chore>(`/chores/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chores'] });
      queryClient.invalidateQueries({ queryKey: ['chores', variables.id] });
    }
  });
}

// Delete a chore
export function useDeleteChore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/chores/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chores'] });
    }
  });
}

// Fetch chore instances for a specific chore
export function useChoreInstances(choreId: number) {
  return useQuery({
    queryKey: ['chores', choreId, 'instances'],
    queryFn: async () => {
      const response = await api.get<ChoreInstance[]>(`/chores/${choreId}/instances`);
      return response.data;
    },
    enabled: !!choreId
  });
}

// Complete a chore instance
export function useCompleteChoreInstance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (instanceId: number) => {
      const response = await api.put<ChoreInstance>(`/chores/instances/${instanceId}/complete`);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['chores'] });
      queryClient.invalidateQueries({ queryKey: ['chores', data.choreId, 'instances'] });
    }
  });
}

// Create a chore instance (schedule a chore)
export function useCreateChoreInstance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
                         choreId,
                         data
                       }: {
      choreId: number;
      data: { dueDate?: Date; userId?: number }
    }) => {
      const response = await api.post<ChoreInstance>(`/chores/${choreId}/instances`, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['chores'] });
      queryClient.invalidateQueries({ queryKey: ['chores', data.choreId, 'instances'] });
    }
  });
}