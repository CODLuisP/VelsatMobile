import React, {useState, useEffect} from 'react';
import { StyleSheet, View, Text, Animated, Easing } from 'react-native';
import { getApiStats } from '../../../services/ApiService';
import { Radio, WifiOff, RefreshCw, Clock, Database, Navigation } from 'lucide-react-native';

interface SimpleLocationViewProps {
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
}

const SimpleLocationView: React.FC<SimpleLocationViewProps> = ({ 
  latitude, 
  longitude, 
  speed = 0,
  heading = 0 
}) => {
  const [apiStats, setApiStats] = useState({
    put: {
      total: 0,
      exitosos: 0,
      fallidos: 0,
      tasaExito: '0.0'
    },
    post: {
      total: 0,
      exitosos: 0,
      fallidos: 0,
      tasaExito: '0.0'
    },
    offline: {
      pendientes: 0,
      isOnline: true
    }
  });

  // Animación para el pulso del indicador de transmisión
  const pulseAnim = useState(new Animated.Value(1))[0];
  const rotateAnim = useState(new Animated.Value(0))[0];
  const waveAnim1 = useState(new Animated.Value(0))[0];
  const waveAnim2 = useState(new Animated.Value(0))[0];
  const waveAnim3 = useState(new Animated.Value(0))[0];
  const [isTransmitting, setIsTransmitting] = useState(false);

  // Actualizar estadísticas cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      const stats = getApiStats();
      setApiStats(stats);
      setIsTransmitting(stats.offline.isOnline);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Animación de pulso cuando está transmitiendo
  useEffect(() => {
    if (isTransmitting) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Rotación continua del icono
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();

      // Ondas expansivas
      const createWaveAnimation = (anim: Animated.Value, delay: number) => {
        return Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.parallel([
              Animated.timing(anim, {
                toValue: 1,
                duration: 2000,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
              }),
            ]),
            Animated.timing(anim, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
          ])
        );
      };

      createWaveAnimation(waveAnim1, 0).start();
      createWaveAnimation(waveAnim2, 400).start();
      createWaveAnimation(waveAnim3, 800).start();
    } else {
      pulseAnim.setValue(1);
      rotateAnim.setValue(0);
      waveAnim1.setValue(0);
      waveAnim2.setValue(0);
      waveAnim3.setValue(0);
    }
  }, [isTransmitting, pulseAnim, rotateAnim, waveAnim1, waveAnim2, waveAnim3]);

  const speedKmh = (speed * 3.6).toFixed(1);
  const isMoving = speed > 0;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        
        {/* Indicador de transmisión en tiempo real */}
        <View style={styles.transmissionContainer}>
          <View style={styles.transmissionIndicatorWrapper}>
            {/* Ondas expansivas */}
            {isTransmitting && (
              <>
                <Animated.View 
                  style={[
                    styles.wave,
                    {
                      opacity: waveAnim1.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.6, 0]
                      }),
                      transform: [{
                        scale: waveAnim1.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 1.5]
                        })
                      }]
                    }
                  ]}
                />
                <Animated.View 
                  style={[
                    styles.wave,
                    {
                      opacity: waveAnim2.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.6, 0]
                      }),
                      transform: [{
                        scale: waveAnim2.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 1.5]
                        })
                      }]
                    }
                  ]}
                />
                <Animated.View 
                  style={[
                    styles.wave,
                    {
                      opacity: waveAnim3.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.6, 0]
                      }),
                      transform: [{
                        scale: waveAnim3.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 1.5]
                        })
                      }]
                    }
                  ]}
                />
              </>
            )}
            
            {/* Icono central */}
            <Animated.View 
              style={[
                styles.transmissionIndicator,
                isTransmitting && styles.transmissionActive,
                { 
                  transform: [
                    { scale: isTransmitting ? pulseAnim : 1 },
                    { 
                      rotate: rotateAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '360deg']
                      })
                    }
                  ] 
                }
              ]}
            >
              {isTransmitting ? (
                <Radio size={28} color="#2196F3" strokeWidth={2.5} />
              ) : (
                <WifiOff size={28} color="#9E9E9E" strokeWidth={2.5} />
              )}
            </Animated.View>
          </View>
          
          <View style={styles.transmissionTextContainer}>
            <Text style={[
              styles.transmissionTitle,
              isTransmitting && styles.transmissionTitleActive
            ]}>
              {isTransmitting ? 'Transmitiendo' : 'Sin conexión'}
            </Text>
            <Text style={styles.transmissionSubtitle}>
              {isTransmitting 
                ? 'Enviando datos en tiempo real' 
                : 'Modo offline activo'}
            </Text>
            
            {/* Indicador de puntos animados cuando transmite */}
            {isTransmitting && (
              <View style={styles.dotsContainer}>
                <Animated.View style={[styles.dot, { 
                  opacity: pulseAnim.interpolate({
                    inputRange: [1, 1.15],
                    outputRange: [0.3, 1]
                  })
                }]} />
                <Animated.View style={[styles.dot, { 
                  opacity: pulseAnim.interpolate({
                    inputRange: [1, 1.15],
                    outputRange: [1, 0.3]
                  })
                }]} />
                <Animated.View style={[styles.dot, { 
                  opacity: pulseAnim.interpolate({
                    inputRange: [1, 1.15],
                    outputRange: [0.3, 1]
                  })
                }]} />
              </View>
            )}
          </View>
        </View>

        {/* Métricas PUT */}
        {/* <View style={styles.metricsRow}>
          <View style={styles.metricIconContainer}>
            <RefreshCw size={20} color="#673AB7" strokeWidth={2.5} />
          </View>
          <Text style={styles.metricLabel}>UPDATE</Text>
          <View style={styles.metricsValues}>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{apiStats.put.total}</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={[styles.metricValue, styles.successText]}>
                {apiStats.put.exitosos}
              </Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={[styles.metricValue, styles.errorText]}>
                {apiStats.put.fallidos}
              </Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={[styles.metricValue, styles.rateText]}>
                {apiStats.put.tasaExito}%
              </Text>
            </View>
          </View>
        </View> */}

        {/* Métricas POST */}
        {/* <View style={styles.metricsRow}>
          <View style={styles.metricIconContainer}>
            <Clock size={20} color="#00ACC1" strokeWidth={2.5} />
          </View>
          <Text style={styles.metricLabel}>30s SYNC</Text>
          <View style={styles.metricsValues}>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{apiStats.post.total}</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={[styles.metricValue, styles.successText]}>
                {apiStats.post.exitosos}
              </Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={[styles.metricValue, styles.errorText]}>
                {apiStats.post.fallidos}
              </Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={[styles.metricValue, styles.rateText]}>
                {apiStats.post.tasaExito}%
              </Text>
            </View>
          </View>
        </View> */}

        {/* Cola offline */}
        {apiStats.offline.pendientes > 0 && (
          <View style={styles.offlineAlert}>
            <View style={styles.offlineIconContainer}>
              <Database size={20} color="#F57C00" strokeWidth={2.5} />
            </View>
            <View style={styles.offlineContent}>
              <Text style={styles.offlineCount}>
                {apiStats.offline.pendientes}
              </Text>
              <Text style={styles.offlineLabel}>pendientes</Text>
            </View>
          </View>
        )}

        {/* Indicador de movimiento */}
        <View style={styles.statusContainer}>
          <View style={[
            styles.statusDot, 
            isMoving ? styles.statusDotMoving : styles.statusDotStatic
          ]} />
          <Text style={styles.statusText}>
            {isMoving ? `${speedKmh} km/h` : 'Detenido'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 20,
  },
  
  transmissionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 20,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  transmissionIndicatorWrapper: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  wave: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2196F3',
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  transmissionIndicator: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  transmissionActive: {
    backgroundColor: '#E3F2FD',
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  transmissionTextContainer: {
    flex: 1,
  },
  transmissionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 2,
  },
  transmissionTitleActive: {
    color: '#2196F3',
  },
  transmissionSubtitle: {
    fontSize: 12,
    fontWeight: '400',
    color: '#9E9E9E',
    marginBottom: 4,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2196F3',
  },
  
  // Estilos de métricas - Minimalista
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  metricIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#757575',
    width: 70,
    letterSpacing: 0.3,
  },
  metricsValues: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#424242',
  },
  successText: {
    color: '#4CAF50',
  },
  errorText: {
    color: '#F44336',
  },
  rateText: {
    color: '#2196F3',
  },
  metricDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#EEEEEE',
  },
  
  // Estilos de la alerta offline - Minimalista
  offlineAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    marginBottom: 12,
  },
  offlineIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFE0B2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  offlineContent: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flex: 1,
  },
  offlineCount: {
    fontSize: 28,
    fontWeight: '700',
    color: '#F57C00',
    marginRight: 8,
  },
  offlineLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#F57C00',
  },
  
  // Estilos del indicador de movimiento - Minimalista
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusDotMoving: {
    backgroundColor: '#4CAF50',
  },
  statusDotStatic: {
    backgroundColor: '#BDBDBD',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#757575',
  },
});

export default SimpleLocationView;