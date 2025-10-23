import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, StatusBar } from 'react-native';
import Profile from './src/screens/screenhome/Profile';
import ServicesDriver from './src/screens/screenhomedp/ServicesDriver';
import ServicesPassenger from './src/screens/screenhomedp/ServicesPassenger';
import ServicesDetailDriver from './src/screens/screenhomedp/ServicesDetailDriver';
import ServicesDetailPassenger from './src/screens/screenhomedp/ServicesDetailPassenger';
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
import Help from './src/screens/screenhome/help/Help';
import Central from './src/screens/screenhome/help/Central';

import Login from './src/components/login/Login';
import Home from './src/screens/Home';
import HomeDriverPassenger from './src/screens/HomeDriverPassenger';
import { useAuthStore } from './src/store/authStore';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import SystemNavigationBar from 'react-native-system-navigation-bar';

interface Device {
  id: string;
  name: string;
  status: 'Detenido' | 'Movimiento';
  speed: number;
  location: string;
  isOnline: boolean;
}

interface Service {
  codservicio: string;
  fechapasajero: string | null;
  empresa: string;
  numero: string;
  codconductor: string;
  destino: string;
  fechaservicio: string;
  status: string;
  tipo: string;
  grupo: string;
  totalpax: number | null;
  unidad: string;
  codusuario: string;
}

interface ApiService {
  codservicio: string;
  codpedido: string;
  codusuario: string;
  codcliente: string | null;
  unidad: string;
  direccion: string;
  distrito: string;
  wy: string;
  wx: string;
  referencia: string | null;
  fechapasajero: string;
  orden: string;
  empresa: string;
  numero: string;
  codconductor: string;
  destino: string | null;
  fechaservicio: string;
  tipo: string;
  totalpax: string;
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
      speed: number;
      latitude: number;
      longitude: number;
      statusCode: number;
    };
  };
  Devices: undefined;
  DetailDevice: {
    device: Device;
  };
  InfoDevice: {
    deviceName: string;
  };
  Events: {
    deviceName: string;
  };
  MapEvent: {
    notificationData: {
      id: number;
      type: string;
      title: string;
      device: string;
      timestamp: string;
      iconName: string;
      accountID: string;
      deviceID: string;
      unixTimestamp: number;
      statusCode: number;
      latitude: number;
      longitude: number;
      speedKPH: number;
    };
  };
  Reports: undefined;
  GeneralReport: {
    unit: { id: number; plate: string };
    startDate: Date;
    endDate: Date;
  };
  StopReport: {
    unit: { id: number; plate: string };
    startDate: Date;
    endDate: Date;
  };
  SpeedReport: {
    unit: { id: number; plate: string };
    startDate: Date;
    endDate: Date;
    speed: string;
  };
  MileageReport: {
    unit: { id: number; plate: string } | 'all';
    startDate: Date;
    endDate: Date;
  };
  TourReport: {
    unit: { id: number; plate: string };
    startDate: Date;
    endDate: Date;
  };
  Security: undefined;
  Help: undefined;
  Central: undefined;
  ServicesDriver: undefined;
  ServicesPassenger: undefined;
  ServicesDetailDriver: {
    serviceData: Service;
  };
  ServicesDetailPassenger: {
    serviceData: ApiService
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {
  const { isAuthenticated, isLoading, setLoading, tipo } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && isLoading) {
      setLoading(false);
    }
  }, [isAuthenticated, isLoading, setLoading]);

  useEffect(() => {
    StatusBar.setBarStyle('light-content', true);

    const setNavigationBarColor = () => {
      try {
        SystemNavigationBar.setNavigationColor('#00296b');
      } catch (error) {
        // Error handling silently
      }
    };

    setNavigationBarColor();

    const timer = setTimeout(setNavigationBarColor, 100);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (

    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: '#00296b' }}>
        <StatusBar barStyle="light-content" backgroundColor="#00296b" />
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#00296b' },
              animation: 'slide_from_right',
            }}
          >
            {isAuthenticated ? (
              <>
                <Stack.Screen
                  name="Home"
                  component={
                    tipo === 'n'
                      ? Home
                      : tipo === 'c' || tipo === 'p'
                      ? HomeDriverPassenger
                      : Home
                  }
                />
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
                <Stack.Screen name="Help" component={Help} />
                <Stack.Screen name="Central" component={Central} />
                <Stack.Screen
                  name="ServicesDriver"
                  component={ServicesDriver}
                />
                <Stack.Screen
                  name="ServicesPassenger"
                  component={ServicesPassenger}
                />
                <Stack.Screen
                  name="ServicesDetailDriver"
                  component={ServicesDetailDriver}
                />
                <Stack.Screen
                  name="ServicesDetailPassenger"
                  component={ServicesDetailPassenger}
                />
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