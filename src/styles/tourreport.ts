import { StyleSheet, Dimensions } from 'react-native';

const { height } = Dimensions.get('window');
const SIDEBAR_WIDTH = 250;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
   
  // Header styles
  header: {
    backgroundColor: '#1e3a8a',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
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
   
  // Content styles
  content: {
    flex: 1,
    position: 'relative',
  },
   
  // Sidebar Toggle Buttons

// Estilo modificado:
showSidebarButton: {
  position: 'absolute',
  top: 20,
  left: 0,
  zIndex: 1000,
  width: 30,
  height: 66,
  justifyContent: 'center',
  alignItems: 'center',
  // Usar borderRadius para crear un efecto similar
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
   
  // Sidebar styles - AJUSTADOS PARA TAMAÑO COMPACTO Y TRANSPARENCIA
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 20,
    width: SIDEBAR_WIDTH,
    // Eliminamos height: '100%' para que se ajuste al contenido
    backgroundColor: 'rgba(255, 255, 255, 0.95)', // Ligeramente transparente
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
    maxHeight: height * 0.6, 
  },
  sidebarHeader: {
    backgroundColor: '#1e3a8a',
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
    // Eliminamos flex: 1 para que no se expanda
    padding: 15,
    paddingBottom: 20, // Un poco más de padding al final
  },
  sidebarSection: {
    marginBottom: 20, // Reducimos el margen
  },
  sidebarSectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8, // Reducimos el margen
    letterSpacing: 0.5,
  },
  sidebarText: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 20,
  },
   
  // Legend styles
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6, // Reducimos el margen
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  legendText: {
    fontSize: 14,
    color: '#374151',
  },
   
  // Map styles - AJUSTADOS PARA MEJOR VISUALIZACIÓN
  mapContainer: {
    flex: 1,
    backgroundColor: '#e5e7eb',
  },
  mapWithSidebar: {
    // En lugar de usar marginLeft, usamos una superposición más elegante
    marginLeft: 0, // Cambiamos esto
  },
  mapFullWidth: {
    marginLeft: 0,
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },

  // NUEVOS ESTILOS PARA MEJORAR LA EXPERIENCIA
  // Sidebar con transparencia para no bloquear completamente el mapa
  sidebarCompact: {
    width: 60, // Ancho muy reducido para modo compacto
    maxHeight: 200, // Altura reducida
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
});