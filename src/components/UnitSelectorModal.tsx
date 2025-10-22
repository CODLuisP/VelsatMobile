import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
} from 'react-native';
import { Search, X, Truck, Car } from 'lucide-react-native';
import { styles } from '../styles/reports';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getBottomSpace, useNavigationMode } from '../hooks/useNavigationMode';

interface Unit {
  id: number;
  plate: string;
}

interface UnitSelectorModalProps {
  visible: boolean;
  units: Unit[];
  onClose: () => void;
  onSelectUnit: (unit: Unit) => void;
}

const UnitSelectorModal: React.FC<UnitSelectorModalProps> = ({
  visible,
  units,
  onClose,
  onSelectUnit,
}) => {
  const [searchText, setSearchText] = useState<string>('');
  const [filteredUnits, setFilteredUnits] = useState<Unit[]>(units);

    const insets = useSafeAreaInsets();
    const navigationDetection = useNavigationMode();
    const bottomSpace = getBottomSpace(
      insets,
      navigationDetection.hasNavigationBar,
    );

      const topSpace = insets.top + 5;


  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredUnits(units);
    } else {
      const filtered = units.filter(
        unit =>
          unit.plate.toLowerCase().includes(searchText.toLowerCase()),
      );
      setFilteredUnits(filtered);
    }
  }, [searchText, units]);

  const renderUnitItem = ({ item }: { item: Unit }) => (
    <TouchableOpacity
      style={styles.unitItem}
      onPress={() => onSelectUnit(item)}
      activeOpacity={0.7}
    >
      <View style={styles.unitItemLeft}>
        <View style={styles.unitIconContainer}>
          <Car size={20} color="#007AFF" />
        </View>
        <View style={styles.unitInfo}>
          <Text style={styles.unitName}>{item.plate}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={[styles.unitModalContainer,  { paddingTop: 0 }]}>
        <View style={[styles.unitModalContent,{ paddingTop: topSpace -35}]} >
          <View style={styles.unitModalHeader}>
            <Text style={styles.unitModalTitle}>Seleccionar Unidad</Text>
            <TouchableOpacity
              style={styles.unitModalCloseButton}
              onPress={onClose}
            >
              <X size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.unitSearchContainer}>
            <View style={styles.unitSearchInputContainer}>
              <Search size={20} color="#999" style={styles.unitSearchIcon} />
              <TextInput
                style={styles.unitSearchInput}
                placeholder="Buscar placa..."
                value={searchText}
                onChangeText={setSearchText}
                autoFocus={true}
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.unitsListContainer}>
            <FlatList
              data={filteredUnits}
              renderItem={renderUnitItem}
              keyExtractor={item => item.id.toString()}
              style={styles.unitsList}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={() => (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    No se encontraron unidades
                  </Text>
                </View>
              )}
            />
          </View>


          
        </View>
      </View>
    </Modal>
  );
};

export default UnitSelectorModal;