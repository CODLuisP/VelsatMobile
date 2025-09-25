import React, { useState } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { ChevronLeft, Clock } from 'lucide-react-native';
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

const Pin = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [selectedOption, setSelectedOption] = useState<string>('');

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

  const handleSelect = (option: string) => {
    setSelectedOption(option);
  };

  const vehicleOptions = [
    {
      id: 'sedan',
      title: 'Sedán clásico',
      image: require('../../../assets/sedan.jpg'),
    },
    {
      id: 'pickup',
      title: 'Pick-up',
      image: require('../../../assets/pickup.jpeg'),
    },
    {
      id: 'truck',
      title: 'Camión cisterna',
      image: require('../../../assets/camion.jpg'),
    },
  ];

  return (
    <View style={[styles.container, { paddingBottom: bottomSpace }]}>
      <View style={styles.header}>
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
            <View key={option.id} style={styles.optionCard}>
              <Text style={styles.optionTitle}>{option.title}</Text>
              <View style={styles.imageContainer}>
                <Image
                  source={option.image}
                  style={styles.vehicleImage}
                  resizeMode="cover"
                />
                <View style={styles.imageOverlay} />
                <TouchableOpacity
                  style={styles.selectButton}
                  onPress={() => handleSelect(option.id)}
                >
                  <Text style={styles.selectButtonText}>Seleccionar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.footerContent}>
          <Clock size={16} color="#666" />
          <Text style={styles.footerText}>
            Más modelos disponibles pronto...
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default Pin;
