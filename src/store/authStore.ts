// src/store/authStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  username: string;
  email?: string;
  name?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  server: string | null;
  token: string | null;
  
  // Actions
  setUser: (user: User) => void;
  setServer: (server: string) => void;
  setToken: (token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      server: null,
      token: null,

      setUser: (user: User) => {
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      setServer: (server: string) => {
        set({ server });
      },

      setToken: (token: string) => {
        set({ token });
      },

      logout: async () => {
        // Limpiar AsyncStorage de credenciales si están guardadas
     
        
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          server: null,
          token: null,
        });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'auth-storage', // nombre único para el storage
      storage: createJSONStorage(() => AsyncStorage),
      // Persistir user, isAuthenticated, server y token
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        server: state.server,
        token: state.token,
      }),
    }
  )
);