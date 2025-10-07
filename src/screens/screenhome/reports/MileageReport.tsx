import React, { useState } from 'react';
import { Text, View, TouchableOpacity, FlatList, Image } from 'react-native';
import { ChevronLeft, Calendar, Car, MapPin } from 'lucide-react-native';
import {
  NavigationProp,
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { styles } from '../../../styles/mileagereport';
import { RootStackParamList } from '../../../../App';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  getBottomSpace,
  useNavigationMode,
} from '../../../hooks/useNavigationMode';
import NavigationBarColor from 'react-native-navigation-bar-color';
import { formatDate } from '../../../utils/converUtils';

interface VehicleReport {
  id: string;
  itemNumber: number;
  unitName: string;
  mileage: number;
  carImage: any;
}

const MileageReport = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const route = useRoute<RouteProp<RootStackParamList, 'MileageReport'>>();
  const { unit, startDate, endDate } = route.params;

  const isAllUnits = unit === 'all';

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

  const handleVehiclePress = (vehicle: VehicleReport) => {
    console.log('Clicked on vehicle:', vehicle);
  };

  const [vehicleData] = useState<VehicleReport[]>([
    {
      id: '1',
      itemNumber: 1,
      unitName: 'BDV-953',
      mileage: 263.75,
      carImage: require('../../../../assets/Car.jpg'),
    },
    {
      id: '2',
      itemNumber: 2,
      unitName: 'BDV-954',
      mileage: 412.3,
      carImage: require('../../../../assets/Car.jpg'),
    },
    {
      id: '3',
      itemNumber: 3,
      unitName: 'BDV-955',
      mileage: 198.45,
      carImage: require('../../../../assets/Car.jpg'),
    },
    {
      id: '4',
      itemNumber: 4,
      unitName: 'BDV-956',
      mileage: 327.8,
      carImage: require('../../../../assets/Car.jpg'),
    },
    {
      id: '5',
      itemNumber: 5,
      unitName: 'BDV-957',
      mileage: 156.25,
      carImage: require('../../../../assets/Car.jpg'),
    },

    {
      id: '6',
      itemNumber: 5,
      unitName: 'BDV-957',
      mileage: 156.25,
      carImage: require('../../../../assets/Car.jpg'),
    },

    {
      id: '7',
      itemNumber: 5,
      unitName: 'BDV-957',
      mileage: 156.25,
      carImage: require('../../../../assets/Car.jpg'),
    },
    {
      id: '8',
      itemNumber: 5,
      unitName: 'BDV-957',
      mileage: 156.25,
      carImage: require('../../../../assets/Car.jpg'),
    },
  ]);

  const renderVehicleItem = ({ item }: { item: VehicleReport }) => (
    <TouchableOpacity
      style={styles.vehicleCard}
      onPress={() => handleVehiclePress(item)}
      activeOpacity={0.8}
    >
      {/* Header combinado: Todo en una línea */}
      <View style={styles.itemHeader}>
        <View style={styles.itemBadge}>
          <Text style={styles.itemBadgeText}>ITEM #{item.itemNumber} </Text>
        </View>
        <View style={styles.unitHeaderInfo}>
          <Text style={styles.unitCompleteText}>Unidad: {item.unitName}</Text>
        </View>
      </View>

      {/* Contenido principal simplificado */}
      <View style={styles.cardContent}>
        {/* Sección izquierda - Solo imagen del carro */}
        <View style={styles.leftSection}>
          <View style={styles.carImageWrapper}>
            <Image
              source={item.carImage}
              style={styles.carImage}
              defaultSource={require('../../../../assets/Car.jpg')}
            />
          </View>
        </View>

        {/* Sección derecha - Kilometraje */}
        <View style={styles.rightSection}>
          <Text style={styles.mileageValue}>{item.mileage}</Text>
          <View style={styles.mileageLabel}>
            <MapPin size={12} color="#ff8c00" />
            <Text style={styles.mileageLabelText}>Km recorridos</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
  const topSpace = insets.top + 5;

  return (
    <View style={[styles.container, { paddingBottom: bottomSpace }]}>
      <View style={[styles.header, { paddingTop: topSpace }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
              <ChevronLeft size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Reporte de Kilometraje</Text>

              <Text style={styles.dateText}>
                {' '}
                {isAllUnits ? 'Todas las unidades' : `Unidad:${unit.plate}`}
              </Text>

              <View style={styles.dateContainer}>
                <View style={styles.dateWrapper}>
                  <Calendar size={16} color="#fff" opacity={0.9} />
                  <Text style={styles.dateText}>
                    {formatDate(startDate)} - {formatDate(endDate)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>

      <FlatList
        data={vehicleData}
        keyExtractor={item => item.id}
        renderItem={renderVehicleItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

export default MileageReport;
