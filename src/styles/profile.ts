import { Platform, StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef1f6',
  },
  header: {
    height: Platform.OS === 'ios' ? 490 : 405,
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
    borderRadius: 18,
    width: '90%',
    marginTop: 15,
    paddingBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 6,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 7,
    gap: 7,
  },
  infoAccent: {
    width: 3,
    height: 12,
    borderRadius: 2,
    backgroundColor: '#e36414',
  },
  infoTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0f1b3d',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  infoLoading: {
    paddingVertical: 22,
    alignItems: 'center',
  },
  infoContent: {
    paddingHorizontal: 14,
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#eef1f6',
    marginLeft: 30,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  infoIcon: {
    width: 20,
    height: 20,
    borderRadius: 7,
    backgroundColor: 'rgba(30,58,138,0.09)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  infoLabel: {
    fontSize: 10.5,
    color: '#9aa4b5',
    fontWeight: '500',
    marginRight: 12,
  },
  infoText: {
    fontSize: 12,
    color: '#0f1b3d',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },

  // Scroll Content (igual que devicesList en Devices)
  scrollContent: {
    flex: 1,
    backgroundColor: '#eef1f6',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    marginTop: -30,
    paddingTop: 22,
  },
  scrollContentContainer: {
    paddingVertical: 0,
  },

  // Menu Section
  menuSection: {
    marginHorizontal: 20,
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8d97a8',
    paddingHorizontal: 4,
    paddingBottom: 8,
    letterSpacing: 1,
  },
  menuCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#0f1b3d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 14,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#eef1f6',
    marginLeft: 62,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: 'rgba(227,100,20,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#0f1b3d',
    marginBottom: 2,
  },
  menuSubtext: {
    fontSize: 11,
    color: '#9aa4b5',
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
    backgroundColor: 'rgba(220,38,38,0.10)',
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