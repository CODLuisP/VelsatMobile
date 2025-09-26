import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Modal,
  NativeModules,
  Animated,
  FlatList,
} from 'react-native';
import {
  ChevronLeft,
  BarChart3,
  Hand,
  Gauge,
  Route,
  FileText,
  ChevronDown,
  Calendar,
  Search,
  X,
  Truck,
} from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { styles } from '../../../styles/reports';
import {
  NavigationProp,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import { RootStackParamList } from '../../../../App';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  getBottomSpace,
  useNavigationMode,
} from '../../../hooks/useNavigationMode';
import NavigationBarColor from 'react-native-navigation-bar-color';

interface ReportType {
  id: number;
  name: string;
  icon: React.ComponentType<any>;
}

interface Unit {
  id: number;
  name: string;
  plate: string;
  model: string;
}

const Reports: React.FC = () => {
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

  // Estados
  const [allUnitsEnabled, setAllUnitsEnabled] = useState(false);
  const [animatedValue] = useState(new Animated.Value(0));
  const [selectedReport, setSelectedReport] = useState<number>(0);
  const [speedValue, setSpeedValue] = useState<string>('');

  // Estados para unidades
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [showUnitModal, setShowUnitModal] = useState<boolean>(false);
  const [unitSearchText, setUnitSearchText] = useState<string>('');
  const [filteredUnits, setFilteredUnits] = useState<Unit[]>([]);

  // Estados para las fechas
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());

  // Estados temporales para iOS (para no cerrar el modal mientras se hace scroll)
  const [tempStartDate, setTempStartDate] = useState<Date>(new Date());
  const [tempEndDate, setTempEndDate] = useState<Date>(new Date());

  // Estados para controlar la visibilidad de los datepickers
  const [showStartDatePicker, setShowStartDatePicker] =
    useState<boolean>(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState<boolean>(false);
  const [currentPickerMode, setCurrentPickerMode] = useState<'date' | 'time'>(
    'date',
  );
  const [currentPickerType, setCurrentPickerType] = useState<'start' | 'end'>(
    'start',
  );

  // Estados para saber si las fechas han sido seleccionadas
  const [startDateSelected, setStartDateSelected] = useState<boolean>(false);
  const [endDateSelected, setEndDateSelected] = useState<boolean>(false);

  // Unidades de prueba
  const testUnits: Unit[] = [
    { id: 1, name: 'Camión Volvo', plate: 'ABC-123', model: 'FH16' },
    { id: 2, name: 'Camión Mercedes', plate: 'DEF-456', model: 'Actros' },
    { id: 3, name: 'Camión Scania', plate: 'GHI-789', model: 'R450' },
    { id: 4, name: 'Camión DAF', plate: 'JKL-012', model: 'XF' },
    { id: 5, name: 'Camión Iveco', plate: 'MNO-345', model: 'Stralis' },
    { id: 6, name: 'Camión MAN', plate: 'PQR-678', model: 'TGX' },
    { id: 7, name: 'Camión Renault', plate: 'STU-901', model: 'T High' },
    { id: 8, name: 'Furgón Ford', plate: 'VWX-234', model: 'Transit' },
    { id: 9, name: 'Pickup Toyota', plate: 'YZA-567', model: 'Hilux' },
    { id: 10, name: 'Van Chevrolet', plate: 'BCD-890', model: 'Express' },
  ];

  useEffect(() => {
    if (Platform.OS === 'ios') {
      try {
        const { SettingsManager } = NativeModules;
        if (SettingsManager && SettingsManager.settings) {
        }
      } catch (error) {
        console.log('No se pudo configurar locale:', error);
      }
    }
    setFilteredUnits(testUnits);
  }, []);

  useEffect(() => {
    console.log('Filtrando unidades con texto:', unitSearchText);
    if (unitSearchText.trim() === '') {
      setFilteredUnits(testUnits);
    } else {
      const filtered = testUnits.filter(
        unit =>
          unit.name.toLowerCase().includes(unitSearchText.toLowerCase()) ||
          unit.plate.toLowerCase().includes(unitSearchText.toLowerCase()) ||
          unit.model.toLowerCase().includes(unitSearchText.toLowerCase()),
      );
      console.log('Unidades filtradas:', filtered.length);
      setFilteredUnits(filtered);
    }
  }, [unitSearchText]);

  useEffect(() => {
    if (selectedReport !== 2) {
      setSpeedValue('');
    }

    if (selectedReport !== 3) {
      setAllUnitsEnabled(false);
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  }, [selectedReport]);

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handleGoBack = () => {
    navigation.goBack();
  };

  const reportTypes: ReportType[] = [
    { id: 0, name: 'Reporte\nGeneral', icon: BarChart3 },
    { id: 1, name: 'Reporte\nde Paradas', icon: Hand },
    { id: 2, name: 'Reporte\nde Velocidad', icon: Gauge },
    { id: 3, name: 'Reporte\nde Kilometraje', icon: Route },
    { id: 4, name: 'Reporte\n Recorrido', icon: FileText },
  ];

  const handleShowReport = () => {
    switch (selectedReport) {
      case 0:
        navigation.navigate('GeneralReport');
        break;
      case 1:
        navigation.navigate('StopReport');
        break;
      case 2:
        navigation.navigate('SpeedReport');
        break;
      case 3:
        navigation.navigate('MileageReport');
        break;
      case 4:
        navigation.navigate('TourReport');
        break;
      default:
        console.warn(
          `No se encontró pantalla para el reporte: ${selectedReport}`,
        );
        break;
    }
  };

  const toggleAllUnits = () => {
    if (selectedReport !== 3) return;

    const newValue = !allUnitsEnabled;
    setAllUnitsEnabled(newValue);

    Animated.timing(animatedValue, {
      toValue: newValue ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 22],
  });

  const handleOpenUnitModal = () => {
    setShowUnitModal(true);
    setUnitSearchText('');
    setFilteredUnits(testUnits);
  };

  const handleCloseUnitModal = () => {
    setShowUnitModal(false);
    setUnitSearchText('');
  };

  const handleSelectUnit = (unit: Unit) => {
    setSelectedUnit(unit);
    handleCloseUnitModal();
  };

  const handleClearUnit = () => {
    setSelectedUnit(null);
  };

  const formatDate = (date: Date): string => {
    const dateOptions: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    };

    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    };

    try {
      const formattedDate = date.toLocaleDateString('es-ES', dateOptions);
      const formattedTime = date.toLocaleTimeString('es-ES', timeOptions);

      const [day, month, year] = formattedDate.split('/');
      return `${month}/${day}/${year}  ${formattedTime}`;
    } catch (error) {
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');

      return `${month}/${day}/${year}  ${hours}:${minutes}`;
    }
  };

  const onDateTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android' && event.type === 'dismissed') {
      setShowStartDatePicker(false);
      setShowEndDatePicker(false);
      return;
    }

    if (selectedDate) {
      if (Platform.OS === 'ios') {
        if (currentPickerType === 'start') {
          setTempStartDate(selectedDate);
        } else {
          setTempEndDate(selectedDate);
        }
      } else {
        if (currentPickerType === 'start') {
          if (currentPickerMode === 'date') {
            setStartDate(selectedDate);
            setStartDateSelected(true);
            setCurrentPickerMode('time');
          } else {
            const newDate = new Date(startDate);
            newDate.setHours(selectedDate.getHours());
            newDate.setMinutes(selectedDate.getMinutes());
            setStartDate(newDate);
            setShowStartDatePicker(false);
            setCurrentPickerMode('date');
          }
        } else {
          if (currentPickerMode === 'date') {
            setEndDate(selectedDate);
            setEndDateSelected(true);
            setCurrentPickerMode('time');
          } else {
            const newDate = new Date(endDate);
            newDate.setHours(selectedDate.getHours());
            newDate.setMinutes(selectedDate.getMinutes());
            setEndDate(newDate);
            setShowEndDatePicker(false);
            setCurrentPickerMode('date');
          }
        }
      }
    }
  };

  const handleStartDatePress = () => {
    setCurrentPickerType('start');
    setCurrentPickerMode('date');
    setTempStartDate(startDate);
    setShowStartDatePicker(true);
  };

  const handleEndDatePress = () => {
    setCurrentPickerType('end');
    setCurrentPickerMode('date');
    setTempEndDate(endDate);
    setShowEndDatePicker(true);
  };

  const handleClosePicker = () => {
    setShowStartDatePicker(false);
    setShowEndDatePicker(false);
    setCurrentPickerMode('date');
  };

  const handleConfirmPicker = () => {
    if (currentPickerType === 'start') {
      setStartDate(tempStartDate);
      setStartDateSelected(true);
    } else {
      setEndDate(tempEndDate);
      setEndDateSelected(true);
    }
    handleClosePicker();
  };

  const handleSpeedChange = (text: string) => {
    if (selectedReport !== 2) return;

    const numericValue = text.replace(/[^0-9]/g, '');
    setSpeedValue(numericValue);
  };

  const renderReportType = (report: ReportType, index: number) => {
    const IconComponent = report.icon;
    const isSelected = selectedReport === report.id;

    return (
      <TouchableOpacity
        key={report.id}
        style={styles.reportTypeContainer}
        onPress={() => setSelectedReport(report.id)}
      >
        <View
          style={[
            styles.reportIcon,
            isSelected && styles.reportIconSelectedLarge,
          ]}
        >
          <IconComponent size={28} color="#666" />
        </View>
        <Text style={styles.reportText}>{report.name}</Text>
      </TouchableOpacity>
    );
  };

  const renderUnitItem = ({ item }: { item: Unit }) => (
    <TouchableOpacity
      style={styles.unitItem}
      onPress={() => handleSelectUnit(item)}
      activeOpacity={0.7}
    >
      <View style={styles.unitItemLeft}>
        <View style={styles.unitIconContainer}>
          <Truck size={20} color="#007AFF" />
        </View>
        <View style={styles.unitInfo}>
          <Text style={styles.unitName}>{item.name}</Text>
          <Text style={styles.unitDetails}>
            {item.plate} • {item.model}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderUnitModal = () => (
    <Modal
      visible={showUnitModal}
      transparent={true}
      animationType="slide"
      onRequestClose={handleCloseUnitModal}
    >
      <View style={styles.unitModalContainer}>
        <View style={styles.unitModalContent}>
          {/* Header del modal */}
          <View style={styles.unitModalHeader}>
            <Text style={styles.unitModalTitle}>Seleccionar Unidad</Text>
            <TouchableOpacity
              style={styles.unitModalCloseButton}
              onPress={handleCloseUnitModal}
            >
              <X size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Campo de búsqueda */}
          <View style={styles.unitSearchContainer}>
            <View style={styles.unitSearchInputContainer}>
              <Search size={20} color="#999" style={styles.unitSearchIcon} />
              <TextInput
                style={styles.unitSearchInput}
                placeholder="Buscar unidad, placa o modelo..."
                value={unitSearchText}
                onChangeText={setUnitSearchText}
                autoFocus={true}
                placeholderTextColor="#999"
              />
            </View>
          </View>

          {/* Lista de unidades */}
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

  const renderDateTimePicker = () => {
    const isStartPicker = showStartDatePicker;
    const currentDate = isStartPicker ? tempStartDate : tempEndDate;
    const minimumDate = isStartPicker
      ? new Date(2020, 0, 1)
      : startDateSelected
      ? startDate
      : new Date(2020, 0, 1);

    if (Platform.OS === 'ios') {
      return (
        <Modal
          visible={showStartDatePicker || showEndDatePicker}
          transparent={true}
          animationType="slide"
          onRequestClose={handleClosePicker}
        >
          <View style={styles.modalContainer}>
            <View style={styles.datePickerContainer}>
              <View style={styles.datePickerHeader}>
                <Text style={styles.datePickerTitle}>
                  {isStartPicker ? 'Fecha Inicial' : 'Fecha Final'}
                </Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={handleConfirmPicker}
                >
                  <Text style={styles.closeButtonText}>Listo</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                testID="dateTimePicker"
                value={currentDate}
                mode="datetime"
                is24Hour={true}
                onChange={onDateTimeChange}
                minimumDate={minimumDate}
                maximumDate={new Date()}
                display="spinner"
                style={styles.iosDatePicker}
                locale="es_ES"
                textColor="#333"
              />
            </View>
          </View>
        </Modal>
      );
    } else {
      if (showStartDatePicker || showEndDatePicker) {
        return (
          <DateTimePicker
            testID="dateTimePicker"
            value={currentDate}
            mode={currentPickerMode}
            is24Hour={true}
            onChange={onDateTimeChange}
            minimumDate={minimumDate}
            maximumDate={new Date()}
            locale="es_ES"
          />
        );
      }
    }
    return null;
  };

  const isSpeedOptionEnabled = () => selectedReport === 2;
  const isAllUnitsOptionEnabled = () => selectedReport === 3;

  return (
    <View style={[styles.container, { paddingBottom: bottomSpace }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <ChevronLeft size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Seleccione tipo de reporte</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          {reportTypes.map((report, index) => renderReportType(report, index))}
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {/* Unidad */}
        <Text style={styles.sectionTitle}>Unidad</Text>
        <TouchableOpacity
          style={styles.unitInputContainer}
          onPress={handleOpenUnitModal}
        >
          <View style={styles.unitInputContent}>
            {selectedUnit ? (
              <View style={styles.selectedUnitContainer}>
                <View style={styles.selectedUnitInfo}>
                  <Text style={styles.selectedUnitName}>
                    {selectedUnit.name}
                  </Text>
                  <Text style={styles.selectedUnitDetails}>
                    {selectedUnit.plate} • {selectedUnit.model}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.clearUnitButton}
                  onPress={handleClearUnit}
                >
                  <X size={18} color="#999" />
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.unitInputPlaceholder}>Seleccione unidad</Text>
            )}
          </View>
          <ChevronDown size={20} color="#999" />
        </TouchableOpacity>

        {/* Fecha Inicial */}
        <Text style={styles.sectionTitle}>Fecha Inicial</Text>
        <TouchableOpacity
          style={styles.dateInput}
          onPress={handleStartDatePress}
        >
          <Text
            style={[
              styles.dateInputText,
              startDateSelected && { color: '#333' },
            ]}
          >
            {startDateSelected ? formatDate(startDate) : 'mm/dd/yyyy  hh:mm'}
          </Text>
          <Calendar size={20} color="#999" />
        </TouchableOpacity>

        {/* Fecha Final */}
        <Text style={styles.sectionTitle}>Fecha Final</Text>
        <TouchableOpacity style={styles.dateInput} onPress={handleEndDatePress}>
          <Text
            style={[styles.dateInputText, endDateSelected && { color: '#333' }]}
          >
            {endDateSelected ? formatDate(endDate) : 'mm/dd/yyyy  hh:mm'}
          </Text>
          <Calendar size={20} color="#999" />
        </TouchableOpacity>

        <View style={styles.specificOptionsContainer}>
          <Text style={styles.sectionTitleSpecific}>Opciones específicas</Text>

          <View style={styles.optionRow}>
            <View style={styles.optionIconContainer}>
              <Gauge size={20} color="#ff6b35" strokeWidth={2} />
            </View>
            <Text style={styles.optionText}>Velocidad mayor a</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.optionInput,
                  !isSpeedOptionEnabled() && {
                    backgroundColor: '#f5f5f5',
                    color: '#999',
                    opacity: 0.6,
                  },
                ]}
                value={speedValue}
                onChangeText={handleSpeedChange}
                placeholder="0"
                keyboardType="numeric"
                placeholderTextColor={
                  isSpeedOptionEnabled() ? '#9CA3AF' : '#ccc'
                }
                editable={isSpeedOptionEnabled()}
              />
              <Text style={styles.optionUnit}>Km/h</Text>
            </View>
          </View>

          {/* Segunda fila - Toggle */}
          <View style={styles.toggleRow}>
            <View style={styles.toggleLabelContainer}>
              <Text style={styles.toggleLabel}>Todas las unidades</Text>
              <Text style={styles.toggleSubtext}>
                Incluir todos los vehículos
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.toggleSwitch,
                allUnitsEnabled && styles.toggleSwitchActive,
                !isAllUnitsOptionEnabled() && {
                  backgroundColor: '#fff',
                  opacity: 1,
                },
              ]}
              onPress={toggleAllUnits}
              activeOpacity={isAllUnitsOptionEnabled() ? 0.8 : 1}
              disabled={!isAllUnitsOptionEnabled()}
            >
              <Animated.View
                style={[
                  styles.toggleCircle,
                  { transform: [{ translateX }] },
                  !isAllUnitsOptionEnabled() && { backgroundColor: '#ccc' },
                ]}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.excelButton}>
            <Text style={styles.buttonText}>Descargar Excel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.showButton}
            onPress={handleShowReport}
          >
            <Text style={styles.buttonText}>Mostrar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* DateTimePicker */}
      {renderDateTimePicker()}

      {/* Unit Modal */}
      {renderUnitModal()}
    </View>
  );
};

export default Reports;
