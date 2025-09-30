import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e3a8a',
  },

  header: {
    paddingBottom: 10,
  },

  headerContent: {
    paddingHorizontal: 20,
    marginTop:10
  },

  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    marginLeft:-10
  },

  headerTextContainer: {
    flex: 1,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },

  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '400',
  },

  dateContainer: {
    marginTop: 4,
  },

  dateWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
  },

  dateText: {
    fontSize: 14,
    color: '#fff',
  },

  listContainer: {
    flex: 1,
    paddingTop: 20,
  },

  listContent: {
    flexGrow: 1, // Cambiar de flex: 1 a flexGrow: 1
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#f5f5f5',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },

  separator: {
    height: 12,
  },

  vehicleCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },

  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
  },

  itemBadge: {
    backgroundColor: '#ff8c00',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },

  itemBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  unitHeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 12,
  },

  carIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },

  unitCompleteText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3d4757ff',
    flex: 1,
  },

  cardContent: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingBottom: 12,
    alignItems: 'center',
    minHeight: 70,
  },

  leftSection: {
    flex: 1,
    paddingRight: 12,
    justifyContent: 'center',
  },

  carImageWrapper: {
    width: '100%',
    height: 60,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  carImage: {
    width: '85%',
    height: 45,
    resizeMode: 'contain',
  },

  unitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  unitInfo: {
    flex: 1,
  },

  vehicleDetails: {
    flex: 1,
    justifyContent: 'center',
  },

  unitContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  rightSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },

  mileageContainer: {
    alignItems: 'center',
    backgroundColor: '#1cd537ff',
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  mileageValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#4285f4',
    lineHeight: 22,
    marginBottom: 6,
  },

  mileageUnit: {
    fontSize: 10,
    fontWeight: '600',
    color: '#4285f4',
    marginBottom: 6,
  },

  mileageLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },

  mileageLabelText: {
    fontSize: 8,
    color: '#ff8c00',
    fontWeight: '600',
    marginLeft: 2,
    textAlign: 'center',
  },
});
