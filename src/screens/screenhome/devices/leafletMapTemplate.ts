// leafletMapTemplate.ts

interface DirectionImages {
  'up.png': string;
  'topright.png': string;
  'right.png': string;
  'downright.png': string;
  'down.png': string;
  'downleft.png': string;
  'left.png': string;
  'topleft.png': string;
}

interface IconSizes {
  vertical: [number, number];
  horizontal: [number, number];
}

interface TileConfig {
  url?: string;
  baseUrl?: string;
  overlayUrl?: string;
  attribution: string;
}

interface LeafletHTMLParams {
  mapType: 'hybrid' | 'standard' | string;
  tileConfig: TileConfig;
  pinType: string;
  DIRECTION_IMAGES: Record<string, DirectionImages>;
  iconSizes: IconSizes;
  popupOffset: number;
}

export const generateLeafletHTML = ({
  mapType,
  tileConfig,
  pinType,
  DIRECTION_IMAGES,
  iconSizes,
  popupOffset
}: LeafletHTMLParams): string => {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Ubicación del Vehículo</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossorigin=""/>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
        crossorigin=""></script>
    <style>
        body {
            margin: 0;
            padding: 0;
            overflow: hidden;
        }
        #map {
            height: 100vh;
            width: 100vw;
            z-index: 0;
        }

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

        .leaflet-top.leaflet-left {
            left: auto !important;
            right: 20px !important;
            top: 90px !important;
        }
    </style>
