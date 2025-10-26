import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Animated,
  PanResponder,
} from 'react-native';
import { X, MapPin, Clock } from 'lucide-react-native';
import { WebView } from 'react-native-webview';

interface CoordinatesModalProps {
  visible: boolean;
  onClose: () => void;
  latitude: number;
  longitude: number;
}

// Tu API Key de Google
const GOOGLE_API_KEY = 'AIzaSyB69HY-OKCtBsbRsKuHns-7HJxjvSqpogg';

const CoordinatesModal: React.FC<CoordinatesModalProps> = ({
  visible,
  onClose,
  latitude,
  longitude,
}) => {
  const [loading, setLoading] = useState(true);
  const [webViewKey, setWebViewKey] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const slideAnim = useState(new Animated.Value(height))[0];

  // Actualizar la vista cuando cambien las coordenadas
  useEffect(() => {
    if (visible) {
      setWebViewKey(prev => prev + 1);
      setLoading(true);
      setLastUpdate(new Date());
      // Animar entrada
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    } else {
      // Animar salida
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  useEffect(() => {
    if (visible) {
      setWebViewKey(prev => prev + 1);
      setLoading(true);
      setLastUpdate(new Date());
    }
  }, [latitude, longitude]);

  const formatCoordinate = (coord: number, decimals: number = 6): string => {
    return coord.toFixed(decimals);
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // Crear HTML con el iframe de Google Street View
  const getStreetViewHTML = (lat: number, lng: number) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body, html {
              width: 100%;
              height: 100%;
              overflow: hidden;
              background-color: #000;
            }
            iframe {
              width: 100%;
              height: 100%;
              border: none;
            }
          </style>
        </head>
        <body>
          <iframe
            src="https://www.google.com/maps/embed/v1/streetview?location=${lat},${lng}&heading=0&pitch=0&fov=90&key=${GOOGLE_API_KEY}"
            frameborder="0"
            allowfullscreen
          ></iframe>
        </body>
      </html>
    `;
  };

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };


  // PanResponder para arrastrar hacia abajo - CORREGIDO
const panResponder = PanResponder.create({
  onStartShouldSetPanResponder: () => true,
  onStartShouldSetPanResponderCapture: () => false,
  onMoveShouldSetPanResponder: (_, gestureState) => {
    // Solo activar cuando se arrastra hacia ABAJO (dy positivo)
    return gestureState.dy > 5;  // ✅ Quitar Math.abs()
  },
  onMoveShouldSetPanResponderCapture: () => false,
  onPanResponderMove: (_, gestureState) => {
    // Solo mover cuando es hacia abajo
    if (gestureState.dy > 0) {
      slideAnim.setValue(gestureState.dy);
    }
  },
  onPanResponderRelease: (_, gestureState) => {
    if (gestureState.dy > 150) {
      handleClose();
    } else {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    }
  },
  onPanResponderTerminate: () => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();
  },
}); 

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.modalContent,
                {
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
            

              {/* Header */}
              <View style={styles.modalHeader}>
                <View style={styles.headerLeft}>
                  <MapPin size={24} color="#3b82f6" />
                  <Text style={styles.modalTitle}>Vista 3D en Tiempo Real</Text>
                </View>
                <TouchableOpacity
                  onPress={handleClose}
                  style={styles.closeButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <X size={24} color="#64748b" />
                </TouchableOpacity>
              </View>

              {/* Street View Container */}
              <View style={styles.streetViewContainer}>
                {loading && (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#3b82f6" />
                    <Text style={styles.loadingText}>Cargando vista 3D...</Text>
                  </View>
                )}

                <WebView
                  key={webViewKey}
                  source={{
                    html: getStreetViewHTML(latitude, longitude),
                  }}
                  style={styles.webView}
                  onLoadStart={() => setLoading(true)}
                  onLoadEnd={() => setLoading(false)}
                  javaScriptEnabled={true}
                  domStorageEnabled={true}
                  allowsFullscreenVideo={true}
                  scrollEnabled={true}
                  bounces={false}
                  showsHorizontalScrollIndicator={false}
                  showsVerticalScrollIndicator={false}
                  originWhitelist={['*']}
                  mixedContentMode="always"
                />

                {/* Overlay de actualización en tiempo real */}
                <View style={styles.liveIndicator}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>EN VIVO</Text>
                </View>
              </View>

              {/* Content - Coordenadas */}
              <View style={styles.modalBody}>
                {/* Última actualización */}
                <View style={styles.updateTimeContainer}>
                  <Clock size={14} color="#64748b" />
                  <Text style={styles.updateTimeText}>
                    Actualizado: {formatTime(lastUpdate)}
                  </Text>
                </View>

                {/* Latitude */}
                <View style={styles.coordinateRow}>
                  <Text style={styles.coordinateLabel}>Latitud:</Text>
                  <View style={styles.coordinateValueContainer}>
                    <Text style={styles.coordinateValue}>
                      {formatCoordinate(latitude)}
                    </Text>
                    <Text style={styles.coordinateUnit}>°</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                {/* Longitude */}
                <View style={styles.coordinateRow}>
                  <Text style={styles.coordinateLabel}>Longitud:</Text>
                  <View style={styles.coordinateValueContainer}>
                    <Text style={styles.coordinateValue}>
                      {formatCoordinate(longitude)}
                    </Text>
                    <Text style={styles.coordinateUnit}>°</Text>
                  </View>
                </View>
              </View>

              {/* Footer */}
              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleClose}
                >
                  <Text style={styles.primaryButtonText}>Cerrar</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    width: '100%',
    maxHeight: height * 0.92,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  dragIndicatorContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: '#cbd5e1',
    borderRadius: 2,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  closeButton: {
    padding: 4,
  },
  streetViewContainer: {
    height: 300,
    backgroundColor: '#000',
    position: 'relative',
    overflow: 'hidden',
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    zIndex: 1,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#fff',
  },
  liveIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    zIndex: 2,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  liveText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  updateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  updateTimeText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  coordinateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  coordinateLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  coordinateValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  coordinateValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1e293b',
  },
  coordinateUnit: {
    fontSize: 14,
    fontWeight: '500',
    color: '#94a3b8',
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default CoordinatesModal;