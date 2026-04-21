import { Platform, StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // ─── HEADER (igual que Profile) ───────────────────────────────────────────
 header: {
    marginTop: Platform.OS === 'ios' ? -60 : 0,
    height: Platform.OS === 'ios' ? 350 : 160,
    alignItems:'center'
  },

  backButton: {
    position: 'absolute',
    left: 10,
    borderRadius: 8,
    padding: 8,
  },

  avatarContainer: {
    marginBottom: 10,
    marginTop: 20,
  },

  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  companyNameTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },

  // ─── TABS DE NAVEGACIÓN (dentro del header) ───────────────────────────────
  navigationContainer: {
    flexDirection: 'row',
    width: '90%',
    marginBottom: 12,
    gap: 10,
  },

  navOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },

  navOptionActive: {
    backgroundColor: '#fff',
    borderColor: '#e36414',
  },

  navOptionText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 12,
    fontWeight: '500',
    color: '#aaa',
  },

  navOptionTextActive: {
    color: '#e36414',
    fontWeight: '600',
  },

  chevronRight: {
    transform: [{ rotate: '180deg' }],
  },

  // ─── INFO SECTION (igual que Profile) ─────────────────────────────────────
  infoSection: {
    backgroundColor: '#fff',
    borderRadius: 15,
    width: '100%',
    paddingHorizontal: 20,
  },

  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3be9dff',
  },

  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e36414',
    marginLeft: 8,
    flex: 1,
  },

  infoContent: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 8,
  },

  // ─── INPUTS ───────────────────────────────────────────────────────────────
  inputGroup: {
    marginBottom: 12,
  },

  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },

  requiredAsterisk: {
    color: '#e36414',
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#e8e8e8',
    paddingHorizontal: 12,
    height: 44,
  },

  inputIcon: {
    marginRight: 8,
  },

  textInput: {
    flex: 1,
    fontSize: 13,
    color: '#1a1a1a',
    height: '100%',
  },

  eyeButton: {
    padding: 6,
  },

  // ─── SCROLL CONTENT BLANCO (igual que Profile) ────────────────────────────
  scrollContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    marginTop: -30,
    flex: 1,
    paddingVertical: 25,
  },

  scrollContentContainer: {
    paddingVertical: 0,
  },

  // ─── BOTÓN ────────────────────────────────────────────────────────────────
  buttonWrapper: {
    paddingHorizontal: 20,
  },

  gradientButton: {
    flexDirection: 'row',
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },

  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

// ─── SEGMENTED CONTROL ────────────────────────────────────────────────────
segmentedContainer: {
  flexDirection: 'row',
  backgroundColor: 'rgba(255,255,255,0.12)',
  borderRadius: 12,
  padding: 4,
  width: '88%',
  marginBottom: 12,
},

segmentOption: {
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: 9,
  paddingHorizontal: 10,
  borderRadius: 9,
  gap: 6,
},

segmentOptionActive: {
  backgroundColor: '#fff',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.12,
  shadowRadius: 3,
  elevation: 2,
},

segmentText: {
  fontSize: 12,
  fontWeight: '500',
  color: '#bbb',
},

segmentTextActive: {
  color: '#e36414',
  fontWeight: '700',
},

});