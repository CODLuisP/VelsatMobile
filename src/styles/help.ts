import { StyleSheet, Dimensions } from 'react-native';


export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e3a8a',
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  
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
  optionsList: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  formContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
    marginBottom: 20,
    flex: 1,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  optionCard: {
    borderRadius: 24,
    padding: 18,
    width: '46%',
   
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  cardContent: {
    alignItems: 'center',
    justifyContent: 'center',

    zIndex: 2,
  
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
    borderWidth: 1,
   
  },
  optionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 8,
    letterSpacing: 0.2,
    textAlign: 'center',
    lineHeight: 14,
  },
  optionSubtitle: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '500',
    lineHeight: 14,
    textAlign: 'center',
    opacity: 0.8,
  },
  decorativeLine: {
    width: 40,
    height: 3,
    borderRadius: 2,
    marginTop: 12,
    alignSelf: 'center',
  },
  infoSection: {
    marginBottom: 20,
    marginTop:20,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
    alignItems: 'center',
  },
  infoIconContainer: {

    borderRadius: 24,
    backgroundColor: '#F7FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  infoText: {
    fontSize: 12,
    color: '#718096',
    lineHeight: 14,
    textAlign: 'center',
    fontWeight: '400',
    marginBottom: 10,
  },
  infoHighlight: {
    fontWeight: '600',
    color: '#4A5568',
  },
  websiteButton: {
    backgroundColor: '#1e3a8a',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius:10,
    shadowColor: '#1e3a8a',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginBottom:10
  },
  websiteButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});