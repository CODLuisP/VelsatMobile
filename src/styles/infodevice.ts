import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef1f6',
  },

  // ── Hero navy ──────────────────────────────────────────
  hero: {
    backgroundColor: '#0a2560',
    paddingHorizontal: 18,
    paddingBottom: 90,
    position: 'relative',
  },
  heroClip: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  heroBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(6,22,58,0.74)',
  },
  heroCarWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 20,
  },
  heroCar: {
    width: '78%',
    height: 130,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height:40,
  },
  nameBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonAccent: {
    backgroundColor: '#e36414',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  vehicleName: {
    color: '#fff',
    fontSize: 21,
    fontWeight: '800',
    letterSpacing: -0.5,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  onlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34,197,94,0.18)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 100,
    marginLeft: 8,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#22c55e',
    marginRight: 6,
  },
  onlineText: {
    color: '#4ade80',
    fontSize: 12,
    fontWeight: '700',
  },

  // ── Scroll body ────────────────────────────────────────
  scroll: {
    flex: 1,
    backgroundColor: '#eef1f6',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    top: -24,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
  },

  // ── Grid de stats ──────────────────────────────────────
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
    marginTop: 10,
  },
  statTile: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    shadowColor: '#0f1b3d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  statIcon: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: 'rgba(30,58,138,0.10)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  statValue: {
    color: '#0f1b3d',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 1,
  },
  statLabel: {
    color: '#9aa4b5',
    fontSize: 10,
    fontWeight: '500',
  },

  // ── Sección detalle ────────────────────────────────────
  sectionTitle: {
    color: '#0f1b3d',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
    marginLeft: 2,
  },
  // ── Bento grid ─────────────────────────────────────────
  bento: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  bentoTile: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#0f1b3d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  bentoFull: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  bentoHalf: {
    width: '48.5%',
    flexGrow: 1,
  },
  bentoText: {
    flex: 1,
    marginLeft: 12,
  },
  bentoIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(30,58,138,0.10)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 7,
  },
  bentoLabel: {
    color: '#9aa4b5',
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 2,
  },
  bentoValue: {
    color: '#1e2a44',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 17,
  },
  // ── Mini mapa ──────────────────────────────────────────
  mapTile: {
    padding: 0,
    overflow: 'hidden',
  },
  miniMap: {
    width: '100%',
    height: 130,
  },
  miniMapPlaceholder: {
    width: '100%',
    height: 130,
    backgroundColor: '#f4f6fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapMarker: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#1e3a8a',
    borderWidth: 2,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },

  // ── Eventos (tile de navegación) ───────────────────────
  eventsTile: {
    alignItems: 'center',
  },
  eventsIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#e36414',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventsTitle: {
    color: '#0f1b3d',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 1,
  },
});
