import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StyleSheet,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface ReportType {
  id: number;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
  gradient: string[];
  imageUrl?: string; // Nueva propiedad para la imagen
}

interface ReportSliderProps {
  reports: ReportType[];
  selectedReportId: number;
  onSelectReport: (reportId: number) => void;
}

const ReportSlider: React.FC<ReportSliderProps> = ({
  reports,
  selectedReportId,
  onSelectReport,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    setActiveIndex(index);

    // Seleccionar automáticamente el reporte visible
    if (reports[index]) {
      onSelectReport(reports[index].id);
    }
  };

  const renderReportCard = (item: ReportType, index: number) => {
    const IconComponent = item.icon;
    const isSelected = selectedReportId === item.id;
    const imageUrl =
      item.imageUrl ||
      'https://res.cloudinary.com/dyc4ik1ko/image/upload/v1761537390/rgeneral_oeexfs.jpg';

    return (
      <View key={item.id} style={styles.slideCardContainer}>
        <TouchableOpacity
          style={styles.slideCard}
          onPress={() => onSelectReport(item.id)}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={item.gradient}
            style={styles.cardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.cardContent}>
              {/* Contenido de Texto a la Izquierda */}
              <View style={styles.cardTextContainer}>
                <View style={styles.iconTitleRow}>
                  <IconComponent size={28} color="#fff" strokeWidth={2.5} />
                  <Text style={styles.cardTitle}>{item.name}</Text>
                </View>
                <Text style={styles.cardDescription} numberOfLines={3}>
                  {item.description}
                </Text>
              </View>

              {/* Imagen Ovalada a la Derecha */}
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: imageUrl }}
                  style={styles.cardImage}
                  resizeMode="cover"
                />
              </View>
            </View>

            {isSelected && (
              <View style={styles.selectedBadge}>
                <Text style={styles.selectedBadgeText}>✓ Seleccionado</Text>
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  };

  const renderPagination = () => {
    return (
      <View style={styles.paginationContainer}>
        {reports.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              {
                width: activeIndex === index ? 24 : 8,
                opacity: activeIndex === index ? 1 : 0.3,
              },
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
        bounces={false}
        contentContainerStyle={styles.scrollContent}
      >
        {reports.map((item, index) => renderReportCard(item, index))}
      </ScrollView>

      {renderPagination()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
  },
  scrollContent: {
    flexDirection: 'row',
  },
  slideCardContainer: {
    width: SCREEN_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideCard: {
    width: SCREEN_WIDTH,
    height: 140,
  },
  cardGradient: {
    flex: 1,
    justifyContent: 'center',
    borderRadius: 20,
    overflow: 'hidden',
    paddingVertical: 0,
    paddingHorizontal: 20,
    marginHorizontal: Platform.select({
      android: 20,
      ios: 0,
    }),
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
  },
  // Contenedor de la imagen ovalada
  imageContainer: {
    width: 140,
    height: '100%',
    borderTopLeftRadius: 70,
    borderBottomLeftRadius: 70,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: {
      width: -2,
      height: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    marginRight: Platform.OS == 'android' ? -20 : 0,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardTextContainer: {
    flex: 1,
    gap: 8,
    paddingLeft: 16,
    paddingRight: 16,
    justifyContent: 'center',
  },
  iconTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: -25,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
    flex: 1,
  },
  cardDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '500',
    lineHeight: 14,
    marginTop: 0,
  },
  selectedBadge: {
    position: 'absolute',
    top: 90,
    left: Platform.select({ android: 20, ios: 20 }),
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 13,
  },
  selectedBadgeText: {
    color: '#ffffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    marginBottom: 10,
    gap: 8,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 1)',
  },
});

export default ReportSlider;
