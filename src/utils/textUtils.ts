import { Platform, Linking, Alert, ActionSheetIOS } from 'react-native';

export const toUpperCaseText = (text: any) => {
  if (!text) return '';
  return text.toUpperCase();
};

export const formatDateTime = (date: Date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `Fecha: ${day}/${month}/${year}  Hora: ${hours}:${minutes}:${seconds}`;
};

export const formatThreeDecimals = (num: any) => {
  const number = Number(num);
  if (Number.isInteger(number)) {
    return number.toString();
  }
  return parseFloat(number.toFixed(1)).toString();
};

// Interfaz para el callback del modal
export interface NavigationOption {
  app: 'google' | 'waze' | 'apple';
  latitude: number;
  longitude: number;
}

// Función que maneja la lógica de navegación
export const handleNavigationApp = (
  app: 'google' | 'waze' | 'apple',
  latitude: number,
  longitude: number,
  onAppNotAvailable?: (appName: string) => void
) => {
  const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`;
  let url = '';
  let appName = '';

  if (Platform.OS === 'android') {
    switch (app) {
      case 'google':
        url = `google.navigation:q=${latitude},${longitude}&mode=d`;
        appName = 'Google Maps';
        break;
      case 'waze':
        url = `waze://?ll=${latitude},${longitude}&navigate=yes`;
        appName = 'Waze';
        break;
    }
  } else if (Platform.OS === 'ios') {
    switch (app) {
      case 'google':
        url = `comgooglemaps://?daddr=${latitude},${longitude}&directionsmode=driving`;
        appName = 'Google Maps';
        break;
      case 'waze':
        url = `waze://?ll=${latitude},${longitude}&navigate=yes`;
        appName = 'Waze';
        break;
      case 'apple':
        url = `maps://?daddr=${latitude},${longitude}&dirflg=d`;
        appName = 'Apple Maps';
        break;
    }
  }

  Linking.canOpenURL(url)
    .then(supported => {
      if (supported) {
        return Linking.openURL(url);
      } else {
        if (onAppNotAvailable) {
          onAppNotAvailable(appName);
        } else {
          // Fallback a alert nativo si no hay callback
          Alert.alert(
            `${appName} no disponible`,
            '¿Deseas abrir en el navegador?',
            [
              { text: 'Cancelar', style: 'cancel' },
              {
                text: 'Abrir en navegador',
                onPress: () => Linking.openURL(webUrl)
              }
            ]
          );
        }
      }
    })
    .catch(() => Linking.openURL(webUrl));
};

// Función principal que retorna los datos necesarios para el modal
export const openGoogleMaps = (latitude: number, longitude: number) => {
  const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`;

  if (Platform.OS === 'web') {
    Linking.openURL(webUrl);
    return null;
  }

  // Retornar la configuración para el modal
  return {
    latitude,
    longitude,
    platform: Platform.OS as 'android' | 'ios',
    webUrl,
  };
};