/**
 * @format
 */
import 'react-native-gesture-handler';
import { AppRegistry, Text, TextInput } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// 👇 AGREGA ESTAS LÍNEAS AQUÍ
Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.allowFontScaling = false;

TextInput.defaultProps = TextInput.defaultProps || {};
TextInput.defaultProps.allowFontScaling = false;
// 👆 FIN DE LAS LÍNEAS

AppRegistry.registerComponent(appName, () => App);