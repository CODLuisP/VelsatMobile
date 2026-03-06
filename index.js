/**
 * @format
 */
import 'react-native-gesture-handler';
import { AppRegistry, Text, TextInput } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// ⭐ NOTIFICACIONES BACKGROUND
import { registerBackgroundHandler } from './src/utils/notificationUtils';

Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.allowFontScaling = false;

TextInput.defaultProps = TextInput.defaultProps || {};
TextInput.defaultProps.allowFontScaling = false;

// ⭐ DEBE IR ANTES DE AppRegistry
registerBackgroundHandler();

AppRegistry.registerComponent(appName, () => App);