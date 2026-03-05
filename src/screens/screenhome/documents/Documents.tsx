import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  Platform,
  Alert,
  PermissionsAndroid,
} from 'react-native';
import { ChevronLeft, FileText } from 'lucide-react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import NavigationBarColor from 'react-native-navigation-bar-color';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import RNFS from 'react-native-fs';

import { RootStackParamList } from '../../../../App';
import { getBottomSpace, useNavigationMode } from '../../../hooks/useNavigationMode';
import { styles } from '../../../styles/documents';
import { Text } from '../../../components/ScaledComponents';
import { DocItem, Vehicle } from './types';
import { initialDriverDocs, initialVehicles } from './mockData';
import { generateId } from './helpers';
import DocumentsBody from './DocumentsBody';
import { AddDocModal, AddVehicleModal, ImageViewerModal, deleteFromCloudflare } from './DocumentModals';

// ─── Main Screen ──────────────────────────────────────────────────────────────

const Documents = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const navigationDetection = useNavigationMode();
  const bottomSpace = getBottomSpace(insets, navigationDetection.hasNavigationBar);
  const topSpace = Platform.OS === 'ios' ? insets.top - 5 : insets.top + 5;

  // ── State ───────────────────────────────────────────────────────────────────

  const [driverDocs, setDriverDocs]   = useState<DocItem[]>(initialDriverDocs);
  const [vehicles, setVehicles]       = useState<Vehicle[]>(initialVehicles);
  const [downloading, setDownloading] = useState<string | null>(null);

  // Modals
  const [showAddDriverDoc, setShowAddDriverDoc] = useState(false);
  const [showAddVehicle, setShowAddVehicle]     = useState(false);
  const [addDocVehicleId, setAddDocVehicleId]   = useState<string | null>(null);
  const [viewerDoc, setViewerDoc]               = useState<DocItem | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      NavigationBarColor('#ffffff', true);
    }, []),
  );

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleDownload = async (doc: DocItem) => {
    const uri = doc.cloudflareImageUrl || doc.imageUri;
    if (!uri) {
      Alert.alert('Sin imagen', 'Este documento no tiene imagen cargada.');
      return;
    }
    try {
      setDownloading(doc.id);

      // Pedir permiso correcto según versión Android
      if (Platform.OS === 'android') {
        const androidVersion = Platform.Version as number;
        if (androidVersion >= 33) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          );
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            Alert.alert('Permiso denegado', 'Ve a Configuración > Aplicaciones y habilita el permiso de galería.');
            return;
          }
        } else {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          );
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            Alert.alert('Permiso denegado', 'Ve a Configuración > Aplicaciones y habilita el permiso de galería.');
            return;
          }
        }
      }

      let localUri = uri;

      // Si es URL remota (Cloudflare), descargar primero al cache
      if (uri.startsWith('http')) {
        const destPath = `${RNFS.CachesDirectoryPath}/doc_${Date.now()}.jpg`;
        const download = RNFS.downloadFile({ fromUrl: uri, toFile: destPath });
        const result = await download.promise;
        if (result.statusCode !== 200) {
          Alert.alert('Error', 'No se pudo descargar la imagen del servidor.');
          return;
        }
        localUri = `file://${destPath}`;
      }

      await CameraRoll.saveAsset(localUri, { type: 'photo' });
      Alert.alert('Guardado', 'La imagen se guardó en tu galería.');
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', 'No se pudo guardar la imagen.');
    } finally {
      setDownloading(null);
    }
  };

  const deleteDriverDoc = (id: string) => {
    const doc = driverDocs.find(d => d.id === id);
    if (doc?.cloudflareImageId) {
      deleteFromCloudflare(doc.cloudflareImageId).catch(() => {});
    }
    setDriverDocs(prev => prev.filter(d => d.id !== id));
  };

  const deleteVehicleDoc = (vehicleId: string, docId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    const doc = vehicle?.documents.find(d => d.id === docId);
    if (doc?.cloudflareImageId) {
      deleteFromCloudflare(doc.cloudflareImageId).catch(() => {});
    }
    setVehicles(prev =>
      prev.map(v =>
        v.id === vehicleId
          ? { ...v, documents: v.documents.filter(d => d.id !== docId) }
          : v,
      ),
    );
  };

  const confirmDeleteVehicle = (id: string, plate: string) => {
    Alert.alert(
      'Eliminar unidad',
      `¿Eliminar la unidad ${plate} y todos sus documentos?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            const vehicle = vehicles.find(v => v.id === id);
            vehicle?.documents.forEach(doc => {
              if (doc.cloudflareImageId) {
                deleteFromCloudflare(doc.cloudflareImageId).catch(() => {});
              }
            });
            setVehicles(prev => prev.filter(v => v.id !== id));
          },
        },
      ],
    );
  };

  const addDriverDoc = (
    name: string,
    expiry: string,
    imageUri: string | null,
    cloudflareImageUrl: string | null,
    cloudflareImageId: string | null,
  ) => {
    setDriverDocs(prev => [
      ...prev,
      { id: generateId(), name, expiry, icon: FileText, imageUri, cloudflareImageUrl, cloudflareImageId },
    ]);
  };

  const addVehicleDoc = (
    vehicleId: string,
    name: string,
    expiry: string,
    imageUri: string | null,
    cloudflareImageUrl: string | null,
    cloudflareImageId: string | null,
  ) => {
    setVehicles(prev =>
      prev.map(v =>
        v.id === vehicleId
          ? {
              ...v,
              documents: [
                ...v.documents,
                { id: generateId(), name, expiry, icon: FileText, imageUri, cloudflareImageUrl, cloudflareImageId },
              ],
            }
          : v,
      ),
    );
  };

  const addVehicle = (plate: string, name: string) => {
    setVehicles(prev => [
      ...prev,
      { id: generateId(), plate, name, expanded: true, documents: [] },
    ]);
  };

  const toggleVehicle = (id: string) =>
    setVehicles(prev =>
      prev.map(v => (v.id === id ? { ...v, expanded: !v.expanded } : v)),
    );

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <View style={[styles.container, { paddingBottom: bottomSpace }]}>

      {/* ── Header ── */}
      <LinearGradient
        colors={['#05194fff', '#05194fff', '#18223dff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.header, { paddingTop: topSpace }]}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
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
      </LinearGradient>

      {/* ── Body ── */}
      <DocumentsBody
        driverDocs={driverDocs}
        vehicles={vehicles}
        downloading={downloading}
        onViewDoc={setViewerDoc}
        onDeleteDriverDoc={deleteDriverDoc}
        onDownload={handleDownload}
        onAddDriverDoc={() => setShowAddDriverDoc(true)}
        onToggleVehicle={toggleVehicle}
        onDeleteVehicle={confirmDeleteVehicle}
        onDeleteVehicleDoc={deleteVehicleDoc}
        onAddVehicleDoc={setAddDocVehicleId}
        onAddVehicle={() => setShowAddVehicle(true)}
      />

      {/* ── Modals ── */}
      <AddDocModal
        visible={showAddDriverDoc}
        onClose={() => setShowAddDriverDoc(false)}
        onAdd={addDriverDoc}
      />

      <AddDocModal
        visible={!!addDocVehicleId}
        onClose={() => setAddDocVehicleId(null)}
        onAdd={(name, expiry, imageUri, cloudflareImageUrl, cloudflareImageId) => {
          if (addDocVehicleId) {
            addVehicleDoc(addDocVehicleId, name, expiry, imageUri, cloudflareImageUrl, cloudflareImageId);
          }
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
        cloudflareUrl={viewerDoc?.cloudflareImageUrl ?? null}
        docName={viewerDoc?.name ?? ''}
        expiry={viewerDoc?.expiry ?? ''}
        onClose={() => setViewerDoc(null)}
      />

    </View>
  );
};

export default Documents;