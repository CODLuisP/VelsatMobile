// App.tsx
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, StatusBar } from 'react-native';
import Profile from './src/screens/screenhome/Profile';
import Setting from './src/screens/screenhome/Setting';
import Pin from './src/screens/screenhome/Pin';
import Notifications from './src/screens/screenhome/Notifications';
import MapAlert from './src/screens/screenhome/MapAlert';
import Devices from './src/screens/screenhome/devices/Devices';
import DetailDevice from './src/screens/screenhome/devices/DetailDevice';
import InfoDevice from './src/screens/screenhome/devices/InfoDevice';
import Events from './src/screens/screenhome/devices/Events';
import MapEvent from './src/screens/screenhome/devices/MapEvent';
import Reports from './src/screens/screenhome/reports/Reports';
import GeneralReport from './src/screens/screenhome/reports/GeneralReport';
import StopReport from './src/screens/screenhome/reports/StopReport';
import SpeedReport from './src/screens/screenhome/reports/SpeedReport';
import MileageReport from './src/screens/screenhome/reports/MileageReport';
import TourReport from './src/screens/screenhome/reports/TourReport';
import Security from './src/screens/screenhome/security/Security';

// Importar pantallas
import Login from './src/components/login/Login';
import Home from './src/screens/Home';

import { useAuthStore } from './src/store/authStore';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// NUEVA IMPORTACIÓN - SystemNavigationBar
import SystemNavigationBar from 'react-native-system-navigation-bar';

// Interfaz para el dispositivo
interface Device {
  id: string;
  name: string;
  status: 'Detenido' | 'Movimiento';
  speed: number;
  location: string;
  isOnline: boolean;
}

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Profile: undefined;
  Setting: undefined;
  Pin: undefined;
  Notifications: undefined;
  MapAlert: {
    notificationData: {
      id: number;
      type: string;
      title: string;
      device: string;
      timestamp: string;
      iconName: string;
    };
  };
  Devices: undefined;
  DetailDevice: {
    device: Device;
  };

  InfoDevice: {
    deviceName: string;
  };
  Events: undefined;
  MapEvent: {
    notificationData: {
      id: number;
      type: string;
      title: string;
      device: string;
      timestamp: string;
      iconName: string;
    };

  };
  Reports: undefined;
  GeneralReport: undefined;
  StopReport: undefined;
  SpeedReport: undefined;
  MileageReport: undefined;
  TourReport: undefined;
  Security: undefined;

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
    StatusBar.setBarStyle('dark-content', true);

    // NUEVA IMPLEMENTACIÓN - Configurar Navigation Bar con SystemNavigationBar
    const setNavigationBarColor = () => {
      try {
        // setNavigationColor(color, style, animated)
        // style: 'dark' para iconos oscuros, 'light' para iconos claros
SystemNavigationBar.setNavigationColor('#1e3a8a');        console.log('Navigation bar color set to #1e3a8a');
      } catch (error) {
        console.log('Error setting navigation bar color:', error);
      }
    };

    // Aplicar inmediatamente
    setNavigationBarColor();
    
    // Reintento después de un pequeño delay para asegurar que se aplique
    const timer = setTimeout(setNavigationBarColor, 100);

    return () => {
      clearTimeout(timer);
    };
  }, []);

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
    <SafeAreaProvider>
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
                <Stack.Screen name="Pin" component={Pin} />
                <Stack.Screen name="Notifications" component={Notifications} />
                <Stack.Screen name="MapAlert" component={MapAlert} />
                <Stack.Screen name="Devices" component={Devices} />
                <Stack.Screen name="DetailDevice" component={DetailDevice} />
                <Stack.Screen name="InfoDevice" component={InfoDevice} />
                <Stack.Screen name="Events" component={Events} />
                <Stack.Screen name="MapEvent" component={MapEvent} />
                <Stack.Screen name="Reports" component={Reports} />
                <Stack.Screen name="GeneralReport" component={GeneralReport} />
                <Stack.Screen name="StopReport" component={StopReport} />
                <Stack.Screen name="SpeedReport" component={SpeedReport} />
                <Stack.Screen name="MileageReport" component={MileageReport} />
                <Stack.Screen name="TourReport" component={TourReport} />
                <Stack.Screen name="Security" component={Security} />

              </>
            ) : (
              <Stack.Screen name="Login" component={Login} />
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </View>
    </SafeAreaProvider>
  );
};

export default App;