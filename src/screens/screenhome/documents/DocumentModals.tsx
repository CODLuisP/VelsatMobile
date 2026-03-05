import React, { useState } from 'react';
import {
  View,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { X, Plus, Camera, Download, ImageIcon, Calendar } from 'lucide-react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import RNFS from 'react-native-fs';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

import { Text } from '../../../components/ScaledComponents';
import { styles } from '../../../styles/documents';
import { DocItem } from './types';

// ─── Cloudflare config ────────────────────────────────────────────────────────
const CLOUDFLARE_ACCOUNT_ID   = 'c6e484ceb13141b8bd322c1015e6fd29';
const CLOUDFLARE_API_TOKEN    = 'q6vLjdHN_zE2g71msCqi3s8J32Gh4NRGyBcHbrXj';
const CLOUDFLARE_DELIVERY_URL = 'https://imagedelivery.net/o0E1jB_kGKnYacpYCBFmZA';

// ─── Helper: formatear fecha como DD/MM/AAAA ─────────────────────────────────
const formatDate = (date: Date): string => {
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
};

// ─── Cloudflare: subir imagen ─────────────────────────────────────────────────

const uploadToCloudflare = async (
  fileUri: string,
  fileName: string,
  mimeType: string,
): Promise<{ id: string; url: string } | null> => {
  try {
    console.log('[CF] Iniciando subida:', { fileUri, fileName, mimeType });

    const formData = new FormData();
    formData.append('file', {
      uri: fileUri,
      name: fileName,
      type: mimeType,
    } as any);

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/images/v1`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
        },
        body: formData,
      },
    );

    console.log('[CF] HTTP status:', response.status);
    const result = await response.json();
    console.log('[CF] Respuesta:', JSON.stringify(result));

    if (result.success) {
      const imageId  = result.result.id;
      const imageUrl = `${CLOUDFLARE_DELIVERY_URL}/${imageId}/public`;
      console.log('[CF] ✅ Subida exitosa:', imageUrl);
      return { id: imageId, url: imageUrl };
    }

    console.error('[CF] ❌ Error:', JSON.stringify(result.errors));
    return null;
  } catch (error) {
    console.error('[CF] ❌ Excepción:', error);
    return null;
  }
};

// ─── Cloudflare: eliminar imagen ──────────────────────────────────────────────

export const deleteFromCloudflare = async (imageId: string): Promise<boolean> => {
  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/images/v1/${imageId}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}` },
      },
    );
    const result = await response.json();
    return result.success;
  } catch {
    return false;
  }
};

// ─── ImageViewerModal ─────────────────────────────────────────────────────────

