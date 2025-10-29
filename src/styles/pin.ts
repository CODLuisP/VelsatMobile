import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: 20,
    paddingHorizontal: 20,
  
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
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#ffffffff',
    lineHeight: 16,
    opacity: 0.9,
  },
  scrollContainer: {
    flex: 1,
    marginTop: 0,
    backgroundColor: '#ffffffff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  optionsContainer: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    gap: 18,
  },
  optionCard: {
    borderRadius: 24,
    overflow: 'hidden',
  
  },
  cardGradient: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 1,
    gap: 10,
  },
  imageContainer: {
    width: '100%',
    height: 120,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 3,
    borderColor: '#e8e8e8',
  },
  imageContainerSelected: {
    borderColor: '#dee2e6',
    borderWidth: 2,
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
  },
  selectedBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: '#fff',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  
  },
  badgeInner: {
    width: 38,
    height: 38,
    borderRadius: 18,
    backgroundColor: '#e36414',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    gap: 5,
    paddingHorizontal:10
  },
  textSection: {
    gap: 0,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: 0.1,
  },
  optionDescription: {
    fontSize: 12,
    color: '#1b1c1fff',
    lineHeight: 20,
    letterSpacing: 0.2,
  },
  selectedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#fff5f0',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1.5,
    borderColor: '#ffd4ba',
  },
  selectedTagText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#e36414',
    letterSpacing: 0.5,
  },
  activeBorder: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#e3631476',
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 10,
    marginTop: 8,
    marginBottom: 20,
  },
  footerIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff5f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffe4d6',
  },
  footerText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});