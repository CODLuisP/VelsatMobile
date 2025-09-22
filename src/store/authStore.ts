// src/store/authStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReactNativeBiometrics from 'react-native-biometrics';

export interface User {
  id: string;
  username: string;
  email?: string;
  name?: string;
}

// Configuración biométrica
export interface BiometricConfig {
  isEnabled: boolean;
  type: string | null; // 'FaceID' | 'TouchID' | 'Biometrics'
  isAvailable: boolean;
  lastConfigured: Date | null;
}

interface AuthState {
  // Estados de autenticación existentes
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  server: string | null;
  token: string | null;
  
  // Estados biométricos
  biometric: BiometricConfig;
  biometricCredentials: {
    username: string | null;
    token: string | null;
    server: string | null;
  };

  // Actions existentes
  setUser: (user: User) => void;
  setServer: (server: string) => void;
  setToken: (token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  
  // Actions biométricas
  checkBiometricAvailability: () => Promise<void>;
  enableBiometric: (type: string) => Promise<boolean>;
  disableBiometric: () => Promise<void>;
  authenticateWithBiometric: () => Promise<boolean>;
  saveBiometricCredentials: (username: string, token: string, server: string) => void;
  clearBiometricCredentials: () => void;
  getBiometricDisplayName: () => string;
  canUseBiometricLogin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Estados existentes
      user: null,
      isAuthenticated: false,
      isLoading: false,
      server: null,
      token: null,
      
      // Estados biométricos
      biometric: {
        isEnabled: false,
        type: null,
        isAvailable: false,
        lastConfigured: null,
      },
      biometricCredentials: {
        username: null,
        token: null,
        server: null,
      },

      // Actions existentes
      setUser: (user: User) => {
        const state = get();
        
        // Guardar credenciales biométricas si está habilitada
        if (state.biometric.isEnabled && state.token && state.server) {
          get().saveBiometricCredentials(user.username, state.token, state.server);
        }
        
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
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          server: null,
          token: null,
        });
        
        // Limpiar credenciales biométricas al hacer logout
        get().clearBiometricCredentials();
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      // NUEVAS ACTIONS BIOMÉTRICAS

      // Verificar disponibilidad biométrica del dispositivo
      checkBiometricAvailability: async () => {
        try {
          const rnBiometrics = new ReactNativeBiometrics();
          const { available, biometryType } = await rnBiometrics.isSensorAvailable();
          
          set((state) => ({
            biometric: {
              ...state.biometric,
              isAvailable: available,
              type: biometryType || null,
            },
          }));
          
          console.log('Biometric availability checked:', { available, biometryType });
        } catch (error) {
          console.error('Error checking biometric availability:', error);
          set((state) => ({
            biometric: {
              ...state.biometric,
              isAvailable: false,
            },
          }));
        }
      },

      // Activar biometría
      enableBiometric: async (type: string): Promise<boolean> => {
        try {
          const rnBiometrics = new ReactNativeBiometrics();
          const { success } = await rnBiometrics.simplePrompt({
            promptMessage: `Confirma tu identidad para activar ${get().getBiometricDisplayName()}`,
            cancelButtonText: 'Cancelar'
          });

          if (success) {
            set((state) => ({
              biometric: {
                ...state.biometric,
                isEnabled: true,
                type,
                lastConfigured: new Date(),
              },
            }));
            
            console.log('Biometric enabled successfully');
            return true;
          }
          
          return false;
        } catch (error) {
          console.error('Error enabling biometric:', error);
          return false;
        }
      },

      // Desactivar biometría
      disableBiometric: async () => {
        set((state) => ({
          biometric: {
            ...state.biometric,
            isEnabled: false,
            lastConfigured: null,
          },
        }));
        
        // Limpiar credenciales al desactivar
        get().clearBiometricCredentials();
        console.log('Biometric disabled');
      },

      // Autenticar con biometría
      authenticateWithBiometric: async (): Promise<boolean> => {
        const state = get();
        
        if (!state.biometric.isEnabled || !state.biometric.isAvailable) {
          throw new Error('Biometric not available or not enabled');
        }

        if (!state.biometricCredentials.username || !state.biometricCredentials.token || !state.biometricCredentials.server) {
          throw new Error('No credentials saved for biometric login');
        }

        try {
          const rnBiometrics = new ReactNativeBiometrics();
          const { success } = await rnBiometrics.simplePrompt({
            promptMessage: `Usa tu ${get().getBiometricDisplayName()} para acceder`,
            cancelButtonText: 'Cancelar'
          });

          if (success) {
            // Restaurar sesión automáticamente
            const { username, token, server } = state.biometricCredentials;
            
            set({
              server,
              token,
              user: {
                id: username!,
                username: username!,
                email: `${username}@velsat.com`,
                name: username!.charAt(0).toUpperCase() + username!.slice(1),
              },
              isAuthenticated: true,
              isLoading: false,
            });
            
            console.log('Biometric authentication successful');
            return true;
          }
          
          return false;
        } catch (error) {
          console.error('Biometric authentication error:', error);
          return false;
        }
      },

      // Guardar credenciales para login biométrico
      saveBiometricCredentials: (username: string, token: string, server: string) => {
        const state = get();
        
        // Solo guardar si la biometría está habilitada
        if (state.biometric.isEnabled) {
          set((state) => ({
            biometricCredentials: {
              username,
              token,
              server,
            },
          }));
          console.log('Biometric credentials saved');
        }
      },

      // Limpiar credenciales biométricas
      clearBiometricCredentials: () => {
        set((state) => ({
          biometricCredentials: {
            username: null,
            token: null,
            server: null,
          },
        }));
        console.log('Biometric credentials cleared');
      },

      // Obtener nombre amigable de la biometría
      getBiometricDisplayName: (): string => {
        const { biometric } = get();
        switch (biometric.type) {
          case 'FaceID': return 'Face ID';
          case 'TouchID': return 'Touch ID';
          case 'Biometrics': return 'Huella Dactilar';
          default: return 'Biometría';
        }
      },

      // Verificar si se puede usar login biométrico
      canUseBiometricLogin: (): boolean => {
        const state = get();
        return (
          state.biometric.isEnabled &&
          state.biometric.isAvailable &&
          !!state.biometricCredentials.username &&
          !!state.biometricCredentials.token &&
          !!state.biometricCredentials.server
        );
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Persistir todos los estados importantes
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        server: state.server,
        token: state.token,
        biometric: state.biometric,
        biometricCredentials: state.biometricCredentials,
      }),
    }
  )
);