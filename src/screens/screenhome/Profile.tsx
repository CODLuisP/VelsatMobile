import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
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
  const [userDetails, setUserDetails] = useState<UserDetailsResponse | null>(null);
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
      NavigationBarColor('#00296b', false);
    }, []),
  );

  useEffect(() => {
    const fetchUserDetails = async () => {
      if ((tipo === 'n' || tipo === 'c' || tipo === 'p') && user?.username) {
        setLoading(true);
        try {
          const response = await axios.get<UserDetailsResponse>(
            `${server}/api/User/MobileDetailsUser?accountID=${user.username}&tipo=${tipo}`
          );
          setUserDetails(response.data);
        } catch (error) {
          console.error('Error al obtener detalles del usuario:', error);
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

  // Determinar si debe mostrar las opciones de Marcadores y Notificaciones
  const shouldShowMarkerAndNotifications = tipo === 'n';

  // Obtener el primer email si hay múltiples separados por punto y coma
  const getFirstEmail = (emailString: string | null | undefined): string => {
    if (!emailString || emailString.trim() === '') return '-';
    const emails = emailString.split(';');
    return emails[0].trim();
  };

  // Obtener el nombre completo para tipo 'c' y 'p'
  const getFullName = (apellidos: string | null | undefined, nombres: string | null | undefined): string => {
    const parts = [];
    if (apellidos) parts.push(apellidos.trim());
    if (nombres) parts.push(nombres.trim());
    return parts.length > 0 ? parts.join(' ') : 'Sin nombre';
  };

  // Obtener los últimos 8 dígitos del codlan
  const getLast8Digits = (codlan: string | null | undefined): string => {
    if (!codlan) return '-';
    const digits = codlan.replace(/\D/g, ''); 
    return digits.length >= 8 ? digits.slice(-8) : digits;
  };

  return (
    <LinearGradient
      colors={['#00296b', '#1e3a8a', '#00296b']}
      style={[styles.container, { paddingBottom: bottomSpace }]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >

      <View style={[styles.header, { paddingTop: topSpace }]}>

        <TouchableOpacity
          style={[styles.backButton, { top: insets.top + 10 }]}
          onPress={handleGoBack}
        >
          <ChevronLeft size={26} color="#fff" />
        </TouchableOpacity>

        {/* Profile Avatar */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Image
              source={require('../../../assets/logo.png')}
              style={styles.avatarImage}
            />
          </View>
        </View>
        {/* User Name */}
        <Text style={styles.companyName}>
          {toUpperCaseText(user?.description || user?.name || 'Usuario')}
        </Text>

      </View>

      {/* Information Section */}
      <View style={styles.infoSection}>
        <View style={styles.infoHeader}>
          <Info size={20} color="#e36414" />
          <Text style={styles.infoTitle}>Información</Text>
        </View>

        {loading ? (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#e36414" />
          </View>
        ) : (
          <View style={styles.infoContent}>
            {/* Para tipo 'n' mostrar datos de la API */}
            {tipo === 'n' && userDetails ? (
              <>
                <View style={styles.infoItem}>
                  <User size={16} color="#1e3a8a" />
                  <Text style={styles.infoText}>
                    {userDetails.description || 'Sin nombre'}
                  </Text>
                </View>

                <View style={styles.infoItem}>
                  <Clipboard size={16} color="#1e3a8a" />
                  <Text style={styles.infoText}>
                    {userDetails.ruc || '-'}
                  </Text>
                </View>

                <View style={styles.infoItem}>
                  <Mail size={16} color="#1e3a8a" />
                  <Text style={styles.infoText}>
                    {getFirstEmail(userDetails.contactEmail)}
                  </Text>
                </View>

                <View style={styles.infoItem}>
                  <Smartphone size={16} color="#1e3a8a" />
                  <Text style={styles.infoText}>
                    {userDetails.contactPhone || '-'}
                  </Text>
                </View>
              </>
            ) : tipo === 'c' && userDetails ? (
              <>
                <View style={styles.infoItem}>
                  <User size={16} color="#1e3a8a" />
                  <Text style={styles.infoText}>
                    {getFullName(userDetails.apellidos, userDetails.nombres)}
                  </Text>
                </View>

                <View style={styles.infoItem}>
                  <Clipboard size={16} color="#1e3a8a" />
                  <Text style={styles.infoText}>
                    {userDetails.dni || '-'}
                  </Text>
                </View>

                <View style={styles.infoItem}>
                  <Smartphone size={16} color="#1e3a8a" />
                  <Text style={styles.infoText}>
                    {userDetails.telefono || '-'}
                  </Text>
                </View>

                <View style={styles.infoItem}>
                  <Smartphone size={16} color="#1e3a8a" />
                  <Text style={styles.infoText}>
                    {userDetails.login || '-'}
                  </Text>
                </View>
              </>
            ) : tipo === 'p' && userDetails ? (
              <>
                <View style={styles.infoItem}>
                  <User size={16} color="#1e3a8a" />
                  <Text style={styles.infoText}>
                    {getFullName(userDetails.apellidos, userDetails.nombres)}
                  </Text>
                </View>

                <View style={styles.infoItem}>
                  <Clipboard size={16} color="#1e3a8a" />
                  <Text style={styles.infoText}>
                    {getLast8Digits(userDetails.codlan)}
                  </Text>
                </View>

                <View style={styles.infoItem}>
                  <Smartphone size={16} color="#1e3a8a" />
                  <Text style={styles.infoText}>
                    {userDetails.telefono || '-'}
                  </Text>
                </View>

                <View style={styles.infoItem}>
                  <Smartphone size={16} color="#999" />
                  <Text style={styles.infoText}>
                    {userDetails.codlan || '-'}
                  </Text>
                </View>

                <View style={styles.infoItem}>
                  <Clipboard size={16} color="#999" />
                  <Text style={styles.infoText}>
                    {userDetails.empresa || '-'}
                  </Text>
                </View>
              </>
            ) : (tipo === 'n' || tipo === 'c' || tipo === 'p') ? (
              <>
                <View style={styles.infoItem}>
                  <User size={16} color="#1e3a8a" />
                  <Text style={styles.infoText}>
                    {user?.description || 'Sin nombre'}
                  </Text>
                </View>

                <View style={styles.infoItem}>
                  <Clipboard size={16} color="#1e3a8a" />
                  <Text style={styles.infoText}>-</Text>
                </View>

                <View style={styles.infoItem}>
                  <Smartphone size={16} color="#1e3a8a" />
                  <Text style={styles.infoText}>-</Text>
                </View>

                {(tipo === 'c' || tipo === 'p') && (
                  <View style={styles.infoItem}>
                    <Smartphone size={16} color="#999" />
                    <Text style={styles.infoText}>-</Text>
                  </View>
                )}

                {tipo === 'p' && (
                  <View style={styles.infoItem}>
                    <Clipboard size={16} color="#999" />
                    <Text style={styles.infoText}>-</Text>
                  </View>
                )}
              </>
            ) : null}
          </View>
        )}
      </View>

      <ScrollView style={styles.scrollContent}>
        {/* Menu Options */}
        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem} onPress={handleSettings}>
            <View style={styles.menuItemLeft}>
              <Settings size={20} color="#e36414" />
              <Text style={styles.menuText}>Configuración</Text>
            </View>
            <ChevronLeft size={20} color="#999" style={styles.chevronRight} />
          </TouchableOpacity>

          {/* Solo mostrar Marcadores si tipo === 'n' */}
          {shouldShowMarkerAndNotifications && (
            <TouchableOpacity style={styles.menuItem} onPress={handlePin}>
              <View style={styles.menuItemLeft}>
                <Pin size={20} color="#e36414" />
                <Text style={styles.menuText}>Marcadores</Text>
              </View>
              <ChevronLeft size={20} color="#999" style={styles.chevronRight} />
            </TouchableOpacity>
          )}

          {/* Solo mostrar Notificaciones si tipo === 'n' */}
          {shouldShowMarkerAndNotifications && (
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleNotifications}
            >
              <View style={styles.menuItemLeft}>
                <Megaphone size={20} color="#e36414" />
                <Text style={styles.menuText}>Notificaciones</Text>
              </View>
              <ChevronLeft size={20} color="#999" style={styles.chevronRight} />
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <View style={styles.menuItemLeft}>
              <LogOut size={20} color="#e36414" />
              <Text style={styles.menuText}>Cerrar sesión</Text>
            </View>
            <ChevronLeft size={20} color="#999" style={styles.chevronRight} />
          </TouchableOpacity>
        </View>

        {/* Version */}
        <View style={styles.versionContainer}>
          <View style={styles.versionDivider} />

          <View style={styles.companyInfoContainer}>
            <Text style={styles.companyNameBold}>VELSAT SAC</Text>
            <Text style={styles.versionSubtext}>Lima - Perú</Text>
          </View>

          {/* <View style={styles.versionRow}>
            <Text style={styles.versionLabel}>Versión:</Text>
            <Text style={styles.versionLabel}> 3.0</Text>
          </View> */}

          <View style={styles.versionRow}>
            <Text style={styles.versionLabel}>RUC:</Text>
            <Text style={styles.versionLabel}> 20202020202202</Text>
          </View>
{/* 
          <Text style={styles.copyrightText}>
            © 2025 Velsat Mobile. Todos los derechos reservados.
          </Text> */}
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default Profile;