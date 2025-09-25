// src/styles/mapalert.ts
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e3a8a',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    
  },
  // Contenedor para el botón y título
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  // Estilos para la información de la alerta en el header
  headerAlertInfo: {
    marginTop: 12,
  },
  headerAlertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  headerIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerAlertDetails: {
    flex: 1,
  },
  headerAlertTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  headerAlertSubtitle: {
    color: '#e5e7eb',
    fontSize: 13,
  },
  headerAlertTimestamp: {
    color: '#d1d5db',
    fontSize: 12,
  },
  content: {
    flex: 1,
    backgroundColor:'#fff',
       borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
 
  },
  mapContainer: {
    backgroundColor: '#fff',
    flex: 1, 
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,

   borderTopLeftRadius: 25,
    borderTopRightRadius: 25,  },
  // Estilo del mapa
  map: {
    flex: 1,
    height: '100%',
    width: '100%',
  },
  
  // Estilos que ya no se usan pero mantenidos por compatibilidad
  alertCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  iconContainer: {
    marginRight: 12,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  alertSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  detailsContainer: {
    padding: 16,
  },
  mapPlaceholder: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  mapSubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});