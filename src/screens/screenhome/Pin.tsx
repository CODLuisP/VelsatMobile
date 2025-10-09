import React, { useState } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { ChevronLeft, Clock, Check } from 'lucide-react-native';
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

const Pin = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [selectedOption, setSelectedOption] = useState<string>('sedan');

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

  const handleSelect = (option: string) => {
    setSelectedOption(option);
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
              style={[
                styles.optionCard,
                selectedOption === option.id && styles.optionCardSelected,
              ]}
              onPress={() => handleSelect(option.id)}
              activeOpacity={0.7}
            >
              <View style={styles.cardContent}>
                <View style={styles.imageWrapper}>
                  <Image
                    source={option.image}
                    style={styles.vehicleImage}
                    resizeMode="cover"
                  />
                  <View style={styles.imageGradient} />
                  {selectedOption === option.id && (
                    <View style={styles.selectedBadge}>
                      <Check size={18} color="#fff" strokeWidth={3} />
                    </View>
                  )}
                </View>
                <View style={styles.textContent}>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionDescription}>
                    {option.description}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footerContent}>
          <View style={styles.footerIconWrapper}>
            <Clock size={18} color="#e36414" />
          </View>
          <Text style={styles.footerText}>
            Más modelos disponibles pronto
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default Pin;