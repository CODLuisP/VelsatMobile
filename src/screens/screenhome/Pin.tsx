import React, { useState } from 'react';
import { Text, View, TouchableOpacity, ScrollView, Image } from 'react-native';
import { ChevronLeft, Clock } from 'lucide-react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../../App';
import { styles } from '../../styles/pin';

const Pin = () => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const [selectedOption, setSelectedOption] = useState<string>('');

    const handleGoBack = () => {
        navigation.goBack();
    };

    const handleSelect = (option: string) => {
        setSelectedOption(option);
        console.log('Opción seleccionada:', option);
        // Aquí puedes agregar la lógica para manejar la selección
    };

    const vehicleOptions = [
        {
            id: 'sedan',
            title: 'Sedán clásico',
            image: require('../../../assets/sedan.jpg')
        },
        {
            id: 'pickup',
            title: 'Pick-up',
            image: require('../../../assets/pickup.jpeg')
        },
        {
            id: 'truck',
            title: 'Camión cisterna',
            image: require('../../../assets/camion.jpg')
        }
    ];

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                        <ChevronLeft size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerMainTitle}>Marcadores</Text>
                </View>
                <View style={styles.headerBottom}>
                    <Text style={styles.headerTitle}>Cambiar marcador de unidades</Text>
                    <Text style={styles.headerSubtitle}>
                        Seleccionar el marcador de tu preferencia, este marcador será con el que visualizarás tus unidades, puedes cambiarlo cuando desees.
                    </Text>
                </View>
            </View>

            {/* Content */}
            <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                <View style={styles.optionsContainer}>
                    {vehicleOptions.map((option) => (
                        <View key={option.id} style={styles.optionCard}>
                            <Text style={styles.optionTitle}>{option.title}</Text>
                            <View style={styles.imageContainer}>
                                <Image 
                                    source={option.image} 
                                    style={styles.vehicleImage}
                                    resizeMode="cover"
                                />
                                <View style={styles.imageOverlay} />
                                <TouchableOpacity 
                                    style={styles.selectButton}
                                    onPress={() => handleSelect(option.id)}
                                >
                                    <Text style={styles.selectButtonText}>Seleccionar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </View>
                
             <View style={styles.footer}>
    <View style={styles.footerContent}>
        <Clock size={16} color="#666" />
        <Text style={styles.footerText}>Más modelos disponibles pronto...</Text>
    </View>
</View>
            </ScrollView>
        </View>
    );
};

export default Pin;