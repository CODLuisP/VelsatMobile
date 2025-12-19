import { Platform, StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
header: {

    height: Platform.OS === 'ios' ? 490 : 390,
    width: '100%',
    alignItems: 'center',
marginTop: Platform.OS === 'ios' ? -85 : 0,
    
  },
  backButton: {
    position: 'absolute',
    left: 10,
    borderRadius: 8,
    padding: 8,
  },
  avatarContainer: {
    marginBottom: 15,
    marginTop: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 20,
    resizeMode: 'cover',
  },
  avatarImageV: {
    width: 50,
    height: 50,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  companyNameTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },

  // Info Section
  infoSection: {
    backgroundColor: '#fff',
    borderRadius: 15,
    width: '90%',
    marginTop: 15,
 
  },





  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3be9dff',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e36414',
    marginLeft: 8,
  },
  infoContent: {
    paddingHorizontal: 18,
    paddingTop: 8,
    marginBottom: 8
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 10,
  },
  infoLabel: {
    fontSize: 16,
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#303030ff',
    flex: 1,
  },

  // Scroll Content (igual que devicesList en Devices)
  scrollContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    marginTop: -30,
    paddingVertical: 20,
  },
  scrollContentContainer: {
    paddingVertical: 0,
  },

  // Menu Section
  menuSection: {
    backgroundColor: '#e36414',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#dee2e6',

  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 20,
    backgroundColor: '#fff',


  },

  menuItemEnd: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 5,
    paddingHorizontal: 20,
    backgroundColor: '#ffffffff',

    borderBottomLeftRadius: 13,
    borderBottomRightRadius: 13,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#fff0e9ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  menuSubtext: {
    fontSize: 11,
    color: '#999',
  },
  chevronRight: {
    transform: [{ rotate: '180deg' }],
    marginLeft: 8,
  },

  // Logout Specific
  logoutItem: {
    borderBottomWidth: 0,
  },
  logoutIconContainer: {
    backgroundColor: '#fee',
  },
  logoutText: {
    color: '#dc2626',
  },

  // Footer / Company Info
  footerContainer: {
    paddingBottom: 0,
    paddingHorizontal: 15
  },
  companyCard: {
    borderRadius: 16,
    paddingVertical: 0,
    paddingHorizontal: 10,
  },
  companyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  companyLogoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  companyLogoText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  companyDetails: {
    flex: 1,
  },
  companyName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  companyLocation: {
    fontSize: 10,
    color: '#666',
  },
  companyDivider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginBottom: 10,
  },
  companyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rucLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rucNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a1a',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  versionText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },

  versionContainer: {
    paddingVertical: 0,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 10,
  },
  versionDivider: {
    width: 70,
    height: 2,
    backgroundColor: '#e36414',
    borderRadius: 2,
    marginBottom: 10,
  },
  companyInfoContainer: {
    alignItems: 'center',
    marginBottom: 0,
  },
  companyNameBold: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e3a8a',
    letterSpacing: 1,
    marginBottom: 4,
  },
  versionSubtext: {
    fontSize: 12,
    color: '#464545ff',
    fontWeight: '500',
  },
  versionDetailsContainer: {
    width: '100%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 4,
  },
  versionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 1,
  },
  versionLabel: {
    fontSize: 12,
    color: '#464545ff',
    fontWeight: '500',
  },
  versionValue: {
    fontSize: 13,
    color: '#1e3a8a',
    fontWeight: '600',
  },
  copyrightText: {
    fontSize: 11,
    color: '#575757ff',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 5,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 16,
    borderBottomWidth: 1,
  },
  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e36414',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  profileInitial: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
  },
});