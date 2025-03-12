import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { List, ListItem, CreateListDto, CreateListItemDto } from '../types';

// Fetch all lists
export function useLists() {
  return useQuery({
    queryKey: ['lists'],
    queryFn: async () => {
      const response = await api.get<List[]>('/lists');
      return response.data;
    }
  });
}

// Fetch shared lists
export function useSharedLists() {
  return useQuery({
    queryKey: ['lists', 'shared'],
    queryFn: async () => {
      const response = await api.get<List[]>('/lists/shared');
      return response.data;
    }
  });
}

// Fetch a single list by ID
export function useList(id: number) {
  return useQuery({
    queryKey: ['lists', id],
    queryFn: async () => {
      const response = await api.get<List>(`/lists/${id}`);
      return response.data;
    },
    enabled: !!id
  });
}

// Create a new list
export function useCreateList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (list: CreateListDto) => {
      const response = await api.post<List>('/lists', list);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
    }
  });
}

// Update a list
export function useUpdateList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CreateListDto }) => {
      const response = await api.put<List>(`/lists/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
      queryClient.invalidateQueries({ queryKey: ['lists', variables.id] });
    }
  });
}

// Delete a list
export function useDeleteList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/lists/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
    }
  });
}

// Add an item to a list
export function useAddListItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
                         listId,
                         data
                       }: {
      listId: number;
      data: CreateListItemDto
    }) => {
      const response = await api.post<ListItem>(`/lists/${listId}/items`, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
      queryClient.invalidateQueries({ queryKey: ['lists', data.listId] });
    }
  });
}

// Update a list item
export function useUpdateListItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
                         itemId,
                         data
                       }: {
      itemId: number;
      data: Partial<CreateListItemDto>
    }) => {
      const response = await api.put<ListItem>(`/lists/items/${itemId}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
      if (data.list) {
        queryClient.invalidateQueries({ queryKey: ['lists', data.listId] });
      }
    }
  });
}

// Delete a list item
export function useDeleteListItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: number) => {
      await api.delete(`/lists/items/${itemId}`);
      return itemId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
    }
  });
}

// Toggle list item completion
export function useToggleListItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: number) => {
      const response = await api.put<ListItem>(`/lists/items/${itemId}/toggle`);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
      queryClient.invalidateQueries({ queryKey: ['lists', data.listId] });
    }
  });
}

// Share a list with another user
export function useShareList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
                         listId,
                         email
                       }: {
      listId: number;
      email: string
    }) => {
      const response = await api.post(`/lists/${listId}/share`, { email });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
    }
  });
}

// Remove list share
export function useRemoveListShare() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
                         listId,
                         userId
                       }: {
      listId: number;
      userId: number
    }) => {
      await api.delete(`/lists/${listId}/share/${userId}`);
      return { listId, userId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
    }
  });
}