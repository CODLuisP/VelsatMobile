import { StyleSheet } from 'react-native';

/**
 * Estilos del cuerpo del Reporte General (resumen + línea de tiempo).
 * Van aparte de generalreport.ts porque ese archivo lo comparten
 * StopReport, SpeedReport y MileageReport.
 */
export const bodyStyles = StyleSheet.create({
  body: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    overflow: 'hidden',
  },

  // ── Resumen del recorrido ──────────────────────────────
  summaryWrap: {
    paddingHorizontal: 14,
    paddingTop: 14,
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: '#f6f8fc',
    borderRadius: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e8edf5',
  },
  summaryTile: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#e3e9f2',
    marginVertical: 2,
  },
  summaryIcon: {
    width: 26,
    height: 26,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f1b3d',
  },
  summaryUnit: {
    fontSize: 10,
    fontWeight: '600',
    color: '#0f1b3d',
  },
  summaryLabel: {
    fontSize: 9.5,
    color: '#8d97a8',
    fontWeight: '500',
    marginTop: 1,
    textAlign: 'center',
  },

  // ── Filtros ────────────────────────────────────────────
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f2f5fa',
    borderWidth: 1,
    borderColor: '#e8edf5',
  },
  chipActive: {
    backgroundColor: '#0f1b3d',
    borderColor: '#0f1b3d',
  },
  chipText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#6b7688',
  },
  chipTextActive: {
    color: '#ffffff',
  },
  chipCount: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#aab3c2',
  },
  chipCountActive: {
    color: 'rgba(255,255,255,0.7)',
  },

  // ── Encabezado de día (sticky) ─────────────────────────
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#eef1f6',
  },
  dayTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f1b3d',
    letterSpacing: 0.3,
  },
  dayCount: {
    fontSize: 10.5,
    color: '#8d97a8',
    fontWeight: '500',
  },

  // ── Fila de la línea de tiempo ─────────────────────────
  row: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingTop: 8,
  },
  timeCol: {
    width: 42,
    alignItems: 'flex-end',
    paddingTop: 1,
  },
  time: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f1b3d',
  },
  timeMuted: {
    color: '#8d97a8',
  },
  railCol: {
    width: 26,
    alignItems: 'center',
  },
  rail: {
    position: 'absolute',
    top: 0,
    bottom: -8,
    width: 2,
    backgroundColor: '#e8edf5',
    borderRadius: 1,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#c3cbd8',
    marginTop: 4,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  dotMoving: {
    backgroundColor: '#1e3a8a',
  },
  dotStop: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#e36414',
    marginTop: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
  },
  dotFast: {
    backgroundColor: '#e36414',
  },

  // ── Contenido de la fila ───────────────────────────────
  content: {
    flex: 1,
    paddingBottom: 8,
  },
  address: {
    fontSize: 12.5,
    color: '#1e2a44',
    lineHeight: 17,
    fontWeight: '500',
  },
  addressMuted: {
    color: '#6b7688',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 5,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 7,
    backgroundColor: 'rgba(30,58,138,0.08)',
  },
  badgeIdle: {
    backgroundColor: '#f2f5fa',
  },
  badgeFast: {
    backgroundColor: 'rgba(227,100,20,0.12)',
  },
  badgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#1e3a8a',
  },
  badgeTextIdle: {
    color: '#8d97a8',
  },
  badgeTextFast: {
    color: '#e36414',
  },
  metaText: {
    fontSize: 10.5,
    color: '#9aa4b5',
    fontWeight: '500',
  },

  // ── Bloque de evento (parada / exceso) ─────────────────
  stopCard: {
    backgroundColor: '#fff8f2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f6e0cd',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  stopTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  stopTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#c25708',
  },
  stopRange: {
    fontSize: 10.5,
    color: '#c98a55',
    fontWeight: '600',
  },
  excessSpeed: {
    fontSize: 16,
    fontWeight: '800',
    color: '#c25708',
  },
  excessUnit: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#c25708',
  },
  limitNote: {
    fontSize: 10.5,
    color: '#8d97a8',
    fontWeight: '500',
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  // ── Detalle expandido ──────────────────────────────────
  detail: {
    marginTop: 8,
    backgroundColor: '#f6f8fc',
    borderRadius: 12,
    padding: 10,
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    fontSize: 10.5,
    color: '#8d97a8',
    fontWeight: '500',
    flex: 1,
  },
  detailValue: {
    fontSize: 11.5,
    color: '#0f1b3d',
    fontWeight: '600',
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#0f1b3d',
    borderRadius: 10,
    paddingVertical: 8,
    marginTop: 2,
  },
  mapButtonText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#ffffff',
  },

  // ── Ranking (kilometraje por unidad) ───────────────────
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: '#f2f5fa',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  rankBadgeTop: {
    backgroundColor: '#e36414',
  },
  rankBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#8d97a8',
  },
  rankBadgeTextTop: {
    color: '#ffffff',
  },
  rankBody: {
    flex: 1,
  },
  rankTopRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  rankName: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#0f1b3d',
    flex: 1,
    marginRight: 8,
  },
  rankValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f1b3d',
  },
  rankValueIdle: {
    color: '#aab3c2',
  },
  rankUnit: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8d97a8',
  },
  rankBar: {
    height: 5,
    borderRadius: 3,
    backgroundColor: '#eef1f6',
    overflow: 'hidden',
  },
  rankBarFill: {
    height: 5,
    borderRadius: 3,
    backgroundColor: '#1e3a8a',
  },
  rankBarFillTop: {
    backgroundColor: '#e36414',
  },
  rankIdleTag: {
    fontSize: 10,
    color: '#aab3c2',
    fontWeight: '500',
    marginTop: 4,
  },

  // ── Unidad única (hero) ────────────────────────────────
  heroCard: {
    marginHorizontal: 14,
    marginTop: 16,
    // El auto de assets/Car.jpg es un PNG con fondo transparente: se ve el plomo.
    backgroundColor: '#f2f5fa',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e8edf5',
    overflow: 'hidden',
    shadowColor: '#0f1b3d',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  heroImageWrap: {
    height: 150,
    width: '100%',
    justifyContent: 'center',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroBody: {
    alignItems: 'center',
    paddingTop: 18,
    paddingBottom: 14,
  },
  heroValue: {
    fontSize: 36,
    fontWeight: '800',
    color: '#0f1b3d',
    letterSpacing: -0.8,
  },
  heroUnit: {
    fontSize: 15,
    fontWeight: '700',
    color: '#8d97a8',
  },
  heroLabel: {
    fontSize: 11.5,
    color: '#8d97a8',
    fontWeight: '500',
    marginTop: 4,
  },
  heroFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e3e9f2',
    marginTop: 16,
    paddingTop: 14,
    width: '100%',
  },
  heroFooterTile: {
    flex: 1,
    alignItems: 'center',
  },
  heroFooterValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f1b3d',
  },
  heroFooterUnit: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8d97a8',
  },
  heroFooterLabel: {
    fontSize: 10,
    color: '#8d97a8',
    fontWeight: '500',
    marginTop: 2,
  },
  heroFooterDivider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: '#e3e9f2',
  },

  // ── Vacío por filtro ───────────────────────────────────
  filterEmpty: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 30,
  },
  filterEmptyText: {
    fontSize: 12.5,
    color: '#8d97a8',
    textAlign: 'center',
    marginTop: 10,
  },
  listContent: {
    paddingBottom: 20,
  },
});
