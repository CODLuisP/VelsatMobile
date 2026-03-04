import {
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
  FlatList,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  Image,
  Dimensions,
  PermissionsAndroid,
} from 'react-native';
import React, { useState } from 'react';
import {
  ChevronLeft,
  FileText,
  Car,
  AlertTriangle,
  CheckCircle,
  Clock,
  Upload,
  Eye,
  ChevronDown,
  ChevronUp,
  Stethoscope,
  Shield,
  Award,
  Wrench,
  CreditCard,
  Plus,
  Trash2,
  X,
  ImageIcon,
  Download,
  Camera,
} from 'lucide-react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import NavigationBarColor from 'react-native-navigation-bar-color';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { launchImageLibrary } from 'react-native-image-picker';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';

import { RootStackParamList } from '../../../../App';
import { getBottomSpace, useNavigationMode } from '../../../hooks/useNavigationMode';
import { styles } from '../../../styles/documents';
import { Text } from '../../../components/ScaledComponents';


// ─── Types ────────────────────────────────────────────────────────────────────

type DocStatus = 'vigente' | 'por_vencer' | 'vencido';

interface Document {
  id: string;
  name: string;
  icon: any;
  expiry: string;
  status: DocStatus;
  imageUri: string | null;
}

interface Vehicle {
  id: string;
  plate: string;
  name: string;
  documents: Document[];
  expanded: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getStatusConfig = (status: DocStatus) => {
  switch (status) {
    case 'vigente':
      return { label: 'Vigente', color: '#16a34a', bg: '#dcfce7', icon: CheckCircle };
    case 'por_vencer':
      return { label: 'Por vencer', color: '#d97706', bg: '#fef3c7', icon: Clock };
    case 'vencido':
      return { label: 'Vencido', color: '#dc2626', bg: '#fee2e2', icon: AlertTriangle };
  }
};

const generateId = () => Math.random().toString(36).substring(2, 9);

// ─── Mock Data ────────────────────────────────────────────────────────────────

const initialDriverDocs: Document[] = [
  { id: 'd1', name: 'Licencia de conducir', icon: CreditCard, expiry: '15/08/2025', status: 'vigente', imageUri: null },
  { id: 'd2', name: 'Examen médico', icon: Stethoscope, expiry: '01/04/2025', status: 'por_vencer', imageUri: null },
  { id: 'd3', name: 'SOAT personal', icon: Shield, expiry: '10/02/2025', status: 'vencido', imageUri: null },
  { id: 'd4', name: 'Certificación SENATI', icon: Award, expiry: '20/12/2025', status: 'vigente', imageUri: null },
];

const initialVehicles: Vehicle[] = [
  {
    id: 'v1', plate: 'ABC-123', name: 'Volvo FH 500', expanded: false,
    documents: [
      { id: 'v1d1', name: 'SOAT', icon: Shield, expiry: '30/06/2025', status: 'vigente', imageUri: null },
      { id: 'v1d2', name: 'Revisión Técnica', icon: Wrench, expiry: '15/03/2025', status: 'por_vencer', imageUri: null },
      { id: 'v1d3', name: 'Tarjeta de propiedad', icon: FileText, expiry: '01/01/2030', status: 'vigente', imageUri: null },
    ],
  },
  {
    id: 'v2', plate: 'XYZ-789', name: 'Scania R450', expanded: false,
    documents: [
      { id: 'v2d1', name: 'SOAT', icon: Shield, expiry: '10/01/2025', status: 'vencido', imageUri: null },
      { id: 'v2d2', name: 'Revisión Técnica', icon: Wrench, expiry: '20/09/2025', status: 'vigente', imageUri: null },
      { id: 'v2d3', name: 'Certificado de gases', icon: Award, expiry: '20/09/2025', status: 'vigente', imageUri: null },
    ],
  },
];

// ─── StatusBadge ──────────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: DocStatus }) => {
  const cfg = getStatusConfig(status);
  const IconComp = cfg.icon;
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
      <IconComp size={11} color={cfg.color} />
      <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
};

// ─── ImageViewerModal ─────────────────────────────────────────────────────────

