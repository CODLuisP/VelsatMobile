import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // ── Header (sin cambios) ───────────────────────────────
  header: {
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  backButton: {
    padding: 8,
    marginRight: 5,
    marginLeft: -10,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#e2e8f0',
    marginBottom: 8,
  },
  headerDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerDate: {
    fontSize: 14,
    color: '#e2e8f0',
    marginLeft: 8,
  },

  // ── Cuerpo: el mapa ocupa todo ─────────────────────────
  content: {
    flex: 1,
    backgroundColor: '#eef1f6',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    overflow: 'hidden',
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#e5e7eb',
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },

  // ── Barra flotante de resumen ──────────────────────────
  statsBar: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    gap: 6,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    shadowColor: '#0f1b3d',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 7,
    elevation: 3,
  },
  statPillText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0f1b3d',
  },
  statPillOff: {
    backgroundColor: 'rgba(15,27,61,0.88)',
  },
  statPillTextOff: {
    color: '#ffffff',
  },
  fitButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0f1b3d',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 7,
    elevation: 3,
  },

  // ── Panel inferior ─────────────────────────────────────
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 16,
    paddingBottom: 14,
    shadowColor: '#0f1b3d',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 12,
  },
  sheetHandleArea: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 10,
  },
  sheetHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#d8dfea',
  },

  // Punto seleccionado
  pointCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f6f8fc',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e8edf5',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  pointDot: {
    width: 30,
    height: 30,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  pointInfo: {
    flex: 1,
  },
  pointTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0f1b3d',
  },
  pointMeta: {
    fontSize: 11,
    color: '#8d97a8',
    fontWeight: '500',
    marginTop: 2,
  },
  pointSpeed: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f1b3d',
  },
  pointSpeedUnit: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8d97a8',
  },
  pointEmpty: {
    fontSize: 12,
    color: '#8d97a8',
    fontWeight: '500',
    flex: 1,
  },

  // Navegador de puntos
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  navButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#f2f5fa',
    borderWidth: 1,
    borderColor: '#e8edf5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  navInput: {
    flex: 1,
    height: 38,
    backgroundColor: '#f2f5fa',
    borderWidth: 1,
    borderColor: '#e8edf5',
    borderRadius: 12,
    paddingHorizontal: 12,
    color: '#0f1b3d',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  goButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: 38,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#e36414',
  },
  goButtonText: {
    color: '#fff',
    fontSize: 12.5,
    fontWeight: '700',
  },

  // Leyenda
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f6f8fc',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  legendDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 10.5,
    color: '#6b7688',
    fontWeight: '600',
  },

  // ── Estados ────────────────────────────────────────────
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eef1f6',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#6b7688',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eef1f6',
    padding: 30,
  },
  errorText: {
    fontSize: 14,
    color: '#6b7688',
    textAlign: 'center',
    marginTop: 12,
  },
});
