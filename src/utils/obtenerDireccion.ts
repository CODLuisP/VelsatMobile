export const obtenerDireccion = (heading: number): string => {
  if (heading >= 0 && heading <= 22.5) return 'Norte';
  if (heading >= 22.51 && heading <= 67.5) return 'Noreste';
  if (heading >= 67.51 && heading <= 112.5) return 'Este';
  if (heading >= 112.51 && heading <= 157.5) return 'Sureste';
  if (heading >= 157.51 && heading <= 202.5) return 'Sur';
  if (heading >= 202.51 && heading <= 247.5) return 'Suroeste';
  if (heading >= 247.51 && heading <= 292.5) return 'Oeste';
  if (heading >= 292.51 && heading <= 337.5) return 'Noroeste';
  if (heading >= 337.51 && heading <= 360.0) return 'Norte';
  return 'Desconocido';
};