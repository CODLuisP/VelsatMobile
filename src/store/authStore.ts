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
  codigo?: string; // 🆕 Agregado
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
    codigo: string | null; // 🆕 Agregado
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
        codigo: null, // 🆕 Agregado
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
            console.log('🔐 Guardando credenciales biométricas para:', user.username);
            
            set((currentState) => ({
              ...currentState,
              biometricCredentials: {
                username: user.username,
                token: newState.token!,
                server: newState.server!,
                tipo: newState.tipo!,
                description: user.description || null,
                codigo: user.codigo || null, // 🆕 Agregado
              },
            }));
            
            setTimeout(() => {
              const finalState = get();
              if (finalState.biometricCredentials.username) {
                console.log('✅ Credenciales biométricas guardadas:', {
                  username: finalState.biometricCredentials.username,
                  tipo: finalState.biometricCredentials.tipo,
                  description: finalState.biometricCredentials.description,
                  codigo: finalState.biometricCredentials.codigo, // 🆕 Agregado
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
        console.log('🌐 Server establecido:', server);
      },

      setToken: (token: string) => {
        set({ token });
        console.log('🔑 Token establecido');
      },

      setTipo: (tipo: string) => {
        set({ tipo });
        console.log('👤 Tipo establecido:', tipo);
      },

      setSelectedVehiclePin: (pin: 's' | 'p' | 'c') => {
        set({ selectedVehiclePin: pin });
        console.log('📍 Pin de vehículo actualizado:', pin);
      },

      logout: async () => {
        console.log('🚪 Iniciando logout...');
        
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
          console.log('🧹 Credenciales biométricas limpiadas (biometría deshabilitada)');
        } else {
          console.log('💾 Credenciales biométricas preservadas (biometría habilitada)');
        }
        
        console.log('✅ Logout completado');
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
          
          console.log('✅ Disponibilidad biométrica verificada:', { available, biometryType });
        } catch (error) {
          console.error('❌ Error verificando disponibilidad biométrica:', error);
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
              console.log('💾 Guardando credenciales biométricas inmediatamente para:', currentState.user.username);
              set((state) => ({
                biometricCredentials: {
                  username: currentState.user!.username,
                  token: currentState.token,
                  server: currentState.server,
                  tipo: currentState.tipo,
                  description: currentState.user!.description || null,
                  codigo: currentState.user!.codigo || null, // 🆕 Agregado
                },
              }));
            }
            
            console.log('✅ Biometría habilitada exitosamente');
            return true;
          }
          
          return false;
        } catch (error) {
          console.error('❌ Error habilitando biometría:', error);
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
        console.log('✅ Biometría deshabilitada');
      },

      authenticateWithBiometric: async (): Promise<boolean> => {
        const state = get();
        
        console.log('🔐 Intentando autenticación biométrica...');
        
        if (!state.biometric.isEnabled || !state.biometric.isAvailable) {
          console.log('❌ Biometría no disponible o no habilitada');
          throw new Error('Biometría no disponible o no habilitada');
        }

        if (!state.biometricCredentials.username || 
            !state.biometricCredentials.token || 
            !state.biometricCredentials.server ||
            !state.biometricCredentials.tipo) {
          console.log('❌ No hay credenciales guardadas para login biométrico');
          throw new Error('No hay credenciales guardadas para login biométrico');
        }

        try {
          const rnBiometrics = new ReactNativeBiometrics();
          const { success } = await rnBiometrics.simplePrompt({
            promptMessage: `Usa tu ${get().getBiometricDisplayName()} para acceder`,
            cancelButtonText: 'Cancelar'
          });

          if (success) {
            // 🆕 Incluir codigo al restaurar sesión
            const { username, token, server, tipo, description, codigo } = state.biometricCredentials;
            
            console.log('✅ Autenticación biométrica exitosa, restaurando sesión:', {
              username,
              tipo,
              server,
              description,
              codigo, // 🆕 Agregado
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
                codigo: codigo || undefined, // 🆕 Agregado
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
              codigo: state.user?.codigo || null, // 🆕 Agregado
            },
          }));
          console.log('✅ Credenciales biométricas guardadas para usuario:', username, 'codigo:', state.user?.codigo);
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
            codigo: null, // 🆕 Agregado
          },
        }));
        console.log('✅ Credenciales biométricas limpiadas');
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
        
        console.log('🔍 ¿Puede usar login biométrico?:', canUse, {
          isEnabled: state.biometric.isEnabled,
          isAvailable: state.biometric.isAvailable,
          hasCredentials: !!state.biometricCredentials.username,
          hasTipo: !!state.biometricCredentials.tipo,
          hasDescription: !!state.biometricCredentials.description,
          hasCodigo: !!state.biometricCredentials.codigo, // 🆕 Agregado
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
          state.user = null;
          state.isAuthenticated = false;
          state.isLoading = false;
          state.server = null;
          state.token = null;
          state.tipo = null;
          state.hasActiveSession = false;
          
          console.log('🔄 Store hidratado correctamente:', {
            selectedVehiclePin: state.selectedVehiclePin,
            hasBiometric: !!state.biometric,
            biometricEnabled: state.biometric?.isEnabled,
            biometricType: state.biometric?.type,
            hasCredentials: !!state.biometricCredentials?.username,
            credentialsUsername: state.biometricCredentials?.username,
            credentialsTipo: state.biometricCredentials?.tipo,
            credentialsDescription: state.biometricCredentials?.description,
            credentialsCodigo: state.biometricCredentials?.codigo, // 🆕 Agregado
            hasActiveSession: state.hasActiveSession,
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