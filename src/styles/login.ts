import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e3a8a',
  },

backgroundMap: {
  position: 'absolute',
  top: (height - 500) / 2,   
  left: (width - 580) / 2,    
  width: 580,
  height: 500,
  opacity: 0.9,
},
  orb: {
    position: 'absolute',
    borderRadius: 100,
    opacity: 0.1,
  },

  orb1: {
    width: 200,
    height: 200,
    backgroundColor: '#f97316',
    top: height * 0.1,
    right: -50,
  },

  orb2: {
    width: 150,
    height: 150,
    backgroundColor: '#3b82f6',
    top: height * 0.4,
    left: -30,
  },

  orb3: {
    width: 120,
    height: 120,
    backgroundColor: '#f97316',
    top: height * 0.6,
    right: -20,
  },

  // ESTILOS GPS

  // Satélites
  satellite: {
    position: 'absolute',
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.7,
  },

  satelliteIcon: {
    fontSize: 16,
  },

  // Señales GPS
  gpsSignal: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 0.2,
    borderColor: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.)',
  },

  gpsSignal1Pos: {
    top: height * 0.2,
    left: width * 0.15,
  },

  gpsSignal2Pos: {
    top: height * 0.35,
    right: width * 0.2,
  },

  gpsSignal3Pos: {
    top: height * 0.5,
    left: width * 0.1,
  },

  // Radar
  radarContainer: {
    position: 'absolute',
    top: height * 0.08,
    left: width * 0.1,
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },

  radarSweep: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    borderRightColor: '#10b981',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
  },

  radarCenter: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.5)',
  },

  radarIcon: {
    fontSize: 14,
  },

  // Antena
  antennaContainer: {
    position: 'absolute',
    top: height * 0.15,
    right: width * 0.15,
    alignItems: 'center',
    justifyContent: 'center',
  },

  antennaSignal: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.5)',
  },

  antennaIcon: {
    fontSize: 18,
    opacity: 0.8,
  },

  // Pulsos de red
  networkPulse: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(249, 115, 22, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.6)',
  },

  networkPulse1: {
    top: height * 0.3,
    left: width * 0.05,
  },

  networkPulse2: {
    top: height * 0.45,
    right: width * 0.05,
  },

  // Contenido principal
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
    fontSize: 32,
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
    marginTop: -210,
    justifyContent: 'center',

  },

  formCard: {
    borderRadius: 24,
    padding: 10,
  },

  welcomeText: {
    fontSize: 18,
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
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(249, 115, 22, 0.2)',
  },

  eyeIconContainer: {
    width: 50,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 8,
  },

  inputIcon: {
    fontSize: 20,
  },

  input: {
    flex: 1,
    height: 56,
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
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 16,
  },

  loginButtonGradient: {
    backgroundColor: '#f97316',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
  },

  loginButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
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
    paddingVertical: 5,
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
    width: 130,
    height: 130,
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
});
