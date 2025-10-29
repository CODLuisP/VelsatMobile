import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

backgroundMap: {
  position: 'absolute',
  top: (height - 500) / 2,   
  left: (width - 580) / 2,    
  width: 580,
  height: 500,
  opacity: 0.8,
},

  mainContent: {
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  // Logo moderno
  logoContainer: {
    alignItems: 'center',
    position: 'relative',
    marginTop: 20,
  },

  logoGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f97316',
    opacity: 0.3,
  },

  logoMain: {
    alignItems: 'center',
    zIndex: 1,
  },

  logoIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(249, 115, 22, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(249, 115, 22, 0.5)',
  },

  logoSymbol: {
    fontSize: 32,
  },

  logoText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 3,
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  logoSubtext: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },

  // Formulario moderno
  formContainer: {
    width: '100%',
    flex: 1,
    marginTop: -130,
    justifyContent: 'center',

  },

  formCard: {
    borderRadius: 24,
    padding: 10,
  },

  welcomeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
  },

  subtitleText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 32,
  },

  inputGroup: {
    marginBottom: 10,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    overflow: 'hidden',
  },

  inputIconContainer: {
    width: 50,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3c67a142',
  },

  eyeIconContainer: {
    width: 50,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 8,
  },

  inputIcon: {
    fontSize: 20,
  },

  input: {
    flex: 1,
    height: 52,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#ffffff',
    backgroundColor: 'transparent',
  },

  // Checkbox para recordar contraseña
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },

  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },

  checkboxChecked: {
    backgroundColor: '#f97316',
    borderColor: '#f97316',
  },

  checkmark: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },

  rememberText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '500',
  },

  // Botón principal
  loginButton: {
    borderRadius: 16,
    overflow: 'hidden',

    marginBottom: 16,
  },

  loginButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
  },

  loginButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 1,
  },

  loadingSpinnerContainer: {
  width: 24,
  height: 24,
  marginRight: 8,
  alignItems: 'center',
  justifyContent: 'center',
},

loadingSpinnerCircle: {
  width: 20,
  height: 20,
  borderRadius: 10,
  borderWidth: 3,
  borderColor: 'rgba(255, 255, 255, 0.3)',
  borderTopColor: '#ffffff',
},

  loginArrow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,

  },

  arrowText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 16,
    includeFontPadding: false,
  },

  // Divisor elegante
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },

  dividerCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
  },

  dividerText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '500',
  },

  biometricSection: {
    marginBottom: -20,
  },

  biometricIcon: {
    fontSize: 20,
    marginRight: 12,
  },

  biometricText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    fontWeight: '500',
  },

  // Botón de contacto telefónico
  forgotPassword: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },

  forgotPasswordText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },

  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderRadius: 20,
    
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
    marginRight: 8,
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },

  statusText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    fontWeight: '600',
  },

  // Carretera con carro
  footerRoadSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    zIndex: 100,
  },

  logoImage: {
    width: 150,
    height: 70,
  },

  road: {
    width: '100%',
    height: 100,
    backgroundColor: '#1e3a8a',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },

  roadLines: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    width: width * 6,
    height: 4,
    top: '50%',
    marginTop: -2,
  },

  roadLine: {
    width: 30,
    height: 4,
    backgroundColor: '#f97316',
    marginHorizontal: 25,
    borderRadius: 2,
  },

  carContainer: {
    position: 'absolute',
    bottom: -5,
    left: 0,
    zIndex: 101,
  },

  carImage: {
    width: 250,
    height: 180,
  },

  biometricButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    paddingVertical: 14,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },

  biometricButtonContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  biometricButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 12,
    letterSpacing: 0.5,
  },

  // Separador entre biometría y login normal
  loginSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
  },

  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },

  separatorText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontWeight: '500',
    paddingHorizontal: 16,
  },

  loadingSpinner: {
  fontSize: 24,
  color: 'white',
  marginRight: 8,
}
});
