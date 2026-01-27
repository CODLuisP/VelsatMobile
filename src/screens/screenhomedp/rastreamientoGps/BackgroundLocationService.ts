import BackgroundService from 'react-native-background-actions';
import Geolocation from '@react-native-community/geolocation';
import notifee, {AndroidImportance} from '@notifee/react-native';
import { sendLocationToApi } from '../../../services/ApiService';

class BackgroundLocationService {
  private watchId: number | null = null;
  private previousLocation: {latitude: number; longitude: number} | null = null;
  private currentHeading: number = 0;

  async initialize() {
    await notifee.createChannel({
      id: 'location-tracking',
      name: 'Seguimiento de Ubicación',
      importance: AndroidImportance.LOW,
    });

    console.log('[BackgroundLocationService] Inicializado');
  }

  private calculateHeading(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const lat1Rad = lat1 * Math.PI / 180;
    const lat2Rad = lat2 * Math.PI / 180;

    const y = Math.sin(dLon) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
              Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);

    let heading = Math.atan2(y, x) * 180 / Math.PI;
    heading = (heading + 360) % 360;
    return heading;
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private getCardinalDirection(degrees: number): string {
    if (degrees < 0) return 'N/A';
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  }

  private async handleLocation(position: any) {
    const {latitude, longitude, speed, heading: gpsHeading} = position.coords;
    
    let finalHeading = this.currentHeading;

    // Calcular heading si hay posición anterior
    if (this.previousLocation) {
      const distance = this.calculateDistance(
        this.previousLocation.latitude,
        this.previousLocation.longitude,
        latitude,
        longitude
      );

      if (distance >= 2) {
        if (gpsHeading !== null && gpsHeading !== undefined && gpsHeading >= 0) {
          finalHeading = gpsHeading;
        } else {
          finalHeading = this.calculateHeading(
            this.previousLocation.latitude,
            this.previousLocation.longitude,
            latitude,
            longitude
          );
        }
        this.currentHeading = finalHeading;
      }
    } else {
      // Primera ubicación, inicializar heading si está disponible
      if (gpsHeading !== null && gpsHeading !== undefined && gpsHeading >= 0) {
        finalHeading = gpsHeading;
        this.currentHeading = finalHeading;
      }
    }

    // Actualizar ubicación anterior
    this.previousLocation = {latitude, longitude};

    // **ENVIAR A LA API** 🔥
    await sendLocationToApi({
      lastValidLatitude: latitude,
      lastValidLongitude: longitude,
      lastValidHeading: finalHeading,
      lastValidSpeed: speed || 0,
    });

    // Actualizar notificación con los datos actuales
    await this.updateNotification(latitude, longitude, speed || 0, finalHeading);
  }

  private async updateNotification(
    latitude: number,
    longitude: number,
    speed: number,
    heading: number
  ) {
    const speedKmh = (speed * 3.6).toFixed(1);
    const direction = this.getCardinalDirection(heading);
    const headingDegrees = heading.toFixed(0);

    await notifee.displayNotification({
      id: 'location-updates',
      title: '📍 GPS Activo',
      body: `${speedKmh} km/h | ${headingDegrees}° ${direction}\n📍 ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      android: {
        channelId: 'location-tracking',
        smallIcon: 'ic_launcher',
        color: '#2196F3',
        importance: AndroidImportance.LOW,
        ongoing: true,
        pressAction: {
          id: 'default',
        },
      },
    });
  }

  private veryIntensiveTask = async (taskDataArguments: any) => {
    const {delay} = taskDataArguments;

    await new Promise(async resolve => {
      this.watchId = Geolocation.watchPosition(
        position => {
          this.handleLocation(position);
        },
        error => {
          console.error('[BackgroundLocation] Error:', error);
        },
        {
          enableHighAccuracy: true,
          distanceFilter: 2,
          interval: 1000,
          fastestInterval: 500,
        },
      );

      for (let i = 0; BackgroundService.isRunning(); i++) {
        await new Promise(r => setTimeout(r, delay));
      }
    });
  };

  async start() {
    const options = {
      taskName: 'Rastreo de Ubicación',
      taskTitle: 'Rastreando ubicación GPS',
      taskDesc: 'Ubicación, velocidad y dirección en tiempo real',
      taskIcon: {
        name: 'ic_launcher',
        type: 'mipmap',
      },
      color: '#2196F3',
      linkingURI: 'rastreogps://',
      parameters: {
        delay: 1000,
      },
    };

    try {
      await BackgroundService.start(this.veryIntensiveTask, options);
      console.log('[BackgroundService] Iniciado correctamente');
      return {enabled: true};
    } catch (error) {
      console.error('[BackgroundService] Error al iniciar:', error);
      throw error;
    }
  }

  async stop() {
    try {
      if (this.watchId !== null) {
        Geolocation.clearWatch(this.watchId);
        this.watchId = null;
      }
      
      await notifee.cancelNotification('location-updates');
      
      await BackgroundService.stop();
      console.log('[BackgroundService] Detenido correctamente');
      return {enabled: false};
    } catch (error) {
      console.error('[BackgroundService] Error al detener:', error);
      throw error;
    }
  }

  async getState() {
    return {
      enabled: BackgroundService.isRunning(),
    };
  }

  destroy() {
    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
    }
    BackgroundService.stop();
  }
}

export default new BackgroundLocationService();