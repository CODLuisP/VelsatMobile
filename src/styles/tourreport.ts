import { StyleSheet, Dimensions } from 'react-native';

const { height } = Dimensions.get('window');
const SIDEBAR_WIDTH = 250;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop:10
  },
  backButton: {
    padding: 8,
    marginRight: 5,
    marginLeft:-10
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

  content: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#f5f5f5',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },

  showSidebarButton: {
    position: 'absolute',
    top: 20,
    left: 0,
    zIndex: 1000,
    width: 30,
    height: 66,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
    backgroundColor: '#1e3a8a',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  sidebar: {
    position: 'absolute',
    left: 0,
    top: 20,
    width: SIDEBAR_WIDTH,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  sidebarHeader: {
    backgroundColor: '#0d2466ff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopRightRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 7,
  },
  sidebarHeaderContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sidebarHeaderIcon: {
    // Espacio para el ícono que aparece en la imagen
  },
  sidebarTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  hideSidebarButton: {
    padding: 4,
  },
  sidebarContent: {
    paddingHorizontal:15,
    paddingTop:10
  },
  sidebarSection: {
    marginBottom: 10,
  },
  sidebarSectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 0,
    letterSpacing: 0.5,
  },
  sidebarText: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 20,
  },

  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },

  
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#374151',
  },

  mapContainer: {
    flex: 1,
    backgroundColor: '#e5e7eb',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    overflow: 'hidden',
  },
  mapWithSidebar: {},
  mapFullWidth: {
    marginLeft: 0,
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },

  sidebarCompact: {
    width: 60,
    maxHeight: 200,
  },
  sidebarCompactHeader: {
    padding: 8,
    minHeight: 40,
  },
  sidebarCompactTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  sidebarRago:{
    marginTop:5
  },

  loadingContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#f5f5f5',
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
  backgroundColor: '#f5f5f5',
  padding: 20,
},
errorText: {
  fontSize: 16,
  color: '#FF4444',
  textAlign: 'center',
},
});
