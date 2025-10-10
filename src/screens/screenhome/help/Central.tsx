import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import React from 'react';
import {
  ChevronLeft,
  Phone,
  User,
  Clock,
  Calendar,
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

interface ContactPerson {
  id: number;
  name: string;
  schedule: string;
  hours: string;
  extraInfo?: string;
  phone: string;
  avatar: string;
}

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

  const contacts: ContactPerson[] = [
    {
      id: 1,
      name: 'Karolinth Montalvo',
      schedule: 'Lunes a Sábado',
      hours: '6:00 AM - 2:00 PM',
      phone: '989112975',
      avatar: '👩',
    },
    {
      id: 2,
      name: 'Yerson Monsalve',
      schedule: 'Lunes a Sábado',
      hours: '2:00 PM - 10:00 PM',
      phone: '914698905',
      avatar: '👨',
    },
    {
      id: 3,
      name: 'Willy Ruiz',
      schedule: 'Lunes a Sábado',
      hours: '10:00 PM - 6:00 AM',
      extraInfo: 'Domingos y feriados todo el día',
      phone: '983287180',
      avatar: '👨',
    },
  ];

  const topSpace = insets.top + 5;

  return (
    <LinearGradient
      colors={['#00296b', '#1e3a8a', '#00296b']}
      style={[styles.container, { paddingBottom: bottomSpace }]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <View style={[styles.header, { paddingTop: topSpace }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <ChevronLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerMainTitle}>Central</Text>
        </View>
        <View style={styles.headerBottom}>
          <Text style={styles.headerTitle}>Central de Atención</Text>
          <Text style={styles.headerSubtitle}>
            Contacta con nuestros operadores disponibles
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.contentList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View style={styles.formContainer}>
          {contacts.map((contact, index) => (
            <View key={contact.id} style={styles.contactCard}>
              {/* Header de la tarjeta */}
              <View style={styles.cardHeader}>
                <View style={styles.avatarSection}>
                  <View style={styles.avatarCircle}>
                    <User size={28} color="#1e3a8a" strokeWidth={2} />
                  </View>
                  <View style={styles.statusIndicator}>
                    <View style={styles.statusDot} />
                    <Text style={styles.statusText}>Disponible</Text>
                  </View>
                </View>
                <View style={styles.nameSection}>
                  <Text style={styles.contactName}>{contact.name}</Text>
                  <Text style={styles.operatorLabel}>Operador de turno</Text>
                </View>
              </View>

              {/* Divisor */}
              <View style={styles.divider} />

              {/* Información de horario */}
              <View style={styles.scheduleSection}>
                <View style={styles.scheduleItem}>
                  <View style={styles.iconWrapper}>
                    <Calendar size={18} color="#1e3a8a" />
                  </View>
                  <View style={styles.scheduleTextContainer}>
                    <Text style={styles.scheduleLabel}>Días</Text>
                    <Text style={styles.scheduleValue}>{contact.schedule}</Text>
                  </View>
                </View>

                <View style={styles.scheduleItem}>
                  <View style={styles.iconWrapper}>
                    <Clock size={18} color="#1e3a8a" />
                  </View>
                  <View style={styles.scheduleTextContainer}>
                    <Text style={styles.scheduleLabel}>Horario</Text>
                    <Text style={styles.scheduleValue}>{contact.hours}</Text>
                  </View>
                </View>
              </View>

              {/* Información extra */}
              {contact.extraInfo && (
                <View style={styles.extraInfoContainer}>
                  <Text style={styles.extraInfoText}>{contact.extraInfo}</Text>
                </View>
              )}

              {/* Footer con teléfono y botón */}
              <View style={styles.cardFooter}>
                <View style={styles.phoneInfo}>
                  <Text style={styles.phoneNumber}>{contact.phone}</Text>
                </View>
                <TouchableOpacity
                  style={styles.callButton}
                  onPress={() => handleCall(contact.phone)}
                  activeOpacity={0.8}
                >
                  <Phone size={20} color="#FFFFFF" />
                  <Text style={styles.callButtonText}>Llamar</Text>
                </TouchableOpacity>
              </View>

            </View>
          ))}

          {/* Información adicional */}
          <View style={styles.infoCard}>
            <View style={styles.infoIconContainer}>
              <Phone size={20} color="#1e3a8a" />
            </View>
            <Text style={styles.infoTitle}>Atención 24/7</Text>
            <Text style={styles.infoDescription}>
              Nuestro equipo está disponible para atenderte en los horarios indicados.
              Para emergencias, siempre tendrás un operador disponible.
            </Text>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default Central;