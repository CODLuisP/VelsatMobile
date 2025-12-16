export const DIRECTION_IMAGES = {
  s: {
    'up.png': 'https://imagedelivery.net/o0E1jB_kGKnYacpYCBFmZA/ff5a18f8-d1ca-496f-ab7c-80052a36a800/public',
    'topright.png': 'https://imagedelivery.net/o0E1jB_kGKnYacpYCBFmZA/3dc29969-3efc-42c2-4f61-5737a37f5f00/public',
    'right.png': 'https://imagedelivery.net/o0E1jB_kGKnYacpYCBFmZA/a3324678-3c04-4a96-4b55-db4475e97800/public',
    'downright.png': 'https://imagedelivery.net/o0E1jB_kGKnYacpYCBFmZA/dd86a097-9ee7-43ca-dd17-a6dddc6a1700/public',
    'down.png': 'https://imagedelivery.net/o0E1jB_kGKnYacpYCBFmZA/e04aed0c-5171-49f8-ad54-6412ddcb8900/public',
    'downleft.png': 'https://imagedelivery.net/o0E1jB_kGKnYacpYCBFmZA/bf5cb71f-0491-4401-fe7f-44902dec3700/public',
    'left.png': 'https://imagedelivery.net/o0E1jB_kGKnYacpYCBFmZA/6c96a697-da3a-4512-cd2c-cd28a183c200/public',
    'topleft.png': 'https://imagedelivery.net/o0E1jB_kGKnYacpYCBFmZA/1697f829-c487-46bf-f691-3383e371c300/public',
  },
  p: {
    'up.png': 'https://imagedelivery.net/o0E1jB_kGKnYacpYCBFmZA/2c6aea85-94c7-4260-9200-895832c8bd00/public',
    'topright.png': 'https://imagedelivery.net/o0E1jB_kGKnYacpYCBFmZA/5f02532f-be41-484e-4a64-0e3a84ed1500/public',
    'right.png': 'https://imagedelivery.net/o0E1jB_kGKnYacpYCBFmZA/249f594c-9a7c-4527-7085-ab86c6bf0100/public',
    'downright.png': 'https://imagedelivery.net/o0E1jB_kGKnYacpYCBFmZA/509230a6-c396-409d-14e2-96b9bc73a300/public',
    'down.png': 'https://imagedelivery.net/o0E1jB_kGKnYacpYCBFmZA/f8f5b75f-6d8c-4666-a802-3256a57f8800/public',
    'downleft.png': 'https://imagedelivery.net/o0E1jB_kGKnYacpYCBFmZA/6893a542-c203-44c3-e3f7-9b192d59e100/public',
    'left.png': 'https://imagedelivery.net/o0E1jB_kGKnYacpYCBFmZA/384a3dc9-0aac-4a2d-47c0-865556609400/public',
    'topleft.png': 'https://imagedelivery.net/o0E1jB_kGKnYacpYCBFmZA/59410a7f-7d88-4665-15aa-fc0f48a6a000/public',
  },
  c: {
    'up.png': 'https://imagedelivery.net/o0E1jB_kGKnYacpYCBFmZA/10bd8fc3-7a7f-4234-ba13-4bbe27e8de00/public',
    'topright.png': 'https://imagedelivery.net/o0E1jB_kGKnYacpYCBFmZA/1c5d8d0e-a3a8-4a7e-add3-1ef1b5380400/public',
    'right.png': 'https://imagedelivery.net/o0E1jB_kGKnYacpYCBFmZA/7141ec18-217e-49f3-b8ab-8b64b0f2e200/public',
    'downright.png': 'https://imagedelivery.net/o0E1jB_kGKnYacpYCBFmZA/f06760f3-5e3b-4950-3dbd-f1130fb26b00/public',
    'down.png': 'https://imagedelivery.net/o0E1jB_kGKnYacpYCBFmZA/f235da5e-6edb-45f4-d4a1-25ad453f3f00/public',
    'downleft.png': 'https://imagedelivery.net/o0E1jB_kGKnYacpYCBFmZA/c46cadfc-e30e-4ae6-42c0-1acece257200/public',
    'left.png': 'https://imagedelivery.net/o0E1jB_kGKnYacpYCBFmZA/9d5c63e8-46c8-4703-0f9d-d8821afb6200/public',
    'topleft.png': 'https://imagedelivery.net/o0E1jB_kGKnYacpYCBFmZA/0586460e-dc34-49ca-e613-4299b757fa00/public',
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