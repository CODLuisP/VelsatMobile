import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import axios from 'axios';

interface PassengerActionButtonProps {
  codpedido: string;
  estado: string;
  codusuario: string; // Nuevo prop
}

const PassengerActionButton: React.FC<PassengerActionButtonProps> = ({ 
  codpedido,
  estado,
  codusuario
}) => {
  const [status, setStatus] = useState<'subir' | 'subiendo' | 'bajar' | 'bajando' | 'finalizado'>('subir');

  // No renderizar si no es aremys
  if (codusuario !== 'aremys') {
    return null;
  }

  // Evaluar el estado inicial cuando cambia el prop estado
  useEffect(() => {
    if (estado === 'P') {
      setStatus('subir');
    } else if (estado === 'A') {
      setStatus('bajar');
    } else if (estado === 'N') {
      setStatus('finalizado');
    }
  }, [estado]);

  // ... resto del código sin cambios
  const handleSubirPasajero = async () => {
    setStatus('subiendo');
    
    try {
      const response = await axios.post(
        `https://velsat.pe:2087/api/Aplicativo/SubirPasajero?codpedido=${codpedido}`
      );
      console.log('✅ Pasajero subido:', response.data);
      setStatus('bajar');
    } catch (error) {
      console.error('❌ Error al subir pasajero:', error);
      setStatus('subir');
    }
  };

  const handleBajarPasajero = async () => {
    setStatus('bajando');
    
    await new Promise<void>(resolve => setTimeout(() => resolve(), 1000));
    
    try {
      const response = await axios.post(
        `https://velsat.pe:2087/api/Aplicativo/BajarPasajero?codpedido=${codpedido}`
      );
      console.log('✅ Pasajero bajado:', response.data);
      console.log('📊 Estado del pasajero:', estado);
      setStatus('finalizado');
    } catch (error) {
      console.error('❌ Error al bajar pasajero:', error);
      setStatus('bajar');
    }
  };

  const handlePress = () => {
    if (status === 'subir') {
      handleSubirPasajero();
    } else if (status === 'bajar') {
      handleBajarPasajero();
    }
  };

  const getButtonText = () => {
    switch (status) {
      case 'subiendo':
        return 'Subiendo...';
      case 'bajando':
        return 'Bajando...';
      case 'bajar':
        return 'Bajar Pasajero';
      case 'finalizado':
        return 'Finalizado';
      default:
        return 'Subir Pasajero';
    }
  };

  const getButtonStyle = () => {
    if (status === 'finalizado') {
      return [styles.button, styles.buttonFinalizado];
    }
    if (status === 'bajar' || status === 'bajando') {
      return [styles.button, styles.buttonBajar];
    }
    return styles.button;
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={handlePress}
      disabled={status === 'subiendo' || status === 'bajando' || status === 'finalizado'}
    >
      <Text style={styles.buttonText}>{getButtonText()}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#038d36ff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    alignSelf: 'center', // <- 🔥 Centra el botón y ajusta al contenido

  },
  buttonBajar: {
    backgroundColor: '#e36414',
  },
  buttonFinalizado: {
    backgroundColor: '#9E9E9E',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default PassengerActionButton;