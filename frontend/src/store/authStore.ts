import { create } from 'zustand';
import { auth } from '../services/api';
import type { User, LoginCredentials, RegisterCredentials } from '../types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  login: async (credentials) => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await auth.login(credentials);
      localStorage.setItem('token', data.token);
      set({ user: data.user, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to login',
        isLoading: false
      });
      throw error;
    }
  },

  register: async (credentials) => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await auth.register(credentials);
      localStorage.setItem('token', data.token);
      set({ user: data.user, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to register',
        isLoading: false
      });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, error: null });
  },

  checkAuth: async () => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await auth.getCurrentUser();
      set({ user: data, isLoading: false });
    } catch (error) {
      set({ user: null, isLoading: false });
      localStorage.removeItem('token');
    }
  }
})); 