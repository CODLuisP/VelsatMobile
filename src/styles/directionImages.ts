export const DIRECTION_IMAGES = {
  s: {
    'up.png': 'https://res.cloudinary.com/dyc4ik1ko/image/upload/v1759594553/up_f0z0c7.png',
    'topright.png': 'https://res.cloudinary.com/dyc4ik1ko/image/upload/v1759594553/topright_ftymue.png',
    'right.png': 'https://res.cloudinary.com/dyc4ik1ko/image/upload/v1759594553/right_k9two2.png',
    'downright.png': 'https://res.cloudinary.com/dyc4ik1ko/image/upload/v1759594559/downright_taregi.png',
    'down.png': 'https://res.cloudinary.com/dyc4ik1ko/image/upload/v1759594553/down_oeri45.png',
    'downleft.png': 'https://res.cloudinary.com/dyc4ik1ko/image/upload/v1759594554/downleft_pq3a7n.png',
    'left.png': 'https://res.cloudinary.com/dyc4ik1ko/image/upload/v1759594554/left_tinfqg.png',
    'topleft.png': 'https://res.cloudinary.com/dyc4ik1ko/image/upload/v1759594556/topleft_ofml2l.png',
  },
  p: {
    'up.png': 'https://res.cloudinary.com/dyc4ik1ko/image/upload/v1760407170/up_kjdkui.png',
    'topright.png': 'https://res.cloudinary.com/dyc4ik1ko/image/upload/v1760407179/topright_dwemw2.png',
    'right.png': 'https://res.cloudinary.com/dyc4ik1ko/image/upload/v1760407175/right_jvw4hu.png',
    'downright.png': 'https://res.cloudinary.com/dyc4ik1ko/image/upload/v1760407175/downright_wcx6zk.png',
    'down.png': 'https://res.cloudinary.com/dyc4ik1ko/image/upload/v1760407171/down_vzvah0.png',
    'downleft.png': 'https://res.cloudinary.com/dyc4ik1ko/image/upload/v1760407173/downleftt_jprnqk.png',
    'left.png': 'https://res.cloudinary.com/dyc4ik1ko/image/upload/v1760407174/left_whnkql.png',
    'topleft.png': 'https://res.cloudinary.com/dyc4ik1ko/image/upload/v1760407177/topleft_bjy3cz.png',
  },
  c: {
    'up.png': 'https://res.cloudinary.com/dyc4ik1ko/image/upload/v1760407143/up_t9tkih.png',
    'topright.png': 'https://res.cloudinary.com/dyc4ik1ko/image/upload/v1760407148/topright_dmxqvt.png',
    'right.png': 'https://res.cloudinary.com/dyc4ik1ko/image/upload/v1760407144/right_j1telm.png',
    'downright.png': 'https://res.cloudinary.com/dyc4ik1ko/image/upload/v1760407144/downright_jv5ntw.png',
    'down.png': 'https://res.cloudinary.com/dyc4ik1ko/image/upload/v1760407143/down_jbwmwf.png',
    'downleft.png': 'https://res.cloudinary.com/dyc4ik1ko/image/upload/v1760407144/downleft_ssf2zx.png',
    'left.png': 'https://res.cloudinary.com/dyc4ik1ko/image/upload/v1760407144/left_t7zdal.png',
    'topleft.png': 'https://res.cloudinary.com/dyc4ik1ko/image/upload/v1760407144/topleft_ev8psj.png',
  },
} as const;

export type VehiclePinType = 's' | 'p' | 'c';
export type DirectionImageName = keyof typeof DIRECTION_IMAGES.s;

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

// ESTA FUNCIÓN YA NO SE EXPORTA - se usa internamente
const getDirectionImageName = (angle: number): DirectionImageName => {
  return getDirectionImageData(angle).name;
};

// NUEVA FUNCIÓN con parámetro pinType
export const getDirectionImage = (angle: number, pinType: VehiclePinType = 's') => {
  const imageName = getDirectionImageName(angle);
  return { uri: DIRECTION_IMAGES[pinType][imageName] };
};