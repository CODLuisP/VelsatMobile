import React, { useState } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  ChevronLeft,
  Settings,
  MapPin,
  Eye,
  EyeOff,
} from 'lucide-react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../../App';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { styles } from '../../styles/setting';
import NavigationBarColor from 'react-native-navigation-bar-color';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  getBottomSpace,
  useNavigationMode,
} from '../../hooks/useNavigationMode';
import { useAuthStore } from '../../store/authStore';
import LinearGradient from 'react-native-linear-gradient';

const Setting = () => {
  const { user, logout, server, tipo } = useAuthStore();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [activeForm, setActiveForm] = useState<'update' | 'password'>('update');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const [updateData, setUpdateData] = useState({
    usuario: 'cgacela',
    correo: 'gacelacorp@gmail.com',
    celular: '976345098',
  });

  const [passwordData, setPasswordData] = useState({
    usuario: 'Usuario existente',
    password: '',
    confirmPassword: '',
  });

  const slideAnimation = useSharedValue(1);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleFormChange = (formType: 'update' | 'password') => {
    if (formType === activeForm) return;

    slideAnimation.value = withTiming(0.7, { duration: 150 }, () => {
      runOnJS(setActiveForm)(formType);
      slideAnimation.value = withTiming(1, { duration: 150 });
    });
  };

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(slideAnimation.value, [0, 1], [0.7, 1]);

    return {
      opacity,
    };
  });

  const handleUpdateData = () => {
    console.log('Actualizando datos:', updateData);
  };

  const handleEstablishPassword = () => {
    if (passwordData.password !== passwordData.confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }
    console.log('Estableciendo contraseña para:', passwordData.usuario);
  };

  const renderUpdateForm = () => (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView 
        style={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View style={styles.formContainer}>
          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>
              {tipo === 'n' ? '¿Nuevo correo o celular?' : '¿Nuevo usuario o celular?'}
            </Text>

            <Text style={styles.infoSubtitle}>
              No te preocupes, en este apartado podrás actualizar estos datos rápidamente; si
              deseas cambiar otra información, por favor contáctanos.
            </Text>
          </View>

          <View style={styles.inputSection}>
            {/* Para tipo 'n' mostrar "Razón social", para 'c' o 'p' mostrar "Nombres" */}
            <Text style={styles.inputLabel}>
              {tipo === 'n' ? 'Razón social' : 'Nombres'}
            </Text>
            <TextInput
              style={styles.input}
              value={updateData.usuario}
              onChangeText={text =>
                setUpdateData({ ...updateData, usuario: text })
              }
              placeholder={tipo === 'n' ? 'Razón social' : 'Nombres'}
              placeholderTextColor="#999"
            />

            {/* Para tipo 'n' mostrar "Correo asociado", para 'c' o 'p' mostrar "Usuario" */}
            <Text style={styles.inputLabel}>
              {tipo === 'n' ? 'Correo asociado' : 'Usuario'}
            </Text>
            <TextInput
              style={styles.input}
              value={updateData.correo}
              onChangeText={text =>
                setUpdateData({ ...updateData, correo: text })
              }
              placeholder={tipo === 'n' ? 'correo@ejemplo.com' : 'Usuario'}
              placeholderTextColor="#999"
              keyboardType={tipo === 'n' ? 'email-address' : 'default'}
            />

            <Text style={styles.inputLabel}>Celular asociado</Text>
            <TextInput
              style={styles.input}
              value={updateData.celular}
              onChangeText={text =>
                setUpdateData({ ...updateData, celular: text })
              }
              placeholder="000000000"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
            />
          </View>


<View style={styles.buttonWrapper}>
  <TouchableOpacity 
    onPress={handleUpdateData} 
    activeOpacity={0.8}
  >
    <LinearGradient
      colors={['#e36414', '#ff7f3f']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 0}}
      style={styles.gradientButton}
    >
      <Text style={styles.buttonText}>
        Actualizar datos
      </Text>
    </LinearGradient>
  </TouchableOpacity>
</View>
   

          
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  const renderPasswordForm = () => (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView 
        style={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View style={styles.formContainer}>
          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>Olvidaste tu contraseña?</Text>
            <Text style={styles.infoSubtitle}>
              No te preocupes! Suele pasar. Por favor crea una nueva contraseña
              asociando tu usuario correcto.
            </Text>
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Usuario</Text>
            <TextInput
              style={styles.input}
              value={passwordData.usuario}
              onChangeText={text =>
                setPasswordData({ ...passwordData, usuario: text })
              }
              placeholder="Usuario existente"
              placeholderTextColor="#999"
            />

            <Text style={styles.inputLabel}>Crea una contraseña</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={passwordData.password}
                onChangeText={text =>
                  setPasswordData({ ...passwordData, password: text })
                }
                placeholder="Debe tener mínimo 3 caracteres"
                placeholderTextColor="#999"
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff size={20} color="#999" />
                ) : (
                  <Eye size={20} color="#999" />
                )}
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Confirma tu contraseña</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={passwordData.confirmPassword}
                onChangeText={text =>
                  setPasswordData({ ...passwordData, confirmPassword: text })
                }
                placeholder="Repetir contraseña"
                placeholderTextColor="#999"
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} color="#999" />
                ) : (
                  <Eye size={20} color="#999" />
                )}
              </TouchableOpacity>
            </View>
          </View>

      <View style={styles.buttonWrapper}>
  <TouchableOpacity 
    onPress={handleEstablishPassword} 
    activeOpacity={0.8}
  >
    <LinearGradient
      colors={['#e36414', '#ff7f3f']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 0}}
      style={styles.gradientButton}
    >
      <Text style={styles.buttonText}>
        Establecer contraseña
      </Text>
    </LinearGradient>
  </TouchableOpacity>
