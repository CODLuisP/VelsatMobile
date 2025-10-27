import React, { useEffect, useRef, useState } from 'react';
import { View, Image, Platform, Animated, ActivityIndicator, Text, Modal, TouchableOpacity } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, Circle, Callout } from 'react-native-maps';
import { WebView } from 'react-native-webview';
import * as signalR from '@microsoft/signalr';
import {
  DIRECTION_IMAGES,
  getDirectionImage,
  getDirectionImageData,
} from '../../styles/directionImages';
import { MapPin, TriangleAlert, Maximize2, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const webViewRef = useRef<WebView>(null);
  const fullscreenWebViewRef = useRef<WebView>(null);
  const markerRef = useRef<any>(null);
  const insets = useSafeAreaInsets();

  // Estado para el radar en iOS
  const [radarPulse, setRadarPulse] = useState({
    wave1: 0,
    wave2: 0.25,
    wave3: 0.5,
    wave4: 0.75,
  });

  // Validación de usuario y placa
  const hasValidCredentials = username && placa;

  // Conexión SignalR
  useEffect(() => {
    if (!hasValidCredentials) {
      console.log('No hay usuario o placa asignados');
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
  }, [username, placa, hasValidCredentials]);

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

  // Tipo de vehículo siempre 's' como especificaste
  const pinType = 's';

  // Tamaños de iconos según el tipo
  const iconSizes = {
    vertical: [30, 40] as [number, number],
    horizontal: [55, 35] as [number, number],
  };

  const popupOffset = -20;

  const getLeafletHTML = (isFullscreenView = false) => {
    const radarColor = getRadarColor();
    const viewId = isFullscreenView ? 'fullscreen-map' : 'map';
    
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
            #${viewId} { height: 100vh; width: 100vw; }
            .radar-pulse {
                position: absolute;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                animation: pulse 3s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
                animation-fill-mode: both;
                pointer-events: none;
            }
            @keyframes pulse {
                0% {
                    transform: scale(0.2);
                    opacity: 0.4;
                }
                50% {
                    opacity: 0.2;
                }
                100% {
                    transform: scale(6);
                    opacity: 0;
                }
            }
        </style>
    </head>
    <body>
        <div id="${viewId}"></div>
        <script>
            var map = L.map('${viewId}').setView([${latitude}, ${longitude}], ${isFullscreenView ? 27 : 25});
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '© OpenStreetMap'
            }).addTo(map);

            // Guardar todas las URLs de imágenes
            window.imageUrls = {
                up: '${DIRECTION_IMAGES[pinType]['up.png']}',
                topright: '${DIRECTION_IMAGES[pinType]['topright.png']}',
                right: '${DIRECTION_IMAGES[pinType]['right.png']}',
                downright: '${DIRECTION_IMAGES[pinType]['downright.png']}',
                down: '${DIRECTION_IMAGES[pinType]['down.png']}',
                downleft: '${DIRECTION_IMAGES[pinType]['downleft.png']}',
                left: '${DIRECTION_IMAGES[pinType]['left.png']}',
                topleft: '${DIRECTION_IMAGES[pinType]['topleft.png']}'
            };

            var marker = null;
            var radarLayer = null;

            // Función para ajustar el centro del mapa (mover hacia arriba)
            function adjustMapCenter(lat, lng, zoom) {
                var targetPoint = map.project([lat, lng], zoom);
                var offsetY = 50;
                targetPoint.y -= offsetY;
                var adjustedLatLng = map.unproject(targetPoint, zoom);
                map.setView(adjustedLatLng, zoom);
            }

            window.updateMarkerPosition = function(lat, lng, heading, spd, radarCol, direccion) {
                // Determinar qué imagen y tamaño usar según el ángulo
                var imageUrl = '';
                var iconSize = [55, 35];
                var verticalSize = ${JSON.stringify(iconSizes.vertical)};
                var horizontalSize = ${JSON.stringify(iconSizes.horizontal)};
                
                if (heading >= 0 && heading <= 22.5) {
                    imageUrl = window.imageUrls.up;
                    iconSize = verticalSize;
                } else if (heading > 22.5 && heading <= 67.5) {
                    imageUrl = window.imageUrls.topright;
                    iconSize = horizontalSize;
                } else if (heading > 67.5 && heading <= 112.5) {
                    imageUrl = window.imageUrls.right;
                    iconSize = horizontalSize;
                } else if (heading > 112.5 && heading <= 157.5) {
                    imageUrl = window.imageUrls.downright;
                    iconSize = horizontalSize;
                } else if (heading > 157.5 && heading <= 202.5) {
                    imageUrl = window.imageUrls.down;
                    iconSize = verticalSize;
                } else if (heading > 202.5 && heading <= 247.5) {
                    imageUrl = window.imageUrls.downleft;
                    iconSize = horizontalSize;
                } else if (heading > 247.5 && heading <= 292.5) {
                    imageUrl = window.imageUrls.left;
                    iconSize = horizontalSize;
                } else if (heading > 292.5 && heading <= 337.5) {
                    imageUrl = window.imageUrls.topleft;
                    iconSize = horizontalSize;
                } else {
                    imageUrl = window.imageUrls.up;
                    iconSize = verticalSize;
                }

                var popupContent = \`
                    <div style="text-align: center; font-family: Arial, sans-serif; min-width: 150px; max-width: 250px;">
                        <h3 style="margin: 8px 0; color: #f97316; font-size: 12px; text-transform: uppercase; font-weight: 800;">${vehicleName}</h3>
                        <div style="display: flex; flex-direction: column; gap: 3px; text-align: left; font-size: 11px;">
                            <div style="display: flex; justify-content: left;">
                                <span style="font-weight: 600; color: #374151;">Velocidad:</span>
                                <span style="color: #6b7280;">\${spd} Km/h</span>
                            </div>
                            <div style="display: flex; justify-content: left;">
                                <span style="font-weight: 600; color: #374151;">Dirección:</span>
                                <span style="color: #6b7280; font-size: 10px; word-wrap: break-word;">\${direccion || 'Sin dirección'}</span>
                            </div>
                        </div>
                    </div>
                \`;

                if (marker === null) {
                    // PRIMERO: Crear el marcador
                    var vehicleIcon = L.divIcon({
                        html: '<img src="' + imageUrl + '" style="width: ' + iconSize[0] + 'px; height: ' + iconSize[1] + 'px;" />',
                        iconSize: iconSize,
                        iconAnchor: [iconSize[0] / 2, iconSize[1] / 2],
                        popupAnchor: [0, ${popupOffset}],
                        className: 'custom-vehicle-icon'
                    });
                    
                    marker = L.marker([lat, lng], {
                        icon: vehicleIcon,
                        autoPan: false
                    }).addTo(map);
                    
                    marker.bindPopup(popupContent, {
                        autoPan: false,
                        closeButton: true,
                        autoClose: false,
                        closeOnClick: false
                    }).openPopup();
                    
                    // Usar la función de ajuste en lugar de setView directo
                    adjustMapCenter(lat, lng, ${isFullscreenView ? 16 : 15});
                    
                    // DESPUÉS: Crear el radar overlay con delay
                    setTimeout(function() {
                        var RadarOverlay = L.Layer.extend({
                            onAdd: function(map) {
                                this._map = map;
                                this._container = L.DomUtil.create('div', 'radar-overlay');
                                this._container.style.position = 'absolute';
                                this._container.style.pointerEvents = 'none';
                                this._container.style.width = '100%';
                                this._container.style.height = '100%';
                                this._container.style.top = '0';
                                this._container.style.left = '0';
                                this._container.style.zIndex = '400';
                                
                                this._container.innerHTML = '<div class="radar-pulse" style="background-color: ' + radarCol + '; position: absolute;"></div>' +
                                    '<div class="radar-pulse" style="background-color: ' + radarCol + '; position: absolute; animation-delay: 1s;"></div>' +
                                    '<div class="radar-pulse" style="background-color: ' + radarCol + '; position: absolute; animation-delay: 2s;"></div>';
                                
                                map.getPanes().overlayPane.appendChild(this._container);
                                
                                // Esperar un frame más antes de actualizar posición
                                requestAnimationFrame(function() {
                                    this._update();
                                }.bind(this));
                                
                                map.on('viewreset zoom move', this._update, this);
                            },
                            
                            onRemove: function(map) {
                                L.DomUtil.remove(this._container);
                                map.off('viewreset zoom move', this._update, this);
                            },
                            
                            _update: function() {
                                if (!this._map || !marker) return;
                                var point = this._map.latLngToLayerPoint(marker.getLatLng());
                                var pulses = this._container.getElementsByClassName('radar-pulse');
                                for (var i = 0; i < pulses.length; i++) {
                                    pulses[i].style.left = (point.x - 10) + 'px';
                                    pulses[i].style.top = (point.y - 10) + 'px';
                                }
                            },
                            
                            updateColor: function(color) {
                                var pulses = this._container.getElementsByClassName('radar-pulse');
                                for (var i = 0; i < pulses.length; i++) {
                                    pulses[i].style.backgroundColor = color;
                                }
                            }
                        });
                        
                        radarLayer = new RadarOverlay().addTo(map);
                    }, 150);
                    
                } else {
                    // Actualizar imagen si cambió la dirección
                    if (!marker.lastHeading || Math.abs(marker.lastHeading - heading) > 22.5) {
                        var vehicleIcon = L.divIcon({
                            html: '<img src="' + imageUrl + '" style="width: ' + iconSize[0] + 'px; height: ' + iconSize[1] + 'px;" />',
                            iconSize: iconSize,
                            iconAnchor: [iconSize[0] / 2, iconSize[1] / 2],
                            popupAnchor: [0, ${popupOffset}],
                            className: 'custom-vehicle-icon'
                        });
                        marker.setIcon(vehicleIcon);
                        marker.lastHeading = heading;
                    }
                    
                    marker.setLatLng([lat, lng]);
                    
                    // Actualizar color del radar
                    if (radarLayer) {
                        radarLayer.updateColor(radarCol);
                        radarLayer._update();
                    }
                    
                    marker.getPopup().setContent(popupContent);
                    // Usar la función de ajuste también en las actualizaciones
                    adjustMapCenter(lat, lng, map.getZoom());
                    
                    if (!marker.isPopupOpen()) {
                        marker.openPopup();
                    }
                }
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
      const direccion = vehicleData.direccion || 'Sin dirección';
      setTimeout(() => {
        const script = `window.updateMarkerPosition(${latitude}, ${longitude}, ${heading}, ${speed}, '${radarColor}', '${direccion.replace(/'/g, "\\'")}'); true;`;
        webViewRef.current?.injectJavaScript(script);
      }, 100);
    }
  }, [latitude, longitude, heading, speed, vehicleData, isWebViewReady]);

  // Actualizar WebView de pantalla completa cuando cambien los datos
  useEffect(() => {
    if (Platform.OS === 'android' && fullscreenWebViewRef.current && vehicleData && isFullscreen) {
      const radarColor = getRadarColor();
      const direccion = vehicleData.direccion || 'Sin dirección';
      setTimeout(() => {
        const script = `window.updateMarkerPosition(${latitude}, ${longitude}, ${heading}, ${speed}, '${radarColor}', '${direccion.replace(/'/g, "\\'")}'); true;`;
        fullscreenWebViewRef.current?.injectJavaScript(script);
      }, 100);
    }
  }, [latitude, longitude, heading, speed, vehicleData, isFullscreen]);

  // Renderizar el contenido del mapa para iOS
  const renderIOSMap = (isFullscreenView = false) => {
    const radarColor = getRadarColor();
    const imageData = getDirectionImageData(heading);

    // Tamaños para iOS
    const iosImageSize: [number, number] = 
      imageData.name === 'up.png' || imageData.name === 'down.png'
        ? iconSizes.vertical
        : iconSizes.horizontal;

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
      <MapView
        provider={PROVIDER_DEFAULT}
        style={{ flex: 1 }}
        region={{
          latitude,
          longitude,
          latitudeDelta: isFullscreenView ? 0.002 : 0.003,
          longitudeDelta: isFullscreenView ? 0.002 : 0.003,
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
              ref={markerRef}
              coordinate={{
                latitude,
                longitude,
              }}
              anchor={{
                x: imageData.anchor[0] / imageData.size[0],
                y: imageData.anchor[1] / imageData.size[1],
              }}
              tracksViewChanges={false}
            >
              <Image
                source={getDirectionImage(heading, pinType)}
                style={{
                  width: iosImageSize[0],
                  height: iosImageSize[1],
                }}
                resizeMode="contain"
              />
              <Callout>
                <View style={{ padding: 0, minWidth: 180, width: 280}}>
                  <Text style={{ fontWeight: 'bold', fontSize: 12, marginBottom: 5 }}>
                    {vehicleName}
                  </Text>
                  <Text style={{ color: '#666', fontSize: 11 }}>
                    Velocidad: {speed} km/h
                  </Text>
                  <Text style={{ color: '#666', fontSize: 11, lineHeight: 14, flexWrap: 'wrap'}}>
                    Dirección: {vehicleData?.direccion || 'Cargando...'}
                  </Text>
                </View>
              </Callout>
            </Marker>
          </>
        )}
      </MapView>
    );
  };

  // Si no hay credenciales válidas, mostrar mensaje de error
  if (!hasValidCredentials) {
    return (
      <View
        style={{
          height: 250,
          borderRadius: 10,
          overflow: 'hidden',
          marginTop: 10,
          backgroundColor: '#ffffffff',
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: '#e5e7eb',
        }}
      >
        <View style={{ alignItems: 'center', padding: 20 }}>
          <View
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: '#fee2e2',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 15,
            }}
          >
            <TriangleAlert size={25} color="#bf0000ff" />
          </View>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: 8,
              textAlign: 'center',
            }}
          >
            Sin datos de vehículo
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: '#6b7280',
              textAlign: 'center',
              lineHeight: 20,
            }}
          >
            {!username && !placa
              ? 'No hay usuario ni placa asignados'
              : !username
              ? 'No hay usuario asignado'
              : 'No hay placa asignada'}
          </Text>
        </View>
      </View>
    );
  }

  if (Platform.OS === 'ios') {
    return (
      <>
        {/* Vista normal */}
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

          {/* Botón de pantalla completa */}
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              borderRadius: 8,
              padding: 8,
              zIndex: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}
            onPress={() => setIsFullscreen(true)}
          >
            <Maximize2 size={20} color="#1f2937" />
          </TouchableOpacity>

          {renderIOSMap(false)}
        </View>

        {/* Modal de pantalla completa */}
        <Modal
          visible={isFullscreen}
          animationType="slide"
          onRequestClose={() => setIsFullscreen(false)}
        >
          <View style={{ flex: 1, backgroundColor: '#000' }}>
            {/* Botón de cerrar */}
            <TouchableOpacity
              style={{
                position: 'absolute',
                top: insets.top + 10,
                right: 10,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderRadius: 8,
                padding: 10,
                zIndex: 30,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
              }}
              onPress={() => setIsFullscreen(false)}
            >
              <X size={24} color="#1f2937" />
            </TouchableOpacity>

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

            {renderIOSMap(true)}
          </View>
        </Modal>
      </>
    );
  }

  // Android - Usando WebView con Leaflet
  return (
    <>
      {/* Vista normal */}
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

        {/* Botón de pantalla completa */}
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: 8,
            padding: 8,
            zIndex: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
          onPress={() => setIsFullscreen(true)}
        >
          <Maximize2 size={20} color="#1f2937" />
        </TouchableOpacity>

        <WebView
          ref={webViewRef}
          source={{ html: getLeafletHTML(false) }}
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

      {/* Modal de pantalla completa */}
      <Modal
        visible={isFullscreen}
        animationType="slide"
        onRequestClose={() => setIsFullscreen(false)}
      >
        <View style={{ flex: 1, backgroundColor: '#000' }}>
          {/* Botón de cerrar */}
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: insets.top + 10,
              right: 10,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              borderRadius: 8,
              padding: 10,
              zIndex: 30,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}
            onPress={() => setIsFullscreen(false)}
          >
            <X size={24} color="#1f2937" />
          </TouchableOpacity>

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
            ref={fullscreenWebViewRef}
            source={{ html: getLeafletHTML(true) }}
            style={{ flex: 1 }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            nestedScrollEnabled={true}
            onMessage={event => {
              if (event.nativeEvent.data === 'webview-ready') {
                // WebView de pantalla completa está listo
                const radarColor = getRadarColor();
                setTimeout(() => {
                  const script = `window.updateMarkerPosition(${latitude}, ${longitude}, ${heading}, ${speed}, '${radarColor}'); true;`;
                  fullscreenWebViewRef.current?.injectJavaScript(script);
                }, 100);
              }
            }}
          />
        </View>
      </Modal>
    </>
  );
};

export default VehicleMap;