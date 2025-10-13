import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e3a8a',
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 15,

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

    formContainer: {
      marginTop:20,
      paddingHorizontal:20,
      marginBottom:15,


  },

  notificationsList: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  notificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 10,
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
    marginBottom:10
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

  loadingContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
},
loadingText: {
  color: '#000',
  marginTop: 10,
  fontSize: 16,
},
errorContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  padding: 20,
},
errorText: {
  color: '#232323ff',
  fontSize: 16,
  textAlign: 'center',
  marginBottom: 20,
  marginTop: 10,
},
retryButton: {
  backgroundColor: '#FF8C42',
  paddingHorizontal: 20,
  paddingVertical: 10,
  borderRadius: 8,
},
retryButtonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: 'bold',
},
emptyContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
},
emptyText: {
  color: '#fff',
  fontSize: 16,
  marginTop: 10,
  opacity: 0.7,
},

counterText: {
  color: '#fff',
  fontSize: 12,

  opacity: 0.8,
},
loadingMoreContainer: {
  padding: 20,
  alignItems: 'center',
  justifyContent: 'center',
},
loadingMoreText: {
  color: '#000',
  marginTop: 10,
  fontSize: 14,
},
endContainer: {
  padding: 20,
  alignItems: 'center',
},
endText: {
  color: '#fff',
  fontSize: 14,
  opacity: 0.6,
},

// Agregar estos estilos a tu archivo de estilos (notifications.ts o donde tengas tus estilos)

counterContainer: {
  borderRadius: 8,
  paddingVertical: 10,
  marginTop: 12,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
},

counterTextContainer: {
  flex: 1,
},



counterNumber: {
  color: '#FF8C42',
  fontSize: 12,
  fontWeight: '700',
  marginLeft: 4,
},

counterBadge: {
  backgroundColor: '#FF8C42',
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: 12,
  marginLeft: 10,
},

counterBadgeText: {
  color: '#00296b',
  fontSize: 12,
  fontWeight: '700',
},

});