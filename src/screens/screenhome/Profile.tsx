import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator, FlatList } from 'react-native';
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

  const shouldShowMarkerAndNotifications = tipo === 'n';

  const getFirstEmail = (emailString: string | null | undefined): string => {
    if (!emailString || emailString.trim() === '') return '-';
    const emails = emailString.split(';');
    return emails[0].trim();
  };

  const getFullName = (apellidos: string | null | undefined, nombres: string | null | undefined): string => {
    const parts = [];
    if (apellidos) parts.push(apellidos.trim());
    if (nombres) parts.push(nombres.trim());
    return parts.length > 0 ? parts.join(' ') : 'Sin nombre';
  };

  const getLast8Digits = (codlan: string | null | undefined): string => {
    if (!codlan) return '-';
    const digits = codlan.replace(/\D/g, ''); 
    return digits.length >= 8 ? digits.slice(-8) : digits;
  };

  return (
    <LinearGradient
      colors={['#021e4bff', '#183890ff', '#032660ff']}
      style={[styles.container, { paddingBottom: bottomSpace - 2 }]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: topSpace }]}>
        <TouchableOpacity
          style={[styles.backButton, { top: insets.top + 10 }]}
          onPress={handleGoBack}
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
                  <Smartphone size={16} color="#1e3a8a" />
                  <Text style={styles.infoText}>
                    {userDetails.codlan || '-'}
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Clipboard size={16} color="#1e3a8a" />
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

      {/* FlatList con menú */}
      <FlatList
        data={[]}
        keyExtractor={(item, index) => index.toString()}
        renderItem={null}
        ListHeaderComponent={() => (
          <>
            <View style={styles.menuSection}>
              <Text style={styles.sectionTitle}>GENERAL</Text>
              
              <TouchableOpacity 
                style={styles.menuItem} 
                onPress={handleSettings}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemLeft}>
                  <View style={styles.iconContainer}>
                    <Settings size={22} color="#e36414" />
                  </View>
                  <View style={styles.menuTextContainer}>
                    <Text style={styles.menuText}>Configuración</Text>
                    <Text style={styles.menuSubtext}>Ajustes de la aplicación</Text>
                  </View>
                </View>
                <ChevronLeft size={20} color="#999" style={styles.chevronRight} />
              </TouchableOpacity>

              {shouldShowMarkerAndNotifications && (
                <>
                  <TouchableOpacity 
                    style={styles.menuItem} 
                    onPress={handlePin}
                    activeOpacity={0.7}
                  >
                    <View style={styles.menuItemLeft}>
                      <View style={styles.iconContainer}>
                        <Pin size={22} color="#e36414" />
                      </View>
                      <View style={styles.menuTextContainer}>
                        <Text style={styles.menuText}>Marcadores</Text>
                        <Text style={styles.menuSubtext}>Contenido guardado</Text>
                      </View>
                    </View>
                    <ChevronLeft size={20} color="#999" style={styles.chevronRight} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.menuItemEnd}
                    onPress={handleNotifications}
                    activeOpacity={0.7}
                  >
                    <View style={styles.menuItemLeft}>
                      <View style={styles.iconContainer}>
                        <Megaphone size={22} color="#e36414" />
                      </View>
                      <View style={styles.menuTextContainer}>
                        <Text style={styles.menuText}>Notificaciones</Text>
                        <Text style={styles.menuSubtext}>Alertas y avisos</Text>
                      </View>
                    </View>
                    <ChevronLeft size={20} color="#999" style={styles.chevronRight} />
                  </TouchableOpacity>
                </>
              )}
            </View>

            <View style={styles.menuSection}>
              <Text style={styles.sectionTitle}>CUENTA</Text>
              
              <TouchableOpacity 
                style={[styles.menuItemEnd]} 
                onPress={handleLogout}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemLeft}>
                  <View style={[styles.iconContainer, styles.logoutIconContainer]}>
                    <LogOut size={22} color="#dc2626" />
                  </View>
                  <Text style={[styles.menuText, styles.logoutText]}>Cerrar sesión</Text>
                </View>
                <ChevronLeft size={20} color="#dc2626" style={styles.chevronRight} />
              </TouchableOpacity>
            </View>

            <View style={styles.footerContainer}>
              <View style={styles.companyCard}>
                <View style={styles.companyHeader}>
                  <View style={styles.companyLogoPlaceholder}>
                      <Image
              source={require('../../../assets/logoV.jpeg')}
              style={styles.avatarImageV}
            />
                  </View>
                  <View style={styles.companyDetails}>
                    <Text style={styles.companyName}>VELSAT SAC</Text>
                    <Text style={styles.companyLocation}>Lima - Perú</Text>
                    <Text style={styles.companyLocation}>RUC - 20202020202202</Text>

                  </View>
                  
                </View>
                
              
              </View>
              
            </View>
          </>
        )}
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
          scrollEnabled={false}
      />
    </LinearGradient>
  );
};

export default Profile;