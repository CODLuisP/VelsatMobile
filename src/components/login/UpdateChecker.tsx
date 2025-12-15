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
import VersionCheck from '../../hooks/version-config';
import { AlertTriangle } from 'lucide-react-native';

const UpdateChecker = () => {
  const [needsUpdate, setNeedsUpdate] = useState(false);
  const [storeUrl, setStoreUrl] = useState('');
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.9))[0];

  useEffect(() => {
    checkVersion();
    
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => needsUpdate // Bloquea el botón atrás cuando necesita actualizar
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
      const updateNeeded = await VersionCheck.needUpdate();

      if (updateNeeded && updateNeeded.isNeeded) {
        setNeedsUpdate(true);
        setStoreUrl(updateNeeded.storeUrl);
      }
    } catch (error) {
      console.error('Error checking version:', error);
      // En producción, no bloquear la app si falla la verificación
      // Solo mostrar el modal si hay confirmación de que necesita actualizar
    }
  };

  const handleUpdate = async () => {
    try {
      if (storeUrl) {
        await Linking.openURL(storeUrl);
      } else {
        const url = await VersionCheck.getStoreUrl();
        await Linking.openURL(url);
      }
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
    marginBottom: 24,
    color: '#666',
    lineHeight: 20,
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