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
  Alert,
  PermissionsAndroid,
  ActivityIndicator,
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
import UnitSelectorModal from '../../../components/UnitSelectorModal';
import { useAuthStore } from '../../../store/authStore';
import axios from 'axios';
import RNFetchBlob from 'react-native-blob-util';
import Share from 'react-native-share';
interface ReportType {
  id: number;
  name: string;
  icon: React.ComponentType<any>;
}

interface Unit {
  id: number;
  plate: string;
}

const Reports: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { user, logout, server, tipo } = useAuthStore();

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

  const [allUnitsEnabled, setAllUnitsEnabled] = useState(false);
  const [animatedValue] = useState(new Animated.Value(0));
  const [selectedReport, setSelectedReport] = useState<number>(0);
  const [speedValue, setSpeedValue] = useState<string>('');

  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [showUnitModal, setShowUnitModal] = useState<boolean>(false);

  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());

  const [tempStartDate, setTempStartDate] = useState<Date>(new Date());
  const [tempEndDate, setTempEndDate] = useState<Date>(new Date());

  const [showStartDatePicker, setShowStartDatePicker] =
    useState<boolean>(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState<boolean>(false);
  const [currentPickerMode, setCurrentPickerMode] = useState<'date' | 'time'>(
    'date',
  );
  const [currentPickerType, setCurrentPickerType] = useState<'start' | 'end'>(
    'start',
  );

  const [startDateSelected, setStartDateSelected] = useState<boolean>(false);
  const [endDateSelected, setEndDateSelected] = useState<boolean>(false);

  const [units, setUnits] = useState<Unit[]>([]);
  const [loadingUnits, setLoadingUnits] = useState<boolean>(false);

  const [downloadingExcel, setDownloadingExcel] = useState<boolean>(false);

  const fetchUnits = async () => {
    const username = user?.username;

    if (!username) {
      console.log('No hay username disponible');
      return;
    }

    setLoadingUnits(true);
    try {
      const response = await axios.get(
        `${server}/api/Aplicativo/unidades/${username}`,
      );

      const formattedUnits: Unit[] = response.data.map(
        (item: any, index: number) => ({
          id: index + 1,
          plate: item.deviceID,
        }),
      );

      setUnits(formattedUnits);
    } catch (error) {
      console.error('Error al obtener unidades:', error);
    } finally {
      setLoadingUnits(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, [user]);

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
    { id: 0, name: 'General', icon: BarChart3 },
    { id: 1, name: 'Paradas', icon: Hand },
    { id: 2, name: 'Velocidad', icon: Gauge },
    { id: 3, name: 'Kilometraje', icon: Route },
    { id: 4, name: 'Recorrido', icon: FileText },
  ];

const handleDownloadExcel = async () => {
  const validation = validateForm();

  if (!validation.isValid) {
    Alert.alert('Campos requeridos', validation.message);
    return;
  }

  // Pedir permisos primero (solo Android)
  const hasPermission = await requestStoragePermission();
  if (!hasPermission) {
    Alert.alert('Error', 'Se necesitan permisos de almacenamiento');
    return;
  }

  try {
    setDownloadingExcel(true);

    const username = user?.username;
    const plate = selectedUnit?.plate;

    // Función para formatear fecha a ISO string
    const formatDateForAPI = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    // Formatear las fechas para la API
    const formattedStartDate = encodeURIComponent(formatDateForAPI(startDate));
    const formattedEndDate = encodeURIComponent(formatDateForAPI(endDate));

    // Construir URL
    const url = `${server}/api/Reporting/downloadExcelG/${formattedStartDate}/${formattedEndDate}/${plate}/${username}`;

    console.log('URL de descarga:', url);

    // Configurar ruta de descarga
    const { dirs } = RNFetchBlob.fs;
    const downloadDir = Platform.OS === 'ios' ? dirs.DocumentDir : dirs.DownloadDir;
    const fileName = `reporte_general_${plate}_${new Date().getTime()}.xlsx`;
    const filePath = `${downloadDir}/${fileName}`;

    // Descargar archivo
    const response = await RNFetchBlob.config({
      fileCache: true,
      path: filePath,
      addAndroidDownloads: {
        useDownloadManager: true,
        notification: true,
        path: filePath,
        description: 'Descargando reporte Excel',
        mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    }).fetch('GET', url);

    console.log('Descarga completada:', filePath);

    // Compartir archivo según la plataforma
    if (Platform.OS === 'ios') {
      // En iOS, abrir el menú de compartir directamente
      await Share.open({
        url: `file://${filePath}`,
        title: 'Reporte Excel',
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        subject: `Reporte General - ${plate}`,
        failOnCancel: false,
      });
      setDownloadingExcel(false);
    } else {
      // En Android, mostrar alerta de éxito
      setDownloadingExcel(false);
      Alert.alert(
        'Descarga exitosa',
        'Archivo guardado en Descargas',
        [{ text: 'OK' }]
      );
    }

  } catch (error) {
    console.error('Error al descargar:', error);
    setDownloadingExcel(false);
    Alert.alert('Error', 'No se pudo descargar el archivo Excel');
  }
};

  const handleShowReport = () => {
    const validation = validateForm();

    if (!validation.isValid) {
      Alert.alert('Campos requeridos', validation.message);
      return;
    }

    switch (selectedReport) {
      case 0:
        navigation.navigate('GeneralReport', {
          unit: selectedUnit!,
          startDate: startDate,
          endDate: endDate,
        });
        break;
      case 1:
        navigation.navigate('StopReport', {
          unit: selectedUnit!,
          startDate: startDate,
          endDate: endDate,
        });
        break;
   case 2:
  navigation.navigate('SpeedReport', {
    unit: selectedUnit!,
    startDate: startDate,
    endDate: endDate,
    speed: speedValue,
  });
  break;
case 3:
  navigation.navigate('MileageReport', {
    unit: selectedUnit ? selectedUnit : 'all',
    startDate: startDate,
    endDate: endDate,
  });
  break;
      case 4:
        navigation.navigate('TourReport', {
          unit: selectedUnit!,
          startDate: startDate,
          endDate: endDate,
        });
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
    if (selectedUnit) return;

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
  };

  const handleCloseUnitModal = () => {
    setShowUnitModal(false);
  };

  const handleSelectUnit = (unit: Unit) => {
    setSelectedUnit(unit);
    setShowUnitModal(false);
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



const requestStoragePermission = async () => {
  if (Platform.OS === 'android') {
    try {
      // Obtener versión de Android
      const apiLevel = Platform.Version;
      
      // Android 13+ (API 33+) no necesita WRITE_EXTERNAL_STORAGE
      if (apiLevel >= 33) {
        return true; // ✅ No se necesita permiso
      }
      
      // Android 12 y anteriores
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Permiso de almacenamiento',
          message: 'La app necesita acceso para guardar el archivo Excel',
          buttonNeutral: 'Preguntar después',
          buttonNegative: 'Cancelar',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  }
  return true; // iOS
};

  const validateForm = (): { isValid: boolean; message: string } => {
    if (!selectedUnit && !allUnitsEnabled) {
      return {
        isValid: false,
        message: 'Debe seleccionar una unidad o habilitar "Todas las unidades"',
      };
    }

    if (!startDateSelected) {
      return { isValid: false, message: 'Debe seleccionar la fecha inicial' };
    }

    if (!endDateSelected) {
      return { isValid: false, message: 'Debe seleccionar la fecha final' };
    }

    if (selectedReport === 2 && (!speedValue || speedValue === '0')) {
      return {
        isValid: false,
        message: 'Debe ingresar una velocidad mayor a 0 Km/h',
      };
    }

    return { isValid: true, message: '' };
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
  const topSpace = insets.top + 5;

  return (
    <View style={[styles.container, { paddingBottom: bottomSpace }]}>
      <View style={[styles.header, { paddingTop: topSpace + 10 }]}>
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

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Unidad</Text>
        <TouchableOpacity
          style={[
            styles.unitInputContainer,
            allUnitsEnabled && { opacity: 0.5, backgroundColor: '#f5f5f5' },
          ]}
          onPress={handleOpenUnitModal}
          disabled={allUnitsEnabled}
        >
          <View style={styles.unitInputContent}>
            {selectedUnit ? (
              <View style={styles.selectedUnitContainer}>
                <View style={styles.selectedUnitInfo}>
                  <Text style={styles.selectedUnitName}>
                    {selectedUnit.plate}
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
              <Text style={styles.unitInputPlaceholder}>
                {loadingUnits ? 'Cargando unidades...' : 'Seleccione unidad'}
              </Text>
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
                (!isAllUnitsOptionEnabled() || !!selectedUnit) && {
                  backgroundColor: '#fff',
                  opacity: 1,
                },
              ]}
              onPress={toggleAllUnits}
              disabled={!isAllUnitsOptionEnabled() || !!selectedUnit}
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
<TouchableOpacity
  style={[styles.excelButton, downloadingExcel && { opacity: 0.7 }]}
  onPress={handleDownloadExcel}
  disabled={downloadingExcel}
>
  {downloadingExcel ? (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <ActivityIndicator size="small" color="#fff" />
      <Text style={styles.buttonText}>Descargando...</Text>
    </View>
  ) : (
    <Text style={styles.buttonText}>Descargar Excel</Text>
  )}
</TouchableOpacity>

          <TouchableOpacity
            style={styles.showButton}
            onPress={handleShowReport}
          >
            <Text style={styles.buttonText}>Mostrar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {renderDateTimePicker()}

      <UnitSelectorModal
        visible={showUnitModal}
        units={units}
        onClose={handleCloseUnitModal}
        onSelectUnit={handleSelectUnit}
      />
    </View>
  );
};

export default Reports;
