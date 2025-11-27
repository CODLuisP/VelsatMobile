// src/components/OptionCard.tsx
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { LucideIcon } from 'lucide-react-native';
import { Text } from './ScaledComponents';
import { homeStyles } from '../styles/home';

interface OptionCardProps {
  onPress: () => void;
  colors: string[];
  badge: string;
  category: string;
  title: string;
  description: string;
  icon: LucideIcon;
  activeOpacity?: number;
  fullWidth?: boolean; // ← Nueva prop
}

const OptionCard: React.FC<OptionCardProps> = ({
  onPress,
  colors,
  badge,
  category,
  title,
  description,
  icon: Icon,
  activeOpacity = 0.7,
  fullWidth = false, // ← Por defecto false
}) => {
  return (
    <TouchableOpacity
      style={[
        homeStyles.optionCard,
        fullWidth && { width: '100%' } // ← Aplica ancho completo si fullWidth es true
      ]}
      onPress={onPress}
      activeOpacity={activeOpacity}
    >
      {/* Fondo degradado */}
      <LinearGradient
        colors={colors}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
        }}
      />

    

      {/* Contenido principal */}
      <View style={{ marginTop: 0 }}>
        <Text
          style={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: 12,
            marginBottom: 4,
            fontWeight: '500',
          }}
        >
          {category}
        </Text>

        <Text
          style={{
            color: '#fff',
            fontSize: 18,
            fontWeight: 'bold',
            marginBottom: 8,
          }}
        >
          {title}
        </Text>

        <Text
          style={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: 12,
            lineHeight: 16,
          }}
        >
          {description}
        </Text>
      </View>

      {/* Icono en la esquina superior derecha */}
      <View
        style={{
          position: 'absolute',
          top: 8,
          right: 12,
          backgroundColor: '#e85b04ff',
          padding: 8,
          borderRadius: 20,
        }}
      >
        <Icon size={20} color="#fff" />
      </View>
    </TouchableOpacity>
  );
};

export default OptionCard;