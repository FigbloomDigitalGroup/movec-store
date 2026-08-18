import { create } from 'zustand';
import api from '../lib/api';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isHydrated: false,

  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    set({ user: data.user, isAuthenticated: true });
  },

  register: async (formData) => {
    await api.post('/auth/register', formData);
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore — clear local state regardless
    } finally {
      set({ user: null, isAuthenticated: false });
    }
  },

  loadUser: async () => {
    try {
      const { data } = await api.get('/users/me');
      set({ user: data, isAuthenticated: true, isHydrated: true });
    } catch {
      set({ user: null, isAuthenticated: false, isHydrated: true });
    }
  },
}));