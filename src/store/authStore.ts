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
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
        
        // CORRECCIÓN: Usar setTimeout para asegurar que el estado se actualice primero
        setTimeout(() => {
          const newState = get();
          // Solo si la biometría está habilitada Y tenemos token y servidor
          if (newState.biometric.isEnabled && newState.token && newState.server) {
            console.log('🔐 Guardando credenciales biométricas para:', user.username);
            
            // CORRECCIÓN CRÍTICA: Usar set con función para asegurar la actualización
            set((currentState) => ({
              ...currentState,
              biometricCredentials: {
                username: user.username,
                token: newState.token!,
                server: newState.server!,
              },
            }));
            
            // NUEVO: Forzar persistencia inmediata
            setTimeout(() => {
              const finalState = get();
              if (finalState.biometricCredentials.username) {
                console.log('✅ Credenciales biométricas guardadas y verificadas');
              } else {
                console.log('❌ Error: Las credenciales no se guardaron correctamente');
              }
            }, 50);
            
          } else {
            console.log('❌ No se pudieron guardar credenciales biométricas:', {
              biometricEnabled: newState.biometric.isEnabled,
              hasToken: !!newState.token,
              hasServer: !!newState.server
            });
          }
        }, 100);
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
  
  // ✅ CORRECCIÓN: NO limpiar las credenciales biométricas en logout normal
  // Solo limpiarlas si la biometría está deshabilitada
  const currentState = get();
  if (!currentState.biometric.isEnabled) {
    get().clearBiometricCredentials();
  }
  
  console.log('Logout completed, biometric credentials preserved');
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
            
            // NUEVO: Guardar credenciales inmediatamente si ya hay sesión activa
            const currentState = get();
            if (currentState.user && currentState.token && currentState.server) {
              console.log('Guardando credenciales biométricas inmediatamente para:', currentState.user.username);
              set((state) => ({
                biometricCredentials: {
                  username: currentState.user!.username,
                  token: currentState.token,
                  server: currentState.server,
                },
              }));
            }
            
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
          console.log('Biometric credentials saved for user:', username);
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
        const canUse = (
          state.biometric.isEnabled &&
          state.biometric.isAvailable &&
          !!state.biometricCredentials.username &&
          !!state.biometricCredentials.token &&
          !!state.biometricCredentials.server
        );
        
        console.log('Can use biometric login:', canUse, {
          isEnabled: state.biometric.isEnabled,
          isAvailable: state.biometric.isAvailable,
          hasCredentials: !!state.biometricCredentials.username
        });
        
        return canUse;
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // CORRECCIÓN CRÍTICA: Configuración mejorada de persistencia
      partialize: (state: AuthState) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        server: state.server,
        token: state.token,
        biometric: state.biometric,
        biometricCredentials: state.biometricCredentials,
      }),
      // NUEVO: Configuración adicional para asegurar persistencia
      version: 1,
      // NUEVO: Función para manejar la hidratación
      onRehydrateStorage: () => (state: AuthState | undefined) => {
        if (state) {
          console.log('🔄 Store hidratado correctamente:', {
            hasBiometric: !!state.biometric,
            biometricEnabled: state.biometric?.isEnabled,
            hasCredentials: !!state.biometricCredentials?.username,
            credentialsUsername: state.biometricCredentials?.username,
          });
        } else {
          console.log('❌ Error en hidratación del store');
        }
      },
    }
  )
);