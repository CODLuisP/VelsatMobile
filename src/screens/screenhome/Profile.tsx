import React, { useEffect, useState } from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import {
  ChevronLeft,
  Info,
  Settings,
  LogOut,
  User,
  Clipboard,
  Smartphone,
  Megaphone,
  Pin,
  Mail,
  Building2,
  IdCard,
  AtSign,
  LucideIcon,
} from 'lucide-react-native';
import { styles } from '../../styles/profile';
import { useAuthStore } from '../../store/authStore';
import {
  NavigationProp,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import { RootStackParamList } from '../../../App';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import NavigationBarColor from 'react-native-navigation-bar-color';
import {
  getBottomSpace,
  useNavigationMode,
} from '../../hooks/useNavigationMode';
import { toUpperCaseText } from '../../utils/textUtils';
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios';
import { Text } from '../../components/ScaledComponents';

interface UserDetailsResponse {
  accountID: string | null;
  password: string | null;
  description: string | null;
  ruc: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  codigo: string | null;
  apellidos: string | null;
  dni: string | null;
  telefono: string | null;
  codlan: string | null;
  empresa: string | null;
  nombres: string | null;
  login: string | null;
}

const Profile = () => {
  const { user, logout, server, tipo } = useAuthStore();
  const [userDetails, setUserDetails] = useState<UserDetailsResponse | null>(
    null,
  );
  const [loading, setLoading] = useState<boolean>(false);

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const insets = useSafeAreaInsets();

  const navigationDetection = useNavigationMode();

  const bottomSpace = getBottomSpace(
    insets,
    navigationDetection.hasNavigationBar,
  );

  useFocusEffect(
    React.useCallback(() => {
      NavigationBarColor('#eef1f6', true);
    }, []),
  );

  useEffect(() => {
    const fetchUserDetails = async () => {
      if ((tipo === 'n' || tipo === 'c' || tipo === 'p' || tipo === 't') && user?.username) {
        setLoading(true);
        try {
          const response = await axios.get<UserDetailsResponse>(
            `${server}/api/User/MobileDetailsUser?accountID=${user.username}&tipo=${tipo}`,
          );
          setUserDetails(response.data);
        } catch (error) {
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserDetails();
  }, [tipo, user?.username]);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleLogout = () => {
    logout();
  };

  const handleSettings = () => {
    navigation.navigate('Setting');
  };

  const handlePin = () => {
    navigation.navigate('Pin');
  };

  const handleNotifications = () => {
    navigation.navigate('Notifications');
  };

  const topSpace = insets.top + 10;

  const shouldShowMarkerAndNotifications = tipo === 'n';
  const shouldShowSettings = tipo !== 'c' && tipo !== 'p' && tipo !== 't';
  const shouldShowGeneral =
    shouldShowSettings || shouldShowMarkerAndNotifications;

  const getFirstEmail = (emailString: string | null | undefined): string => {
    if (!emailString || emailString.trim() === '') return '';
    const emails = emailString.split(';');
    return emails[0].trim();
  };

  const getFullName = (
    apellidos: string | null | undefined,
    nombres: string | null | undefined,
  ): string => {
    const parts = [];
    if (apellidos) parts.push(apellidos.trim());
    if (nombres) parts.push(nombres.trim());
    return parts.join(' ');
  };

  const getLast8Digits = (codlan: string | null | undefined): string => {
    if (!codlan) return '';
    const digits = codlan.replace(/\D/g, '');
    return digits.length >= 8 ? digits.slice(-8) : digits;
  };

  type InfoRow = {
    key: string;
    Icon: LucideIcon;
    label: string;
    value: string | null | undefined;
  };

  const buildInfoRows = (): InfoRow[] => {
    let rows: InfoRow[] = [];

    if (tipo === 'n' && userDetails) {
      rows = [
        {
          key: 'nombre',
          Icon: Building2,
          label: 'Razón social',
          value: userDetails.description,
        },
        { key: 'ruc', Icon: IdCard, label: 'RUC', value: userDetails.ruc },
        {
          key: 'email',
          Icon: Mail,
          label: 'Correo',
          value: getFirstEmail(userDetails.contactEmail),
        },
        {
          key: 'telefono',
          Icon: Smartphone,
          label: 'Celular',
          value: userDetails.contactPhone,
        },
      ];
    } else if ((tipo === 'c' || tipo === 't') && userDetails) {
      rows = [
        {
          key: 'nombre',
          Icon: User,
          label: 'Nombres',
          value: getFullName(userDetails.apellidos, userDetails.nombres),
        },
        { key: 'dni', Icon: IdCard, label: 'DNI', value: userDetails.dni },
        {
          key: 'telefono',
          Icon: Smartphone,
          label: 'Celular',
          value: userDetails.telefono,
        },
        {
          key: 'login',
          Icon: AtSign,
          label: 'Usuario',
          value: userDetails.login,
        },
      ];
    } else if (tipo === 'p' && userDetails) {
      rows = [
        {
          key: 'nombre',
          Icon: User,
          label: 'Nombres',
          value: getFullName(userDetails.apellidos, userDetails.nombres),
        },
        {
          key: 'dni',
          Icon: IdCard,
          label: 'DNI',
          value: getLast8Digits(userDetails.codlan),
        },
        {
          key: 'telefono',
          Icon: Smartphone,
          label: 'Celular',
          value: userDetails.telefono,
        },
        {
          key: 'codlan',
          Icon: AtSign,
          label: 'Usuario',
          value: userDetails.codlan,
        },
        {
          key: 'empresa',
          Icon: Building2,
          label: 'Empresa',
          value: userDetails.empresa,
        },
      ];
    } else if (tipo === 'n' || tipo === 'c' || tipo === 'p' || tipo === 't') {
      rows = [
        {
          key: 'nombre',
          Icon: tipo === 'n' ? Building2 : User,
          label: tipo === 'n' ? 'Razón social' : 'Nombres',
          value: user?.description,
        },
      ];
    }

    return rows.filter(row => !!row.value && row.value.trim() !== '');
  };

  const infoRows = buildInfoRows();
  const showInfoSection = loading || infoRows.length > 0;

  return (


    
  <View style={[styles.container, { paddingBottom: bottomSpace  }]}>

      {/* Header */}
    <LinearGradient
         colors={['#05194fff', '#05194fff', '#18223dff']}
       start={{ x: 0, y: 0 }}
       end={{ x: 0, y: 1 }}
         style={[styles.header, { paddingTop: topSpace }]}
       >

        <TouchableOpacity
          style={[styles.backButton, { top: insets.top + 10 }]}
          onPress={handleGoBack}
          activeOpacity={0.7}
        >
          <ChevronLeft size={26} color="#fff" />
        </TouchableOpacity>

        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Image
              source={require('../../../assets/logo.png')}
              style={styles.avatarImage}
            />
          </View>
        </View>

        <Text style={styles.companyNameTitle}>
          {toUpperCaseText(user?.description || user?.name || 'Usuario')}
        </Text>

        {showInfoSection && (
          <View style={styles.infoSection}>
            <View style={styles.infoHeader}>
              <View style={styles.infoAccent} />
              <Text style={styles.infoTitle}>Información</Text>
            </View>

            {loading ? (
              <View style={styles.infoLoading}>
                <ActivityIndicator size="small" color="#e36414" />
              </View>
            ) : (
              <View style={styles.infoContent}>
                {infoRows.map(({ key, Icon, label, value }, index) => (
                  <View key={key}>
                    {index > 0 && <View style={styles.infoDivider} />}
                    <View style={styles.infoItem}>
                      <View style={styles.infoIcon}>
                        <Icon size={12} color="#1e3a8a" />
                      </View>
                      <Text style={styles.infoLabel}>{label}</Text>
                      <Text style={styles.infoText} numberOfLines={1}>
                        {value}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        
      </LinearGradient>

      {/* Information Section */}
     

      {/* Menú */}
      <View style={styles.scrollContent}>
        <View style={styles.scrollContentContainer}>
          {shouldShowGeneral && (
            <View style={styles.menuSection}>
              <Text style={styles.sectionTitle}>GENERAL</Text>

              <View style={styles.menuCard}>
                {shouldShowSettings && (
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={handleSettings}
                    activeOpacity={0.7}
                  >
                    <View style={styles.iconContainer}>
                      <Settings size={19} color="#e36414" />
                    </View>
                    <View style={styles.menuTextContainer}>
                      <Text style={styles.menuText}>Configuración</Text>
                      <Text style={styles.menuSubtext}>
                        Ajustes de la aplicación
                      </Text>
                    </View>
                    <ChevronLeft
                      size={18}
                      color="#c3cbd8"
                      style={styles.chevronRight}
                    />
                  </TouchableOpacity>
                )}

                {shouldShowMarkerAndNotifications && (
                  <>
                    {shouldShowSettings && <View style={styles.menuDivider} />}

                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={handlePin}
                      activeOpacity={0.7}
                    >
                      <View style={styles.iconContainer}>
                        <Pin size={19} color="#e36414" />
                      </View>
                      <View style={styles.menuTextContainer}>
                        <Text style={styles.menuText}>Marcadores</Text>
                        <Text style={styles.menuSubtext}>
                          Contenido guardado
                        </Text>
                      </View>
                      <ChevronLeft
                        size={18}
                        color="#c3cbd8"
                        style={styles.chevronRight}
                      />
                    </TouchableOpacity>

                    <View style={styles.menuDivider} />

                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={handleNotifications}
                      activeOpacity={0.7}
                    >
                      <View style={styles.iconContainer}>
                        <Megaphone size={19} color="#e36414" />
                      </View>
                      <View style={styles.menuTextContainer}>
                        <Text style={styles.menuText}>Notificaciones</Text>
                        <Text style={styles.menuSubtext}>Alertas y avisos</Text>
                      </View>
                      <ChevronLeft
                        size={18}
                        color="#c3cbd8"
                        style={styles.chevronRight}
                      />
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          )}

          <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>CUENTA</Text>

            <View style={styles.menuCard}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleLogout}
                activeOpacity={0.7}
              >
                <View style={[styles.iconContainer, styles.logoutIconContainer]}>
                  <LogOut size={19} color="#dc2626" />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={[styles.menuText, styles.logoutText]}>
                    Cerrar sesión
                  </Text>
                  <Text style={styles.menuSubtext}>Salir de la aplicación</Text>
                </View>
                <ChevronLeft
                  size={18}
                  color="#dc2626"
                  style={styles.chevronRight}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>


    </View>
  );
};

export default Profile;