const ImageViewerModal = ({
  visible,
  uri,
  docName,
  expiry,
  status,
  onClose,
}: {
  visible: boolean;
  uri: string | null;
  docName: string;
  expiry: string;
  status: DocStatus;
  onClose: () => void;
}) => {
  const [downloading, setDownloading] = useState(false);
  const cfg = getStatusConfig(status);

  const handleDownload = async () => {
    if (!uri) return;
    try {
      setDownloading(true);
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permiso denegado', 'Se necesita permiso para guardar la imagen.');
          return;
        }
      }
      await CameraRoll.saveAsset(uri, { type: 'photo' });
      Alert.alert('Descargado', 'La imagen se guardó en tu galería.');
    } catch (e) {
      Alert.alert('Error', 'No se pudo descargar la imagen.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.imageModalOverlay}>
        {/* Header */}
        <View style={styles.imageModalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.imageModalClose} activeOpacity={0.8}>
            <X size={20} color="#fff" />
          </TouchableOpacity>
          <View style={styles.imageModalTitleWrap}>
            <Text style={styles.imageModalTitle} numberOfLines={1}>{docName}</Text>
            <View style={styles.imageModalMeta}>
              <Text style={styles.imageModalExpiry}>Vence: {expiry}</Text>
              <View style={[styles.imageModalBadge, { backgroundColor: cfg.bg }]}>
                <Text style={[styles.imageModalBadgeText, { color: cfg.color }]}>{cfg.label}</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            onPress={handleDownload}
            style={styles.imageModalDownload}
            activeOpacity={0.8}
            disabled={!uri || downloading}
          >
            {downloading
              ? <ActivityIndicator size={18} color="#fff" />
              : <Download size={18} color="#fff" />}
          </TouchableOpacity>
        </View>

        {/* Image */}
        <View style={styles.imageModalBody}>
          {uri ? (
            <Image
              source={{ uri }}
              style={styles.imageModalImg}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.imageModalEmpty}>
              <ImageIcon size={56} color="#475569" />
              <Text style={styles.imageModalEmptyText}>Sin imagen cargada</Text>
            </View>
          )}
        </View>

        {/* Footer download button */}
        {uri && (
          <TouchableOpacity
            style={styles.imageModalFooterBtn}
            onPress={handleDownload}
            activeOpacity={0.85}
            disabled={downloading}
          >
            {downloading ? (
              <ActivityIndicator size={16} color="#fff" />
            ) : (
              <>
                <Download size={16} color="#fff" />
                <Text style={styles.imageModalFooterBtnText}>Descargar imagen</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </Modal>
  );
};

// ─── AddDocModal ──────────────────────────────────────────────────────────────

const AddDocModal = ({
  visible,
  onClose,
  onAdd,
}: {
  visible: boolean;
  onClose: () => void;
  onAdd: (name: string, expiry: string, status: DocStatus, imageUri: string | null) => void;
}) => {
  const [name, setName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [status, setStatus] = useState<DocStatus>('vigente');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);

  const handlePickImage = async () => {
    try {
      setPicking(true);
      const result = await launchImageLibrary({ mediaType: 'photo', quality: 1, selectionLimit: 1 });
      if (!result.didCancel && result.assets?.length) {
        setImageUri(result.assets[0].uri ?? null);
      }
    } finally {
      setPicking(false);
    }
  };

  const handleAdd = () => {
    if (!name.trim() || !expiry.trim()) {
      Alert.alert('Campos requeridos', 'Ingresa nombre y fecha de vencimiento.');
      return;
    }
    onAdd(name.trim(), expiry.trim(), status, imageUri);
    setName(''); setExpiry(''); setStatus('vigente'); setImageUri(null);
    onClose();
  };

  const handleClose = () => {
    setName(''); setExpiry(''); setStatus('vigente'); setImageUri(null);
    onClose();
  };

  const statusOptions: { value: DocStatus; label: string; color: string }[] = [
    { value: 'vigente', label: 'Vigente', color: '#16a34a' },
    { value: 'por_vencer', label: 'Por vencer', color: '#d97706' },
    { value: 'vencido', label: 'Vencido', color: '#dc2626' },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHeaderRow}>
            <Text style={styles.modalTitle}>Agregar documento</Text>
            <TouchableOpacity onPress={handleClose} activeOpacity={0.8}>
              <X size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          <Text style={styles.modalLabel}>Nombre del documento</Text>
          <TextInput
            style={styles.modalInput}
            placeholder="Ej. Brevete AIII"
            placeholderTextColor="#94a3b8"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.modalLabel}>Fecha de vencimiento</Text>
          <TextInput
            style={styles.modalInput}
            placeholder="DD/MM/AAAA"
            placeholderTextColor="#94a3b8"
            value={expiry}
            onChangeText={setExpiry}
          />

          <Text style={styles.modalLabel}>Estado</Text>
          <View style={styles.statusPicker}>
            {statusOptions.map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.statusOption,
                  status === opt.value && { backgroundColor: opt.color, borderColor: opt.color },
                ]}
                onPress={() => setStatus(opt.value)}
                activeOpacity={0.8}
              >
                <Text style={[styles.statusOptionText, status === opt.value && { color: '#fff' }]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Image picker */}
          <Text style={styles.modalLabel}>Imagen del documento</Text>
          <TouchableOpacity
            style={styles.modalImagePicker}
            onPress={handlePickImage}
            activeOpacity={0.85}
          >
            {picking ? (
              <ActivityIndicator size={20} color="#1e40af" />
            ) : imageUri ? (
              <>
                <Image source={{ uri: imageUri }} style={styles.modalImageThumb} resizeMode="cover" />
                <View style={styles.modalImagePickerOverlay}>
                  <Camera size={18} color="#fff" />
                  <Text style={styles.modalImagePickerOverlayText}>Cambiar</Text>
                </View>
              </>
            ) : (
              <>
                <Camera size={24} color="#1e40af" />
                <Text style={styles.modalImagePickerText}>Seleccionar imagen</Text>
                <Text style={styles.modalImagePickerSub}>Toca para abrir la galería</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.modalAddBtn} onPress={handleAdd} activeOpacity={0.85}>
            <Plus size={16} color="#fff" />
            <Text style={styles.modalAddBtnText}>Agregar documento</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// ─── AddVehicleModal ──────────────────────────────────────────────────────────

const AddVehicleModal = ({
  visible,
  onClose,
  onAdd,
}: {
  visible: boolean;
  onClose: () => void;
  onAdd: (plate: string, name: string) => void;
}) => {
  const [plate, setPlate] = useState('');
  const [name, setName] = useState('');

  const handleAdd = () => {
    if (!plate.trim() || !name.trim()) {
      Alert.alert('Campos requeridos', 'Ingresa placa y nombre de la unidad.');
      return;
    }
    onAdd(plate.trim().toUpperCase(), name.trim());
    setPlate(''); setName('');
    onClose();
  };

  const handleClose = () => { setPlate(''); setName(''); onClose(); };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHeaderRow}>
            <Text style={styles.modalTitle}>Agregar unidad</Text>
            <TouchableOpacity onPress={handleClose} activeOpacity={0.8}>
              <X size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          <Text style={styles.modalLabel}>Placa</Text>
          <TextInput
            style={styles.modalInput}
            placeholder="Ej. MNO-321"
            placeholderTextColor="#94a3b8"
            value={plate}
            onChangeText={setPlate}
            autoCapitalize="characters"
          />

          <Text style={styles.modalLabel}>Nombre / Modelo</Text>
          <TextInput
            style={styles.modalInput}
            placeholder="Ej. Kenworth T680"
            placeholderTextColor="#94a3b8"
            value={name}
            onChangeText={setName}
          />

          <TouchableOpacity style={styles.modalAddBtn} onPress={handleAdd} activeOpacity={0.85}>
            <Plus size={16} color="#fff" />
            <Text style={styles.modalAddBtnText}>Agregar unidad</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// ─── DocCard ──────────────────────────────────────────────────────────────────

const DocCard = ({
  doc,
  onView,
  onDelete,
  onDownload,
  downloading,
}: {
  doc: Document;
  onView: (doc: Document) => void;
  onDelete: (id: string) => void;
  onDownload: (doc: Document) => void;
  downloading: string | null;
}) => {
  const IconComp = doc.icon;
  const cfg = getStatusConfig(doc.status);

  const confirmDelete = () => {
    Alert.alert(
      'Eliminar documento',
      `¿Deseas eliminar "${doc.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => onDelete(doc.id) },
      ],
    );
  };

  return (
    <View style={[styles.docCard, { borderLeftColor: cfg.color }]}>
      {/* Top row */}
      <View style={styles.docCardTop}>
        <View style={[styles.docIconWrap, { backgroundColor: `${cfg.color}18` }]}>
          <IconComp size={20} color={cfg.color} />
        </View>
        <View style={styles.docInfo}>
          <Text style={styles.docName}>{doc.name}</Text>
          <Text style={styles.docExpiry}>Vence: {doc.expiry}</Text>
        </View>
        <StatusBadge status={doc.status} />
      </View>

      {/* Thumbnail */}
      {doc.imageUri ? (
        <TouchableOpacity onPress={() => onView(doc)} activeOpacity={0.9} style={styles.thumbWrap}>
          <Image source={{ uri: doc.imageUri }} style={styles.thumbImg} resizeMode="cover" />
          <View style={styles.thumbOverlay}>
            <Eye size={15} color="#fff" />
            <Text style={styles.thumbOverlayText}>Toca para ver</Text>
          </View>
        </TouchableOpacity>
      ) : (
        <View style={styles.thumbEmpty}>
          <ImageIcon size={22} color="#cbd5e1" />
          <Text style={styles.thumbEmptyText}>Sin imagen</Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.docActions}>
        {/* Ver */}
        <TouchableOpacity style={styles.btnView} onPress={() => onView(doc)} activeOpacity={0.8}>
          <Eye size={13} color="#1e40af" />
          <Text style={styles.btnViewText}>Ver</Text>
        </TouchableOpacity>

        {/* Descargar */}
        <TouchableOpacity
          style={styles.btnDownload}
          onPress={() => onDownload(doc)}
          activeOpacity={0.8}
          disabled={downloading === doc.id}
        >
          {downloading === doc.id ? (
            <ActivityIndicator size={13} color="#f97316" />
          ) : (
            <>
              <Download size={13} color="#f97316" />
              <Text style={styles.btnDownloadText}>Descargar</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Eliminar */}
        <TouchableOpacity style={styles.btnDelete} onPress={confirmDelete} activeOpacity={0.8}>
          <Trash2 size={13} color="#dc2626" />
          <Text style={styles.btnDeleteText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ─── AlertBanner ─────────────────────────────────────────────────────────────

const AlertBanner = ({ docs }: { docs: Document[] }) => {
  const urgent = docs.filter(d => d.status !== 'vigente');
  if (urgent.length === 0) return null;
  return (
    <View style={styles.alertBanner}>
      <View style={styles.alertBannerHeader}>
        <AlertTriangle size={15} color="#d97706" />
        <Text style={styles.alertBannerTitle}>
          {urgent.length} documento{urgent.length > 1 ? 's' : ''} requiere{urgent.length > 1 ? 'n' : ''} atención
        </Text>
      </View>
      {urgent.map(d => {
        const cfg = getStatusConfig(d.status);
        return (
          <View key={d.id} style={styles.alertItem}>
            <View style={[styles.alertDot, { backgroundColor: cfg.color }]} />
            <Text style={styles.alertItemText}>
              {d.name}<Text style={{ color: cfg.color }}> · {cfg.label}</Text>
            </Text>
          </View>
        );
      })}
    </View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

const Documents = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const navigationDetection = useNavigationMode();
  const bottomSpace = getBottomSpace(insets, navigationDetection.hasNavigationBar);

  const [driverDocs, setDriverDocs] = useState<Document[]>(initialDriverDocs);
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [uploading, setUploading] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  // Modals
  const [showAddDriverDoc, setShowAddDriverDoc] = useState(false);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [addDocVehicleId, setAddDocVehicleId] = useState<string | null>(null);
  const [viewerDoc, setViewerDoc] = useState<Document | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      NavigationBarColor('#00296b', false);
    }, []),
  );

  const topSpace = Platform.OS === 'ios' ? insets.top - 5 : insets.top + 5;

  const allDocs = [...driverDocs, ...vehicles.flatMap(v => v.documents)];
  const total = allDocs.length;
  const vigente = allDocs.filter(d => d.status === 'vigente').length;
  const porVencer = allDocs.filter(d => d.status === 'por_vencer').length;
  const vencido = allDocs.filter(d => d.status === 'vencido').length;

  // ── Download image ──────────────────────────────────────────────────────────

  const handleDownload = async (doc: Document) => {
    if (!doc.imageUri) {
      Alert.alert('Sin imagen', 'Este documento no tiene imagen cargada.');
      return;
    }
    try {
      setDownloading(doc.id);
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permiso denegado', 'Se necesita permiso para guardar la imagen.');
          return;
        }
      }
      await CameraRoll.saveAsset(doc.imageUri, { type: 'photo' });
      Alert.alert('Descargado', 'La imagen se guardó en tu galería.');
    } catch (_) {
      Alert.alert('Error', 'No se pudo descargar la imagen.');
    } finally {
      setDownloading(null);
    }
  };

  // ── Pick image (cambiar desde tarjeta) ──────────────────────────────────────

  const pickImage = async (docId: string, isDriverDoc: boolean, vehicleId?: string) => {
    try {
      setUploading(docId);
      const result = await launchImageLibrary({ mediaType: 'photo', quality: 1, selectionLimit: 1 });
      if (result.didCancel || !result.assets?.length) return;
      const uri = result.assets[0].uri ?? null;
      if (!uri) return;
      if (isDriverDoc) {
        setDriverDocs(prev => prev.map(d => d.id === docId ? { ...d, imageUri: uri } : d));
      } else if (vehicleId) {
        setVehicles(prev => prev.map(v =>
          v.id === vehicleId
            ? { ...v, documents: v.documents.map(d => d.id === docId ? { ...d, imageUri: uri } : d) }
            : v,
        ));
      }
    } catch (_) {
    } finally {
      setUploading(null);
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────

  const deleteDriverDoc = (id: string) => setDriverDocs(prev => prev.filter(d => d.id !== id));

  const deleteVehicleDoc = (vehicleId: string, docId: string) =>
    setVehicles(prev => prev.map(v =>
      v.id === vehicleId ? { ...v, documents: v.documents.filter(d => d.id !== docId) } : v,
    ));

  const confirmDeleteVehicle = (id: string, plate: string) => {
    Alert.alert(
      'Eliminar unidad',
      `¿Eliminar la unidad ${plate} y todos sus documentos?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => setVehicles(prev => prev.filter(v => v.id !== id)) },
      ],
    );
  };

  // ── Add ─────────────────────────────────────────────────────────────────────

  const addDriverDoc = (name: string, expiry: string, status: DocStatus, imageUri: string | null) => {
    setDriverDocs(prev => [...prev, { id: generateId(), name, expiry, status, icon: FileText, imageUri }]);
  };

  const addVehicleDoc = (vehicleId: string, name: string, expiry: string, status: DocStatus, imageUri: string | null) => {
    const newDoc: Document = { id: generateId(), name, expiry, status, icon: FileText, imageUri };
    setVehicles(prev => prev.map(v =>
      v.id === vehicleId ? { ...v, documents: [...v.documents, newDoc] } : v,
    ));
  };

  const addVehicle = (plate: string, name: string) => {
    setVehicles(prev => [...prev, { id: generateId(), plate, name, expanded: true, documents: [] }]);
  };

  const toggleVehicle = (id: string) =>
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, expanded: !v.expanded } : v));

  // ── Render helpers ──────────────────────────────────────────────────────────

  const renderSummaryCard = (label: string, value: number, color: string, bg: string) => (
    <View style={[styles.summaryCard, { backgroundColor: bg, borderColor: color + '50' }]}>
      <Text style={[styles.summaryValue, { color }]}>{value}</Text>
      <Text style={[styles.summaryLabel, { color }]}>{label}</Text>
    </View>
  );

  const renderVehicleCard = ({ item }: { item: Vehicle }) => {
    const hasIssues = item.documents.some(d => d.status !== 'vigente');
    return (
      <View style={styles.vehicleCard}>
        <View style={styles.vehicleHeader}>
          <TouchableOpacity
            style={styles.vehicleHeaderLeft}
            onPress={() => toggleVehicle(item.id)}
            activeOpacity={0.85}
          >
            <View style={[styles.vehicleIconWrap, hasIssues ? styles.vehicleIconAlert : styles.vehicleIconOk]}>
              <Car size={18} color={hasIssues ? '#d97706' : '#1e40af'} />
            </View>
            <View>
              <Text style={styles.vehiclePlate}>{item.plate}</Text>
              <Text style={styles.vehicleName}>{item.name}</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.vehicleRight}>
            {hasIssues && (
              <View style={styles.vehicleAlertBadge}>
                <AlertTriangle size={11} color="#d97706" />
              </View>
            )}
            <TouchableOpacity
              onPress={() => confirmDeleteVehicle(item.id, item.plate)}
              style={styles.vehicleDeleteBtn}
              activeOpacity={0.8}
            >
              <Trash2 size={14} color="#dc2626" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => toggleVehicle(item.id)} activeOpacity={0.8}>
              {item.expanded ? <ChevronUp size={18} color="#64748b" /> : <ChevronDown size={18} color="#64748b" />}
            </TouchableOpacity>
          </View>
        </View>

        {item.expanded && (
          <View style={styles.vehicleDocs}>
            {item.documents.map(doc => (
              <DocCard
                key={doc.id}
                doc={doc}
                onView={setViewerDoc}
                onDelete={(id) => deleteVehicleDoc(item.id, id)}
                onDownload={handleDownload}
                downloading={downloading}
              />
            ))}
            <TouchableOpacity
              style={styles.addDocInlineBtn}
              onPress={() => setAddDocVehicleId(item.id)}
              activeOpacity={0.8}
            >
              <Plus size={14} color="#1e40af" />
              <Text style={styles.addDocInlineBtnText}>Agregar documento</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <LinearGradient
      colors={['#021e4bff', '#183890ff', '#032660ff']}
      style={[styles.container, { paddingBottom: bottomSpace - 2 }]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: topSpace }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.7}>
            <ChevronLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerMainTitle}>Documentos</Text>
        </View>
        <View style={styles.headerBottom}>
          <Text style={styles.headerTitle}>Gestión documental</Text>
          <Text style={styles.headerSubtitle}>
            Controla el estado de todos los documentos del conductor y de tu flota.
          </Text>
        </View>
      </View>

      {/* ── Body ── */}
      <ScrollView
        style={styles.contentList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 30 }}
      >
        <View style={styles.formContainer}>

          {/* Summary */}
          <View style={styles.summaryRow}>
            {renderSummaryCard('Total', total, '#1e40af', '#eff6ff')}
            {renderSummaryCard('Vigentes', vigente, '#16a34a', '#dcfce7')}
            {renderSummaryCard('Por vencer', porVencer, '#d97706', '#fef3c7')}
            {renderSummaryCard('Vencidos', vencido, '#dc2626', '#fee2e2')}
          </View>

          {/* Alertas */}
          <AlertBanner docs={allDocs} />

          {/* ── Conductor ── */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconWrap}>
              <CreditCard size={15} color="#1e40af" />
            </View>
            <Text style={styles.sectionTitle}>Documentos del conductor</Text>
            <TouchableOpacity style={styles.sectionAddBtn} onPress={() => setShowAddDriverDoc(true)} activeOpacity={0.8}>
              <Plus size={14} color="#fff" />
              <Text style={styles.sectionAddBtnText}>Agregar</Text>
            </TouchableOpacity>
          </View>

          {driverDocs.map(doc => (
            <DocCard
              key={doc.id}
              doc={doc}
              onView={setViewerDoc}
              onDelete={deleteDriverDoc}
              onDownload={handleDownload}
              downloading={downloading}
            />
          ))}

          {/* ── Vehículos ── */}
          <View style={[styles.sectionHeader, { marginTop: 24 }]}>
            <View style={styles.sectionIconWrap}>
              <Car size={15} color="#1e40af" />
            </View>
            <Text style={styles.sectionTitle}>Documentos por unidad</Text>
            <TouchableOpacity style={styles.sectionAddBtn} onPress={() => setShowAddVehicle(true)} activeOpacity={0.8}>
              <Plus size={14} color="#fff" />
              <Text style={styles.sectionAddBtnText}>Agregar</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={vehicles}
            keyExtractor={item => item.id}
            renderItem={renderVehicleCard}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          />

        </View>
      </ScrollView>

      {/* ── Modals ── */}

      <AddDocModal
        visible={showAddDriverDoc}
        onClose={() => setShowAddDriverDoc(false)}
        onAdd={addDriverDoc}
      />

      <AddDocModal
        visible={!!addDocVehicleId}
        onClose={() => setAddDocVehicleId(null)}
        onAdd={(name, expiry, status, imageUri) => {
          if (addDocVehicleId) addVehicleDoc(addDocVehicleId, name, expiry, status, imageUri);
        }}
      />

      <AddVehicleModal
        visible={showAddVehicle}
        onClose={() => setShowAddVehicle(false)}
        onAdd={addVehicle}
      />

      <ImageViewerModal
        visible={!!viewerDoc}
        uri={viewerDoc?.imageUri ?? null}
        docName={viewerDoc?.name ?? ''}
        expiry={viewerDoc?.expiry ?? ''}
        status={viewerDoc?.status ?? 'vigente'}
        onClose={() => setViewerDoc(null)}
      />
    </LinearGradient>
  );
};

export default Documents;