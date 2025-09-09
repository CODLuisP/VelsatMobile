// App.tsx
import React from 'react';
import { View } from 'react-native';
import Login from './src/components/login/Login';

const App = () => {
  return (
    <View style={{ flex: 1 }}>
      <Login />
    </View>
  );
};

export default App;