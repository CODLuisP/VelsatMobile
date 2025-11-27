import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    
  },

  mainContent: {
    flex: 1,
  },

  // Top Background Section with GPS image
  topBackgroundSection: {
    position: 'relative',
    marginHorizontal: -24,
    paddingHorizontal: 48,
    paddingBottom: 25,
    overflow: 'hidden',
    
  },

  gpsBackgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 320,
    opacity: 0.3,
  },
logoImage: {
  width:55,  
  height:55,
},
  backgroundOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    
  },

  // Header Section
  headerSection: {
    marginTop: Platform.OS === 'ios' ? 70 : 50,
    zIndex: 1,
  },

  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 0,
  },
  welcomeTitles: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 0,
  },


  welcomeSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '400',
  },

  // Logo GPS Section (centrado y grande)
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    marginTop: 10,
    marginBottom: 10,
  },

  gpsCircleContainer: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  gpsOuterRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: 'rgba(30, 144, 255, 0.3)',
    backgroundColor: 'transparent',
  },

  gpsMainCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1E90FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },

  gpsInnerRing: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'transparent',
  },

  gpsIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Form Container
  formContainer: {
    flex: 1,
    backgroundColor: '#edf2fb',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    marginTop: -20,

  },

  // Biometric Button
  biometricButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 0,
    marginHorizontal: 0,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    zIndex: 1,
    marginTop: 10,
  },

  biometricButtonContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  biometricButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 10,
  },

  // Or Divider
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },

  orText: {
    color: 'rgba(0, 0, 0, 0.5)',
    fontSize: 14,
    paddingHorizontal: 16,
    fontWeight: '500',
  },

  // Input Fields
  inputWrapper: {
    marginBottom:15,
    marginTop: 10,
  },
  mainContentInputs: {
    marginTop: 10,
  },

  inputLabel: {
    fontSize: 14,
    color: '#00296b',
    marginBottom: 5,
    fontWeight: '500',
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 0,
    height: 30,
  },



  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: 0,
    fontSize: 15,
    color: '#232222ff',
    backgroundColor: 'transparent',
  },

    infoSection: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    alignItems: 'center',
    marginTop: 16,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FF6B00', // Naranja
    textAlign: 'center',
    marginBottom: 12,
  },
  infoDescription: {
    fontSize: 15,
    color: '#000000ff', // Blanco
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.95,
  },

  eyeIconContainer: {
    width: 40,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },

signInButton: {
  width: '100%',
  height: 48,
  borderRadius: 12, 
  overflow: 'hidden', 

  elevation: 5,
},
signInGradient: {
  flex: 1,
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
},

  signInText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },

  loadingSpinnerContainer: {
    width: 20,
    height: 20,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingSpinnerCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderTopColor: '#FFFFFF',
  },

  // Bottom Links
  bottomLinks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },

  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 3,
    borderWidth: 2,
    borderColor: '#fb5607',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },

  checkboxChecked: {
    backgroundColor: '#fb5607',
    borderColor: '#fb5607',
  },

  checkmark: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },

  linkText: {
    color: 'rgba(0, 0, 0, 0.7)',
    fontSize: 13,
    fontWeight: '500',
  },

  linkTextRight: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
    fontWeight: '500',
  },
footerContainer: {
  marginTop: 'auto', // Esto empuja el footer al final
  paddingBottom:  20, // Ajusta según tu bottomSpace
  width: '100%',
  alignItems: 'center',
},
  // Social Section
  socialSection: {
    alignItems: 'center',
    marginTop: 10,
  },

  socialText: {
    color: '#012a4a',
    fontSize: 12,
    fontWeight: '500',
  },

  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },

  socialButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },

  socialIcon: {
    width: 24,
    height: 24,
    tintColor: '#FFFFFF',
  },

  // Version
  versionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 30,
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
    marginRight: 8,
  },

  versionText: {
    color: '#0e293dd2',
    fontSize: 12,
    fontWeight: '600',
  },
});