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
  description?: string;
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
  tipo: string | null;
  selectedVehiclePin: 's' | 'p' | 'c'; // s=sedan, p=pickup, c=camion cisterna
  
  // Estados biométricos
  biometric: BiometricConfig;
  biometricCredentials: {
    username: string | null;
    token: string | null;
    server: string | null;
    tipo: string | null;
  };

  // Actions existentes
  setUser: (user: User) => void;
  setServer: (server: string) => void;
  setToken: (token: string) => void;
  setTipo: (tipo: string) => void;
  setSelectedVehiclePin: (pin: 's' | 'p' | 'c') => void;
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
      tipo: null,
      selectedVehiclePin: 's', // Por defecto sedan
      
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
        tipo: null,
      },

      // Actions existentes
      setUser: (user: User) => {
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
        
        setTimeout(() => {
          const newState = get();
          if (newState.biometric.isEnabled && newState.token && newState.server && newState.tipo) {
            set((currentState) => ({
              ...currentState,
              biometricCredentials: {
                username: user.username,
                token: newState.token!,
                server: newState.server!,
                tipo: newState.tipo!,
              },
            }));
          }
        }, 100);
      },

      setServer: (server: string) => {
        set({ server });
      },

      setToken: (token: string) => {
        set({ token });
      },

      setTipo: (tipo: string) => {
        set({ tipo });
      },

      setSelectedVehiclePin: (pin: 's' | 'p' | 'c') => {
        set({ selectedVehiclePin: pin });
      },

      logout: async () => {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          server: null,
          token: null,
          tipo: null,
        });
        
        const currentState = get();
        if (!currentState.biometric.isEnabled) {
          get().clearBiometricCredentials();
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      // ACTIONS BIOMÉTRICAS

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
        } catch (error) {
          set((state) => ({
            biometric: {
              ...state.biometric,
              isAvailable: false,
            },
          }));
        }
      },

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
            
            const currentState = get();
            if (currentState.user && currentState.token && currentState.server && currentState.tipo) {
              set((state) => ({
                biometricCredentials: {
                  username: currentState.user!.username,
                  token: currentState.token,
                  server: currentState.server,
                  tipo: currentState.tipo,
                },
              }));
            }
            
            return true;
          }
          
          return false;
        } catch (error) {
          return false;
        }
      },

      disableBiometric: async () => {
        set((state) => ({
          biometric: {
            ...state.biometric,
            isEnabled: false,
            lastConfigured: null,
          },
        }));
        
        get().clearBiometricCredentials();
      },

      authenticateWithBiometric: async (): Promise<boolean> => {
        const state = get();
        
        if (!state.biometric.isEnabled || !state.biometric.isAvailable) {
          throw new Error('Biometría no disponible o no habilitada');
        }

        if (!state.biometricCredentials.username || 
            !state.biometricCredentials.token || 
            !state.biometricCredentials.server ||
            !state.biometricCredentials.tipo) {
          throw new Error('No hay credenciales guardadas para login biométrico');
        }

        try {
          const rnBiometrics = new ReactNativeBiometrics();
          const { success } = await rnBiometrics.simplePrompt({
            promptMessage: `Usa tu ${get().getBiometricDisplayName()} para acceder`,
            cancelButtonText: 'Cancelar'
          });

          if (success) {
            const { username, token, server, tipo } = state.biometricCredentials;
            
            set({
              server,
              token,
              tipo,
              user: {
                id: username!,
                username: username!,
                email: `${username}@velsat.com`,
                name: username!.charAt(0).toUpperCase() + username!.slice(1),
              },
              isAuthenticated: true,
              isLoading: false,
            });
            
            return true;
          }
          
          return false;
        } catch (error) {
          return false;
        }
      },

      saveBiometricCredentials: (username: string, token: string, server: string) => {
        const state = get();
        
        if (state.biometric.isEnabled && state.tipo) {
          set((state) => ({
            biometricCredentials: {
              username,
              token,
              server,
              tipo: state.tipo,
            },
          }));
        }
      },

      clearBiometricCredentials: () => {
        set((state) => ({
          biometricCredentials: {
            username: null,
            token: null,
            server: null,
            tipo: null,
          },
        }));
      },

      getBiometricDisplayName: (): string => {
        const { biometric } = get();
        switch (biometric.type) {
          case 'FaceID': return 'Face ID';
          case 'TouchID': return 'Touch ID';
          case 'Biometrics': return 'Huella Dactilar';
          default: return 'Biometría';
        }
      },

      canUseBiometricLogin: (): boolean => {
        const state = get();
        return (
          state.biometric.isEnabled &&
          state.biometric.isAvailable &&
          !!state.biometricCredentials.username &&
          !!state.biometricCredentials.token &&
          !!state.biometricCredentials.server &&
          !!state.biometricCredentials.tipo
        );
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state: AuthState) => ({
        selectedVehiclePin: state.selectedVehiclePin,
        biometric: state.biometric,
        biometricCredentials: state.biometricCredentials,
      }),
      version: 1,
    }
  )
);