import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e3a8a',
  },

  // Header Styles - Fixed
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1000,
  },

  // Scrollable content
  scrollContent: {
    flex: 1,

    backgroundColor: '#f5f5f5',

    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  headerBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  temperatureBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 6,
    borderRadius: 6,
  },
  fuelBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 6,
    borderRadius: 6,
  },
  settingsBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 6,
    borderRadius: 6,
  },
  onlineBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  onlineText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },

  // Vehicle Image Styles
  imageContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    height: 150,
    padding: 20,
  },

  vehicleImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },

  // Information Section Styles
  infoSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  iconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 2,
  },
  statusMoving: {
        fontSize: 16,

    color: '#4CAF50',
    fontWeight: '600',
  },
  speedText: {
    color: '#333',
    fontWeight: '400',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginBottom: 2,
  },
  infoSubtitle: {
    fontSize: 12,
    color: '#666',
    fontWeight: '400',
  },

  // Button Styles
  buttonContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 32,
    gap: 12,
  },
  eventsButton: {
    backgroundColor: '#FFC107',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  eventsButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  shareButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
