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
  
  // Estados biométricos
  biometric: BiometricConfig;
  biometricCredentials: {
    username: string | null;
    token: string | null;
    server: string | null;
    tipo: string | null; // ⭐ AGREGADO
  };

  // Actions existentes
  setUser: (user: User) => void;
  setServer: (server: string) => void;
  setToken: (token: string) => void;
  setTipo: (tipo: string) => void;
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
        tipo: null, // ⭐ AGREGADO
      },

      // Actions existentes
      setUser: (user: User) => {
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
        
        // Usar setTimeout para asegurar que el estado se actualice primero
        setTimeout(() => {
          const newState = get();
          // Solo si la biometría está habilitada Y tenemos token, servidor Y tipo
          if (newState.biometric.isEnabled && newState.token && newState.server && newState.tipo) {
            console.log('🔐 Guardando credenciales biométricas para:', user.username);
            
            set((currentState) => ({
              ...currentState,
              biometricCredentials: {
                username: user.username,
                token: newState.token!,
                server: newState.server!,
                tipo: newState.tipo!, // ⭐ AGREGADO
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
            console.log('❌ No se pudieron guardar credenciales biométricas:', {
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
        
        console.log('Logout completed, biometric credentials preserved');
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      // ACTIONS BIOMÉTRICAS

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
            
            // Guardar credenciales inmediatamente si ya hay sesión activa
            const currentState = get();
            if (currentState.user && currentState.token && currentState.server && currentState.tipo) {
              console.log('💾 Guardando credenciales biométricas inmediatamente para:', currentState.user.username, 'tipo:', currentState.tipo);
              set((state) => ({
                biometricCredentials: {
                  username: currentState.user!.username,
                  token: currentState.token,
                  server: currentState.server,
                  tipo: currentState.tipo, // ⭐ AGREGADO
                },
              }));
            }
            
            console.log('✅ Biometric enabled successfully');
            return true;
          }
          
          return false;
        } catch (error) {
          console.error('❌ Error enabling biometric:', error);
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

        if (!state.biometricCredentials.username || 
            !state.biometricCredentials.token || 
            !state.biometricCredentials.server ||
            !state.biometricCredentials.tipo) { // ⭐ AGREGADO
          throw new Error('No credentials saved for biometric login');
        }

        try {
          const rnBiometrics = new ReactNativeBiometrics();
          const { success } = await rnBiometrics.simplePrompt({
            promptMessage: `Usa tu ${get().getBiometricDisplayName()} para acceder`,
            cancelButtonText: 'Cancelar'
          });

          if (success) {
            // Restaurar sesión automáticamente CON tipo
            const { username, token, server, tipo } = state.biometricCredentials; // ⭐ AGREGADO tipo
            
            set({
              server,
              token,
              tipo, // ⭐ AGREGADO - ESTO ES CRÍTICO
              user: {
                id: username!,
                username: username!,
                email: `${username}@velsat.com`,
                name: username!.charAt(0).toUpperCase() + username!.slice(1),
              },
              isAuthenticated: true,
              isLoading: false,
            });
            
            console.log('✅ Autenticación biométrica exitosa:', {
              username,
              tipo,
              server
            });
            return true;
          }
          
          return false;
        } catch (error) {
          console.error('❌ Biometric authentication error:', error);
          return false;
        }
      },

      // Guardar credenciales para login biométrico
      saveBiometricCredentials: (username: string, token: string, server: string) => {
        const state = get();
        
        // Solo guardar si la biometría está habilitada Y hay tipo
        if (state.biometric.isEnabled && state.tipo) {
          set((state) => ({
            biometricCredentials: {
              username,
              token,
              server,
              tipo: state.tipo, // ⭐ AGREGADO
            },
          }));
          console.log('✅ Biometric credentials saved for user:', username, 'tipo:', state.tipo);
        } else {
          console.log('⚠️ No se guardaron credenciales biométricas:', {
            biometricEnabled: state.biometric.isEnabled,
            hasTipo: !!state.tipo
          });
        }
      },

      // Limpiar credenciales biométricas
      clearBiometricCredentials: () => {
        set((state) => ({
          biometricCredentials: {
            username: null,
            token: null,
            server: null,
            tipo: null, // ⭐ AGREGADO
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
          !!state.biometricCredentials.server &&
          !!state.biometricCredentials.tipo // ⭐ AGREGADO
        );
        
        console.log('Can use biometric login:', canUse, {
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
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        server: state.server,
        token: state.token,
        tipo: state.tipo,
        biometric: state.biometric,
        biometricCredentials: state.biometricCredentials,
      }),
      version: 1,
      onRehydrateStorage: () => (state: AuthState | undefined) => {
        if (state) {
          console.log('🔄 Store hidratado correctamente:', {
            hasBiometric: !!state.biometric,
            biometricEnabled: state.biometric?.isEnabled,
            hasCredentials: !!state.biometricCredentials?.username,
            credentialsUsername: state.biometricCredentials?.username,
            credentialsTipo: state.biometricCredentials?.tipo, // ⭐ AGREGADO
            currentTipo: state.tipo
          });
        } else {
          console.log('❌ Error en hidratación del store');
        }
      },
    }
  )
);