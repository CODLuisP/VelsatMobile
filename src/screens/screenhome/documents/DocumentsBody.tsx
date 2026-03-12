import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import {
  CreditCard,
  Car,
  Eye,
  ChevronDown,
  ChevronUp,
  Trash2,
  Plus,
  ImageIcon,
  Download,
  FileText,
} from 'lucide-react-native';

import { Text } from '../../../components/ScaledComponents';
import { styles } from '../../../styles/documents';
import { DocItem, Vehicle } from './types';

// ─── API ──────────────────────────────────────────────────────────────────────

const ACCOUNT_ID = 'pakatnamu';
const API_URL    = `https://sub.velsat.pe:2096/api/Admin/GetDocumento?accountID=${ACCOUNT_ID}`;

interface ApiDoc {
  id: number;
  accountID: string;
  deviceID: string;
  tipo_documento: string;
  nombre_documento: string;
  archivo_url: string;
  fecha_vencimiento: string;
  observaciones: string | null;
  estado: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });

const mapApiDocToDocItem = (apiDoc: ApiDoc): DocItem => ({
  id:                 String(apiDoc.id),
  name:               apiDoc.nombre_documento,
  expiry:             formatDate(apiDoc.fecha_vencimiento),
  imageUri:           apiDoc.archivo_url || null,
  cloudflareImageUrl: apiDoc.archivo_url || null,
  cloudflareImageId:  null,
  icon:               FileText,
  estado:             apiDoc.estado,
  deviceID:           apiDoc.deviceID,
});

// ─── Props ────────────────────────────────────────────────────────────────────

interface DocumentsBodyProps {
  downloading: string | null;
  onViewDoc: (doc: DocItem) => void;
  onDeleteDriverDoc: (id: string) => void;
  onDownload: (doc: DocItem) => void;
  onAddDriverDoc: () => void;
  onDeleteVehicle: (id: string, plate: string) => void;
  onDeleteVehicleDoc: (vehicleId: string, docId: string) => void;
  onAddVehicleDoc: (vehicleId: string) => void;
  onAddVehicle: () => void;
  refreshKey: number;
}

// ─── DocCard ──────────────────────────────────────────────────────────────────