</head>
<body>
    <div id="map"></div>
    <script>
        var map = L.map('map', {
            zoomControl: true,
            scrollWheelZoom: true,
            doubleClickZoom: true,
            touchZoom: true
        }).setView([-12.0464, -77.0428], 16);

        // Capa base inicial
        ${mapType === 'hybrid' ? `
        var baseLayer = L.tileLayer('${tileConfig.baseUrl}', {
            attribution: '${tileConfig.attribution}',
            maxZoom: 19
        }).addTo(map);
        
        var overlayLayer = L.tileLayer('${tileConfig.overlayUrl}', {
            maxZoom: 19,
            opacity: 0.5
        }).addTo(map);
        ` : `
        var baseLayer = L.tileLayer('${tileConfig.url}', {
            attribution: '${tileConfig.attribution}',
            maxZoom: 19
        }).addTo(map);
        var overlayLayer = null;
        `}

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

        // Función para obtener dirección cardinal
        function obtenerDireccion(heading) {
            if (heading >= 0 && heading <= 22.5) return 'Norte';
            if (heading >= 22.51 && heading <= 67.5) return 'Noreste';
            if (heading >= 67.51 && heading <= 112.5) return 'Este';
            if (heading >= 112.51 && heading <= 157.5) return 'Sureste';
            if (heading >= 157.51 && heading <= 202.5) return 'Sur';
            if (heading >= 202.51 && heading <= 247.5) return 'Suroeste';
            if (heading >= 247.51 && heading <= 292.5) return 'Oeste';
            if (heading >= 292.51 && heading <= 337.5) return 'Noroeste';
            if (heading >= 337.51 && heading <= 360.0) return 'Norte';
            return 'Desconocido';
        }

        map.on('focus', function() {
            map.scrollWheelZoom.enable();
        });
        map.on('blur', function() {
            map.scrollWheelZoom.disable();
        });

        // Función para crear o actualizar el marcador
        window.updateMarkerPosition = function(lat, lng, heading, speed, statusText, deviceName, deviceId) {
            // Determinar qué imagen y tamaño usar según el ángulo
            var imageUrl = '';
            var iconSize = [42, 25]; // Tamaño por defecto
            
            // Tamaños configurados desde React Native
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
            
            // Determinar color del radar según velocidad
            var radarColor = '';
            if (speed === 0) {
                radarColor = '#ef4444'; // ROJO
            } else if (speed > 0 && speed < 11) {
                radarColor = '#ff8000'; // AMARILLO
            } else if (speed >= 11 && speed < 60) {
                radarColor = '#38b000'; // VERDE
            } else {
                radarColor = '#00509d'; // AZUL
            }

            var statusColor = statusText === 'Movimiento' ? '#38b000' : '#ef4444';

            var popupContent = \`
                <div style="text-align: center; font-family: Arial, sans-serif; min-width: 200px;">
                    <h3 style="margin: 8px 0; color: #f97316; font-size: 14.5px;text-transform: uppercase;font-weight: 800;">\${deviceName}</h3>
                    <div style="display: flex; flex-direction: column; gap: 3px; text-align: left;">
                        <div style="display: flex; justify-content: space-between;">
                            <span style="font-weight: 600; color: #374151;">Estado:</span>
                            <span style="color: \${statusColor}; font-weight: 600;">\${statusText}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="font-weight: 600; color: #374151;">Velocidad:</span>
                            <span style="color: #6b7280;">\${speed.toFixed(0)} Km/h</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="font-weight: 600; color: #374151;">Dirección:</span>
                            <span style="color: #6b7280;">\${obtenerDireccion(heading)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="font-weight: 600; color: #374151;">Conexión:</span>
                            <span style="color: #38b000; font-weight: 600;">Online</span>
                        </div>
                  
                    </div>
                </div>
            \`;

            // Si es la primera vez, crear el marcador Y el radar como capa separada
            if (marker === null) {
                // Crear overlay SVG para el radar (permanente)
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
                        
                        this._container.innerHTML = '<div class="radar-pulse" style="background-color: ' + radarColor + '; position: absolute;"></div>' +
                            '<div class="radar-pulse" style="background-color: ' + radarColor + '; position: absolute; animation-delay: 1s;"></div>' +
                            '<div class="radar-pulse" style="background-color: ' + radarColor + '; position: absolute; animation-delay: 2s;"></div>';
                        
                        map.getPanes().overlayPane.appendChild(this._container);
                        this._update();
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
                
                window.radarLayer = new RadarOverlay().addTo(map);
                
                // Crear marcador simple sin radar
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
                
                map.setView([lat, lng], 16);
            } else {
                // Actualizar imagen solo si cambió la dirección
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
                
                // Actualizar posición
                marker.setLatLng([lat, lng]);
                
                // Actualizar color del radar si cambió
                var oldColor = marker.lastSpeed === 0 ? '#ef4444' : 
                              (marker.lastSpeed > 0 && marker.lastSpeed < 11) ? '#fbbf24' :
                              (marker.lastSpeed >= 11 && marker.lastSpeed < 60) ? '#10b981' : '#3b82f6';
                
                if (oldColor !== radarColor && window.radarLayer) {
                    window.radarLayer.updateColor(radarColor);
                }
                marker.lastSpeed = speed;
                
                // Actualizar posición del radar
                if (window.radarLayer) {
                    window.radarLayer._update();
                }
                
                marker.getPopup().setContent(popupContent);
                map.setView([lat, lng], map.getZoom());
                
                if (!marker.isPopupOpen()) {
                    marker.openPopup();
                }
            }
        };

        document.addEventListener('visibilitychange', function() {
            if (!document.hidden && map) {
                setTimeout(function() {
                    map.invalidateSize(true);
                   
                    // Forzar redibujado de tiles
                    map.eachLayer(function(layer) {
                        if (layer instanceof L.TileLayer) {
                            layer.redraw();
                        }
                    });
                }, 250);
            }
        });

        // Para mensajes desde React Native
        document.addEventListener('message', function(event) {
            if (event.data === 'invalidate-size') {
                if (map) {
                    setTimeout(function() {
                        map.invalidateSize(true);
                    }, 100);
                }
            }
        });

        window.addEventListener('message', function(event) {
            if (event.data === 'invalidate-size') {
                if (map) {
                    setTimeout(function() {
                        map.invalidateSize(true);
                    }, 100);
                }
            }
        });

        // Señalar que el WebView está listo
        window.ReactNativeWebView.postMessage('webview-ready');
    </script>
</body>
</html>
`;
};

// Exportar también los tipos por si los necesitas en otros lugares
export type { LeafletHTMLParams, DirectionImages, IconSizes, TileConfig };