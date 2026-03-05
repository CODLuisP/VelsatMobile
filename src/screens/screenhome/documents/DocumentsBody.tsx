import React from 'react';
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
} from 'lucide-react-native';

import { Text } from '../../../components/ScaledComponents';
import { styles } from '../../../styles/documents';
import { DocItem, Vehicle } from './types';

// ─── Props ────────────────────────────────────────────────────────────────────

interface DocumentsBodyProps {
  driverDocs: DocItem[];
  vehicles: Vehicle[];
  downloading: string | null;
  onViewDoc: (doc: DocItem) => void;
  onDeleteDriverDoc: (id: string) => void;
  onDownload: (doc: DocItem) => void;
  onAddDriverDoc: () => void;
  onToggleVehicle: (id: string) => void;
  onDeleteVehicle: (id: string, plate: string) => void;
  onDeleteVehicleDoc: (vehicleId: string, docId: string) => void;
  onAddVehicleDoc: (vehicleId: string) => void;
  onAddVehicle: () => void;
}

// ─── SummaryCard ──────────────────────────────────────────────────────────────

const SummaryCard = ({
  label, value, color, bg,
}: {
  label: string;
  value: number;
  color: string;
  bg: string;
}) => (
  <View style={[styles.summaryCard, { backgroundColor: bg, borderColor: color + '50' }]}>
    <Text style={[styles.summaryValue, { color }]}>{value}</Text>
    <Text style={[styles.summaryLabel, { color }]}>{label}</Text>
  </View>
);

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
    <View style={styles.docCard}>

      {/* Top row */}
      <View style={styles.docCardTop}>
        <View style={styles.docIconWrap}>
          <IconComp size={20} color="#1e40af" />
        </View>
        <View style={styles.docInfo}>
          <Text style={styles.docName}>{doc.name}</Text>
          <Text style={styles.docExpiry}>Vence: {doc.expiry}</Text>
        </View>
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
          {downloading === doc.id ? (
            <ActivityIndicator size={13} color="#f97316" />
          ) : (
            <>
              <Download size={13} color="#f97316" />
              <Text style={styles.btnDownloadText}>Descargar</Text>
            </>
          )}
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

      <TouchableOpacity
        style={styles.vehicleHeaderLeft}
        onPress={() => onToggle(item.id)}
        activeOpacity={0.85}
      >
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
          {item.expanded
            ? <ChevronUp size={18} color="#64748b" />
            : <ChevronDown size={18} color="#64748b" />}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onDelete(item.id, item.plate)}
          style={styles.vehicleDeleteBtn}
          activeOpacity={0.8}
        >
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
            onDelete={(id) => onDeleteDoc(item.id, id)}
            onDownload={onDownload}
            downloading={downloading}
          />
        ))}
        <TouchableOpacity
          style={styles.addDocInlineBtn}
          onPress={() => onAddDoc(item.id)}
          activeOpacity={0.8}
        >
          <Plus size={14} color="#1e40af" />
          <Text style={styles.addDocInlineBtnText}>Agregar documento</Text>
        </TouchableOpacity>
      </View>
    )}
  </View>
);

// ─── DocumentsBody ────────────────────────────────────────────────────────────

const DocumentsBody = ({
  driverDocs,
  vehicles,
  downloading,
  onViewDoc,
  onDeleteDriverDoc,
  onDownload,
  onAddDriverDoc,
  onToggleVehicle,
  onDeleteVehicle,
  onDeleteVehicleDoc,
  onAddVehicleDoc,
  onAddVehicle,
}: DocumentsBodyProps) => {
  const allDocs = [...driverDocs, ...vehicles.flatMap(v => v.documents)];
  const total   = allDocs.length;

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

        {driverDocs.map(doc => (
          <DocCard
            key={doc.id}
            doc={doc}
            onView={onViewDoc}
            onDelete={onDeleteDriverDoc}
            onDownload={onDownload}
            downloading={downloading}
          />
        ))}

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

        <FlatList
          data={vehicles}
          keyExtractor={item => item.id}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          renderItem={({ item }) => (
            <VehicleCard
              item={item}
              downloading={downloading}
              onToggle={onToggleVehicle}
              onDelete={onDeleteVehicle}
              onView={onViewDoc}
              onDownload={onDownload}
              onDeleteDoc={onDeleteVehicleDoc}
              onAddDoc={onAddVehicleDoc}
            />
          )}
        />

      </View>
    </ScrollView>
  );
};

export default DocumentsBody;