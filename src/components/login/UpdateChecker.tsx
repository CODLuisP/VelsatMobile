import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  BackHandler,
  Platform,
  Linking,
  StatusBar,
  Animated,
} from 'react-native';
import VersionCheck from 'react-native-version-check';
import { checkForUpdates, openStore } from '../../hooks/version-config';
import { AlertTriangle } from 'lucide-react-native';

const UpdateChecker = () => {
  const [needsUpdate, setNeedsUpdate] = useState(false);
  const [versionInfo, setVersionInfo] = useState({ current: '', latest: '' });
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.9))[0];

  useEffect(() => {
    checkVersion();
    
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => needsUpdate
    );

    return () => backHandler.remove();
  }, [needsUpdate]);

  useEffect(() => {
    if (needsUpdate) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [needsUpdate]);

  const checkVersion = async () => {
    try {
      const result = await checkForUpdates();
      
      console.log('Resultado de verificación:', result);

      if (result.needsUpdate) {
        setNeedsUpdate(true);
        setVersionInfo({
          current: result.currentVersion || 'Desconocida',
          latest: result.latestVersion || 'Desconocida',
        });
      }
    } catch (error) {
      console.error('Error checking version:', error);
    }
  };

  const handleUpdate = async () => {
    try {
      await openStore();
    } catch (error) {
      console.error('Error opening store:', error);
    }
  };

  if (!needsUpdate) return null;

  return (
    <>
      <StatusBar backgroundColor="rgba(0, 0, 0, 0.7)" barStyle="light-content" />
      <Animated.View 
        style={[
          styles.overlay,
          {
            opacity: fadeAnim,
          }
        ]}
      >
        <Animated.View 
          style={[
            styles.container,
            {
              transform: [{ scale: scaleAnim }],
            }
          ]}
        >
          <View style={styles.iconContainer}>
            <AlertTriangle size={52} color="#FF9800" strokeWidth={2} />
          </View>
          
          <Text style={styles.title}>Actualización Necesaria</Text>
          
          <Text style={styles.message}>
            Para continuar usando la aplicación, necesitas actualizar a la última versión.
          </Text>

          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>
              Versión actual: {versionInfo.current}
            </Text>
          
          </View>

          <TouchableOpacity 
            style={styles.button}
            onPress={handleUpdate}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>
              {Platform.OS === 'ios' ? 'Abrir App Store' : 'Abrir Play Store'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    elevation: 9999,
    paddingHorizontal: 24,
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 18,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  iconContainer: {
    backgroundColor: '#FFF3E0',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 19,
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
    color: '#1a1a1a',
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    color: '#666',
    lineHeight: 20,
  },
  versionContainer: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    width: '100%',
    marginBottom: 20,
  },
  versionText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginVertical: 2,
  },
  button: {
    backgroundColor: '#00296b',
    paddingVertical: 13,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
  },
  buttonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default UpdateChecker;