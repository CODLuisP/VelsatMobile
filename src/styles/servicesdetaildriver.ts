import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e3a8a',
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
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  formContainer: {
    marginTop:5,
    paddingHorizontal: 5,
  },
  // Indicador de pasajero
  passengerIndicator: {
    alignItems: 'center',
    marginBottom: 5,
  },
  passengerIndicatorLabel: {
    fontSize: 12,
    color: '#363333ff',
  },
  passengerIndicatorNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333',
    marginTop: 2,
  },
  // Contenedor del slider completo
  sliderWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
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
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  
  },
  // Cards
  card: {
    borderRadius: 12,
     borderBottomWidth: 1,
  borderBottomColor: '#e0e0e0',
  paddingHorizontal:10,
  marginBottom:10,
  paddingBottom:10
 

  },

 cardslider: {
  marginBottom: 2,
  borderBottomWidth: 1,
  borderBottomColor: '#e0e0e0', 
},
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  centerLabel: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginBottom: 12,
  },
  // Rows y contenedores
  rowWithIcon: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 0,

  },
  infoRowWithIcon: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom:0,
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
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
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
  flex: 1,
},
gridItemRight: {
  // Sin flex, se ajusta a su contenido y queda a la derecha
  alignItems: 'flex-end', // Alinea el texto a la derecha dentro del item
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
    color: '#666',
    marginTop: 2,
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
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  buttonGray: {
    backgroundColor: '#9ca3af',
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  buttonOrange: {
    backgroundColor: '#f97316',
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '500',
  },
});