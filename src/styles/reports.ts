import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffffff',

    },
    header: {
        backgroundColor: '#1e3a8a',
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    backButton: {
        borderRadius: 8,
        padding: 8,
        marginRight: 10,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 2,
    },
    scrollContainer: {
        paddingHorizontal: 15,
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
    reportText: {
        color: 'white',
        fontSize: 12,
        textAlign: 'center',
        fontWeight: '500',
        lineHeight: 16,
    },
    content: {
        flex: 1,
        backgroundColor: 'white',
        paddingHorizontal: 20,
        paddingTop: 20,
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
    dateInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 12,
        marginBottom: 20,
        backgroundColor: 'white',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dateInputText: {
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
    buttonsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingBottom: 30,
        paddingTop: 20,
        backgroundColor: 'white',
        gap: 15,
    },
    excelButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 15,
        paddingHorizontal: 25,
        borderRadius: 8,
        flex: 1,
    },
    showButton: {
        backgroundColor: '#ff6b35',
        paddingVertical: 15,
        paddingHorizontal: 25,
        borderRadius: 8,
        flex: 1,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },






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

    specificOptionsContainer: {
        backgroundColor: '#d3d3d3',
        borderRadius: 16,
        padding: 20,
        marginVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },

    

    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 10,
        letterSpacing: -0.3,
    },

      

    sectionTitleSpecific: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 20,
        letterSpacing: -0.3,
        textAlign: 'center',
    },

    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },

    optionIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },

    optionText: {
        flex: 1,
        fontSize: 15,
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

    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },

    toggleLabelContainer: {
        flex: 1,
    },

    toggleLabel: {
        fontSize: 15,
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
        borderRadius: 14,
        backgroundColor: '#D1D5DB',
        padding: 2,
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
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
    marginBottom: 20,
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
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },

  selectedUnitDetails: {
    fontSize: 14,
    color: '#666',
  },

  clearUnitButton: {
    padding: 8,
    marginLeft: 8,
  },

  // Estilos para el modal de unidades
  unitModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },

unitModalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%', 
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
    paddingTop: 54,
  },

  unitModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },

  unitModalCloseButton: {
    padding: 8,
  },

  // Estilos para el campo de búsqueda
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

  // Estilos para la lista de unidades
  unitsList: {
    flex: 1,
    paddingHorizontal: 20,
  },

  unitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },

  unitsListContainer: {
    flex: 1,
    paddingBottom: 20,
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
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },

  unitDetails: {
    fontSize: 14,
    color: '#666',
  },

  // Estilo para cuando no hay resultados
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },

  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },

});