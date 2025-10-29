import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import NavigationBarColor from 'react-native-navigation-bar-color';
import { useFocusEffect } from '@react-navigation/native';
import Accordion from '../../../components/Accordion';
import { RootStackParamList } from '../../../../App';
import {
  getBottomSpace,
  useNavigationMode,
} from '../../../hooks/useNavigationMode';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

const FAQ = () => {
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

  const faqData: FAQItem[] = [
    {
      id: 1,
      question: '¿Cómo cambiar mi contraseña?',
      answer:
        'En la sección de Perfil < Configuración < Cambiar contraseña, después de verificar que su usuario sea el correcto, podrá establecer la contraseña de su preferencia.',
    },
    {
      id: 2,
      question: '¿Cómo agregar una nueva unidad a mi cuenta?',
      answer:
        'Por el momento no es posible hacerlo directamente desde el aplicativo; si desea hacerlo, por favor contactar con nuestra central de monitoreo y gestión.',
    },
    {
      id: 3,
      question: '¿Cómo generar un reporte de movimientos y/o de ubicación?',
      answer:
        'El reporte general y el reporte detalle recorrido son muy útiles para visualizar el historial de movimientos de cada una de sus unidades.',
    },
    {
      id: 4,
      question: '¿Cómo contactar al soporte técnico si tengo un problema con mi unidad?',
      answer:
        'En la sección de Ayuda, puede encontrar todos nuestro números celulares, correo y página web para atender cualquier solicitud que tenga.',
    },
    {
      id: 5,
      question: '¿Cómo ver los servicios y detalles del mismo que me han sido asignados?',
      answer:
        'En la sección de Servicios, podrá revisar sus servicios programados en las próximas 24 horas, y al presionar en cada uno podrá revisar horarios, destinos, pasajeros y más de cada servicio.',
    },
    {
      id: 6,
      question: '¿Qué hacer si no puedo cumplir con un servicio asignado?',
      answer:
        'Por el momento no hay ninguna opción desde el aplicativo para manejar este escenario, tendrá que contactarse con su proveedor del servicio.',
    },
    {
      id: 7,
      question: '¿Qué hacer si tengo problemas con la información del servicio en la app?',
      answer:
        'La aplicación muestra los servicios previamente programados por su proveedor; por lo que, si hay algún error, tendrá que contactarse con su proveedor del servicio.',
    },
    {
      id: 8,
      question: '¿Cómo ver los servicios y detalles del mismo que me han sido programados?',
      answer:
        'En la sección de Servicios, podrá revisar sus servicios programados en las próximas 24 horas, y al presionar en cada uno podrá revisar horarios, destinos, conductor, unidad y más de cada servicio.',
    },
    {
      id: 9,
      question: '¿Qué debo hacer si el conductor no llega a la hora programada?',
      answer:
        'Puede optar por la opción de llamar al conductor que se encuentra en la parte final del detalle del servicio, al cual se accede presionando en cada servicio. Si a pesar de esto, el conductor no llega o simplemente no responde, tendrá que contactarse con su proveedor del servicio.',
    },
    {
      id: 10,
      question: '¿Cómo puedo cancelar un servicio ya programado?',
      answer:
        'El botón de Cancelar Servicio, se encuentra en la parte final del detalle del servicio, al cual se accede presionando en cada servicio.',
    }
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
          <TouchableOpacity
            onPress={handleGoBack}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <ChevronLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerMainTitle}>Preguntas frecuentes</Text>
        </View>
        <View style={styles.headerBottom}>
          <Text style={styles.headerTitle}>Centro de ayuda</Text>
          <Text style={styles.headerSubtitle}>
            Encuentra respuestas a las preguntas más comunes sobre el uso de la
            aplicación y nuestros servicios.
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.accordionContainer}>
          {faqData.map((item, index) => (
            <Accordion
              key={item.id}
              title={item.question}
              content={item.answer}
              iconColor="#1e3a8a"
              borderColor="#E2E8F0"
              isFirst={index === 0}
              isLast={index === faqData.length - 1}
            />
          ))}
        </View>

        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>¿No encontraste tu respuesta?</Text>
          <Text style={styles.contactText}>
            Nuestro equipo está disponible para ayudarte
          </Text>
          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => navigation.navigate('Central')}
          >
            <Text style={styles.contactButtonText}>Contactar con soporte</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 10,
  },
  backButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerMainTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 15,
  },
  headerBottom: {
    marginTop: 5,
    marginLeft: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E3F2FD',
    lineHeight: 20,
    opacity: 0.9,
  },
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  accordionContainer: {
    marginBottom: 20,
  },
  contactSection: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 10,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 8,
    textAlign: 'center',
  },
  contactText: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 16,
    textAlign: 'center',
  },
  contactButton: {
    backgroundColor: '#1e3a8a',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default FAQ;