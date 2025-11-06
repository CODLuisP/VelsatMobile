import React from 'react';
import { Text as RNText, TextInput as RNTextInput, TextProps, TextInputProps } from 'react-native';

// Text personalizado
export const Text: React.FC<TextProps> = (props) => {
  return <RNText {...props} allowFontScaling={false} />;
};

// TextInput personalizado
export const TextInput: React.FC<TextInputProps> = (props) => {
  return <RNTextInput {...props} allowFontScaling={false} />;
};