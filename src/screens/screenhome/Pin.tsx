import React from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { ChevronLeft, Clock, Check, Sparkles } from 'lucide-react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../../App';
import { styles } from '../../styles/pin';
import NavigationBarColor from 'react-native-navigation-bar-color';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  getBottomSpace,
  useNavigationMode,
} from '../../hooks/useNavigationMode';
import LinearGradient from 'react-native-linear-gradient';
import { useAuthStore } from '../../store/authStore'; // ⭐ Zustand

const Pin = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  
  // ⭐ Zustand: Mantener la funcionalidad del primer documento
  const selectedVehiclePin = useAuthStore(state => state.selectedVehiclePin);
  const setSelectedVehiclePin = useAuthStore(state => state.setSelectedVehiclePin);

  // ⭐ Convertir el código de pin a id para la UI
  const selectedOption = selectedVehiclePin === 's' ? 'sedan' : 
                         selectedVehiclePin === 'p' ? 'pickup' : 'truck';

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

  // ⭐ Actualizar con los códigos de Zustand
  const handleSelect = (option: string) => {
    const pinCode = option === 'sedan' ? 's' : 
                    option === 'pickup' ? 'p' : 'c';
    setSelectedVehiclePin(pinCode);
  };

  const vehicleOptions = [
    {
      id: 'sedan',
      title: 'Sedán clásico',
      description: 'Ideal para vehículos ligeros y automóviles',
      image: require('../../../assets/sedannew.jpg'),
    },
    {
      id: 'pickup',
      title: 'Pick-up',
      description: 'Perfecto para camionetas y vehículos medianos',
      image: require('../../../assets/pickup.jpeg'),
    },
    {
      id: 'truck',
      title: 'Camión cisterna',
      description: 'Diseñado para vehículos de carga pesada',
      image: require('../../../assets/camion.jpg'),
    },
  ];
  const topSpace = insets.top + 5;

  return (
    <LinearGradient
      colors={['#021e4bff', '#183890ff', '#032660ff']}
      style={[styles.container, { paddingBottom: bottomSpace }]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <View style={[styles.header, { paddingTop: topSpace }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <ChevronLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerMainTitle}>Marcadores</Text>
        </View>
        <View style={styles.headerBottom}>
          <Text style={styles.headerTitle}>Cambiar marcador de unidades</Text>
          <Text style={styles.headerSubtitle}>
            Seleccionar el marcador de tu preferencia, este marcador será con el
            que visualizarás tus unidades.
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.optionsContainer}>
          {vehicleOptions.map(option => (
            <TouchableOpacity
              key={option.id}
              style={styles.optionCard}
              onPress={() => handleSelect(option.id)}
              activeOpacity={0.95}
            >
              <LinearGradient
                colors={
                  selectedOption === option.id
                    ? ['#ababaf4a', '#ffffff']
                    : ['#ffffff', '#fafafa']
                }
                style={styles.cardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
              >
                <View style={styles.cardContent}>
                  <View
                    style={[
                      styles.imageContainer,
                      selectedOption === option.id && styles.imageContainerSelected,
                    ]}
                  >
                    <Image
                      source={option.image}
                      style={styles.vehicleImage}
                      resizeMode="cover"
                    />
                    {selectedOption === option.id && (
                      <>
                        <LinearGradient
                          colors={['rgba(227, 100, 20, 0.15)', 'rgba(187, 77, 8, 0.4)']}
                          style={styles.imageOverlay}
                        />
                        <View style={styles.selectedBadge}>
                          <View style={styles.badgeInner}>
                            <Check size={18} color="#fff" strokeWidth={3.5} />
                          </View>
                        </View>
                      </>
                    )}
                  </View>

                  <View style={styles.cardInfo}>
                    <View style={styles.textSection}>
                      <Text style={styles.optionTitle}>{option.title}</Text>
                      <Text style={styles.optionDescription}>
                        {option.description}
                      </Text>
                    </View>

                    {selectedOption === option.id && (
                      <View style={styles.selectedTag}>
                        <Sparkles size={14} color="#e36414" fill="#e36414" />
                        <Text style={styles.selectedTagText}>Activo</Text>
                      </View>
                    )}
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default Pin;