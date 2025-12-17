// hooks/version-config.js
import { Platform } from 'react-native';
import VersionCheck from 'react-native-version-check';
import { Alert, Linking } from 'react-native';

const IOS_APP_ID = '6755132444';
const FALLBACK_VERSION = '2.2.9';

export const checkForUpdates = async () => {
  try {
    let currentVersion;
    try {
      currentVersion = VersionCheck.getCurrentVersion();
    } catch (error) {
      currentVersion = null;
    }
    
    if (!currentVersion) {
      currentVersion = FALLBACK_VERSION;
    }

    let latestVersion;
    let needsUpdate = false;

    try {
      latestVersion = await VersionCheck.getLatestVersion({
        provider: Platform.OS === 'ios' ? 'appStore' : 'playStore',
        ...(Platform.OS === 'ios' && { appID: IOS_APP_ID }),
      });
      
      // 🔍 LOGS DETALLADOS PARA DEBUG
      console.log('===== DEBUG VERSIONES =====');
      console.log('currentVersion:', currentVersion);
      console.log('latestVersion:', latestVersion);
      console.log('currentVersion type:', typeof currentVersion);
      console.log('latestVersion type:', typeof latestVersion);
      console.log('Son iguales?:', currentVersion === latestVersion);
      console.log('Comparación con trim:', currentVersion.trim() === latestVersion.trim());
      console.log('===========================');
      
      // Limpiar espacios en blanco y comparar
      needsUpdate = currentVersion.trim() !== latestVersion.trim();
      
    } catch (error) {
      console.log('❌ Error obteniendo versión de la tienda:', error);
      
      // Si hay error, NO forzar actualización
      needsUpdate = false;
      latestVersion = currentVersion;
    }
    
    console.log('✅ Versión actual:', currentVersion);
    console.log('✅ Última versión:', latestVersion);
    console.log('✅ Necesita actualizar:', needsUpdate);
    
    return {
      needsUpdate,
      currentVersion,
      latestVersion,
    };
  } catch (error) {
    console.error('❌ Error general verificando versión:', error);
    
    return {
      needsUpdate: false,
      currentVersion: FALLBACK_VERSION,
      latestVersion: FALLBACK_VERSION,
      error: error.message,
    };
  }
};

export const openStore = async () => {
  try {
    const isSimulator = await VersionCheck.getCountry().catch(() => null) === null;
    
    if (isSimulator) {
      Alert.alert(
        'Simulador',
        'En el simulador no se puede abrir la App Store. En un dispositivo real, esto abrirá la App Store automáticamente.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      await VersionCheck.openStore();
    } catch (error) {
      const storeUrl = Platform.OS === 'ios' 
        ? `https://apps.apple.com/app/id${IOS_APP_ID}`
        : `https://play.google.com/store/apps/details?id=com.velsat.mobile`;
      
      const canOpen = await Linking.canOpenURL(storeUrl);
      if (canOpen) {
        await Linking.openURL(storeUrl);
      } else {
        throw new Error('No se puede abrir la tienda');
      }
    }
  } catch (error) {
    console.error('Error abriendo tienda:', error);
    Alert.alert(
      'Error',
      'No se pudo abrir la tienda. Por favor, búscala manualmente.',
      [{ text: 'OK' }]
    );
  }
};

export default VersionCheck;
