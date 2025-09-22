import React from 'react';
import { Text, View, TouchableOpacity, Image, ScrollView } from 'react-native';
import { ChevronLeft, Thermometer, Droplet, Settings, MapPin, Navigation, Gauge, Calendar, Share, Radar, SatelliteDish, BatteryFull, TriangleAlert } from 'lucide-react-native';
import { RouteProp, useRoute, useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../../../App';
import { styles } from '../../../styles/infodevice';

type InfoDeviceRouteProp = RouteProp<RootStackParamList, 'InfoDevice'>;

const InfoDevice = () => {
    const route = useRoute<InfoDeviceRouteProp>();
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    const { deviceName } = route.params;

    const handleGoBack = () => {
        navigation.goBack();
    };


    const handleEvents = () => {
        navigation.navigate('Events');
    };


    return (
        <View style={styles.container}>
            {/* Header - Fixed */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                    <ChevronLeft size={24} color="#fff" />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Unidad: {deviceName}</Text>
                    <View style={styles.headerBadges}>
                        <View style={styles.temperatureBadge}>
                            <Radar size={16} color="#ffffffff" />
                        </View>
                        <View style={styles.fuelBadge}>
                            <BatteryFull size={16} color="#ffffffff" />
                        </View>
                        <View style={styles.settingsBadge}>
                            <SatelliteDish size={16} color="#ffffffff" />
                        </View>
                        <View style={styles.onlineBadge}>
                            <Text style={styles.onlineText}>Online</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Scrollable Content */}
            <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Vehicle Image */}
                <View style={styles.imageContainer}>
                    <Image
                        source={require('../../../../assets/Car.jpg')}
                        style={styles.vehicleImage}
                        resizeMode="cover"
                    />
                </View>

                {/* Vehicle Information Section */}
                <View style={styles.infoSection}>
                    <Text style={styles.sectionTitle}>Información vehicular</Text>

                    {/* Status Item */}
                    <View style={styles.infoItem}>
                        <View style={styles.iconContainer}>
                            <Gauge size={20} color="#666" />
                        </View>
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>
                                <Text style={styles.statusMoving}>Movimiento</Text>
                                <Text style={styles.speedText}> (34 km/h)</Text>
                            </Text>
                            <Text style={styles.infoSubtitle}>Estado y velocidad</Text>
                        </View>
                    </View>

                    {/* Date and Time Item */}
                    <View style={styles.infoItem}>
                        <View style={styles.iconContainer}>
                            <Calendar size={20} color="#666" />
                        </View>
                        <View style={styles.infoContent}>
                            <Text style={styles.infoValue}>16/09/2025 16:45:34</Text>
                            <Text style={styles.infoSubtitle}>Fecha y hora</Text>
                        </View>
                    </View>

                    {/* Coordinates Item */}
                    <View style={styles.infoItem}>
                        <View style={styles.iconContainer}>
                            <Settings size={20} color="#666" />
                        </View>
                        <View style={styles.infoContent}>
                            <Text style={styles.infoValue}>-7.151254, -78.506478</Text>
                            <Text style={styles.infoSubtitle}>Latitud y longitud</Text>
                        </View>
                    </View>

                    {/* Location Item */}
                    <View style={styles.infoItem}>
                        <View style={styles.iconContainer}>
                            <MapPin size={20} color="#666" />
                        </View>
                        <View style={styles.infoContent}>
                            <Text style={styles.infoValue}>Jr. Zoilo León 391, Lima, Perú</Text>
                            <Text style={styles.infoSubtitle}>Ubicación actual</Text>
                        </View>
                    </View>

                    {/* Direction Item */}
                    <View style={styles.infoItem}>
                        <View style={styles.iconContainer}>
                            <Navigation size={20} color="#666" />
                        </View>
                        <View style={styles.infoContent}>
                            <Text style={styles.infoValue}>Noroeste</Text>
                            <Text style={styles.infoSubtitle}>Dirección</Text>
                        </View>
                    </View>

                    {/* Odometer Item */}
                    <View style={styles.infoItem}>
                        <View style={styles.iconContainer}>
                            <Gauge size={20} color="#666" />
                        </View>
                        <View style={styles.infoContent}>
                            <Text style={styles.infoValue}>14195.7 Km</Text>
                            <Text style={styles.infoSubtitle}>Kilometraje actual</Text>
                        </View>
                    </View>

                    {/* Daily Distance Item */}
                    <View style={styles.infoItem}>
                        <View style={styles.iconContainer}>
                            <Calendar size={20} color="#666" />
                        </View>
                        <View style={styles.infoContent}>
                            <Text style={styles.infoValue}>30 km manejados el día de hoy</Text>
                            <Text style={styles.infoSubtitle}>Empezó el día a las 02:55:53 PM</Text>
                        </View>
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.eventsButton}  onPress={handleEvents}>
                        <TriangleAlert />
                        <Text style={styles.eventsButtonText}>
                            Eventos</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.shareButton}>
                        <Share size={20} color="#fff" />
                        <Text style={styles.shareButtonText}>Compartir</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

export default InfoDevice;