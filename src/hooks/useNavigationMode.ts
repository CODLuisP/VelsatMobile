// hooks/useNavigationMode.ts
import { useState, useEffect } from 'react';
import { Platform, Dimensions, NativeModules } from 'react-native';
import { useSafeAreaInsets, EdgeInsets } from 'react-native-safe-area-context';

// Importar el módulo nativo
const { NavigationModeModule } = NativeModules;

// Tipos para el resultado del módulo nativo
interface NavigationModeResult {
  mode: number;
  description: string;
  hasNavigationBar: boolean;
}

interface NavigationInfo {
  mode: string;
  hasNavigationBar: boolean;
  isLoading: boolean;
  error: string | null;
}

// Hook para detectar navegación con módulo nativo
export const useNavigationMode = () => {
  const [navigationInfo, setNavigationInfo] = useState<NavigationInfo>({
    mode: 'Detectando...',
    hasNavigationBar: true,
    isLoading: true,
    error: null,
  });
  
  const insets = useSafeAreaInsets();
  
  useEffect(() => {
    const detectNavigationMode = async () => {
      if (Platform.OS !== 'android') {
        setNavigationInfo({
          mode: 'iOS (Gestos)',
          hasNavigationBar: true,
          isLoading: false,
          error: null,
        });
        return;
      }
      
      try {
        if (!NavigationModeModule) {
          throw new Error('Módulo nativo no disponible');
        }
        
        const result: NavigationModeResult = await NavigationModeModule.getNavigationMode();
        
        let modeText = '';
        switch (result.description) {
          case '3_button_navigation':
            modeText = '3 Botones (Nativo)';
            break;
          case '2_button_navigation':
            modeText = '2 Botones (Nativo)';
            break;
          case 'gesture_navigation':
            modeText = 'Gestos (Nativo)';
            break;
          default:
            modeText = `Desconocido (${result.mode})`;
        }
        
        setNavigationInfo({
          mode: modeText,
          hasNavigationBar: result.hasNavigationBar,
          isLoading: false,
          error: null,
        });
        
      } catch (error) {
        const hasNavBar = insets.bottom > 20;
        const fallbackMode = hasNavBar ? '3 Botones (Fallback)' : 'Gestos (Fallback)';
        
        setNavigationInfo({
          mode: fallbackMode,
          hasNavigationBar: hasNavBar,
          isLoading: false,
          error: 'Usando detección fallback',
        });
      }
    };
    
    detectNavigationMode();
  }, [insets.bottom]);
  
  return navigationInfo;
};

// Función utilitaria para calcular el espacio inferior
export const getBottomSpace = (insets: EdgeInsets, hasNavigationBar: boolean): number => {
  if (Platform.OS === 'android') {
    const screen = Dimensions.get('screen');
    const window = Dimensions.get('window');
    const navBarHeight = screen.height - window.height;

    if (hasNavigationBar) {
      return Math.max(navBarHeight + 30, 50); 
    } else {
      return 20;
    }
  }

  return 0;
};