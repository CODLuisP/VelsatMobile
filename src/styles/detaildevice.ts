import { StyleSheet } from 'react-native';


export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  floatingBackButton: {
    position: 'absolute',
    left: 20,
    width: 44,
    height: 44,
    backgroundColor: '#fff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 6,
    zIndex: 1000,
  },
  infoPanel: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
    overflow: 'hidden',
  },
  panelHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#00296b',
    backgroundColor: '#00296b',
  },
  panelHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
deviceHeaderInfo: {
  flex: 1,
    flexDirection: 'row',


},
  deviceName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ffffffff',
    marginBottom: 4,
  },
  deviceStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 10,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  deviceId: {
    fontSize: 14,
    color: '#ffffffff',
    fontWeight: '500',
  },
  onlineStatus: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft:0,
    marginRight:5
  },
  panelContent: {
    flex: 1,
     backgroundColor: '#ffffff', 
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 6,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 2,
    marginTop: 5,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  speedText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '400',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '600',
  },
  lastReportText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  distanceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 0,
  },
  distanceText: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '600',
  },
  startTimeText: {
    fontSize: 14,
    color: '#9ca3af',
    marginLeft: 26,
    marginBottom: 6,
  },
  streetViewRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 10,

  },
  streetViewContainer: {
    position: 'relative',
    width: 80,
    height: 50,
  },
  streetViewImage: {
    width: 80,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  streetViewOverlay: {
    position: 'absolute',
    top: 4,
    left: 4,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  streetViewText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '500',
  },
  locationInfoRight: {
    flex: 1,
    justifyContent: 'center',
    position: 'relative',
  },
  locationTitle: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '600',
    marginBottom: 2,
    marginRight:30
  },
  locationSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
  },
  locationButton: {
    position: 'absolute',
    right: 0,
    top: '50%',
    transform: [{ translateY: -15 }],
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f97316',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationButtonCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  verMasButton: {
    backgroundColor: '#f97316',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  verMasText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  arrowText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },


  // NUEVOS ESTILOS PARA SELECTOR DE TIPO DE MAPA
mapTypeSelector: {
  position: 'absolute',
  top: 80,
  right: 16,
  flexDirection: 'row',
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  borderRadius: 12,
  overflow: 'hidden',
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
  elevation: 5,
},
mapTypeButton: {
  paddingVertical: 8,
  paddingHorizontal: 14,

},
mapTypeButtonActive: {
  backgroundColor: '#f35b04',
},
mapTypeButtonText: {
  fontSize: 14,
  fontWeight: '500',
  color: '#333',
  textAlign: 'center',
},
mapTypeButtonTextActive: {
  color: '#fff',
  fontWeight: '600',
},
});