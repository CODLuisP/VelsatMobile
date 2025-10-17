import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#00296b',
  },
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
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 15,
  },
  contentList: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  formContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 15,
  },
  driverContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
  },
  driverAvatar: {
    marginRight: 15,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#d1d5db',
  },
  driverInfo: {
    flex: 1,
  },
  driverLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
  },
  driverValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  locationContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
  },
  locationRow: {
    flexDirection: 'row',
  },
  locationLeft: {
    flex: 1,
    paddingRight: 15,
  },
  locationLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 10,
  },
  locationValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
    marginTop: 2,
  },
  locationRight: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: 100,
  },
  dateLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  dateValue: {
    fontSize: 13,
    color: '#000',
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 2,
  },
  mapButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  mapText: {
    fontSize: 11,
    color: '#000',
    marginTop: 5,
    textAlign: 'center',
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  detailItem: {
    flex: 1,
    marginRight: 10,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 5,
  },
  detailValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  mapPlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#d1d5db',
    borderRadius: 10,
    marginTop: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
      justifyContent: 'center', // Opcional: centra el contenido

    flexWrap: 'wrap',
    gap: 2,
    backgroundColor:'red'

  },
  buttonBlue: {
   backgroundColor: '#2d53faff',
  paddingVertical: 10,
  paddingHorizontal: 20,
  borderRadius: 20,
  alignItems: 'center',
  marginTop: 10,
  flexDirection: 'row', // Esta es la clave para que esté en línea
  justifyContent: 'center', // Opcional: centra el contenido
  },
  buttonIcon: {
    marginRight: 6,
  },
  buttonBlueText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
buttonRed: {
  backgroundColor: '#fe3f04ff',
  paddingVertical: 10,
  paddingHorizontal: 20,
  borderRadius: 20,
  alignItems: 'center',
  marginTop: 10,
  flexDirection: 'row', // Esta es la clave para que esté en línea
  justifyContent: 'center', // Opcional: centra el contenido
},
  buttonRedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  buttonOrange: {
    backgroundColor: '#f97316',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonOrangeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});