const DocCard = ({
  doc, onView, onDelete, onDownload, downloading,
}: {
  doc: DocItem;
  onView: (doc: DocItem) => void;
  onDelete: (id: string) => void;
  onDownload: (doc: DocItem) => void;
  downloading: string | null;
}) => {
  const IconComp = doc.icon;
  const estadoColor =
    doc.estado === 'Vigente'    ? '#16a34a' :
    doc.estado === 'Por Vencer' ? '#f97316' : '#dc2626';

  const confirmDelete = () => {
    Alert.alert('Eliminar documento', `¿Deseas eliminar "${doc.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => onDelete(doc.id) },
    ]);
  };

  return (
    <View style={styles.docCard}>
      <View style={styles.docCardTop}>
        <View style={styles.docIconWrap}>
          <IconComp size={20} color="#1e40af" />
        </View>
        <View style={styles.docInfo}>
          <Text style={styles.docName}>{doc.name}</Text>
          <Text style={styles.docExpiry}>Vence: {doc.expiry}</Text>
        </View>
        <View style={[styles.estadoBadge, { backgroundColor: estadoColor + '20', borderColor: estadoColor }]}>
          <Text style={[styles.estadoBadgeText, { color: estadoColor }]}>{doc.estado}</Text>
        </View>
      </View>

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

      <View style={styles.docActions}>
        <TouchableOpacity style={styles.btnView} onPress={() => onView(doc)} activeOpacity={0.8}>
          <Eye size={13} color="#1e40af" />
          <Text style={styles.btnViewText}>Ver</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btnDownload}
          onPress={() => onDownload(doc)}
          activeOpacity={0.8}
          disabled={downloading === doc.id}
        >
          {downloading === doc.id
            ? <ActivityIndicator size={13} color="#f97316" />
            : <><Download size={13} color="#f97316" /><Text style={styles.btnDownloadText}>Descargar</Text></>}
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnDelete} onPress={confirmDelete} activeOpacity={0.8}>
          <Trash2 size={13} color="#dc2626" />
          <Text style={styles.btnDeleteText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ─── VehicleCard ──────────────────────────────────────────────────────────────

const VehicleCard = ({
  item, downloading, onToggle, onDelete, onView, onDownload, onDeleteDoc, onAddDoc,
}: {
  item: Vehicle;
  downloading: string | null;
  onToggle: (id: string) => void;
  onDelete: (id: string, plate: string) => void;
  onView: (doc: DocItem) => void;
  onDownload: (doc: DocItem) => void;
  onDeleteDoc: (vehicleId: string, docId: string) => void;
  onAddDoc: (vehicleId: string) => void;
}) => (
  <View style={styles.vehicleCard}>
    <View style={styles.vehicleHeader}>
      <TouchableOpacity style={styles.vehicleHeaderLeft} onPress={() => onToggle(item.id)} activeOpacity={0.85}>
        <View style={[styles.vehicleIconWrap, styles.vehicleIconOk]}>
          <Car size={18} color="#1e40af" />
        </View>
        <View>
          <Text style={styles.vehiclePlate}>{item.plate}</Text>
          <Text style={styles.vehicleName}>{item.name}</Text>
        </View>
      </TouchableOpacity>
      <View style={styles.vehicleRight}>
        <TouchableOpacity onPress={() => onToggle(item.id)} activeOpacity={0.8}>
          {item.expanded ? <ChevronUp size={18} color="#64748b" /> : <ChevronDown size={18} color="#64748b" />}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(item.id, item.plate)} style={styles.vehicleDeleteBtn} activeOpacity={0.8}>
          <Trash2 size={14} color="#dc2626" />
        </TouchableOpacity>
      </View>
    </View>

    {item.expanded && (
      <View style={styles.vehicleDocs}>
        {item.documents.map(doc => (
          <DocCard
            key={doc.id}
            doc={doc}
            onView={onView}
            onDelete={id => onDeleteDoc(item.id, id)}
            onDownload={onDownload}
            downloading={downloading}
          />
        ))}
        <TouchableOpacity style={styles.addDocInlineBtn} onPress={() => onAddDoc(item.id)} activeOpacity={0.8}>
          <Plus size={14} color="#1e40af" />
          <Text style={styles.addDocInlineBtnText}>Agregar documento</Text>
        </TouchableOpacity>
      </View>
    )}
  </View>
);

// ─── DocumentsBody ────────────────────────────────────────────────────────────

const DocumentsBody = ({
  downloading,
  onViewDoc,
  onDeleteDriverDoc,
  onDownload,
  onAddDriverDoc,
  onDeleteVehicle,
  onDeleteVehicleDoc,
  onAddVehicleDoc,
  onAddVehicle,
  refreshKey,
}: DocumentsBodyProps) => {
  const [driverDocs, setDriverDocs] = useState<DocItem[]>([]);
  const [vehicles, setVehicles]     = useState<Vehicle[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(API_URL);

      if (response.status === 404) {
        setDriverDocs([]);
        setVehicles([]);
        return;
      }

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const json     = await response.json();
      const apiDocs: ApiDoc[] = json.data ?? [];

      const driver = apiDocs
        .filter(d => d.tipo_documento === '1')
        .map(mapApiDocToDocItem);

      const vehicleMap = new Map<string, Vehicle>();
      apiDocs
        .filter(d => d.tipo_documento === '2')
        .forEach(d => {
          const key = d.deviceID || 'SIN_UNIDAD';
          if (!vehicleMap.has(key)) {
            vehicleMap.set(key, {
              id:       key,
              plate:    key,
              name:     key !== 'SIN_UNIDAD' ? `Unidad ${key}` : 'Sin unidad asignada',
              expanded: true,
              documents: [],
            });
          }
          vehicleMap.get(key)!.documents.push(mapApiDocToDocItem(d));
        });

      setDriverDocs(driver);
      setVehicles(Array.from(vehicleMap.values()));
    } catch (err: any) {
      console.error('[FETCH]', err);
      setError(err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [refreshKey]);

  // Toggle local (no necesita API)
  const handleToggle = (id: string) =>
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, expanded: !v.expanded } : v));

  if (loading) {
    return (
       <View style={[styles.contentList, styles.centered]}>

        <ActivityIndicator size="large" color="#1e40af" />
        <Text style={styles.loadingText}>Cargando documentos…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={fetchDocuments}>
          <Text style={styles.retryBtnText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.contentList}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 30 }}
    >
      <View style={styles.formContainer}>

        {/* ── Conductor ── */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIconWrap}>
            <CreditCard size={15} color="#1e40af" />
          </View>
          <Text style={styles.sectionTitle}>Documentos del conductor</Text>
          <TouchableOpacity style={styles.sectionAddBtn} onPress={onAddDriverDoc} activeOpacity={0.8}>
            <Plus size={14} color="#fff" />
            <Text style={styles.sectionAddBtnText}>Agregar</Text>
          </TouchableOpacity>
        </View>

        {driverDocs.length === 0 ? (
          <View style={styles.emptyState}>
            <FileText size={32} color="#cbd5e1" />
            <Text style={styles.emptyText}>Sin documentos del conductor</Text>
          </View>
        ) : (
          driverDocs.map(doc => (
            <DocCard
              key={doc.id}
              doc={doc}
              onView={onViewDoc}
              onDelete={onDeleteDriverDoc}
              onDownload={onDownload}
              downloading={downloading}
            />
          ))
        )}

        {/* ── Vehículos ── */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <View style={styles.sectionIconWrap}>
            <Car size={15} color="#1e40af" />
          </View>
          <Text style={styles.sectionTitle}>Documentos por unidad</Text>
          <TouchableOpacity style={styles.sectionAddBtn} onPress={onAddVehicle} activeOpacity={0.8}>
            <Plus size={14} color="#fff" />
            <Text style={styles.sectionAddBtnText}>Agregar</Text>
          </TouchableOpacity>
        </View>

        {vehicles.length === 0 ? (
          <View style={styles.emptyState}>
            <Car size={32} color="#cbd5e1" />
            <Text style={styles.emptyText}>Sin unidades registradas</Text>
          </View>
        ) : (
          <FlatList
            data={vehicles}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            renderItem={({ item }) => (
              <VehicleCard
                item={item}
                downloading={downloading}
                onToggle={handleToggle}
                onDelete={onDeleteVehicle}
                onView={onViewDoc}
                onDownload={onDownload}
                onDeleteDoc={onDeleteVehicleDoc}
                onAddDoc={onAddVehicleDoc}
              />
            )}
          />
        )}

      </View>
    </ScrollView>
  );
};

export default DocumentsBody;