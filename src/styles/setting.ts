import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 20,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  scrollContent: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  backButton: {
    marginRight: 15,
  },

   headerSection: {
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 20,
  },

    iconWrapper: {
    marginBottom: 20,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },


    headerTitleForm: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
    textAlign: 'center',
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 40,
    backgroundColor: '#f7e4daff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#e36414',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },


   headerSubtitle: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    lineHeight: 15,
    paddingHorizontal: 10,
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
    borderWidth: 1,
    borderColor: '#e36414',
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
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },

  formContainer: {
    flex: 1,
    paddingTop: 15,
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
    paddingHorizontal: 20,
  },

    inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },

  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
 
  },

  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',

  },

  passwordInput: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    color: '#333',
  },

  eyeButton: {
    padding: 8,
    marginLeft: 4,
  },

  primaryButton: {
    backgroundColor: '#e36414',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 0,
  
  },

  primaryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonWrapper: {
    paddingHorizontal: 20,
    marginTop: 8,
  },

  gradientButton: {
    flexDirection: 'row',
    height: 54,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#e36414',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  requiredAsterisk: {
    color: '#e36414',
  },

   inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e8e8e8',
    paddingHorizontal: 14,
    height: 52,
  },

inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#1a1a1a',
    height: '100%',
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