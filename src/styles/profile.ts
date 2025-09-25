import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e3a8a',
  },
  header: {
    backgroundColor: '#1e3a8a', // Color azul similar al de la imagen
    paddingTop: 70,
    paddingBottom: 80, // Más espacio para que la sección info tenga lugar para superponerse
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    borderRadius: 8,
    padding: 8,
  },
  avatarContainer: {
    marginBottom: 15,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  companyName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  scrollContent: {
    flex: 1,
    marginTop: 0,
    backgroundColor: '#f5f5f5',

    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  infoSection: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: -60,
    marginBottom: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 2,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 8,

    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e36414',
    marginLeft: 8,
  },
  infoContent: {
    paddingHorizontal: 18,
    paddingTop: 5,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
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
    color: '#666',
    flex: 1,
  },
  menuSection: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  menuItem: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
    fontWeight: '500',
  },
  chevronRight: {
    transform: [{ rotate: '180deg' }],
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 10,
    gap: 5,
  },
  versionText: {
    fontSize: 12,
    color: '#585757ff',
    fontWeight: '600',
  },
  versionTextTitle: {
    fontSize: 12,
    color: '#585757ff',
    fontWeight: '600',
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 20,
    resizeMode: 'cover',
  },
});
