import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  ScrollView,
  Platform,
} from 'react-native';
import React from 'react';
import {
  ChevronLeft,
  Phone,
  Mail,
  Globe,
  Clock,
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
import { styles } from '../../../styles/central';
import LinearGradient from 'react-native-linear-gradient';

const Central = () => {
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

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleEmail = () => {
    Linking.openURL('mailto:cmyg@velsat.com.pe');
  };

  const handleWebsite = () => {
    Linking.openURL('https://www.velsat.com.pe');
  };

const topSpace = Platform.OS === 'ios' ? insets.top -5 : insets.top + 5;

  const phoneNumbers = [
    { id: 1, number: '989112975' },
    { id: 2, number: '952075325' },
  ];

  return (
    <LinearGradient
      colors={['#021e4bff', '#183890ff', '#032660ff']}
      style={[styles.container, { paddingBottom: bottomSpace }]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <View style={[styles.header, { paddingTop: topSpace }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton} activeOpacity={0.7}>
            <ChevronLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerMainTitle}>Central de Monitoreo y Gestión</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.contentContainer}>
         

          {/* Phone Numbers Section */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Números de Contacto</Text>
            {phoneNumbers.map((phone) => (
              <TouchableOpacity
                key={phone.id}
                style={styles.contactRow}
                onPress={() => handleCall(phone.number)}
                activeOpacity={0.7}
              >
                <View style={styles.iconContainer}>
                  <Phone size={20} color="#1e3a8a" />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactLabel}>Celular</Text>
                  <Text style={styles.contactValue}>{phone.number}</Text>
                </View>
                <View style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>Llamar</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Email Section */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Correo Electrónico</Text>
            <TouchableOpacity
              style={styles.contactRow}
              onPress={handleEmail}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <Mail size={20} color="#1e3a8a" />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>E-mail</Text>
                <Text style={styles.contactValue}>cmyg@velsat.com.pe</Text>
              </View>
              <View style={styles.actionButton}>
                <Text style={styles.actionButtonText}>Enviar</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Website Section */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Sitio Web</Text>
            <TouchableOpacity
              style={styles.contactRow}
              onPress={handleWebsite}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <Globe size={20} color="#1e3a8a" />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Web</Text>
                <Text style={styles.contactValue}>www.velsat.com.pe</Text>
              </View>
              <View style={styles.actionButton}>
                <Text style={styles.actionButtonText}>Visitar</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Schedule Info */}
          <View style={styles.scheduleCard}>
            <View style={styles.scheduleHeader}>
              <Clock size={22} color="#e36414" />
              <Text style={styles.scheduleTitle}>Horario de Atención</Text>
            </View>
            <Text style={styles.scheduleText}>
              Nuestra atención es de lunes a domingo, las 24 horas, los 365 días del año.
            </Text>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default Central;