import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
  Animated,
} from 'react-native';
import { ChevronDown } from 'lucide-react-native';

// Habilitar LayoutAnimation en Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}


interface AccordionProps {
  title: string;
  content: string;
  iconColor?: string;
  borderColor?: string;
  isFirst?: boolean;
  isLast?: boolean;
}

const Accordion: React.FC<AccordionProps> = ({
  title,
  content,
  iconColor = '#1e3a8a',
  borderColor = '#E2E8F0',
  isFirst = false,
  isLast = false,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [rotateAnimation] = useState(new Animated.Value(0));

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);

    // Animar la rotación del ícono
    Animated.timing(rotateAnimation, {
      toValue: expanded ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const rotate = rotateAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View
      style={[
        styles.container,
        { borderColor },
        isFirst && styles.firstItem,
        isLast && styles.lastItem,
      ]}
    >
      <TouchableOpacity
        style={styles.header}
        onPress={toggleExpand}
        activeOpacity={0.7}
      >
        <Text style={styles.title}>{title}</Text>
        <Animated.View
          style={[
            styles.iconContainer,
            { transform: [{ rotate }] },
          ]}
        >
          <ChevronDown size={20} color={iconColor} />
        </Animated.View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.content}>
          <Text style={styles.contentText}>{content}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  firstItem: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  lastItem: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    marginBottom: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F9FA',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A202C',
    flex: 1,
    marginRight: 12,
    lineHeight: 20,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
    paddingTop: 0,
    backgroundColor: '#F8F9FA',
  },
  contentText: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 20,
  },
});

export default Accordion;