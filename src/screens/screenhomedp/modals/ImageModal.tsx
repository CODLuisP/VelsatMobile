import React from 'react';
import { 
  View, 
  Modal, 
  TouchableOpacity, 
  Image, 
  StyleSheet, 
  Animated,
  StatusBar
} from 'react-native';

interface ImageModalProps {
  visible: boolean;
  imageUri: string | null;
  onClose: () => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({ 
  visible, 
  imageUri, 
  onClose 
}) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
        {/* Botón cerrar flotante */}
     

        {/* Contenedor principal */}
        <TouchableOpacity
          style={styles.contentArea}
          activeOpacity={1}
          onPress={onClose}
        >
          <View style={styles.imageCard}>
            {imageUri && (
              <Image
                source={{ uri: imageUri }}
                style={styles.image}
                resizeMode="contain"
              />
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
  },

  contentArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  imageCard: {
    width: '100%',
    maxWidth: 600,
    aspectRatio: 1,
    backgroundColor: 'transparent',
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});