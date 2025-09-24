import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Platform, Dimensions } from 'react-native';
import {
  ChevronLeft,
  Info,
  Settings,
  MapPin,
  LogOut,
  User,
  Clipboard,
  Mail,
  Smartphone,
  Megaphone,
  Pin
} from 'lucide-react-native';
import { styles } from '../../styles/profile';
import { useAuthStore } from '../../store/authStore';
import { NavigationProp, useFocusEffect, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../../App';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';
import NavigationBarColor from 'react-native-navigation-bar-color';

const getBottomSpace = (insets: EdgeInsets) => {
  if (Platform.OS === 'android') {
    const screen = Dimensions.get('screen');
    const window = Dimensions.get('window');
    
    const navBarHeight = screen.height - window.height;
    return navBarHeight > 0 ? navBarHeight + 30 : 70;
  }
  
  return Math.max(insets.bottom, 20);
};

const Profile = () => {

  const { user, server, logout } = useAuthStore();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const insets = useSafeAreaInsets();
  const bottomSpace = getBottomSpace(insets);

  useFocusEffect(
    React.useCallback(() => {
      NavigationBarColor('#1e3a8a', false);
    }, [])
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

  return (
    <View style={[
      styles.container,
      { paddingBottom: bottomSpace }
    ]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
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
        {/* Company Name */}
        <Text style={styles.companyName}>
          {user?.username ? user.username.charAt(0).toUpperCase() + user.username.slice(1) : ''}
        </Text>      
      </View>

      {/* Information Section - Posicionada absolutamente sobre el header */}
      <View style={styles.infoSection}>
        <View style={styles.infoHeader}>
          <Info size={20} color="#e36414" />
          <Text style={styles.infoTitle}>Información</Text>
        </View>

        <View style={styles.infoContent}>
          <View style={styles.infoItem}>
            <User size={16} color="#999" />
            <Text style={styles.infoText}>Corporación Gacela SAC</Text>
          </View>

          <View style={styles.infoItem}>
            <Clipboard size={16} color="#999" />
            <Text style={styles.infoText}>20251234456</Text>
          </View>

          <View style={styles.infoItem}>
            <Mail size={16} color="#999" />
            <Text style={styles.infoText}>gacelacorp@gmail.com</Text>
          </View>

          <View style={styles.infoItem}>
            <Smartphone size={16} color="#999" />
            <Text style={styles.infoText}>976345098</Text>
          </View>
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

          <TouchableOpacity style={styles.menuItem} onPress={handlePin}>
            <View style={styles.menuItemLeft}>
              <Pin size={20} color="#e36414" />
              <Text style={styles.menuText}>Marcadores</Text>
            </View>
            <ChevronLeft size={20} color="#999" style={styles.chevronRight} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleNotifications}>
            <View style={styles.menuItemLeft}>
              <Megaphone size={20} color="#e36414" />
              <Text style={styles.menuText}>Notificaciones</Text>
            </View>
            <ChevronLeft size={20} color="#999" style={styles.chevronRight} />
          </TouchableOpacity>

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
          <Text style={styles.versionTextTitle}>VELSAT SAC</Text>
          <Text style={styles.versionText}>Lima - Perú</Text>
          <Text style={styles.versionText}>Versión Velsat Mobile 3.0</Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default Profile;