import React, {useState, useEffect} from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { getApiStats } from '../../../services/ApiService';

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

  // Actualizar estadísticas cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      setApiStats(getApiStats());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const speedKmh = (speed * 3.6).toFixed(1);
  const isMoving = speed > 0;

  const getCardinalDirection = (degrees: number): string => {
    if (degrees < 0) return 'N/A';
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  };

  const getArrowRotation = (degrees: number): string => {
    if (degrees < 0) return '0deg';
    return `${degrees}deg`;
  };

  const cardinalDirection = getCardinalDirection(heading);
  const hasValidHeading = heading >= 0;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerText}>Ubicación Actual</Text>
          {/* 🔥 Indicador de conexión */}
          <View style={[
            styles.connectionBadge,
            apiStats.offline.isOnline ? styles.onlineBadge : styles.offlineBadge
          ]}>
            <View style={[
              styles.connectionDot,
              apiStats.offline.isOnline ? styles.onlineDot : styles.offlineDot
            ]} />
            <Text style={styles.connectionText}>
              {apiStats.offline.isOnline ? 'ONLINE' : 'OFFLINE'}
            </Text>
          </View>
        </View>

        {/* Latitud */}
        <View style={styles.infoRow}>
          <View style={styles.labelContainer}>
            <Text style={styles.emoji}>🌐</Text>
            <Text style={styles.label}>Latitud</Text>
          </View>
          <Text style={styles.value}>{latitude.toFixed(6)}</Text>
        </View>

        {/* Longitud */}
        <View style={styles.infoRow}>
          <View style={styles.labelContainer}>
            <Text style={styles.emoji}>🌐</Text>
            <Text style={styles.label}>Longitud</Text>
          </View>
          <Text style={styles.value}>{longitude.toFixed(6)}</Text>
        </View>

        {/* Velocidad */}
        <View style={[styles.infoRow, styles.speedRow]}>
          <View style={styles.labelContainer}>
            <Text style={styles.emoji}>⚡</Text>
            <Text style={styles.label}>Velocidad</Text>
          </View>
          <View style={styles.speedContainer}>
            <Text style={[
              styles.speedValue, 
              isMoving ? styles.speedMoving : styles.speedStatic
            ]}>
              {speedKmh}
            </Text>
            <Text style={styles.speedUnit}>km/h</Text>
          </View>
        </View>

        {/* Ángulo/Dirección */}
        <View style={[styles.infoRow, styles.headingRow]}>
          <View style={styles.labelContainer}>
            <Text style={styles.emoji}>🧭</Text>
            <Text style={styles.label}>Dirección</Text>
          </View>
          <View style={styles.headingContainer}>
            {hasValidHeading ? (
              <>
                <View style={styles.compassContainer}>
                  <Text 
                    style={[
                      styles.arrowIcon,
                      { transform: [{ rotate: getArrowRotation(heading) }] }
                    ]}
                  >
                    ↑
                  </Text>
                </View>
                <View style={styles.headingTextContainer}>
                  <Text style={styles.headingDegrees}>
                    {heading.toFixed(0)}°
                  </Text>
                  <Text style={styles.headingCardinal}>
                    {cardinalDirection}
                  </Text>
                </View>
              </>
            ) : (
              <Text style={styles.headingNA}>N/A</Text>
            )}
          </View>
        </View>

        {/* 🔥 Estadísticas PUT (UpdateTramaDevice) */}
        <View style={[styles.infoRow, styles.putStatsRow]}>
          <View style={styles.labelContainer}>
            <Text style={styles.emoji}>🔄</Text>
            <Text style={styles.label}>PUT (Update)</Text>
          </View>
          <View style={styles.apiStatsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{apiStats.put.total}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, styles.statSuccess]}>
                {apiStats.put.exitosos}
              </Text>
              <Text style={styles.statLabel}>OK</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, styles.statError]}>
                {apiStats.put.fallidos}
              </Text>
              <Text style={styles.statLabel}>Error</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, styles.statRate]}>
                {apiStats.put.tasaExito}%
              </Text>
              <Text style={styles.statLabel}>Éxito</Text>
            </View>
          </View>
        </View>

        {/* 🔥 Estadísticas POST (InsertarTrama cada 30s) */}
        <View style={[styles.infoRow, styles.postStatsRow]}>
          <View style={styles.labelContainer}>
            <Text style={styles.emoji}>📮</Text>
            <Text style={styles.label}>POST (30s)</Text>
          </View>
          <View style={styles.apiStatsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{apiStats.post.total}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, styles.statSuccess]}>
                {apiStats.post.exitosos}
              </Text>
              <Text style={styles.statLabel}>OK</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, styles.statError]}>
                {apiStats.post.fallidos}
              </Text>
              <Text style={styles.statLabel}>Error</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, styles.statRate]}>
                {apiStats.post.tasaExito}%
              </Text>
              <Text style={styles.statLabel}>Éxito</Text>
            </View>
          </View>
        </View>

        {/* 🔥 Cola offline */}
        {apiStats.offline.pendientes > 0 && (
          <View style={[styles.infoRow, styles.offlineRow]}>
            <View style={styles.labelContainer}>
              <Text style={styles.emoji}>💾</Text>
              <Text style={styles.label}>Cola Offline</Text>
            </View>
            <View style={styles.offlineContainer}>
              <Text style={styles.offlineCount}>
                {apiStats.offline.pendientes}
              </Text>
              <Text style={styles.offlineLabel}>
                tramas pendientes
              </Text>
            </View>
          </View>
        )}

        {/* Indicador de estado */}
        <View style={styles.statusContainer}>
          <View style={[
            styles.statusDot, 
            isMoving ? styles.statusDotMoving : styles.statusDotStatic
          ]} />
          <Text style={styles.statusText}>
            {isMoving ? 'En movimiento' : 'Detenido'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#e8eaf6',
  },
  headerText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2196F3',
  },
  // 🔥 Badge de conexión
  connectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  onlineBadge: {
    backgroundColor: '#E8F5E9',
  },
  offlineBadge: {
    backgroundColor: '#FFEBEE',
  },
  connectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  onlineDot: {
    backgroundColor: '#4CAF50',
  },
  offlineDot: {
    backgroundColor: '#F44336',
  },
  connectionText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#666',
  },
  infoRow: {
    marginBottom: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  speedRow: {
    backgroundColor: '#e3f2fd',
  },
  headingRow: {
    backgroundColor: '#fff3e0',
  },
  putStatsRow: {
    backgroundColor: '#f3e5f5',
  },
  postStatsRow: {
    backgroundColor: '#e1f5fe',
  },
  offlineRow: {
    backgroundColor: '#fff9c4',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  emoji: {
    fontSize: 20,
    marginRight: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    letterSpacing: 0.5,
  },
  speedContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  speedValue: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  speedMoving: {
    color: '#4CAF50',
  },
  speedStatic: {
    color: '#999',
  },
  speedUnit: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginLeft: 8,
  },
  headingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compassContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FF9800',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  arrowIcon: {
    fontSize: 32,
    color: '#fff',
    fontWeight: '900',
  },
  headingTextContainer: {
    flexDirection: 'column',
  },
  headingDegrees: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FF6F00',
    letterSpacing: 0.5,
  },
  headingCardinal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF9800',
    marginTop: 2,
  },
  headingNA: {
    fontSize: 20,
    fontWeight: '700',
    color: '#999',
  },
  apiStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#7B1FA2',
  },
  statSuccess: {
    color: '#4CAF50',
  },
  statError: {
    color: '#F44336',
  },
  statRate: {
    color: '#2196F3',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#999',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E0E0E0',
  },
  // 🔥 Estilos cola offline
  offlineContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  offlineCount: {
    fontSize: 32,
    fontWeight: '800',
    color: '#F57C00',
    marginRight: 8,
  },
  offlineLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F57C00',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: '#e8eaf6',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusDotMoving: {
    backgroundColor: '#4CAF50',
  },
  statusDotStatic: {
    backgroundColor: '#999',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
});

export default SimpleLocationView;