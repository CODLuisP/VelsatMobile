import { View, Text, ScrollView, TouchableOpacity, Linking } from 'react-native';
import React from 'react';
import {
  Headphones,
  MessageCircle,
  HelpCircle,
  Play,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';

import NavigationBarColor from 'react-native-navigation-bar-color';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../../../App';
import { getBottomSpace, useNavigationMode } from '../../../hooks/useNavigationMode';
import { styles } from '../../../styles/help';

// Interfaz para las opciones de ayuda
interface HelpOption {
  id: number;
  title: string;
  subtitle: string;
  icon: any;
  color: string;
  backgroundColor: string;
  borderColor: string;
  action: string;
}

const Help = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const insets = useSafeAreaInsets();
  const navigationDetection = useNavigationMode();
  const bottomSpace = getBottomSpace(
    insets,
    navigationDetection.hasNavigationBar,
  );

  useFocusEffect(
    React.useCallback(() => {
      NavigationBarColor('#1e3a8a', false);
    }, []),
  );

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleOptionPress = (option: HelpOption) => {
    // Aquí puedes manejar las diferentes acciones
    switch (option.action) {
      case 'contact':
        // Navegar a contacto o abrir llamada
        console.log('Contactar central');
        break;
      case 'whatsapp':
        // Abrir WhatsApp
        console.log('Abrir WhatsApp');
        break;
      case 'faq':
        // Navegar a preguntas frecuentes
        console.log('Ver FAQ');
        break;
      case 'tutorials':
        // Navegar a video tutoriales
        console.log('Ver tutoriales');
        break;
      default:
        break;
    }
  };

  const handleWebsitePress = () => {

    Linking.openURL('https://velsat.com.pe/');
  };

  const helpOptions: HelpOption[] = [
    {
      id: 1,
      title: 'Contacta con nuestra central',
      subtitle: 'Resuelve todas tus consultas',
      icon: Headphones,
      color: '#FF6B6B',
      backgroundColor: '#FFFBFB',
      borderColor: '#FF6B6B',
      action: 'contact',
    },
    {
      id: 2,
      title: 'Chatea por WhatsApp',
      subtitle: 'Realiza tus consultas por chat',
      icon: MessageCircle,
      color: '#25D366',
      backgroundColor: '#F8FFF8',
      borderColor: '#25D366',
      action: 'whatsapp',
    },
    {
      id: 3,
      title: 'Preguntas frecuentes',
      subtitle: 'Revisa consultas recurrentes',
      icon: HelpCircle,
      color: '#4ECDC4',
      backgroundColor: '#F8FFFE',
      borderColor: '#4ECDC4',
      action: 'faq',
    },
    {
      id: 4,
      title: 'Videos tutoriales',
      subtitle: 'Observa guías visuales y vídeos',
      icon: Play,
      color: '#FF8C42',
      backgroundColor: '#FFF8F3',
      borderColor: '#FF8C42',
      action: 'tutorials',
    },
  ];

  return (
    <View style={[styles.container, { paddingBottom: bottomSpace }]}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <ChevronLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerMainTitle}>Ayuda</Text>
        </View>
        <View style={styles.headerBottom}>
          <Text style={styles.headerTitle}>Centro de soporte</Text>
          <Text style={styles.headerSubtitle}>
            Encuentra la ayuda que necesitas. Contáctanos, consulta nuestras
            guías o revisa las preguntas más frecuentes.
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.optionsList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View style={styles.formContainer}>
          <View style={styles.gridContainer}>
            {helpOptions.map((option, index) => {
              const IconComponent = option.icon;
              return (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.optionCard,
                    {
                      backgroundColor: option.backgroundColor,
                      borderColor: option.borderColor,
                    },
                  ]}
                  activeOpacity={0.8}
                  onPress={() => handleOptionPress(option)}
                >
                  <View style={styles.cardContent}>
                    <View
                      style={[
                        styles.iconContainer,
                        {
                          backgroundColor: `${option.color}15`, // Fondo con opacidad
                          borderColor: `${option.color}30`, // Borde con opacidad
                        },
                      ]}
                    >
                      <IconComponent size={25} color={option.color} />
                    </View>
                    <Text style={styles.optionTitle}>{option.title}</Text>
                    <Text style={styles.optionSubtitle}>{option.subtitle}</Text>

                    {/* Línea decorativa centrada */}
                    <View style={[styles.decorativeLine, { backgroundColor: option.color }]} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>


          <View style={styles.infoSection}>
            <View style={styles.infoIconContainer}>
              <HelpCircle size={24} color="#6C7B7F" />
            </View>
            <Text style={styles.infoTitle}>Conoce más sobre nosotros</Text>
            <Text style={styles.infoText}>
              Descubre todos nuestros servicios de monitoreo{'\n'}
              y soluciones tecnológicas disponibles
            </Text>
            <TouchableOpacity style={styles.websiteButton} onPress={handleWebsitePress}>
              <Text style={styles.websiteButtonText}>Visita velsat.com.pe</Text>
            </TouchableOpacity>
          </View>
        </View>


      </ScrollView>
    </View>
  );
};

export default Help;