import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e3a8a',
  },
  header: {
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
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
  headerBottom: {
    paddingLeft: 0,
    marginLeft: 10,
  },
  headerMainTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
    flex: 1,
    marginLeft: 15,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  headerSubtitle: {
     fontSize: 14,
    color: '#E3F2FD',
    lineHeight: 20,
    opacity: 0.9,
  },
  scrollContainer: {
    flex: 1,
    marginTop: 0,
    backgroundColor: '#f5f5f5',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  optionsContainer: {
    padding:15,

    flex: 1,
  },
  optionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 15,
  
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom:5,
    paddingHorizontal:10,
    paddingTop:5
  },
  imageContainer: {
    position: 'relative',
    height: 120,
 borderBottomLeftRadius: 10,
  borderBottomRightRadius: 10,    overflow: 'hidden',
  },
  vehicleImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#e36414',
    opacity: 0.15,
  },
  selectButton: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    backgroundColor: 'rgba(227, 100, 20, 0.95)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  selectButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:'center',
    gap: 8,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
});
