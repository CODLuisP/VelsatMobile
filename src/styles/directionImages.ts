export const DIRECTION_IMAGES = {
  s: {
    'up.png': 'https://res.cloudinary.com/dmamynahb/image/upload/v1764985197/up_meawgn.png',
    'topright.png': 'https://res.cloudinary.com/dmamynahb/image/upload/v1764985196/topright_n1mbhm.png',
    'right.png': 'https://res.cloudinary.com/dmamynahb/image/upload/v1764985196/right_l3bx8l.png',
    'downright.png': 'https://res.cloudinary.com/dmamynahb/image/upload/v1764985196/downright_xea3vv.png',
    'down.png': 'https://res.cloudinary.com/dmamynahb/image/upload/v1764985197/down_n9hkay.png',
    'downleft.png': 'https://res.cloudinary.com/dmamynahb/image/upload/v1764985196/downleft_ncspdm.png',
    'left.png': 'https://res.cloudinary.com/dmamynahb/image/upload/v1764985196/left_fjtsi2.png',
    'topleft.png': 'https://res.cloudinary.com/dmamynahb/image/upload/v1764985203/topleft_db0tvl.png',
  },
  p: {
    'up.png': 'https://res.cloudinary.com/dmamynahb/image/upload/v1764986044/up_j66qnl.png',
    'topright.png': 'https://res.cloudinary.com/dmamynahb/image/upload/v1764986049/topright_pvmbps.png',
    'right.png': 'https://res.cloudinary.com/dmamynahb/image/upload/v1764986047/right_ifsdev.png',
    'downright.png': 'https://res.cloudinary.com/dmamynahb/image/upload/v1764986045/downright_se4fz6.png',
    'down.png': 'https://res.cloudinary.com/dmamynahb/image/upload/v1764986045/down_tw1klz.png',
    'downleft.png': 'https://res.cloudinary.com/dmamynahb/image/upload/v1764986045/downleftt_ak7gzw.png',
    'left.png': 'https://res.cloudinary.com/dmamynahb/image/upload/v1764986045/left_xijhke.png',
    'topleft.png': 'https://res.cloudinary.com/dmamynahb/image/upload/v1764986047/topleft_fo4gjy.png',
  },
  c: {
    'up.png': 'https://res.cloudinary.com/dmamynahb/image/upload/v1764986034/up_mmzj9l.png',
    'topright.png': 'https://res.cloudinary.com/dmamynahb/image/upload/v1764986035/topright_yfs4qv.png',
    'right.png': 'https://res.cloudinary.com/dmamynahb/image/upload/v1764986035/right_riy4hq.png',
    'downright.png': 'https://res.cloudinary.com/dmamynahb/image/upload/v1764986034/downright_y4nuuf.png',
    'down.png': 'https://res.cloudinary.com/dmamynahb/image/upload/v1764986034/down_ww7i44.png',
    'downleft.png': 'https://res.cloudinary.com/dmamynahb/image/upload/v1764986034/downleft_eixqtw.png',
    'left.png': 'https://res.cloudinary.com/dmamynahb/image/upload/v1764986034/left_etckno.png',
    'topleft.png': 'https://res.cloudinary.com/dmamynahb/image/upload/v1764986035/topleft_vgtnud.png',
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