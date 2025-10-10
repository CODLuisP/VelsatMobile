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
    paddingBottom: 20,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  scrollContent: {
    flex: 1,
    marginTop: 0,
    backgroundColor: '#f5f5f5',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  backButton: {
    marginRight: 15,
  },

  headerTitle: {
    color: '#fff',
    fontSize: 18,
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
    fontSize: 15,
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

  contentContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },

  formContainer: {
    flex: 1,
    paddingHorizontal: 25,
    paddingTop: 30,
    justifyContent: 'flex-start',
  },

  infoSection: {
    marginBottom: 10,
  },

  infoTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },

  infoSubtitle: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },

  inputSection: {
    marginBottom: 30,
    minHeight: 200,
  },

  inputLabel: {
    fontSize: 14,
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
    fontSize: 14,
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

  primaryButton: {
    backgroundColor: '#e36414',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 0,
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
    fontSize: 14,
    fontWeight: '600',
  },

  buttonWrapper: {
    marginTop: 0,
  },

  gradientButton: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },

  requiredAsterisk: {
    color: '#e36414',
  },
});

// Estilos para AlertPro (fuera de StyleSheet.create)
export const alertStyles = {
  mask: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  container: {
    borderRadius: 15,
    backgroundColor: '#fff',
  },
  title: {
    color: '#e36414',
    fontSize: 18,
    fontWeight: 'bold' as 'bold',
  },
  message: {
    color: '#333',
    fontSize: 14,
  },
  buttonCancel: {
    backgroundColor: '#e36414',
    borderRadius: 10,
  },
  buttonCancelText: {
    color: '#fff',
    fontWeight: 'bold' as 'bold',
  },
};