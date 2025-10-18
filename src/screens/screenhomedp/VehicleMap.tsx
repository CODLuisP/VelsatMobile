import React, { useEffect, useRef, useState } from 'react';
import { View, Image, Platform, Animated, ActivityIndicator, Text } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, Circle } from 'react-native-maps';
import { WebView } from 'react-native-webview';
import * as signalR from '@microsoft/signalr';

interface VehicleMapProps {
  username: string;
  placa: string;
  vehicleName?: string;
}

interface VehicleData {
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

const VehicleMap: React.FC<VehicleMapProps> = ({
  username,
  placa,
  vehicleName = 'No asignada',
}) => {
  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null);
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting');
  const [isWebViewReady, setIsWebViewReady] = useState(false);
  const webViewRef = useRef<WebView>(null);

  // Estado para el radar en iOS
  const [radarPulse, setRadarPulse] = useState({
    wave1: 0,
    wave2: 0.25,
    wave3: 0.5,
    wave4: 0.75,
  });

  // Conexión SignalR
  useEffect(() => {
    if (!username || !placa) {
      console.error('Faltan datos para conectar SignalR');
      setConnectionStatus('error');
      return;
    }

    const hubUrl = `https://velsat.pe:2087/dataHubVehicle/${username}/${placa}`;
    console.log('Conectando a:', hubUrl);
    setConnectionStatus('connecting');

    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        skipNegotiation: false,
        transport:
          signalR.HttpTransportType.WebSockets |
          signalR.HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: retryContext => {
          if (retryContext.previousRetryCount === 0) return 0;
          if (retryContext.previousRetryCount < 3) return 2000;
          if (retryContext.previousRetryCount < 6) return 10000;
          return 30000;
        },
      })
      .configureLogging(signalR.LogLevel.Information)
      .build();

    newConnection.on('ActualizarDatosVehiculo', (datos: SignalRData) => {
      console.log('📡 Datos recibidos:', JSON.stringify(datos, null, 2));
      if (datos.vehiculo) {
        setVehicleData(datos.vehiculo);
        setConnectionStatus('connected');
      }
    });

    newConnection.on('ConectadoExitosamente', data => {
      console.log('Conectado exitosamente:', data);
      setConnectionStatus('connected');
    });

    newConnection.on('Error', msg => {
      console.error('Error desde SignalR:', msg);
      setConnectionStatus('error');
    });

    newConnection.onreconnecting(() => {
      setConnectionStatus('connecting');
    });

    newConnection.onreconnected(() => {
      setConnectionStatus('connected');
    });

    newConnection.onclose(error => {
      console.log('🔌 Conexión cerrada', error);
      setConnectionStatus('disconnected');
    });

    newConnection
      .start()
      .then(() => {
        setConnectionStatus('connected');
      })
      .catch(err => {
        console.error('Error al conectar:', err);
        setConnectionStatus('error');
      });

    setConnection(newConnection);