</View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
 
  const topSpace = insets.top + 5;

  return (
      <LinearGradient
    colors={['#1e3a8a', '#00509d', '#03045e']} // Degradado de azul oscuro a azul más claro
    style={[styles.container, { paddingBottom: bottomSpace }]}
    start={{ x: 0, y: 0 }}
    end={{ x: 0, y: 1 }}
  >
      <View style={[styles.header, { paddingTop: topSpace }]}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <ChevronLeft size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configuraciones</Text>
      </View>

      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[
            styles.navOption,
            activeForm === 'update' && styles.navOptionActive,
          ]}
          onPress={() => handleFormChange('update')}
        >
          <Settings
            size={20}
            color={activeForm === 'update' ? '#e36414' : '#999'}
          />
          <Text
            style={[
              styles.navOptionText,
              activeForm === 'update'
                ? styles.navOptionTextActive
                : { color: '#999' },
            ]}
          >
            Actualizar datos
          </Text>
          <ChevronLeft
            size={20}
            color={activeForm === 'update' ? '#e36414' : '#999'}
            style={styles.chevronRight}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.navOption,
            activeForm === 'password' && styles.navOptionActive,
          ]}
          onPress={() => handleFormChange('password')}
        >
          <MapPin
            size={20}
            color={activeForm === 'password' ? '#e36414' : '#999'}
          />
          <Text
            style={[
              styles.navOptionText,
              activeForm === 'password'
                ? styles.navOptionTextActive
                : { color: '#999' },
            ]}
          >
            Cambiar contraseña
          </Text>
          <ChevronLeft
            size={20}
            color={activeForm === 'password' ? '#e36414' : '#999'}
            style={styles.chevronRight}
          />
        </TouchableOpacity>


      </View>

      <Animated.View style={[styles.contentContainer, animatedStyle]}>
        {activeForm === 'update' ? renderUpdateForm() : renderPasswordForm()}
      </Animated.View>
      </LinearGradient>

  );
};

export default Setting;