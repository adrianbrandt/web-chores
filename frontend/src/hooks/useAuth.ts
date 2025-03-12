import { useMutation } from '@tanstack/react-query';
import api from '../services/api';
import { LoginCredentials, RegisterCredentials, AuthUser } from '../types';
import { useAuth } from '../context/AuthContext';

export function useLogin() {
  const { setUser } = useAuth();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await api.post<AuthUser>('/users/login', credentials);
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
      const response = await api.post<AuthUser>('/users/register', credentials);
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