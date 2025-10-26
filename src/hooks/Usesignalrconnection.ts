import { useEffect, useState } from 'react';
import * as signalR from '@microsoft/signalr';

// Interfaces
export interface VehicleData {
  deviceId: string;
  lastGPSTimestamp: number;
  lastValidLatitude: number;
  lastValidLongitude: number;
  lastValidHeading: number;
  lastValidSpeed: number;
  lastOdometerKM: number;
  odometerini: number | null;
  kmini: number | null;
  descripcion: string | null;
  direccion: string;
  codgeoact: string | null;
  rutaact: string | null;
  servicio: string | null;
  datosGeocercausu: any | null;
}

interface SignalRData {
  fechaActual: string;
  vehiculo: VehicleData;
}

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

interface UseSignalRConnectionProps {
  server: string;
  username: string | undefined;
  deviceName: string;
}

interface UseSignalRConnectionReturn {
  vehicleData: VehicleData | null;
  connectionStatus: ConnectionStatus;
  connection: signalR.HubConnection | null;
}

/**
 * Hook personalizado para manejar la conexión SignalR y recibir datos del vehículo
 */
export const useSignalRConnection = ({
  server,
  username,
  deviceName,
}: UseSignalRConnectionProps): UseSignalRConnectionReturn => {
  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null);
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');

  useEffect(() => {
    // Validar que tenemos los datos necesarios
    if (!username || !deviceName) {
      console.error('Faltan datos para conectar SignalR');
      setConnectionStatus('error');
      return;
    }

    // Construir la URL del hub
    const hubUrl = `${server}/dataHubVehicle/${username}/${deviceName}`;
    console.log('Conectando a:', hubUrl);
    setConnectionStatus('connecting');

    // Crear la conexión SignalR
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        skipNegotiation: false,
        transport:
          signalR.HttpTransportType.WebSockets |
          signalR.HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: retryContext => {
          // Sin delay en el primer reintento
          if (retryContext.previousRetryCount === 0) {
            return 0;
          }
          // 2 segundos para los primeros 3 reintentos
          if (retryContext.previousRetryCount < 3) {
            return 2000;
          }
          // 10 segundos para los siguientes 3 reintentos
          if (retryContext.previousRetryCount < 6) {
            return 10000;
          }
          // 30 segundos para el resto
          return 30000;
        },
      })
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // Evento principal: Actualizar datos del vehículo
    newConnection.on('ActualizarDatosVehiculo', (datos: SignalRData) => {
      console.log('📡 Datos recibidos:', JSON.stringify(datos, null, 2));
      if (datos.vehiculo) {
        setVehicleData(datos.vehiculo);
        setConnectionStatus('connected');
      }
    });

    // Evento: Conexión exitosa
    newConnection.on('ConectadoExitosamente', data => {
      console.log('✅ Conectado exitosamente:', data);
      setConnectionStatus('connected');
    });

    // Evento: Error
    newConnection.on('Error', msg => {
      console.error('❌ Error desde SignalR:', msg);
      setConnectionStatus('error');
    });

    // Manejador: Reconectando
    newConnection.onreconnecting(error => {
      console.log('🔄 Reconectando...', error);
      setConnectionStatus('connecting');
    });

    // Manejador: Reconectado
    newConnection.onreconnected(connectionId => {
      console.log('✅ Reconectado con ID:', connectionId);
      setConnectionStatus('connected');
    });

    // Manejador: Conexión cerrada
    newConnection.onclose(error => {
      console.log('🔌 Conexión cerrada', error);
      setConnectionStatus('disconnected');
    });

    // Iniciar la conexión
    newConnection
      .start()
      .then(() => {
        console.log('🚀 SignalR iniciado correctamente');
        setConnectionStatus('connected');
      })
      .catch(err => {
        console.error('💥 Error al iniciar SignalR:', err);
        setConnectionStatus('error');
      });

    setConnection(newConnection);

    // Cleanup: Cerrar conexión al desmontar
    return () => {
      if (
        newConnection &&
        newConnection.state === signalR.HubConnectionState.Connected
      ) {
        newConnection.stop().then(() => {
          console.log('🔌 SignalR desconectado correctamente');
        });
      }
    };
  }, [deviceName, username, server]);

  return {
    vehicleData,
    connectionStatus,
    connection,
  };
};