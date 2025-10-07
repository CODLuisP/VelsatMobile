import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
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

const Profile = () => {
  const { user, logout, server, tipo } = useAuthStore();

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

  return (
    <LinearGradient
      colors={['#00296b', '#1e3a8a', '#03045e']}
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

        {/* <Text
          style={[
            styles.companyName,
            { fontSize: 14, color: '#fff', marginTop: 5 },
          ]}
        >
          {navigationDetection.mode}
        </Text> */}

        {/* <Text
            style={[
              styles.companyName,
              { fontSize: 12, color: '#fff', marginTop: 2 },
            ]}
          >
            hasNavBar: {navigationDetection.hasNavigationBar ? 'Sí' : 'No'}
          </Text>
          <Text
            style={[
              styles.companyName,
              { fontSize: 12, color: '#fff', marginTop: 2 },
            ]}
          >
            insets.bottom: {insets.bottom}
          </Text>
          <Text
            style={[
              styles.companyName,
              { fontSize: 12, color: '#fff', marginTop: 2 },
            ]}
          >
            insets.top: {insets.top}
          </Text> */}

      </View>

      {/* Information Section */}
      <View style={styles.infoSection}>
        <View style={styles.infoHeader}>
          <Info size={20} color="#e36414" />
          <Text style={styles.infoTitle}>Información</Text>
        </View>

        <View style={styles.infoContent}>
          <View style={styles.infoItem}>
            <User size={16} color="#1e3a8a" />
            <Text style={styles.infoText}>
              {user?.description || 'Sin nombre'}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Clipboard size={16} color="#1e3a8a" />
            <Text style={styles.infoText}>20251234456</Text>
          </View>

          {/* Para tipo 'n' mostrar Email */}
          {tipo === 'n' && (
            <View style={styles.infoItem}>
              <Mail size={16} color="#1e3a8a" />
              <Text style={styles.infoText}>gacelacorp@gmail.com</Text>
            </View>
          )}

          <View style={styles.infoItem}>
            <Smartphone size={16} color="#1e3a8a" />
            <Text style={styles.infoText}>976345098</Text>
          </View>

          {/* Para tipo 'c' o 'p' mostrar TALMA y código */}
          {(tipo === 'c' || tipo === 'p') && (
            <>
              <View style={styles.infoItem}>
                <Smartphone size={16} color="#999" />
                <Text style={styles.infoText}>TALMA</Text>
              </View>

              <View style={styles.infoItem}>
                <Clipboard size={16} color="#999" />
                <Text style={styles.infoText}>TALM4738</Text>
              </View>
            </>
          )}
        </View>
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
        {/* Version */}
        <View style={styles.versionContainer}>
          <View style={styles.versionDivider} />

          <View style={styles.companyInfoContainer}>
            <Text style={styles.companyNameBold}>VELSAT SAC</Text>
            <Text style={styles.versionSubtext}>Lima - Perú</Text>
          </View>

          <View style={styles.versionRow}>
            <Text style={styles.versionLabel}>Versión:</Text>
            <Text style={styles.versionLabel}> 3.0</Text>
          </View>

          <View style={styles.versionRow}>
            <Text style={styles.versionLabel}>RUC:</Text>
            <Text style={styles.versionLabel}> 20202020202202</Text>
          </View>


          <Text style={styles.copyrightText}>
            © 2025 Velsat Mobile. Todos los derechos reservados.
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default Profile;