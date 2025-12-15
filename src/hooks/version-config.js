// version-config.js
import { Platform } from 'react-native';
import VersionCheck from 'react-native-version-check';

// Configurar App ID de iOS
const IOS_APP_ID = '6755132444';

if (Platform.OS === 'ios') {
  VersionCheck.setAppID(IOS_APP_ID);
}

export default VersionCheck;