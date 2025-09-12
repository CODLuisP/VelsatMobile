// App.tsx
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, StatusBar } from 'react-native';
import Profile from './src/screens/screenhome/Profile';
import Setting from './src/screens/screenhome/Setting'; 

// Importar pantallas
import Login from './src/components/login/Login';
import Home from './src/screens/Home';
import SplashScreen from './src/components/SplashScreen';

import { useAuthStore } from './src/store/authStore';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Profile: undefined;
  Setting: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {
  const { isAuthenticated, isLoading, setLoading } = useAuthStore();
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  useEffect(() => {
    // Configurar StatusBar desde el inicio
    StatusBar.setBarStyle('light-content', true);
    
    // Simula carga de sesión
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [setLoading]);

  // 1) Mostrar tu SplashScreen animado INMEDIATAMENTE
  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  // 2) Pantalla de carga mientras se verifica sesión
  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#1e3a8a',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  // 3) Navegación normal
  return (
    <View style={{ flex: 1, backgroundColor: '#1e3a8a' }}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#1e3a8a' },
            animation: 'slide_from_right',
          }}
        >
          {isAuthenticated ? (
            <>
              <Stack.Screen name="Home" component={Home} />
              <Stack.Screen name="Profile" component={Profile} />
              <Stack.Screen name="Setting" component={Setting} />
            </>
          ) : (
            <Stack.Screen name="Login" component={Login} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
};

export default App;