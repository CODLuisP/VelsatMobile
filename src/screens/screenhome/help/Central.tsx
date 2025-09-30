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
      NavigationBarColor('#1e3a8a', false);
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
      schedule: 'De Lunes a Sábado',
      hours: '6:00 AM - 2:00 PM',
      phone: '989112975',
      avatar: '👩',
    },
    {
      id: 2,
      name: 'Yerson Monsalve',
      schedule: 'De Lunes a Sábado',
      hours: '2:00 PM - 10:00 PM',
      phone: '914698905',
      avatar: '👨',
    },
    {
      id: 3,
      name: 'Willy Ruiz',
      schedule: 'De Lunes a Sábado',
      hours: '10:00 PM - 6:00 AM',
      extraInfo: 'Domingos y feriados\nTodo el día',
      phone: '983287180',
      avatar: '👨',
    },
  ];

  const topSpace = insets.top + 5;

  return (
    <View style={[styles.container, { paddingBottom: bottomSpace }]}>
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
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View style={styles.formContainer}>
          {contacts.map((contact, index) => (
            <View
              key={contact.id}
              style={[
                styles.contactCard,
                index === contacts.length - 1 && styles.lastContactCard,
              ]}
            >
              <View style={styles.contactContent}>
                <View style={styles.avatarContainer}>
                  <View style={styles.avatarCircle}>
                    <User size={32} color="#1e3a8a" strokeWidth={1.5} />
                  </View>
                  <View style={styles.statusDot} />
                </View>

                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{contact.name}</Text>
                  
                  <View style={styles.scheduleContainer}>
                    <Clock size={14} color="#718096" />
                    <Text style={styles.scheduleText}>{contact.schedule}</Text>
                  </View>
                  
                  <Text style={styles.hoursText}>{contact.hours}</Text>
                  
                  {contact.extraInfo && (
                    <Text style={styles.extraInfoText}>{contact.extraInfo}</Text>
                  )}
                  
                  <View style={styles.phoneContainer}>
                    <Phone size={14} color="#1e3a8a" />
                    <Text style={styles.phoneText}>{contact.phone}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.callButton}
                  onPress={() => handleCall(contact.phone)}
                  activeOpacity={0.7}
                >
                  <Phone size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          <View style={styles.infoFooter}>
            <Text style={styles.infoFooterText}>
              Nuestro equipo está disponible para atenderte.{'\n'}
              Llama en el horario correspondiente.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default Central;