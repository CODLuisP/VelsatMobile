import { StyleSheet, Dimensions } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    paddingBottom: 10,
  },

  headerContent: {
    paddingHorizontal: 20,
    marginTop: 10,
  },

  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
    marginLeft: -10,
  },

  headerTextContainer: {
    flex: 1,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },

  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '400',
  },

  dateContainer: {
    marginTop: 4,
  },

  dateWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
  },

  dateText: {
    fontSize: 14,
    color: '#fff',
  },

  listWrapper: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    overflow: 'hidden',
  },

  listContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },

  separator: {
    height: 16,
  },

  // ===== SECCIÓN DE ESTADÍSTICAS =====
  statisticsContainer: {
    marginBottom: 18,
  },

  statisticsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },

  statisticsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginLeft: 10,
  },

  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },

  statCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

statGradient: {
  padding: 10,
  minHeight: 110,
  justifyContent: 'center',
  alignItems: 'center',
},

  statIconContainer: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },

  statLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  statValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },

  statSubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
  },

  statisticsDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 0,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },

  dividerText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748b',
    marginHorizontal: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // ===== DISEÑO DE CARDS =====
  vehicleCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e8f0fe',
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#f8fafc',
  },

  badgeContainer: {
    marginRight: 12,
  },

  itemBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    shadowColor: '#ff8c00',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },

  itemBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  unitInfoContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  carIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#e8f0fe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  unitTextContainer: {
    flex: 1,
  },

  unitLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  unitName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },

  cardDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
  },

  cardBody: {
    flexDirection: 'row',
    paddingVertical: 0,
    paddingHorizontal:10,
    alignItems: 'center',
  },

  vehicleImageSection: {
    flex: 1,
    marginRight: 16,
  },

  imageContainer: {
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
 
  },

  vehicleImage: {
    width: '100%',
    height: 50,
    resizeMode: 'contain',
  },

  mileageSection: {
    flex: 1.3,
  },

  mileageCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e8f0fe',
    marginBottom: 8,
    marginTop:8
  },

  mileageIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#e8f0fe',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },

  mileageInfo: {
    gap: 4,
  },

  mileageLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  mileageValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },

  mileageValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#4285f4',
    lineHeight: 28,
  },

  mileageUnit: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginLeft: 4,
  },

  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#fed7aa',
    gap: 4,
  },

  locationText: {
    fontSize: 10,
    color: '#ff8c00',
    fontWeight: '600',
  },

  // Estados de loading, error y empty
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },

  errorIconContainer: {
    marginBottom: 20,
  },

  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },

  errorText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    paddingTop: 100,
  },

  emptyIconContainer: {
    marginBottom: 16,
    opacity: 0.6,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 20,
  },
});