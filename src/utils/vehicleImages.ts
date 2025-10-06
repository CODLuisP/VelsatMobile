// src/utils/vehicleImages.ts
import { Image } from 'react-native';

const DIRECTION_IMAGES = {
  'up.png': require('../../assets/up.png'),
  'topright.png': require('../../assets/topright.png'),
  'right.png': require('../../assets/right.png'),
  'downright.png': require('../../assets/downright.png'),
  'down.png': require('../../assets/down.png'),
  'downleft.png': require('../../assets/downleft.png'),
  'left.png': require('../../assets/left.png'),
  'topleft.png': require('../../assets/topleft.png'),
};

// Obtener las URIs de las imágenes
export const getImageUris = () => {
  return {
    up: Image.resolveAssetSource(DIRECTION_IMAGES['up.png']).uri,
    topright: Image.resolveAssetSource(DIRECTION_IMAGES['topright.png']).uri,
    right: Image.resolveAssetSource(DIRECTION_IMAGES['right.png']).uri,
    downright: Image.resolveAssetSource(DIRECTION_IMAGES['downright.png']).uri,
    down: Image.resolveAssetSource(DIRECTION_IMAGES['down.png']).uri,
    downleft: Image.resolveAssetSource(DIRECTION_IMAGES['downleft.png']).uri,
    left: Image.resolveAssetSource(DIRECTION_IMAGES['left.png']).uri,
    topleft: Image.resolveAssetSource(DIRECTION_IMAGES['topleft.png']).uri,
  };
};

export { DIRECTION_IMAGES };