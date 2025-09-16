import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e3a8a',
  },
  
  // Header styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
            marginTop: 10,

  
  },
  
  backButton: {
    marginRight: 15,
  },
  
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },

  navigationContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  
  navOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  
  navOptionActive: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#1e3a8a',
  },
  
  navOptionText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  
  navOptionTextActive: {
    color: '#e36414',
    fontWeight: '600',
  },
  
  chevronRight: {
    transform: [{ rotate: '180deg' }],
  },

  // Content styles - CORREGIDO
  contentContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    // Removido paddingTop para evitar inconsistencias
  },
  
  // Form container - CORREGIDO para consistencia
  formContainer: {
    flex: 1,
    paddingHorizontal: 25,
    paddingTop: 30, // Movido aquí desde contentContainer
    justifyContent: 'flex-start', // Asegura que ambos formularios empiecen desde arriba
  },
  
  // Info section
  infoSection: {
    marginBottom: 30,
  },
  
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  
  infoSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  
  // Input styles
  inputSection: {
    marginBottom: 30,
    // Añadido para consistencia en ambos formularios
    minHeight: 200, // Altura mínima para evitar saltos
  },
  
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 15,
  },
  
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 15,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  
  // Password input styles
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  
  passwordInput: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 15,
    fontSize: 16,
    color: '#333',
  },
  
  eyeButton: {
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  
  // Button styles - CORREGIDO para posicionamiento consistente
  primaryButton: {
    backgroundColor: '#e36414',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20, // Aumentado para mejor espaciado
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 6,
  },
  
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});