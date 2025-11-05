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
  codigo?: string;
}

// Configuración biométrica
export interface BiometricConfig {
  isEnabled: boolean;
  type: string | null; // 'FaceID' | 'TouchID' | 'Biometrics'
  isAvailable: boolean;
  lastConfigured: Date | null;
}

// Configuración de PIN
export interface PinConfig {
  isEnabled: boolean;
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
  selectedVehiclePin: 's' | 'p' | 'c';
  
  hasActiveSession: boolean;
  
  // Estados biométricos
  biometric: BiometricConfig;
  biometricCredentials: {
    username: string | null;
    token: string | null;
    server: string | null;
    tipo: string | null;
    description: string | null;
    codigo: string | null;
  };

  // Estados de PIN
  pin: PinConfig;
  pinCredentials: {
    username: string | null;
    token: string | null;
    server: string | null;
    tipo: string | null;
    description: string | null;
    codigo: string | null;
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

  // Actions de PIN
  enablePinLogin: () => Promise<boolean>;
  disablePinLogin: () => Promise<void>;
  savePinCredentials: (username: string, token: string, server: string) => void;
  clearPinCredentials: () => void;
  canUsePinLogin: () => boolean;
  authenticateWithPin: () => Promise<boolean>; // ⭐ AGREGADA
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
      selectedVehiclePin: 's',
      hasActiveSession: false,
      
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
        description: null,
        codigo: null,
      },

      // Estados iniciales de PIN
      pin: {
        isEnabled: false,
        lastConfigured: null,
      },
      pinCredentials: {
        username: null,
        token: null,
        server: null,
        tipo: null,
        description: null,
        codigo: null,
      },

      // Actions existentes
      setUser: (user: User) => {
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          hasActiveSession: true,
        });
        
        setTimeout(() => {
          const newState = get();
          
          // Guardar credenciales biométricas
          if (newState.biometric.isEnabled && newState.token && newState.server && newState.tipo) {
            set((currentState) => ({
              ...currentState,
              biometricCredentials: {
                username: user.username,
                token: newState.token!,
                server: newState.server!,
                tipo: newState.tipo!,
                description: user.description || null,
                codigo: user.codigo || null,
              },
            }));
          }
          
          // Guardar credenciales de PIN
          if (newState.pin.isEnabled && newState.token && newState.server && newState.tipo) {
            set((currentState) => ({
              ...currentState,
              pinCredentials: {
                username: user.username,
                token: newState.token!,
                server: newState.server!,
                tipo: newState.tipo!,
                description: user.description || null,
                codigo: user.codigo || null,
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
          hasActiveSession: false,
        });
        
        const currentState = get();
        if (!currentState.biometric.isEnabled) {
          get().clearBiometricCredentials();
        }
        
        if (!currentState.pin.isEnabled) {
          get().clearPinCredentials();
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
                  description: currentState.user!.description || null,
                  codigo: currentState.user!.codigo || null,
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
          const { success, error } = await rnBiometrics.simplePrompt({
            promptMessage: `Usa tu ${get().getBiometricDisplayName()} para acceder`,
            cancelButtonText: 'Cancelar'
          });

          if (success) {
            const { username, token, server, tipo, description, codigo } = state.biometricCredentials;
            
            set({
              server,
              token,
              tipo,
              user: {
                id: username!,
                username: username!,
                email: `${username}@velsat.com`,
                name: username!.charAt(0).toUpperCase() + username!.slice(1),
                description: description || undefined,
                codigo: codigo || undefined,
              },
              isAuthenticated: true,
              isLoading: false,
              hasActiveSession: true,
            });
            
            return true;
          }
          
          if (error && (error === 'User cancellation' || error === 'cancelled' || error === 'user_cancel')) {
            throw new Error('USER_CANCELLED');
          }
          
          throw new Error('BIOMETRIC_FAILED');
          
        } catch (error: any) {
          throw error;
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
              description: state.user?.description || null,
              codigo: state.user?.codigo || null,
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
            description: null,
            codigo: null,
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
        const canUse = (
          state.biometric.isEnabled &&
          state.biometric.isAvailable &&
          !!state.biometricCredentials.username &&
          !!state.biometricCredentials.token &&
          !!state.biometricCredentials.server &&
          !!state.biometricCredentials.tipo
        );
        
        return canUse;
      },

      // ACTIONS DE PIN

      enablePinLogin: async (): Promise<boolean> => {
        try {
          set((state) => ({
            pin: {
              ...state.pin,
              isEnabled: true,
              lastConfigured: new Date(),
            },
          }));
          
          const currentState = get();
          if (currentState.user && currentState.token && currentState.server && currentState.tipo) {
            set((state) => ({
              pinCredentials: {
                username: currentState.user!.username,
                token: currentState.token,
                server: currentState.server,
                tipo: currentState.tipo,
                description: currentState.user!.description || null,
                codigo: currentState.user!.codigo || null,
              },
            }));
          }
          
          return true;
        } catch (error) {
          return false;
        }
      },

      disablePinLogin: async () => {
        set((state) => ({
          pin: {
            ...state.pin,
            isEnabled: false,
            lastConfigured: null,
          },
        }));
        
        get().clearPinCredentials();
      },

      savePinCredentials: (username: string, token: string, server: string) => {
        const state = get();
        
        if (state.pin.isEnabled && state.tipo) {
          set((state) => ({
            pinCredentials: {
              username,
              token,
              server,
              tipo: state.tipo,
              description: state.user?.description || null,
              codigo: state.user?.codigo || null,
            },
          }));
        }
      },

      clearPinCredentials: () => {
        set((state) => ({
          pinCredentials: {
            username: null,
            token: null,
            server: null,
            tipo: null,
            description: null,
            codigo: null,
          },
        }));
      },

      canUsePinLogin: (): boolean => {
        const state = get();
        const canUse = (
          state.pin.isEnabled &&
          !!state.pinCredentials.username &&
          !!state.pinCredentials.token &&
          !!state.pinCredentials.server &&
          !!state.pinCredentials.tipo
        );
        
        return canUse;
      },

      // ⭐ NUEVA FUNCIÓN: Autenticar con PIN
      authenticateWithPin: async (): Promise<boolean> => {
        const state = get();
        
        if (!state.pin.isEnabled) {
          throw new Error('PIN no está habilitado');
        }

        if (!state.pinCredentials.username || 
            !state.pinCredentials.token || 
            !state.pinCredentials.server ||
            !state.pinCredentials.tipo) {
          throw new Error('No hay credenciales guardadas para login con PIN');
        }

        try {
          const { username, token, server, tipo, description, codigo } = state.pinCredentials;
          
          set({
            server,
            token,
            tipo,
            user: {
              id: username!,
              username: username!,
              email: `${username}@velsat.com`,
              name: username!.charAt(0).toUpperCase() + username!.slice(1),
              description: description || undefined,
              codigo: codigo || undefined,
            },
            isAuthenticated: true,
            isLoading: false,
            hasActiveSession: true,
          });
          
          return true;
        } catch (error: any) {
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state: AuthState) => ({
        selectedVehiclePin: state.selectedVehiclePin,
        biometric: state.biometric,
        biometricCredentials: state.biometricCredentials,
        pin: state.pin,
        pinCredentials: state.pinCredentials,
      }),
      version: 1,
      onRehydrateStorage: () => (state: AuthState | undefined) => {
        if (state) {
          state.user = null;
          state.isAuthenticated = false;
          state.isLoading = false;
          state.server = null;
          state.token = null;
          state.tipo = null;
          state.hasActiveSession = false;
        }
      },
    }
  )
);