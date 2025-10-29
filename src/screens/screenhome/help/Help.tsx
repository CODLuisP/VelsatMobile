import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
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
import {
  getBottomSpace,
  useNavigationMode,
} from '../../../hooks/useNavigationMode';
import { styles } from '../../../styles/help';
import LinearGradient from 'react-native-linear-gradient';

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
  fullWidth?: boolean; 
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
      NavigationBarColor('#00296b', false);
    }, []),
  );

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleCentral = () => {
    navigation.navigate('Central');
  };

  const handleWhatsAppPress = () => {
    const phoneNumber = '51983287180'; // Número con código de país (51 para Perú)
    const message = 'Hola, somos de Velsat Monitoreo. ¿En qué podemos ayudarte?';
    const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
    
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          // Opción alternativa: abrir en el navegador
          const webUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
          return Linking.openURL(webUrl);
        }
      })
  };

  const handleWebsitePress = () => {
    Linking.openURL('https://velsat.com.pe/');
  };

  const handleOptionPress = (option: HelpOption) => {
    // Aquí puedes manejar las diferentes acciones
    switch (option.action) {
      case 'contact':
        handleCentral();
        break;
      case 'whatsapp':
        handleWhatsAppPress();
        break;
      case 'faq':
        navigation.navigate('FAQ'); // 👈 Navegar a FAQ
      break;
      case 'tutorials':
        // Navegar a video tutoriales
        break;
      default:
        break;
    }
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
    // {
    //   id: 2,
    //   title: 'Chatea por WhatsApp',
    //   subtitle: 'Realiza tus consultas por chat',
    //   icon: MessageCircle,
    //   color: '#25D366',
    //   backgroundColor: '#F8FFF8',
    //   borderColor: '#25D366',
    //   action: 'whatsapp',
    // },
    {
      id: 2,
      title: 'Preguntas frecuentes',
      subtitle: 'Revisa consultas recurrentes',
      icon: HelpCircle,
      color: '#4ECDC4',
      backgroundColor: '#F8FFFE',
      borderColor: '#4ECDC4',
      action: 'faq',
    },
    {
      id: 3,
      title: 'Videos tutoriales',
      subtitle: 'Observa guías visuales y vídeos',
      icon: Play,
      color: '#FF8C42',
      backgroundColor: '#FFF8F3',
      borderColor: '#FF8C42',
      action: 'tutorials',
      fullWidth: true,
    },
  ];

const topSpace = Platform.OS === 'ios' ? insets.top -5 : insets.top + 5;

  return (
    <LinearGradient
      colors={['#021e4bff', '#183890ff', '#032660ff']}
      style={[styles.container, { paddingBottom: bottomSpace - 2 }]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <View style={[styles.header, { paddingTop: topSpace }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton} activeOpacity={0.7}>
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
                  option.fullWidth && styles.optionCardFull,

                  ]}
                  activeOpacity={0.8}
                  onPress={() => handleOptionPress(option)}
                >
                  <View style={styles.cardContent}>
                    <View
                      style={[
                        styles.iconContainer,
                        {
                          backgroundColor: `${option.color}15`, 
                          borderColor: `${option.color}30`, 
                        },
                      ]}
                    >
                      <IconComponent size={25} color={option.color} />
                    </View>
                    <Text style={styles.optionTitle}>{option.title}</Text>
                    <Text style={styles.optionSubtitle}>{option.subtitle}</Text>

                    {/* Línea decorativa centrada */}
                    <View
                      style={[
                        styles.decorativeLine,
                        { backgroundColor: option.color },
                      ]}
                    />
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
              Descubre todos nuestros servicios de monitoreo{'\n'}y soluciones
              tecnológicas disponibles
            </Text>
            <TouchableOpacity
              style={styles.websiteButton}
              onPress={handleWebsitePress}
            >
              <Text style={styles.websiteButtonText}>Visita velsat.com.pe</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default Help;