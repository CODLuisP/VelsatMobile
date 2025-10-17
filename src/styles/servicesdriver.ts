import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#00296b',
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  backButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerMainTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 15,
  },
  contentList: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  formContainer: {
    marginTop: 15,
    paddingHorizontal: 15,
  },
  serviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#1e3a8a',
    shadowColor: '#000',
 
  },
  serviceHeader: {
    backgroundColor: '#1e3a8a',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 6,
  },
  serviceHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  serviceNumber: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  passengersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  passengersText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  serviceHeaderRight: {
    flex: 1,
    alignItems: 'flex-end',
    marginRight: 12,
  },
  locationText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#e0dfdfff',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  serviceBody: {
   paddingHorizontal:8,
   paddingVertical:6
  },
  infoRow: {
    flexDirection: 'row',
    gap: 16,
  },
  leftColumn: {
    flex: 1,
  },
  rightColumn: {
    flex: 1,
  },
  dateSection: {
    marginBottom: 2,
  },
  dateIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  dateLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  dateValue: {
    fontSize: 13,
    color: '#000',
    fontWeight: '600',
  },
  groupSection: {
    marginTop: 8,
  },
  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  groupLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  groupValue: {
    fontSize: 13,
    color: '#000',
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonActive: {
    backgroundColor: '#4CAF50',
  },
  actionButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  actionButtonEnd: {
    backgroundColor: '#EF5350',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  actionButtonTextDisabled: {
    color: '#999',
  },

  emptyStateContainer: {
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: 40,
  marginBottom: 20,
  paddingHorizontal: 20,
},
iconCircle: {
  width: 60,
  height: 60,
  borderRadius: 30,
  backgroundColor: 'rgba(227, 100, 20, 0.1)',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 15,
},
iconCircleLarge: {
  width: 80,
  height: 80,
  borderRadius: 40,
  marginBottom: 20,
},
emptyStateTitle: {
  color: '#00296b',
  fontSize: 16,
  fontWeight: '600',
  marginBottom: 8,
  textAlign: 'center',
},
emptyStateTitleDark: {
  color: '#1a237e',
  fontSize: 18,
  fontWeight: '700',
  marginBottom: 8,
  textAlign: 'center',
},
emptyStateSubtitle: {
  color: '#212529',
  fontSize: 14,
  textAlign: 'center',
},
emptyStateDescription: {
  color: '#666',
  fontSize: 14,
  textAlign: 'center',
  lineHeight: 20,
},
});