    return () => {
      if (newConnection && newConnection.state === signalR.HubConnectionState.Connected) {
        newConnection.stop().then(() => {
          console.log('🔌 SignalR desconectado correctamente');
        });
      }
    };
  }, [username, placa]);

  // Animación del radar para iOS
  useEffect(() => {
    if (Platform.OS === 'ios' && vehicleData) {
      const interval = setInterval(() => {
        setRadarPulse(prev => ({
          wave1: (prev.wave1 + 0.01) % 1,
          wave2: (prev.wave2 + 0.01) % 1,
          wave3: (prev.wave3 + 0.01) % 1,
          wave4: (prev.wave4 + 0.01) % 1,
        }));
      }, 40);

      return () => clearInterval(interval);
    }
  }, [vehicleData]);

  const latitude = vehicleData?.lastValidLatitude || -12.0464;
  const longitude = vehicleData?.lastValidLongitude || -77.0428;
  const heading = vehicleData?.lastValidHeading || 0;
  const speed = vehicleData?.lastValidSpeed || 0;

  const getRadarColor = () => {
    if (speed === 0) return '#ef4444';
    if (speed > 0 && speed < 11) return '#ff8000';
    if (speed >= 11 && speed < 60) return '#38b000';
    return '#00509d';
  };

  const getLeafletHTML = () => {
    const radarColor = getRadarColor();
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
            body { margin: 0; padding: 0; }
            #map { height: 100vh; width: 100vw; }
            .radar-pulse {
                position: absolute;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background-color: ${radarColor};
                animation: pulse 3s infinite;
            }
            @keyframes pulse {
                0% { transform: scale(0.2); opacity: 0.7; }
                100% { transform: scale(6); opacity: 0; }
            }
        </style>
    </head>
    <body>
        <div id="map"></div>
        <script>
            var map = L.map('map').setView([${latitude}, ${longitude}], 15);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '© OpenStreetMap'
            }).addTo(map);
          
            var carIcon = L.divIcon({
                html: '<div style="position: relative; width: 60px; height: 40px;"><div class="radar-pulse" style="position: absolute; top: 10px; left: 20px;"></div><img src="https://res.cloudinary.com/dyc4ik1ko/image/upload/v1759966615/Car_nkielr.png" style="width:60px;height:40px;position:relative;z-index:10;"/></div>',
                iconSize: [60, 60],
                iconAnchor: [30, 20],
                className: ''
            });

            var marker = L.marker([${latitude}, ${longitude}], {icon: carIcon})
                .addTo(map)
                .bindPopup('<b>${vehicleName}</b><br>Velocidad: ${speed} km/h');

            window.updateMarkerPosition = function(lat, lng, spd, radarCol) {
                marker.setLatLng([lat, lng]);
                marker.getPopup().setContent('<b>${vehicleName}</b><br>Velocidad: ' + spd + ' km/h');
                map.setView([lat, lng], map.getZoom());
                
                // Actualizar color del radar
                var pulses = document.querySelectorAll('.radar-pulse');
                pulses.forEach(function(pulse) {
                    pulse.style.backgroundColor = radarCol;
                });
            };

            window.ReactNativeWebView.postMessage('webview-ready');
        </script>
    </body>
    </html>
    `;
  };

  // Actualizar WebView cuando cambien los datos
  useEffect(() => {
    if (Platform.OS === 'android' && webViewRef.current && vehicleData && isWebViewReady) {
      const radarColor = getRadarColor();
      setTimeout(() => {
        const script = `window.updateMarkerPosition(${latitude}, ${longitude}, ${speed}, '${radarColor}'); true;`;
        webViewRef.current?.injectJavaScript(script);
      }, 100);
    }
  }, [latitude, longitude, speed, vehicleData, isWebViewReady]);

  if (Platform.OS === 'ios') {
    const radarColor = getRadarColor();

    // Cálculo de opacidad para las ondas del radar
    const getOpacity = (progress: number) => {
      if (progress < 0.03 || progress > 0.8) return 0;
      if (progress < 0.08) return ((progress - 0.03) / 0.05) * 0.2;
      return (1 - progress) * 0.25;
    };

    const wave1Radius = 10 + radarPulse.wave1 * 90;
    const wave2Radius = 10 + radarPulse.wave2 * 90;
    const wave3Radius = 10 + radarPulse.wave3 * 90;
    const wave4Radius = 10 + radarPulse.wave4 * 90;

    const wave1Opacity = getOpacity(radarPulse.wave1);
    const wave2Opacity = getOpacity(radarPulse.wave2);
    const wave3Opacity = getOpacity(radarPulse.wave3);
    const wave4Opacity = getOpacity(radarPulse.wave4);

    return (
      <View
        style={{
          height: 250,
          borderRadius: 10,
          overflow: 'hidden',
          marginTop: 10,
        }}
      >
        {!vehicleData && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 10,
            }}
          >
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={{ color: '#fff', marginTop: 10 }}>
              {connectionStatus === 'connecting' ? 'Conectando...' : 'Cargando datos...'}
            </Text>
          </View>
        )}

        <MapView
          provider={PROVIDER_DEFAULT}
          style={{ flex: 1 }}
          region={{
            latitude,
            longitude,
            latitudeDelta: 0.003,
            longitudeDelta: 0.003,
          }}
        >
          {vehicleData && (
            <>
              {/* Ondas del radar con opacidad dinámica */}
              {wave1Opacity > 0 && (
                <Circle
                  center={{ latitude, longitude }}
                  radius={wave1Radius}
                  fillColor={`${radarColor}${Math.floor(wave1Opacity * 255).toString(16).padStart(2, '0')}`}
                  strokeColor={`${radarColor}${Math.floor(wave1Opacity * 200).toString(16).padStart(2, '0')}`}
                  strokeWidth={2}
                />
              )}
              {wave2Opacity > 0 && (
                <Circle
                  center={{ latitude, longitude }}
                  radius={wave2Radius}
                  fillColor={`${radarColor}${Math.floor(wave2Opacity * 255).toString(16).padStart(2, '0')}`}
                  strokeColor={`${radarColor}${Math.floor(wave2Opacity * 200).toString(16).padStart(2, '0')}`}
                  strokeWidth={2}
                />
              )}
              {wave3Opacity > 0 && (
                <Circle
                  center={{ latitude, longitude }}
                  radius={wave3Radius}
                  fillColor={`${radarColor}${Math.floor(wave3Opacity * 255).toString(16).padStart(2, '0')}`}
                  strokeColor={`${radarColor}${Math.floor(wave3Opacity * 200).toString(16).padStart(2, '0')}`}
                  strokeWidth={2}
                />
              )}
              {wave4Opacity > 0 && (
                <Circle
                  center={{ latitude, longitude }}
                  radius={wave4Radius}
                  fillColor={`${radarColor}${Math.floor(wave4Opacity * 255).toString(16).padStart(2, '0')}`}
                  strokeColor={`${radarColor}${Math.floor(wave4Opacity * 200).toString(16).padStart(2, '0')}`}
                  strokeWidth={2}
                />
              )}

              <Marker
                coordinate={{
                  latitude,
                  longitude,
                }}
                title={vehicleName}
                description={`Velocidad: ${speed} km/h`}
                tracksViewChanges={false}
                anchor={{ x: 0.5, y: 0.5 }}
              >
                <Image
                  source={{
                    uri: 'https://res.cloudinary.com/dyc4ik1ko/image/upload/v1759966615/Car_nkielr.png',
                  }}
                  style={{ width: 60, height: 30 }}
                  resizeMode="contain"
                />
              </Marker>
            </>
          )}
        </MapView>
      </View>
    );
  }

  // Android - Usando WebView con Leaflet
  return (
    <View
      style={{
        height: 250,
        borderRadius: 10,
        overflow: 'hidden',
        marginTop: 10,
      }}
    >
      {!vehicleData && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10,
          }}
        >
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={{ color: '#fff', marginTop: 10 }}>
            {connectionStatus === 'connecting' ? 'Conectando...' : 'Cargando datos...'}
          </Text>
        </View>
      )}

      <WebView
        ref={webViewRef}
        source={{ html: getLeafletHTML() }}
        style={{ flex: 1 }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        nestedScrollEnabled={true}
        onMessage={event => {
          if (event.nativeEvent.data === 'webview-ready') {
            setIsWebViewReady(true);
          }
        }}
      />
    </View>
  );
};

export default VehicleMap;