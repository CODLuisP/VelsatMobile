import { StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: 8,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    borderRadius: 8,
    padding: 8,
    marginRight: 10,
    marginLeft: -10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },

  selectedBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  selectedBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 6,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  // ===== FIN DE ESTILOS DEL SLIDER MODERNO =====

  // Estilos del slider anterior (mantener por compatibilidad)
  scrollContainer: {
    paddingHorizontal: 0,
  },
  reportTypeContainer: {
    marginRight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    width: 90,
  },
  reportIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  reportIconSelected: {
    borderWidth: 3,
    borderColor: '#ff6b35',
  },
  reportIconSelectedLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 3,
    borderColor: '#ff6b35',
  },
  reportText: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 16,
  },

  content: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
    letterSpacing: -0.3,
  },

  sectionTitleSpecific: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 10,
    letterSpacing: -0.3,
  },

  // Unidad Input
  unitInputContainer: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },

  unitInputContent: {
    flex: 1,
  },

  unitInputPlaceholder: {
    color: '#9CA3AF',
    fontSize: 14,
  },

  selectedUnitContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },

  selectedUnitInfo: {
    flex: 1,
  },

  selectedUnitName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },

  selectedUnitDetails: {
    fontSize: 14,
    color: '#666',
  },

  clearUnitButton: {
    padding: 2,
    marginLeft: 8,
  },

  // Date Input
  dateInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 10,
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateInputText: {
    color: '#999',
    fontSize: 14,
  },

  // Opciones Específicas
  specificOptionsContainer: {
    borderRadius: 16,
    marginVertical: 8,
    shadowColor: '#000',
    marginTop: 10,
  },

  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  optionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  optionText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    marginRight: 12,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 12,
    minWidth: 80,
  },

  optionInput: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    minWidth: 40,
  },

  optionUnit: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginLeft: 4,
  },

  // Toggle
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  toggleLabelContainer: {
    flex: 1,
  },

  toggleLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 2,
  },

  toggleSubtext: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '400',
  },

  toggleSwitch: {
    width: 52,
    height: 28,
    borderRadius: 10,
    backgroundColor: '#D1D5DB',
    padding: 3,
    
    justifyContent: 'center',
  },

  toggleSwitchActive: {
    backgroundColor: '#e36414',
  },

  toggleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
   
  },

  // Botones
  buttonsContainer: {
    flexDirection: 'row',
    gap: 15,
    paddingVertical: 10,
    marginBottom: 20,
  },
  excelButton: {
    backgroundColor: '#008000',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 8,
    flex: 1,
  },
  showButton: {
    backgroundColor: '#ff5400',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 8,
    flex: 1,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Date Picker Modal
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    margin: 20,
    padding: 20,
    maxHeight: '80%',
    width: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    backgroundColor: '#ff6b35',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  iosDatePicker: {
    height: 200,
  },

  // Modal de Unidades
  unitModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },

  unitModalContent: {
    backgroundColor: 'white',
 
    height: '100%',
    paddingTop: 20,
    flex: 1,
  },

  unitModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingTop: 30,
  },

  unitModalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },

  unitModalCloseButton: {
    padding: 8,
  },

  // Búsqueda de Unidades
  unitSearchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },

  unitSearchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  unitSearchIcon: {
    marginRight: 10,
  },

  unitSearchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 0,
  },

  // Lista de Unidades
  unitsList: {
    flex: 1,
    paddingHorizontal: 20,
  },

  unitsListContainer: {
    flex: 1,
    paddingBottom: 20,
  },

  unitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },

  unitItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  unitIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F9FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  unitInfo: {
    flex: 1,
  },

  unitName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },

  unitDetails: {
    fontSize: 14,
    color: '#666',
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },

  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },

  dropdown: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 25,
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    color: '#999',
    fontSize: 14,
  },

  toggleButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  toggleButtonText: {
    fontSize: 12,
    color: '#666',
  },
});