import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // === HEADER ===
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  backButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerMainTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 15,
  },

  // === SCROLL ===
  scrollContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  scrollContent: {
    paddingBottom: 24,
  },

  // === CONTENT ===
  contentContainer: {
    paddingTop: 28,
    paddingHorizontal: 20,
  },

  // === TITLE ===
  titleContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    lineHeight: 28,
  },

  // === SECTION CARD ===
  sectionCard: {
    borderRadius: 16,
    marginBottom: 16,
   
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0a3674ff',
    marginBottom: 12,
  },

  // === CONTACT ROW ===
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f6fbffff',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1e293b',
    letterSpacing: 0.3,
  },
  actionButton: {
    backgroundColor: '#e36414',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },

  // === SCHEDULE CARD ===
  scheduleCard: {
    backgroundColor: '#fffbeb',
    borderRadius: 16,
    padding: 18,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#fef3c7',
  },
  scheduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  scheduleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400e',
    marginLeft: 10,
  },
  scheduleText: {
    fontSize: 12,
    color: '#78350f',
    lineHeight: 15,
    fontWeight: '600',
  },
});