export const ImageViewerModal = ({
  visible, uri, cloudflareUrl, docName, expiry, onClose,
}: {
  visible: boolean;
  uri: string | null;
  cloudflareUrl: string | null;
  docName: string;
  expiry: string;
  onClose: () => void;
}) => {
  const [downloading, setDownloading] = useState(false);
  const displayUri = cloudflareUrl || uri;

  const handleDownload = async () => {
    if (!displayUri) return;
    try {
      setDownloading(true);

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

      let localUri = displayUri;

      if (displayUri.startsWith('http')) {
        const destPath = `${RNFS.CachesDirectoryPath}/doc_${Date.now()}.jpg`;
        const download = RNFS.downloadFile({ fromUrl: displayUri, toFile: destPath });
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
      setDownloading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.imageModalOverlay}>

        <View style={styles.imageModalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.imageModalClose} activeOpacity={0.8}>
            <X size={20} color="#fff" />
          </TouchableOpacity>
          <View style={styles.imageModalTitleWrap}>
            <Text style={styles.imageModalTitle} numberOfLines={1}>{docName}</Text>
            <Text style={styles.imageModalExpiry}>Vence: {expiry}</Text>
          </View>
          <TouchableOpacity
            onPress={handleDownload}
            style={styles.imageModalDownload}
            activeOpacity={0.8}
            disabled={!displayUri || downloading}
          >
            {downloading
              ? <ActivityIndicator size={18} color="#fff" />
              : <Download size={18} color="#fff" />}
          </TouchableOpacity>
        </View>

        <View style={styles.imageModalBody}>
          {displayUri ? (
            <Image source={{ uri: displayUri }} style={styles.imageModalImg} resizeMode="contain" />
          ) : (
            <View style={styles.imageModalEmpty}>
              <ImageIcon size={56} color="#475569" />
              <Text style={styles.imageModalEmptyText}>Sin imagen cargada</Text>
            </View>
          )}
        </View>

        {displayUri && (
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

export const AddDocModal = ({
  visible, onClose, onAdd,
}: {
  visible: boolean;
  onClose: () => void;
  onAdd: (
    name: string,
    expiry: string,
    imageUri: string | null,
    cloudflareImageUrl: string | null,
    cloudflareImageId: string | null,
  ) => void;
}) => {
  const [name, setName]           = useState('');
  const [expiryDate, setExpiryDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateSelected, setDateSelected] = useState(false);
  const [imageUri, setImageUri]   = useState<string | null>(null);
  const [imageName, setImageName] = useState('imagen.jpg');
  const [imageMime, setImageMime] = useState('image/jpeg');
  const [picking, setPicking]     = useState(false);
  const [uploading, setUploading] = useState(false);

  const reset = () => {
    setName('');
    setExpiryDate(new Date());
    setDateSelected(false);
    setShowDatePicker(false);
    setImageUri(null);
    setImageName('imagen.jpg');
    setImageMime('image/jpeg');
  };

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    // En Android se cierra solo al seleccionar
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (event.type === 'set' && selectedDate) {
      setExpiryDate(selectedDate);
      setDateSelected(true);
    }
  };

  const handlePickImage = async () => {
    if (picking || uploading) return;
    setPicking(true);
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 1,
      });

      if (result.didCancel || !result.assets?.length) return;

      const asset = result.assets[0];
      setImageUri(asset.uri ?? null);
      setImageName(asset.fileName ?? 'imagen.jpg');
      setImageMime(asset.type ?? 'image/jpeg');
    } finally {
      setPicking(false);
    }
  };

  const handleAdd = async () => {
    if (!name.trim()) {
      Alert.alert('Campo requerido', 'Ingresa el nombre del documento.');
      return;
    }
    if (!dateSelected) {
      Alert.alert('Campo requerido', 'Selecciona la fecha de vencimiento.');
      return;
    }

    const expiryStr = formatDate(expiryDate);

    if (imageUri) {
      setUploading(true);
      try {
        const cloudResult = await uploadToCloudflare(imageUri, imageName, imageMime);
        if (cloudResult) {
          onAdd(name.trim(), expiryStr, imageUri, cloudResult.url, cloudResult.id);
        } else {
          Alert.alert('Aviso', 'No se pudo subir a Cloudflare. Se guardará solo localmente.');
          onAdd(name.trim(), expiryStr, imageUri, null, null);
        }
      } finally {
        setUploading(false);
      }
    } else {
      onAdd(name.trim(), expiryStr, null, null, null);
    }

    reset();
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

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

          {/* Nombre */}
          <Text style={styles.modalLabel}>Nombre del documento</Text>
          <TextInput
            style={styles.modalInput}
            placeholder="Ej. Brevete AIII"
            placeholderTextColor="#94a3b8"
            value={name}
            onChangeText={setName}
          />

          {/* Fecha de vencimiento */}
          <Text style={styles.modalLabel}>Fecha de vencimiento</Text>
          <TouchableOpacity
            style={styles.modalInput}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.8}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Calendar size={16} color="#94a3b8" />
              <Text style={{ color: dateSelected ? '#1e293b' : '#94a3b8', fontSize: 14 }}>
                {dateSelected ? formatDate(expiryDate) : 'Seleccionar fecha'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* DatePicker — Android: inline al tocar; iOS: modal */}
          {showDatePicker && (
            Platform.OS === 'ios' ? (
              <Modal transparent animationType="fade" onRequestClose={() => setShowDatePicker(false)}>
                <View style={{
                  flex: 1, justifyContent: 'flex-end',
                  backgroundColor: 'rgba(0,0,0,0.4)',
                }}>
                  <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                      <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                        <Text style={{ color: '#64748b', fontSize: 15 }}>Cancelar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => { setDateSelected(true); setShowDatePicker(false); }}>
                        <Text style={{ color: '#1e40af', fontSize: 15, fontWeight: '600' }}>Listo</Text>
                      </TouchableOpacity>
                    </View>
                    <DateTimePicker
                      value={expiryDate}
                      mode="date"
                      display="spinner"
                      onChange={onDateChange}
                      minimumDate={new Date()}
                      locale="es-ES"
                    />
                  </View>
                </View>
              </Modal>
            ) : (
              <DateTimePicker
                value={expiryDate}
                mode="date"
                display="default"
                onChange={onDateChange}
                minimumDate={new Date()}
              />
            )
          )}

          {/* Imagen */}
          <Text style={styles.modalLabel}>Imagen del documento</Text>
          <TouchableOpacity
            style={styles.modalImagePicker}
            onPress={handlePickImage}
            activeOpacity={0.85}
            disabled={picking || uploading}
          >
            {picking ? (
              <>
                <ActivityIndicator size={20} color="#1e40af" />
                <Text style={styles.modalImagePickerText}>Seleccionando...</Text>
              </>
            ) : uploading ? (
              <>
                <ActivityIndicator size={20} color="#1e40af" />
                <Text style={styles.modalImagePickerText}>Subiendo a Cloudflare...</Text>
              </>
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

          <TouchableOpacity
            style={[styles.modalAddBtn, uploading && { opacity: 0.6 }]}
            onPress={handleAdd}
            activeOpacity={0.85}
            disabled={uploading}
          >
            <Plus size={16} color="#fff" />
            <Text style={styles.modalAddBtnText}>
              {uploading ? 'Subiendo imagen...' : 'Agregar documento'}
            </Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
};

// ─── AddVehicleModal ──────────────────────────────────────────────────────────

export const AddVehicleModal = ({
  visible, onClose, onAdd,
}: {
  visible: boolean;
  onClose: () => void;
  onAdd: (plate: string, name: string) => void;
}) => {
  const [plate, setPlate] = useState('');
  const [name, setName]   = useState('');

  const reset = () => { setPlate(''); setName(''); };

  const handleAdd = () => {
    if (!plate.trim() || !name.trim()) {
      Alert.alert('Campos requeridos', 'Ingresa placa y nombre de la unidad.');
      return;
    }
    onAdd(plate.trim().toUpperCase(), name.trim());
    reset();
    onClose();
  };

  const handleClose = () => { reset(); onClose(); };

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