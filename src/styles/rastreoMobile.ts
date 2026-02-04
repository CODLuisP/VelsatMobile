import { StyleSheet } from 'react-native';

export const rastreoMobileStyles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    paddingHorizontal: 5,
    paddingBottom: 40, // Reducido porque ya no tiene curvas
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingTop: 2,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerMainTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
    flex: 1,
    marginLeft: 10,
  },
  placeholder: {
    width: 40,
  },
  contentList: {
    flex: 1,
    marginTop: -20, // Superposición sobre el header
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30, // Curvas superiores para el contenido
    borderTopRightRadius: 30,
    padding: 20,
    paddingTop: 30,
    minHeight: '100%',
  },
  statusContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  pulseCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  pulseActive: {
    backgroundColor: '#C8E6C9',
  },
  // Anillos de pulso (efecto radar)
  pulseRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  innerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#9E9E9E',
    zIndex: 10,
  },
  innerCircleActive: {
    backgroundColor: '#4CAF50',
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  statusSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 30,
    gap: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  controlButtonActive: {
    backgroundColor: '#F44336',
  },
  controlButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  infoContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  infoHeader: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    gap: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  placaBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  placaText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
});