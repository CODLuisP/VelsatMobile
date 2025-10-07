import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e3a8a',
  },

  header: {
    backgroundColor: '#1e3a8a',
    paddingBottom: 20,
    paddingHorizontal: 20,

  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  backButton: {
    borderRadius: 8,
    padding: 8,
    marginRight: 10,
    marginLeft:-20,
    
  },
  headerContent: {
    flex: 1,
  },

  reportItemFirst: {
  borderTopLeftRadius: 10,
  borderTopRightRadius: 10,
},
reportItemLast: {
  borderBottomLeftRadius: 10,
  borderBottomRightRadius: 10,
},


  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 4,
  },
  headerDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerDate: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
    marginLeft: 8,
  },

  // Reports list styles
  reportsList: {
    flex: 1,
       backgroundColor: 'white',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  reportsListContent: {
    paddingVertical: 10,
    paddingHorizontal:10
  },

  // Report item styles
  reportItem: {
    backgroundColor: '#fff',
    marginHorizontal: 0,
    marginBottom: 1,
    borderRadius: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    // Estilos para el efecto de touch
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
  },
  reportContent: {
    flexDirection: 'row',
    paddingHorizontal: 6,
    alignItems: 'flex-start',
    paddingVertical: 12,},

  // Number container
  numberContainer: {
    marginRight: 10,
    marginTop: 0,
  },
  numberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },

  // Main content
  mainContent: {
    flex: 1,
    flexDirection: 'column',
  },

  // Top row with two columns
  topRowContent: {
    flexDirection: 'row',
  },

  // Bottom row - full width for location
  bottomRowContent: {
    width: '100%',
  },

  // Left section
  leftSection: {
    flex: 1,
    marginRight: 20,
  },

  // Right section
  rightSection: {
    flex: 1,
  },

  // Common section styles
  sectionLabel: {
    fontSize: 12,
     fontWeight: '600',
    color: '#333',
    marginLeft: 6,
    marginBottom: 4,
  },

  // Date time styles
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateTimeText: {
    fontSize: 12,
    color: '#333',
    marginBottom: 5,
    marginLeft: 20,
  },

  // Speed styles
  speedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  speedText: {
    fontSize: 12,
    color: '#333',
    marginBottom: 5,
    marginLeft: 20,
  },

  // Odometer styles
  odometerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  odometerText: {
    fontSize: 12,
    color: '#333',
    marginLeft: 20,
    marginBottom: 5,
  },

  // Location styles - now full width
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
    marginLeft: 20,
  },

  // Coordinates styles - now in right section
  coordinatesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coordinatesText: {
    fontSize: 13,
    color: '#666',
    fontFamily: 'monospace',
    marginLeft: 20,
  },

  loadingContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: 80,
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
  padding: 20,
},

retryButtonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: '600',
},




errorIconContainer: {
  marginBottom: 20,
},
errorTitle: {
  fontSize: 16,
  fontWeight: '600',
  color: '#333',
  marginBottom: 8,
},
errorText: {
  fontSize: 12,
  color: '#666',
  textAlign: 'center',
  marginBottom: 24,
},
retryButton: {
  backgroundColor: '#1e3a8a',
  width: 56,
  height: 56,
  borderRadius: 28,
  justifyContent: 'center',
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
  elevation: 5,
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