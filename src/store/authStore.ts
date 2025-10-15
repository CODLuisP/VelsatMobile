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
            
            // Forzar persistencia inmediata
            setTimeout(() => {
              const finalState = get();
              if (finalState.biometricCredentials.username) {
                console.log('✅ Credenciales biométricas guardadas y verificadas:', {
                  username: finalState.biometricCredentials.username,
                  tipo: finalState.biometricCredentials.tipo
                });
              } else {
                console.log('❌ Error: Las credenciales no se guardaron correctamente');
              }
            }, 50);
            
          } else {
            console.log('⚠️ No se pudieron guardar credenciales biométricas:', {
              biometricEnabled: newState.biometric.isEnabled,
              hasToken: !!newState.token,
              hasServer: !!newState.server,
              hasTipo: !!newState.tipo
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
              console.log('💾 Guardando credenciales biométricas inmediatamente para:', currentState.user.username, 'tipo:', currentState.tipo);
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

      // Autenticar con biometría
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
            // Restaurar sesión automáticamente CON tipo
            const { username, token, server, tipo } = state.biometricCredentials;
            
            console.log('✅ Autenticación biométrica exitosa, restaurando sesión:', {
              username,
              tipo,
              server
            });
            
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
          
          console.log('❌ Autenticación biométrica cancelada por el usuario');
          return false;
        } catch (error) {
          console.error('❌ Error en autenticación biométrica:', error);
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
              description: state.user?.description || null,
              codigo: state.user?.codigo || null,
            },
          }));
          console.log('✅ Credenciales biométricas guardadas para usuario:', username, 'tipo:', state.tipo);
        } else {
          console.log('⚠️ No se guardaron credenciales biométricas:', {
            biometricEnabled: state.biometric.isEnabled,
            hasTipo: !!state.tipo
          });
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
        return (
          state.biometric.isEnabled &&
          state.biometric.isAvailable &&
          !!state.biometricCredentials.username &&
          !!state.biometricCredentials.token &&
          !!state.biometricCredentials.server &&
          !!state.biometricCredentials.tipo
        );
        
        console.log('🔍 ¿Puede usar login biométrico?:', canUse, {
          isEnabled: state.biometric.isEnabled,
          isAvailable: state.biometric.isAvailable,
          hasCredentials: !!state.biometricCredentials.username,
          hasTipo: !!state.biometricCredentials.tipo
        });
        
        return canUse;
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
      onRehydrateStorage: () => (state: AuthState | undefined) => {
        if (state) {
          console.log('🔄 Store hidratado correctamente:', {
            selectedVehiclePin: state.selectedVehiclePin,
            hasBiometric: !!state.biometric,
            biometricEnabled: state.biometric?.isEnabled,
            biometricType: state.biometric?.type,
            hasCredentials: !!state.biometricCredentials?.username,
            credentialsUsername: state.biometricCredentials?.username,
            credentialsTipo: state.biometricCredentials?.tipo,
            // Estos deberían ser null/false al cargar:
            isAuthenticated: state.isAuthenticated,
            hasToken: !!state.token,
            hasServer: !!state.server,
            hasTipo: !!state.tipo,
            hasUser: !!state.user
          });
        } else {
          console.log('❌ Error en hidratación del store');
        }
      },
    }
  )
);