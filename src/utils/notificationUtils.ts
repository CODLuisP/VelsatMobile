import messaging, {
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import {Platform, PermissionsAndroid, Alert} from 'react-native';
import notifee from '@notifee/react-native';
import axios from 'axios';

// ─── TIPOS ────────────────────────────────────────────────────────────────────

export interface NotificationPayload {
  title?: string;
  body?: string;
  data?: Record<string, string>;
}

// ─── 1. PEDIR PERMISOS ────────────────────────────────────────────────────────

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'ios') {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
      Alert.alert(
        'Notificaciones desactivadas',
        'Activa las notificaciones en Configuración para recibir alertas.',
      );
    }
    return enabled;
  }

  if (Platform.OS === 'android') {
    if ((Platform.Version as number) >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  }

  return false;
}

// ─── 2. GUARDAR TOKEN EN EL SERVIDOR ──────────────────────────────────────────

async function saveTokenToServer(
  username?: string,
  token?: string,
): Promise<void> {
  if (!username || !token) return;

  try {
    const response = await axios.post(
      'https://sub.velsat.pe:2087/api/Aplicativo/save-token',
      {
        userId: username,
        fcmToken: token,
        platform: Platform.OS,
      },
    );
    console.log('[FCM] Token guardado:', response.data);
  } catch (error: any) {
    // Ver exactamente qué devuelve el servidor
    console.error('[FCM] Status:', error?.response?.status);
     console.error('[FCM] Respuesta servidor:', JSON.stringify(error?.response?.data));
    console.error('[FCM] Body enviado:', { userId: username, fcmToken: token, platform: Platform.OS });
  }
}

// ─── 3. OBTENER TOKEN FCM ─────────────────────────────────────────────────────

export async function getFCMToken(username?: string): Promise<string | null> {
  try {
    await messaging().registerDeviceForRemoteMessages();
    const token = await messaging().getToken();
    console.log('[FCM] Token:', token);

    // Enviar token al backend
    await saveTokenToServer(username, token);

    await messaging().subscribeToTopic('todos');
    console.log('[FCM] Suscrito al topic: todos');

    return token;
  } catch (error) {
    console.error('[FCM] Error obteniendo token:', error);
    return null;
  }
}

// ─── 4. LISTENERS ─────────────────────────────────────────────────────────────

export function setupNotificationListeners(): () => void {
  // App ABIERTA (foreground)
  const unsubscribeForeground = messaging().onMessage(
    async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
      console.log('[FCM] Foreground:', remoteMessage);

      const channelId = await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
      });

      await notifee.displayNotification({
        title: remoteMessage.notification?.title,
        body: remoteMessage.notification?.body,
        android: {
          channelId,
          smallIcon: 'ic_notification',
          largeIcon: 'ic_launcher',
          pressAction: {id: 'default'},
        },
      });
    },
  );

  // App en BACKGROUND — usuario toca la notificación
  messaging().onNotificationOpenedApp(
    (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
      console.log('[FCM] Abierta desde background:', remoteMessage);
      // TODO: navegar a pantalla según remoteMessage.data
    },
  );

  // App CERRADA — usuario toca la notificación
  messaging()
    .getInitialNotification()
    .then((remoteMessage: FirebaseMessagingTypes.RemoteMessage | null) => {
      if (remoteMessage) {
        console.log('[FCM] Abierta desde cerrada:', remoteMessage);
        // TODO: navegar a pantalla según remoteMessage.data
      }
    });

  // Retorna función para desuscribirse (solo foreground necesita cleanup)
  return unsubscribeForeground;
}

// ─── 5. HANDLER PARA APP CERRADA (se registra fuera del componente) ───────────
// Esta función debe llamarse en index.js, ANTES de registrar el componente App

export function registerBackgroundHandler(): void {
  messaging().setBackgroundMessageHandler(
    async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
      console.log('[FCM] Background/Killed handler:', remoteMessage);
      // FCM muestra la notificación automáticamente,
      // aquí solo procesas datos si necesitas (ej: guardar en AsyncStorage)
    },
  );
}