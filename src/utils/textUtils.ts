import { Platform, Linking } from 'react-native';

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
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};

export const formatThreeDecimals = (num: any) => {
  const number = Number(num);
  if (Number.isInteger(number)) {
    return number.toString();
  }
  return parseFloat(number.toFixed(1)).toString();
};

export const openGoogleMaps = (latitude: number, longitude: number) => {
  const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`;

  const nativeUrl = Platform.select({
    ios: `maps://app?daddr=${latitude},${longitude}&dirflg=d`,
    android: `google.navigation:q=${latitude},${longitude}&mode=d`,
    default: webUrl,
  });

  if (nativeUrl) {
    Linking.canOpenURL(nativeUrl)
      .then(supported => {
        if (supported) {
          return Linking.openURL(nativeUrl);
        } else {
          return Linking.openURL(webUrl);
        }
      })
      .catch(err => {
        Linking.openURL(webUrl);
      });
  } else {
    Linking.openURL(webUrl);
  }
};

