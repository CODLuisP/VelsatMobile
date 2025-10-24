import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  Phone,
  User,
  Clock,
  Calendar,
  AlertCircle,
  RefreshCw,
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
import axios from 'axios';

interface ContactPerson {
  id: number;
  nombres: string;
  telefono: string;
  tmañana: boolean;
  ttarde: boolean;
  tnoche: boolean;
  tcompleto: boolean;
  habilitado: boolean;
}

interface ProcessedContact extends ContactPerson {
  isCurrentShift: boolean;
  schedule: string;
  hours: string;
  extraInfo?: string;
}

const Central = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const navigationDetection = useNavigationMode();
  const bottomSpace = getBottomSpace(
    insets,
    navigationDetection.hasNavigationBar,
  );

  const [contacts, setContacts] = useState<ProcessedContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      NavigationBarColor('#00296b', false);
    }, []),
  );

  // Función para obtener el turno actual
  const getCurrentShift = (): 'mañana' | 'tarde' | 'noche' => {
    const now = new Date();
    const hours = now.getHours();

    if (hours >= 6 && hours < 14) {
      return 'mañana';
    } else if (hours >= 14 && hours < 22) {
      return 'tarde';
    } else {
      return 'noche';
    }
  };

  // Función para obtener la información del horario según el turno
  const getShiftInfo = (contact: ContactPerson) => {
    let schedule = '';
    let hours = '';
    let extraInfo = '';

    if (contact.tcompleto) {
      schedule = 'Domingos y feriados';
      hours = 'Todo el día';
      extraInfo = 'Disponible en horarios especiales';
    } else if (contact.tmañana) {
      schedule = 'Lunes a Sábado';
      hours = '6:00 AM - 2:00 PM';
    } else if (contact.ttarde) {
      schedule = 'Lunes a Sábado';
      hours = '2:00 PM - 10:00 PM';
    } else if (contact.tnoche) {
      schedule = 'Lunes a Sábado';
      hours = '10:00 PM - 6:00 AM';
    }

    return { schedule, hours, extraInfo };
  };

  // Función para verificar si está en su turno actual
  const isInCurrentShift = (contact: ContactPerson): boolean => {
    const currentShift = getCurrentShift();

    if (currentShift === 'mañana') {
      return contact.tmañana;
    } else if (currentShift === 'tarde') {
      return contact.ttarde;
    } else {
      return contact.tnoche || contact.tcompleto;
    }
  };

  // Función para obtener los contactos de la API
  const fetchContacts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get<ContactPerson[]>(
        'https://velsat.pe:2087/api/Aplicativo/central',
        {
          timeout: 10000, // 10 segundos de timeout
        }
      );

      // Filtrar solo los habilitados y procesarlos
      const enabledContacts = response.data.filter(
        (contact) => contact.habilitado
      );

      // Procesar los contactos y añadir información adicional
      const processedContacts: ProcessedContact[] = enabledContacts.map(
        (contact) => {
          const shiftInfo = getShiftInfo(contact);
          return {
            ...contact,
            isCurrentShift: isInCurrentShift(contact),
            schedule: shiftInfo.schedule,
            hours: shiftInfo.hours,
            extraInfo: shiftInfo.extraInfo || undefined,
          };
        }
      );

      // Ordenar: primero el que está en turno actual
      const sortedContacts = processedContacts.sort((a, b) => {
        if (a.isCurrentShift && !b.isCurrentShift) return -1;
        if (!a.isCurrentShift && b.isCurrentShift) return 1;
        return 0;
      });

      setContacts(sortedContacts);
    } catch (error) {
      console.error('Error al obtener contactos:', error);
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          setError('Tiempo de espera agotado. Por favor, verifica tu conexión.');
        } else if (error.response) {
          setError(`Error del servidor: ${error.response.status}`);
        } else if (error.request) {
          setError('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
        } else {
          setError('Ocurrió un error al cargar los operadores.');
        }
      } else {
        setError('Ocurrió un error inesperado.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleCall = (phone: string, isCurrentShift: boolean) => {
    if (isCurrentShift) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  const handleRetry = () => {
    fetchContacts();
  };

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
          {loading ? (
            <View style={{ paddingVertical: 80, alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#e36414" />
              <Text style={{ color: '#1c1b1bff', marginTop: 16, fontSize: 14 }}>
                Cargando operadores...
              </Text>
            </View>
          ) : error ? (
            <View style={{ paddingVertical: 60, alignItems: 'center', paddingHorizontal: 20 }}>
              <View style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderRadius: 50,
                padding: 16,
                marginBottom: 0,
              }}>
                <AlertCircle size={48} color="#ef4444" />
              </View>
              <Text style={{
                color: '#FFFFFF',
                fontSize: 18,
                fontWeight: '600',
                marginBottom: 8,
                textAlign: 'center',
              }}>
                Error al cargar
              </Text>
              <Text style={{
                color: '#131212ff',
                fontSize: 14,
                textAlign: 'center',
                marginBottom: 24,
                opacity: 0.8,
              }}>
                {error}
              </Text>

            </View>
          ) : (
            <>
              {contacts.map((contact, index) => (
                <View key={contact.id} style={styles.contactCard}>
                  {/* Header de la tarjeta */}
                  <View style={styles.cardHeader}>
                    <View style={styles.avatarSection}>
                      <View style={styles.avatarCircle}>
                        <User size={28} color="#1e3a8a" strokeWidth={2} />
                      </View>
                      <View style={styles.statusIndicator}>
                        <View
                          style={[
                            styles.statusDot,
                            {
                              backgroundColor: contact.isCurrentShift
                                ? '#38b000'
                                : '#c2354dff',
                            },
                          ]}
                        />
                        <Text
                          style={[
                            styles.statusText,
                            { color: contact.isCurrentShift ? '#38b000' : '#c6465bff' }
                          ]}
                        >
                          {contact.isCurrentShift ? 'Disponible' : 'Fuera de turno'}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.nameSection}>
                      <Text style={styles.contactName}>{contact.nombres}</Text>
                      <Text style={styles.operatorLabel}>
                        {contact.isCurrentShift
                          ? 'Operador de turno'
                          : 'Próximo turno'}
                      </Text>
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
                      <Text style={styles.phoneNumber}>{contact.telefono}</Text>
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.callButton,
                        {
                          opacity: contact.isCurrentShift ? 1 : 0.5,
                          backgroundColor: contact.isCurrentShift
                            ? '#e36414'
                            : '#6b7280',
                        },
                      ]}
                      onPress={() => handleCall(contact.telefono, contact.isCurrentShift)}
                      activeOpacity={contact.isCurrentShift ? 0.8 : 1}
                      disabled={!contact.isCurrentShift}
                    >
                      <Phone size={20} color="#FFFFFF" />
                      <Text style={styles.callButtonText}>
                        {contact.isCurrentShift ? 'Llamar' : 'No disponible'}
                      </Text>
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
                  Nuestro equipo está disponible para atenderte en los horarios
                  indicados. Para emergencias, siempre tendrás un operador disponible.
                </Text>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default Central;