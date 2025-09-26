import { Platform, StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e3a8a',
  },

  // Header styles
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 10,
  },
  backButton: {
    borderRadius: 8,
    padding: 8,
    marginRight: 15,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },

  // Search styles
  searchInputContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: Platform.OS === 'ios' ? 10 : 10,
  },

  // Device list styles
  devicesList: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  devicesListContent: {
    paddingVertical: 20,
  },

  // Device item styles
  deviceItem: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 1,
    borderRadius: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.09,
    shadowRadius: 2,
    elevation: 1,
  },
  deviceContent: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
  },

  // Vehicle image styles
  vehicleImageContainer: {
    marginRight: 15,
    alignItems: 'center',
  },
  vehicleImage: {
    width: 50,
    height: 35,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  vehicleImageText: {
    fontSize: 20,
  },
  speedIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 45,
    alignItems: 'center',
  },
  speedText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },

  // Device info styles
  deviceInfo: {
    flex: 1,
  },
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 2,
  },
  deviceName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  deviceBadges: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  temperatureBadge: {
    backgroundColor: '#90EE90',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 4,
  },
  temperatureText: {
    color: '#2E7D32',
    fontSize: 10,
    fontWeight: 'bold',
  },
  fuelBadge: {
    backgroundColor: '#90EE90',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 4,
  },
  fuelIcon: {
    fontSize: 10,
  },
  onlineBadge: {
    backgroundColor: '#E8F5E8',
    borderWidth: 1,
    borderColor: '#90EE90',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  onlineText: {
    color: '#2E7D32',
    fontSize: 10,
    fontWeight: '500',
  },

  // Status styles
  statusContainer: {
    marginBottom: 2,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },

  // Location styles
  locationLabel: {
    fontSize: 12,
    color: '#333',
    marginBottom: 2,
  },
  locationText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 16,
  },

  carImage: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
  },

  deviceItemFirst: {
  borderTopLeftRadius: 15,
  borderTopRightRadius: 15,
  marginTop: 0,
},
deviceItemLast: {
  borderBottomLeftRadius: 15,
  borderBottomRightRadius: 15,
  marginBottom: 20,
},

// Estilos para el componente de búsqueda vacía
emptyContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  paddingHorizontal: 40,
  paddingVertical: 60,
},
emptyIconContainer: {
  width: 120,
  height: 120,
  borderRadius: 60,
  backgroundColor: '#F7FAFC',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: 24,
  borderWidth: 2,
  borderColor: '#E2E8F0',
  borderStyle: 'dashed',
},
emptyTitle: {
  fontSize: 20,
  fontWeight: '600',
  color: '#2D3748',
  textAlign: 'center',
  marginBottom: 8,
},
emptySubtitle: {
  fontSize: 16,
  color: '#718096',
  textAlign: 'center',
  marginBottom: 4,
  lineHeight: 22,
},
emptyHint: {
  fontSize: 14,
  color: '#A0AEC0',
  textAlign: 'center',
  fontStyle: 'italic',
},


});


