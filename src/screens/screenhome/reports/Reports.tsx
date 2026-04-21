import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Platform,
  Modal,
  Animated,
  PermissionsAndroid,
  ActivityIndicator,
  Image,
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
  X,
  AlertCircle,
  CheckCircle2,
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
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import LinearGradient from 'react-native-linear-gradient';
import ReportSlider, { ReportType } from '../../../components/ReportSlider';
import { Text, TextInput } from '../../../components/ScaledComponents';

interface Unit {
  id: number;
  plate: string;
}

type FieldError = 'unit' | 'startDate' | 'endDate' | 'speed' | null;

interface InlineMessage {
  field: FieldError;
  message: string;
  type: 'error' | 'success';
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
      NavigationBarColor('#ffffff', true);
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

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  // Estado para mensajes inline
  const [inlineMessage, setInlineMessage] = useState<InlineMessage | null>(null);
  const fadeAnim = useState(new Animated.Value(0))[0];

  const showInlineMessage = (field: FieldError, message: string, type: 'error' | 'success' = 'error') => {
    setInlineMessage({ field, message, type });
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(3500),
      Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setInlineMessage(null));
  };

  const clearInlineMessage = () => {
    setInlineMessage(null);
    fadeAnim.setValue(0);
  };

  // Definición de tipos de reportes
  const reportTypes: ReportType[] = [
    {
      id: 0,
      name: 'Reporte General',
      icon: BarChart3,
      description: 'Análisis completo de la actividad',
      gradient: ['#ffffffff', '#ffffffff'],
    },
    {
      id: 1,
      name: 'Reporte Paradas',
      icon: Hand,
      description: 'Detalle de paradas realizadas',
      gradient: ['#ffffffff', '#ffffffff'],
      eos: 'https://res.cloudinary.com/db8efdixd/image/upload/v1764991429/paradas_kdfusl.jpg',
    },
    {
      id: 2,
      name: 'Reporte Velocidad',
      icon: Gauge,
      description: 'Control de excesos de velocidad',
      gradient: ['#ffffffff', '#ffffffff'],
      eos: 'https://res.cloudinary.com/db8efdixd/image/upload/v1764991360/rspeed_pskxjg.jpg',
    },
    {
      id: 3,
      name: 'Reporte Kilometraje',
      icon: Route,
      description: 'Distancias recorridas por unidad(es)',
      gradient: ['#ffffffff', '#ffffffff'],
      eos: 'https://res.cloudinary.com/db8efdixd/image/upload/v1764991440/kilometraje_bbimzv.jpg',
    },
    {
      id: 4,
      name: 'Reporte Recorrido',
      icon: FileText,
      description: 'Rutas y trayectos completos',
      gradient: ['#ffffffff', '#ffffffff'],
      eos: 'https://res.cloudinary.com/db8efdixd/image/upload/v1764991360/rrecorrido_aavpzm.jpg',
    },
  ];

  const fetchUnits = async () => {
    const username = user?.username;
    if (!username) return;

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
    } finally {
      setLoadingUnits(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, [user]);

  useEffect(() => {
    if (selectedReport !== 2) setSpeedValue('');
    if (selectedReport !== 3) {
      setAllUnitsEnabled(false);
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
    clearInlineMessage();
  }, [selectedReport]);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleSelectReport = (reportId: number) => {
    setSelectedReport(reportId);
  };

  const handleDownloadExcel = async () => {
    const validation = validateForm();

    if (!validation.isValid) {
      showInlineMessage(validation.field, validation.message, 'error');
      return;
    }

    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      showInlineMessage('unit', 'Se necesitan permisos de almacenamiento', 'error');
      return;
    }

    try {
      setDownloadingExcel(true);

      const username = user?.username;
      const plate = selectedUnit?.plate;

      const formatDateForAPI = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };

      const formattedStartDate = encodeURIComponent(formatDateForAPI(startDate));
      const formattedEndDate = encodeURIComponent(formatDateForAPI(endDate));

      let apiEndpoint = '';
      let reportName = '';

      switch (selectedReport) {
        case 0: apiEndpoint = 'downloadExcelG'; reportName = 'general'; break;
        case 1: apiEndpoint = 'downloadExcelS'; reportName = 'paradas'; break;
        case 2: apiEndpoint = 'downloadExcelV'; reportName = 'velocidad'; break;
        case 3: apiEndpoint = 'downloadExcelK'; reportName = 'kilometraje'; break;
        case 4: apiEndpoint = 'downloadExcelT'; reportName = 'recorrido'; break;
        default: apiEndpoint = 'downloadExcelG'; reportName = 'general';
      }

      let url = '';

      if (selectedReport === 2) {
        url = `${server}/api/Reporting/${apiEndpoint}/${formattedStartDate}/${formattedEndDate}/${plate}/${speedValue}/${username}`;
      } else if (selectedReport === 3) {
        if (allUnitsEnabled) {
          url = `${server}/api/Kilometer/downloadExcelKall/${formattedStartDate}/${formattedEndDate}/${username}`;
        } else {
          url = `${server}/api/Kilometer/downloadExcelK/${formattedStartDate}/${formattedEndDate}/${plate}/${username}`;
        }
      } else {
        url = `${server}/api/Reporting/${apiEndpoint}/${formattedStartDate}/${formattedEndDate}/${plate}/${username}`;
      }

      const { dirs } = RNFetchBlob.fs;
      const downloadDir = Platform.OS === 'ios' ? dirs.DocumentDir : dirs.DownloadDir;
      const fileName = `reporte_${reportName}_${plate}_${new Date().getTime()}.xlsx`;
      const filePath = `${downloadDir}/${fileName}`;

      await RNFetchBlob.config({
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

      if (Platform.OS === 'ios') {
        await Share.open({
          url: `file://${filePath}`,
          title: 'Reporte Excel',
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          subject: `Reporte General - ${plate}`,
          failOnCancel: false,
        });
        setDownloadingExcel(false);
      } else {
        setDownloadingExcel(false);
        showInlineMessage(null, 'Archivo guardado en Descargas', 'success');
      }
    } catch (error) {
      setDownloadingExcel(false);
      showInlineMessage(null, 'No se pudo descargar el archivo Excel', 'error');
    }
  };

  const handleShowReport = () => {
    const validation = validateForm();

    if (!validation.isValid) {
      showInlineMessage(validation.field, validation.message, 'error');
      return;
    }

    switch (selectedReport) {
      case 0:
        navigation.navigate('GeneralReport', { unit: selectedUnit!, startDate, endDate });
        break;
      case 1:
        navigation.navigate('StopReport', { unit: selectedUnit!, startDate, endDate });
        break;
      case 2:
        navigation.navigate('SpeedReport', { unit: selectedUnit!, startDate, endDate, speed: speedValue });
        break;
      case 3:
        navigation.navigate('MileageReport', { unit: selectedUnit ? selectedUnit : 'all', startDate, endDate });
        break;
      case 4:
        navigation.navigate('TourReport', { unit: selectedUnit!, startDate, endDate });
        break;
      default:
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

  const handleOpenUnitModal = () => setShowUnitModal(true);
  const handleCloseUnitModal = () => setShowUnitModal(false);

  const handleSelectUnit = (unit: Unit) => {
    setSelectedUnit(unit);
    setShowUnitModal(false);
    if (inlineMessage?.field === 'unit') clearInlineMessage();
  };

  const handleClearUnit = () => setSelectedUnit(null);

  const formatDate = (date: Date): string => {
    const dateOptions: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
    const timeOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: false };

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
        if (currentPickerType === 'start') setTempStartDate(selectedDate);
        else setTempEndDate(selectedDate);
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
            if (inlineMessage?.field === 'startDate') clearInlineMessage();
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
            if (inlineMessage?.field === 'endDate') clearInlineMessage();
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
      if (inlineMessage?.field === 'startDate') clearInlineMessage();
    } else {
      setEndDate(tempEndDate);
      setEndDateSelected(true);
      if (inlineMessage?.field === 'endDate') clearInlineMessage();
    }
    handleClosePicker();
  };

  const handleSpeedChange = (text: string) => {
    if (selectedReport !== 2) return;
    const numericValue = text.replace(/[^0-9]/g, '');
    setSpeedValue(numericValue);
    if (inlineMessage?.field === 'speed') clearInlineMessage();
  };

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const apiLevel = Platform.Version;
        if (apiLevel >= 33) return true;

        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Permiso de almacenamiento',
            message: 'La app necesita acceso para guardar el archivo Excel',
            buttonNeutral: 'Preguntar después',
            buttonNegative: 'Cancelar',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        return false;
      }
    }
    return true;
  };

  const validateForm = (): { isValid: boolean; message: string; field: FieldError } => {
    if (!selectedUnit && !allUnitsEnabled) {
      return { isValid: false, message: 'Selecciona una unidad para continuar', field: 'unit' };
    }
    if (!startDateSelected) {
      return { isValid: false, message: 'Selecciona la fecha inicial', field: 'startDate' };
    }
    if (!endDateSelected) {
      return { isValid: false, message: 'Selecciona la fecha final', field: 'endDate' };
    }
    if (selectedReport === 2 && (!speedValue || speedValue === '0')) {
      return { isValid: false, message: 'Ingresa una velocidad mayor a 0 Km/h', field: 'speed' };
    }
    return { isValid: true, message: '', field: null };
  };

  // Componente de mensaje inline
  const InlineError = ({ field }: { field: FieldError }) => {
    if (!inlineMessage || inlineMessage.field !== field) return null;

    const isSuccess = inlineMessage.type === 'success';

    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 5,
          marginTop: 5,
          marginBottom: 2,
          paddingHorizontal: 10,
          paddingVertical: 10,
          borderRadius: 8,
          backgroundColor: isSuccess ? '#f0faf4' : '#fff5f5',
          borderLeftWidth: 3,
          borderLeftColor: isSuccess ? '#22c55e' : '#ef4444',
        }}
      >
        {isSuccess
          ? <CheckCircle2 size={13} color="#22c55e" />
          : <AlertCircle size={13} color="#ef4444" />
        }
        <Text style={{
          fontSize: 12,
          color: isSuccess ? '#16a34a' : '#ef4444',
          fontWeight: '500',
          flex: 1,
        }}>
          {inlineMessage.message}
        </Text>
      </Animated.View>
    );
  };

  // Mensaje global (sin field específico) para éxito/error de descarga
  const GlobalMessage = () => {
    if (!inlineMessage || inlineMessage.field !== null) return null;

    const isSuccess = inlineMessage.type === 'success';

    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          marginTop: 10,
          marginBottom: 2,
          paddingHorizontal: 14,
          paddingVertical: 10,
          borderRadius: 10,
          backgroundColor: isSuccess ? '#f0faf4' : '#fff5f5',
          borderWidth: 1,
          borderColor: isSuccess ? '#bbf7d0' : '#fecaca',
        }}
      >
        {isSuccess
          ? <CheckCircle2 size={16} color="#22c55e" />
          : <AlertCircle size={16} color="#ef4444" />
        }
        <Text style={{
          fontSize: 13,
          color: isSuccess ? '#16a34a' : '#ef4444',
          fontWeight: '500',
          flex: 1,
        }}>
          {inlineMessage.message}
        </Text>
      </Animated.View>
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
                <TouchableOpacity style={styles.closeButton} onPress={handleConfirmPicker}>
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
  const topSpace = Platform.OS === 'ios' ? insets.top - 5 : insets.top + 5;

  const hasUnitError = inlineMessage?.field === 'unit';
  const hasStartDateError = inlineMessage?.field === 'startDate';
  const hasEndDateError = inlineMessage?.field === 'endDate';
  const hasSpeedError = inlineMessage?.field === 'speed';

  return (
    <View style={[styles.container, { paddingBottom: bottomSpace }]}>
      <LinearGradient
        colors={['#05194fff', '#05194fff', '#18223dff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.header, { paddingTop: topSpace }]}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleGoBack}
            activeOpacity={0.7}
          >
            <ChevronLeft size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Seleccione tipo de reporte</Text>
        </View>

        <ReportSlider
          reports={reportTypes}
          selectedReportId={selectedReport}
          onSelectReport={handleSelectReport}
        />
      </LinearGradient>

      <KeyboardAwareScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 20 }}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        extraScrollHeight={30}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* UNIDAD */}
        <Text style={styles.sectionTitle}>Unidad</Text>
        <TouchableOpacity
          style={[
            styles.unitInputContainer,
            allUnitsEnabled && { opacity: 0.8, backgroundColor: '#e7ecef' },
            hasUnitError && { borderColor: '#ef4444', borderWidth: 1 },
          ]}
          onPress={handleOpenUnitModal}
          disabled={allUnitsEnabled}
        >
          <View style={styles.unitInputContent}>
            {selectedUnit ? (
              <View style={styles.selectedUnitContainer}>
                <View style={styles.selectedUnitInfo}>
                  <Text style={styles.selectedUnitName}>{selectedUnit.plate}</Text>
                </View>
                <TouchableOpacity style={styles.clearUnitButton} onPress={handleClearUnit}>
                  <X size={18} color="#999" />
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.unitInputPlaceholder}>
                {loadingUnits ? 'Cargando unidades...' : 'Seleccione unidad'}
              </Text>
            )}
          </View>
          <ChevronDown size={20} color={hasUnitError ? '#ef4444' : '#999'} />
        </TouchableOpacity>
        <InlineError field="unit" />

        {/* FECHA INICIAL */}
        <Text style={styles.sectionTitle}>Fecha Inicial</Text>
        <TouchableOpacity
          style={[
            styles.dateInput,
            hasStartDateError && { borderColor: '#ef4444', borderWidth: 1 },
          ]}
          onPress={handleStartDatePress}
        >
          <Text style={[styles.dateInputText, startDateSelected && { color: '#333' }]}>
            {startDateSelected ? formatDate(startDate) : 'mm/dd/yyyy  hh:mm'}
          </Text>
          <Calendar size={20} color={hasStartDateError ? '#ef4444' : '#999'} />
        </TouchableOpacity>
        <InlineError field="startDate" />

        {/* FECHA FINAL */}
        <Text style={styles.sectionTitle}>Fecha Final</Text>
        <TouchableOpacity
          style={[
            styles.dateInput,
            hasEndDateError && { borderColor: '#ef4444', borderWidth: 1 },
          ]}
          onPress={handleEndDatePress}
        >
          <Text style={[styles.dateInputText, endDateSelected && { color: '#333' }]}>
            {endDateSelected ? formatDate(endDate) : 'mm/dd/yyyy  hh:mm'}
          </Text>
          <Calendar size={20} color={hasEndDateError ? '#ef4444' : '#999'} />
        </TouchableOpacity>
        <InlineError field="endDate" />

        {/* OPCIONES ESPECÍFICAS */}
        {(isSpeedOptionEnabled() || isAllUnitsOptionEnabled()) && (
          <View style={styles.specificOptionsContainer}>
            <Text style={styles.sectionTitleSpecific}>Opciones específicas</Text>

            {isSpeedOptionEnabled() && (
              <>
                <View style={[
                  styles.optionRow,
                  hasSpeedError && {
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: '#ef4444',
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                  },
                ]}>
                  <View style={styles.optionIconContainer}>
                    <Gauge size={20} color={hasSpeedError ? '#ef4444' : '#ff6b35'} strokeWidth={2} />
                  </View>
                  <Text style={[styles.optionText, hasSpeedError && { color: '#ef4444' }]}>
                    Velocidad mayor a
                  </Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.optionInput}
                      value={speedValue}
                      onChangeText={handleSpeedChange}
                      placeholder="0"
                      keyboardType="numeric"
                      placeholderTextColor="#9CA3AF"
                      editable={true}
                    />
                    <Text style={styles.optionUnit}>Km/h</Text>
                  </View>
                </View>
                <InlineError field="speed" />
              </>
            )}

            {isAllUnitsOptionEnabled() && (
              <View style={styles.toggleRow}>
                <View style={styles.toggleLabelContainer}>
                  <Text style={styles.toggleLabel}>Todas las unidades</Text>
                  <Text style={styles.toggleSubtext}>Incluir todos los vehículos</Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.toggleSwitch,
                    allUnitsEnabled && styles.toggleSwitchActive,
                    !!selectedUnit && { backgroundColor: '#dcd2d2ff', opacity: 1 },
                  ]}
                  onPress={toggleAllUnits}
                  disabled={!!selectedUnit}
                >
                  <Animated.View
                    style={[styles.toggleCircle, { transform: [{ translateX }] }]}
                  />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* MENSAJE GLOBAL (descarga) */}
        <GlobalMessage />

        {/* BOTONES */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[
              styles.excelButton,
              downloadingExcel && { opacity: 0.7 },
              selectedReport === 4 && { opacity: 0.7, backgroundColor: '#023047' },
            ]}
            onPress={handleDownloadExcel}
            disabled={downloadingExcel || selectedReport === 4}
            activeOpacity={0.8}
          >
            {downloadingExcel ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.buttonText}>Descargando...</Text>
              </View>
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Image
                  source={require('../../../../assets/excel.png')}
                  style={{ width: 20, height: 20 }}
                  resizeMode="contain"
                />
                <Text style={styles.buttonText}>Descargar Excel</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.showButton}
            onPress={handleShowReport}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Mostrar</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>

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