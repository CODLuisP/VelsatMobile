import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#1e3a8a',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 30,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 10,

  },
 backButton: {
  
        justifyContent: 'center',
        alignItems: 'center',
    },
  headerMainTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
            marginLeft: 10,

  },
  headerBottom: {
    marginTop: 5,
    marginLeft: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E3F2FD',
    lineHeight: 20,
    opacity: 0.9,
  },
  notificationsList: {
    flex: 1,
    padding: 20,
  },
  notificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    borderLeftWidth: 5,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  batteryNotification: {
    borderLeftColor: '#FF6B6B',
    backgroundColor: '#FFFBFB',
  },
  motorNotification: {
    borderLeftColor: '#4ECDC4',
    backgroundColor: '#F8FFFE',
  },
  motorOffNotification: {
    borderLeftColor: '#FF8C42',
    backgroundColor: '#FFF8F3',
  },
  panicNotification: {
    borderLeftColor: '#FFD93D',
    backgroundColor: '#FFFEF8',
  },
  defaultNotification: {
    borderLeftColor: '#95A5A6',
    backgroundColor: '#FFFFFF',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 0,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFF4ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 3,
    borderColor: '#FFE4D6',
    shadowColor: '#FF8C42',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  deviceName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5D6D7E',
    marginBottom: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  timestamp: {
    fontSize: 14,
    color: '#95A5A6',
    fontWeight: '400',
  },

});