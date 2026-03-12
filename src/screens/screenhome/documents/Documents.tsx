import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  Platform,
  Alert,
  PermissionsAndroid,
} from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
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
import { DocItem } from './types';
import DocumentsBody from './DocumentsBody';
import {
  AddDocModal,
  AddVehicleDocModal,
  ImageViewerModal,
  deleteFromCloudflare,
} from './DocumentModals';

const API_BASE = 'https://sub.velsat.pe:2096/api/Admin';

const Documents = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const navigationDetection = useNavigationMode();
  const bottomSpace = getBottomSpace(insets, navigationDetection.hasNavigationBar);
  const topSpace = Platform.OS === 'ios' ? insets.top - 5 : insets.top + 5;

  // ── State ──
  const [downloading, setDownloading] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const refetch = () => setRefreshKey(k => k + 1);

  // Modals
  const [showAddDriverDoc, setShowAddDriverDoc] = useState(false);
  const [showAddVehicleStep1, setShowAddVehicleStep1] = useState(false);
  const [addDocVehicleId, setAddDocVehicleId] = useState<string | null>(null);
  const [viewerDoc, setViewerDoc] = useState<DocItem | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      NavigationBarColor('#ffffff', true);
    }, []),
  );

  // ── Handlers ──

  const handleDownload = async (doc: DocItem) => {
    const uri = doc.cloudflareImageUrl || doc.imageUri;
    if (!uri) {
      Alert.alert('Sin imagen', 'Este documento no tiene imagen cargada.');
      return;
    }
    try {
      setDownloading(doc.id);
      if (Platform.OS === 'android') {
        const androidVersion = Platform.Version as number;
        const permission = androidVersion >= 33
          ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
          : PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;
        const granted = await PermissionsAndroid.request(permission);
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permiso denegado', 'Ve a Configuración > Aplicaciones y habilita el permiso de galería.');
          return;
        }
      }
      let localUri = uri;
      if (uri.startsWith('http')) {
        const destPath = `${RNFS.CachesDirectoryPath}/doc_${Date.now()}.jpg`;
        const result = await RNFS.downloadFile({ fromUrl: uri, toFile: destPath }).promise;
        if (result.statusCode !== 200) {
          Alert.alert('Error', 'No se pudo descargar la imagen del servidor.');
          return;
        }
        localUri = `file://${destPath}`;
      }
      await CameraRoll.saveAsset(localUri, { type: 'photo' });
      Alert.alert('Guardado', 'La imagen se guardó en tu galería.');
    } catch {
      Alert.alert('Error', 'No se pudo guardar la imagen.');
    } finally {
      setDownloading(null);
    }
  };

  const deleteDocFromAPI = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/DeleteDocumento?id=${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) return false;
      const text = await response.text();
      if (!text) return true;
      const json = JSON.parse(text);
      return json.success !== false;
    } catch {
      return false;
    }
  };

  const deleteDriverDoc = async (id: string) => {
    const ok = await deleteDocFromAPI(id);
    if (!ok) {
      Alert.alert('Error', 'No se pudo eliminar el documento del servidor.');
      return;
    }
    refetch();
  };

  const deleteVehicleDoc = async (vehicleId: string, docId: string) => {
    const ok = await deleteDocFromAPI(docId);
    if (!ok) {
      Alert.alert('Error', 'No se pudo eliminar el documento del servidor.');
      return;
    }
    refetch();
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
        onPress: async () => {
          // Buscar los docs de esa unidad en el estado local de DocumentsBody
          // Como el estado vive en DocumentsBody, pasamos el id de la unidad
          // y eliminamos todos sus docs via API
          try {
            // Necesitamos los doc ids — los obtenemos del GET actual
            const response = await fetch(
              `https://sub.velsat.pe:2096/api/Admin/GetDocumento?accountID=pakatnamu`,
            );
            const json = await response.json();
            const docs = (json.data ?? []).filter(
              (d: any) => d.deviceID === id,
            );

            await Promise.all(
              docs.map((d: any) =>
                fetch(
                  `https://sub.velsat.pe:2096/api/Admin/DeleteDocumento?id=${d.id}`,
                  { method: 'DELETE' },
                ),
              ),
            );
          } catch {
            Alert.alert('Error', 'No se pudieron eliminar todos los documentos.');
            return;
          }

          refetch();
        },
      },
    ],
  );
};

  const toggleVehicle = (id: string) => {
    // El toggle se maneja internamente en DocumentsBody
  };

  // ── Render ──

  return (
    <View style={[styles.container, { paddingBottom: bottomSpace }]}>
      {/* Header */}
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
            Controla el estado de todos los documentos de tu flota y del conductor
          </Text>
        </View>
      </LinearGradient>

      {/* Body */}
      <DocumentsBody
        downloading={downloading}
        onViewDoc={setViewerDoc}
        onDeleteDriverDoc={deleteDriverDoc}
        onDownload={handleDownload}
        onAddDriverDoc={() => setShowAddDriverDoc(true)}
        onDeleteVehicle={confirmDeleteVehicle}
        onDeleteVehicleDoc={deleteVehicleDoc}
        onAddVehicleDoc={setAddDocVehicleId}
        onAddVehicle={() => setShowAddVehicleStep1(true)}
        refreshKey={refreshKey}
      />

      {/* Modal: documento del conductor */}
      <AddDocModal
        visible={showAddDriverDoc}
        onClose={() => setShowAddDriverDoc(false)}
        tipoDocumento="1"
        deviceID={null}
        onAdd={() => refetch()}
      />

      {/* Modal paso 1: pedir placa de nueva unidad */}
      <AddVehicleDocModal
        visible={showAddVehicleStep1}
        onClose={() => setShowAddVehicleStep1(false)}
        onConfirm={(plate) => {
          setShowAddVehicleStep1(false);
          setAddDocVehicleId(plate);
        }}
      />

      {/* Modal paso 2: agregar documento a la unidad */}
      <AddDocModal
        visible={!!addDocVehicleId}
        onClose={() => setAddDocVehicleId(null)}
        tipoDocumento="2"
        deviceID={addDocVehicleId}
        onAdd={() => {
          setAddDocVehicleId(null);
          refetch();
        }}
      />

      {/* Visor de imagen */}
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