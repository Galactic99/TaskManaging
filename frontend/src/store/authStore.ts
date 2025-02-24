import { create } from 'zustand';
import { auth } from '../services/api';
import type { User, LoginCredentials, RegisterCredentials } from '../types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true, // Start with true since we'll check auth on init
  error: null,
  isInitialized: false,

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
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      set({ isLoading: true, error: null });
      const { data } = await auth.getCurrentUser();
      set({ user: data, isLoading: false, isInitialized: true });
    } catch (error) {
      set({ user: null, isLoading: false, isInitialized: true });
      localStorage.removeItem('token');
    }
  }
})); 