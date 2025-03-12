import { useMutation } from '@tanstack/react-query';
import api from '../services/api';
import { LoginCredentials, RegisterCredentials, User } from '../types';
import { useAuth } from '../context/AuthContext';

// In frontend/src/hooks/useAuth.ts
export function useLogin() {
  const { setUser } = useAuth();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await api.post<User>('/users/login', credentials);
      return response.data;
    },
    onSuccess: (data) => {
      setUser(data);
    }
  });
}

export function useRegister() {
  const { setUser } = useAuth();

  return useMutation({
    mutationFn: async (credentials: RegisterCredentials) => {
      const response = await api.post<User>('/users/register', credentials);
      return response.data;
    },
    onSuccess: (data) => {
      setUser(data);
    }
  });
}

export function useLogout() {
  const { logout } = useAuth();

  return useMutation({
    mutationFn: async () => {
      logout();
      return null;
    }
  });
}