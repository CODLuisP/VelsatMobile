import { Platform, StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginTop: Platform.OS === 'ios' ? -60 : 0,
    height: Platform.OS === 'ios' ? 200 : 110,
 
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  backButton: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 15,

  },
  headerMainTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 20,
  },
  contentList: {
    flex: 1,
    backgroundColor: '#ffffff',
    marginTop: -25,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  formContainer: {
    marginTop: 5,
    paddingHorizontal: 5,
  },
  // Indicador de pasajero
  passengerIndicator: {
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom:0,

  },
  passengerIndicatorLabel: {
    fontSize: 15,
    color: '#000000ff',
    fontWeight: '600',

  },
  passengerIndicatorNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: '#001845',
    marginTop: 2,
  },
  // Contenedor del slider completo
  sliderWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
    borderRadius: 20,
  },

  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom:5,
    marginTop:5
  },
  // Contenedor de las tarjetas del slider
  sliderCardsContainer: {
    flex: 1,

  },
  // Botones de navegación (izquierda y derecha)
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',

  },
  // Cards
  card: {
    borderRadius: 12,
 
    paddingHorizontal: 20,
    marginBottom: 10,
    paddingBottom: 10,
    backgroundColor:'#e9ecef',
    marginHorizontal:20
    
  },

  cardslider: {
    marginBottom: 2,
    borderBottomWidth: 1,
    borderColor:'#e0e0e0',
  
  },

    cardsliderSin: {
    marginBottom: 10,

  },




  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000ff',
  },
  centerLabel: {
    fontSize: 12,
    color: '#000000ff',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 10,
    marginTop:10
  },
  // Rows y contenedores
  rowWithIcon: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 0,
    backgroundColor:'#ffffffff'

  },
  infoRowWithIcon: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 0,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  iconButtonSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e36414',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoRow: {
    marginBottom: 3,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  gridItem: {
    flex: 1
  },
  gridItemRight: {
    width: 120,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent:'center',
  },

  actionButton: {
    marginBottom: 10,
  },

  // Textos
  label: {
    fontSize: 10,
    color: '#2d2a2aff',
    marginBottom: 2,
  },
  value: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  linkText: {
    fontSize: 11,
    color: '#000',
    marginTop: 5,
    textAlign: 'center',
  },
  // Botón de ubicación
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  // Botones de opciones
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 4,
  },
  buttonBlue: {
    backgroundColor: '#2563eb',
    paddingVertical: 9,
    paddingHorizontal: 7,
    borderRadius: 10,
  },
    buttonD: {
    backgroundColor: '#c4c4c4ff',
    paddingVertical: 9,
    paddingHorizontal: 7,
    borderRadius: 10,
  },
  buttonGray: {
    backgroundColor: '#018b3aff',
    paddingVertical: 9,
    paddingHorizontal:7,
    borderRadius: 10,
  },
  buttonOrange: {
    backgroundColor: '#f97316',
    paddingVertical: 9,
    paddingHorizontal: 7,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '500',
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -40,
    marginBottom: 20,
    paddingHorizontal: 20,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 80,
  },
  emptyStateTitle: {
    color: '#00296b',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateTitleDark: {
    color: '#1a237e',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    color: '#212529',
    fontSize: 14,
    textAlign: 'center',
  },
  emptyStateDescription: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(227, 100, 20, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  iconCircleLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent:'center',
    width:120
  },

  gpsAlert: {
  borderRadius: 12,
  margin: 10,
  backgroundColor: 'red',

},
gpsAlertHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
},
gpsAlertTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  color: '#FF6B35',
},
gpsAlertMessage: {
  fontSize: 14,
  color: '#666',
  marginBottom: 12,
  lineHeight: 20,
},
gpsActivateButton: {
  backgroundColor: '#FF6B35',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: 12,
  paddingHorizontal: 20,
  borderRadius: 8,
  gap: 8,
  marginBottom: 12,
},
gpsActivateButtonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: '600',
},
gpsStatusIndicator: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
},
gpsStatusDot: {
  width: 10,
  height: 10,
  borderRadius: 5,
  backgroundColor: '#FF6B35',
},
gpsStatusText: {
  fontSize: 13,
  color: '#666',
  fontWeight: '500',
},
});