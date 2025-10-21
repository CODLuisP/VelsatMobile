import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  StyleSheet,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
} from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface ReportType {
  id: number;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
  gradient: string[]; 
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
              <View style={styles.cardIconContainer}>
                <IconComponent size={40} color="#fff" strokeWidth={2.5} />
              </View>
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardDescription} numberOfLines={2}>
                  {item.description}
                </Text>
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
    height: 135,
  },
  cardGradient: {
    flex: 1,
    justifyContent: 'space-between',
    borderRadius: 20,
    overflow: 'hidden',
    paddingVertical: 0,
    paddingHorizontal: 20,
  marginHorizontal: Platform.select({
    android: 20,
    ios: 0,
  }),  },

  cardContent: {
    flex: 1,
  },
  cardIconContainer: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    marginTop: 10,
    shadowColor: '#000',
  },
  cardTextContainer: {
    flex: 1,
    gap: 6,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginBottom: 2,
  },
  cardDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.90)',
    fontWeight: '500',
    lineHeight: 15,
  },
  selectedBadge: {
    position: 'absolute',
    top: 20,
    right: 50,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 13,
  },
  selectedBadgeText: {
    color: '#fff',
    fontSize: 13,
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