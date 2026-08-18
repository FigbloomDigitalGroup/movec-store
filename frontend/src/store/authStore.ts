import { create } from 'zustand';
import api, { setHasSession } from '../lib/api';
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
    setHasSession(true);
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
      setHasSession(false);
      set({ user: null, isAuthenticated: false });
    }
  },

  loadUser: async () => {
    try {
      const { data } = await api.get('/users/me');
      setHasSession(true);
      set({ user: data, isAuthenticated: true, isHydrated: true });
    } catch {
      setHasSession(false);
      set({ user: null, isAuthenticated: false, isHydrated: true });
    }
  },
}));