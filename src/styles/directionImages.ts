// src/utils/directionImages.ts

export const DIRECTION_IMAGES = {
  'up.png': 'https://res.cloudinary.com/dyc4ik1ko/image/upload/v1759594553/up_f0z0c7.png',
  'topright.png': 'https://res.cloudinary.com/dyc4ik1ko/image/upload/v1759594553/topright_ftymue.png',
  'right.png': 'https://res.cloudinary.com/dyc4ik1ko/image/upload/v1759594553/right_k9two2.png',
  'downright.png': 'https://res.cloudinary.com/dyc4ik1ko/image/upload/v1759594559/downright_taregi.png',
  'down.png': 'https://res.cloudinary.com/dyc4ik1ko/image/upload/v1759594553/down_oeri45.png',
  'downleft.png': 'https://res.cloudinary.com/dyc4ik1ko/image/upload/v1759594554/downleft_pq3a7n.png',
  'left.png': 'https://res.cloudinary.com/dyc4ik1ko/image/upload/v1759594554/left_tinfqg.png',
  'topleft.png': 'https://res.cloudinary.com/dyc4ik1ko/image/upload/v1759594556/topleft_ofml2l.png',
} as const;

export type DirectionImageName = keyof typeof DIRECTION_IMAGES;

export interface DirectionImageData {
  name: DirectionImageName;
  size: [number, number];
  anchor: [number, number];
}

export const getDirectionImageData = (angle: number): DirectionImageData => {
  if (angle >= 0 && angle <= 22.5) {
    return {
      name: 'up.png',
      size: [30, 40],
      anchor: [15, 35],
    };
  }
  if (angle > 22.5 && angle <= 67.5) {
    return {
      name: 'topright.png',
      size: [55, 35],
      anchor: [27, 17],
    };
  }
  if (angle > 67.5 && angle <= 112.5) {
    return {
      name: 'right.png',
      size: [55, 35],
      anchor: [27, 17],
    };
  }
  if (angle > 112.5 && angle <= 157.5) {
    return {
      name: 'downright.png',
      size: [55, 35],
      anchor: [27, 17],
    };
  }
  if (angle > 157.5 && angle <= 202.5) {
    return {
      name: 'down.png',
      size: [30, 40],
      anchor: [15, 5],
    };
  }
  if (angle > 202.5 && angle <= 247.5) {
    return {
      name: 'downleft.png',
      size: [55, 35],
      anchor: [27, 17],
    };
  }
  if (angle > 247.5 && angle <= 292.5) {
    return {
      name: 'left.png',
      size: [42, 25],
      anchor: [21, 12],
    };
  }
  if (angle > 292.5 && angle <= 337.5) {
    return {
      name: 'topleft.png',
      size: [55, 35],
      anchor: [27, 17],
    };
  }
  return {
    name: 'up.png',
    size: [30, 40],
    anchor: [15, 35],
  };
};

export const getDirectionImageName = (angle: number): DirectionImageName => {
  return getDirectionImageData(angle).name;
};

export const getDirectionImage = (angle: number) => {
  const imageName = getDirectionImageName(angle);
  return { uri: DIRECTION_IMAGES[imageName] };
};