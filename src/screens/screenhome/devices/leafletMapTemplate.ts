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
  iconSizes: IconSizes;
  popupOffset: number;
  initialLat?: number;
  initialLng?: number;
}

export const generateLeafletHTML = ({
  mapType,
  tileConfig,
  pinType,
  iconSizes,
  popupOffset,
  initialLat = -12.0464,
  initialLng = -77.0428,
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
            animation: pulse 3s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
            animation-fill-mode: both;
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
.leaflet-popup-content-wrapper {
    padding: 10px !important;
}
.leaflet-popup-content {
    margin: 0 !important;
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
        }).setView([${initialLat}, ${initialLng}], 16);

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

        // Contenedor fijo: el ícono NUNCA cambia de tamaño → nunca se llama setIcon() después de crearlo
        var CW = ${Math.max(iconSizes.vertical[0], iconSizes.horizontal[0])};
        var CH = ${Math.max(iconSizes.vertical[1], iconSizes.horizontal[1])};

        setTimeout(function() { map.invalidateSize(true); }, 200);

        var marker = null;
        var userClosedPopup = false;

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

        function getSpeedColor(spd) {
            if (spd === 0) return '#ef4444';
            if (spd < 11)  return '#ff8000';
            if (spd < 60)  return '#38b000';
            return '#00509d';
        }

        // Crea el ícono UNA sola vez con contenedor fijo CW x CH
        function buildIcon(imageUrl, imgW, imgH, radarColor) {
            var ps = 'position:absolute;width:20px;height:20px;border-radius:50%;left:-10px;top:-10px;pointer-events:none;background-color:' + radarColor + ';';
            var imgLeft = (CW - imgW) / 2;
            var imgTop  = (CH - imgH) / 2;
            var html =
                '<div style="position:relative;width:' + CW + 'px;height:' + CH + 'px;overflow:visible;">' +
                    '<div style="position:absolute;left:50%;top:50%;width:0;height:0;">' +
                        '<div class="radar-pulse" style="' + ps + '"></div>' +
                        '<div class="radar-pulse" style="' + ps + 'animation-delay:1s;"></div>' +
                        '<div class="radar-pulse" style="' + ps + 'animation-delay:2s;"></div>' +
                    '</div>' +
                    '<img src="' + imageUrl + '" style="position:absolute;left:' + imgLeft + 'px;top:' + imgTop + 'px;width:' + imgW + 'px;height:' + imgH + 'px;" />' +
                '</div>';
            return L.divIcon({
                html: html,
                iconSize: [CW, CH],
                iconAnchor: [CW / 2, CH / 2],
                popupAnchor: [0, ${popupOffset}],
                className: ''
            });
        }

        // imageUrl, imgW, imgH vienen de React Native en cada llamada → sin dependencia de window.imageUrls
        window.updateMarkerPosition = function(lat, lng, heading, speed, statusText, deviceName, deviceId, imageUrl, imgW, imgH) {
            var radarColor = getSpeedColor(speed);

            var popupContent = \`
                <div style="font-family:Arial,sans-serif;text-align:left;white-space:nowrap;min-width:190px;">
                    <div style="font-weight:800;font-size:13px;color:#000;text-transform:uppercase;">\${deviceName}</div>
                    <div style="font-size:12px;color:#555;">\${statusText} · \${speed.toFixed(0)} Km/h · \${obtenerDireccion(heading)}</div>
                </div>\`;

            if (marker === null) {
                marker = L.marker([lat, lng], {
                    icon: buildIcon(imageUrl, imgW, imgH, radarColor),
                    autoPan: false
                }).addTo(map);
                marker.bindPopup(popupContent, {
                    autoPan: false, closeButton: true, autoClose: false, closeOnClick: false
                }).openPopup();
                marker.on('popupclose', function() { userClosedPopup = true; });
                marker.on('popupopen',  function() { userClosedPopup = false; });
                marker.lastSpeedColor = radarColor;
                map.setView([lat, lng], 16);
            } else {
                // Actualizar DOM directamente — NUNCA se llama setIcon()
                if (marker._icon) {
                    var imgEl = marker._icon.querySelector('img');
                    if (imgEl) {
                        imgEl.src          = imageUrl;
                        imgEl.style.width  = imgW + 'px';
                        imgEl.style.height = imgH + 'px';
                        imgEl.style.left   = ((CW - imgW) / 2) + 'px';
                        imgEl.style.top    = ((CH - imgH) / 2) + 'px';
                    }
                    if (marker.lastSpeedColor !== radarColor) {
                        var pulses = marker._icon.querySelectorAll('.radar-pulse');
                        for (var i = 0; i < pulses.length; i++) {
                            pulses[i].style.backgroundColor = radarColor;
                        }
                        marker.lastSpeedColor = radarColor;
                    }
                }
                marker.setLatLng([lat, lng]);
                marker.getPopup().setContent(popupContent);
                map.setView([lat, lng], map.getZoom());
                if (!userClosedPopup && !marker.isPopupOpen()) {
                    marker.openPopup();
                }
            }
        };

        map.on('focus', function() { map.scrollWheelZoom.enable(); });
        map.on('blur',  function() { map.scrollWheelZoom.disable(); });

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