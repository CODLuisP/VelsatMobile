/**
 * Helpers compartidos por las pantallas de reportes (fechas y duraciones
 * que llegan del API como strings sueltos).
 */

const DAYS = [
  'domingo',
  'lunes',
  'martes',
  'miércoles',
  'jueves',
  'viernes',
  'sábado',
];

const MONTHS = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'setiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

/** Acepta dd/MM/yyyy y yyyy-MM-dd; devuelve null si no puede interpretarla. */
export const parseDateTime = (date: string, time: string): Date | null => {
  if (!date) return null;

  const parts = date.includes('/') ? date.split('/') : date.split('-');
  if (parts.length !== 3) return null;

  const nums = parts.map(p => parseInt(p, 10));
  if (nums.some(isNaN)) return null;

  const [year, month, day] =
    String(parts[0]).length === 4
      ? [nums[0], nums[1], nums[2]]
      : [nums[2], nums[1], nums[0]];

  const [h = 0, m = 0, s = 0] = (time || '').split(':').map(p => {
    const n = parseInt(p, 10);
    return isNaN(n) ? 0 : n;
  });

  const parsed = new Date(year, month - 1, day, h, m, s);
  return isNaN(parsed.getTime()) ? null : parsed;
};

/** "12/08/2026" -> "Miércoles 12 de agosto" (o el string crudo si no se puede leer). */
export const formatDayTitle = (date: string): string => {
  const parsed = parseDateTime(date, '');
  if (!parsed) return date;
  const day = DAYS[parsed.getDay()];
  return `${day.charAt(0).toUpperCase()}${day.slice(1)} ${parsed.getDate()} de ${
    MONTHS[parsed.getMonth()]
  }`;
};

/** "12/08/2026" -> "12 ago" (para paradas que terminan otro día). */
export const formatShortDate = (date: string): string => {
  const parsed = parseDateTime(date, '');
  if (!parsed) return date;
  return `${parsed.getDate()} ${MONTHS[parsed.getMonth()].slice(0, 3)}`;
};

/** "HH:mm:ss" -> "HH:mm" */
export const shortTime = (time: string): string => (time || '').slice(0, 5);

/** Minutos entre dos marcas del API; null si alguna no se puede interpretar. */
export const minutesBetween = (
  startDate: string,
  startTime: string,
  endDate: string,
  endTime: string,
): number | null => {
  const from = parseDateTime(startDate, startTime);
  const to = parseDateTime(endDate, endTime);
  if (!from || !to) return null;
  return (to.getTime() - from.getTime()) / 60000;
};

/** "01:25:00" o "1:25" -> 85 minutos. null si no calza. */
export const parseDuration = (totalTime: string): number | null => {
  if (!totalTime) return null;
  const parts = totalTime.split(':').map(p => parseInt(p, 10));
  if (parts.length < 2 || parts.some(isNaN)) return null;
  const [h, m, s = 0] = parts;
  return h * 60 + m + s / 60;
};

/** 85 -> "1 h 25 min" */
export const formatDuration = (minutes: number | null): string => {
  if (minutes === null) return '';
  if (minutes < 1) return 'menos de 1 min';
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
};

/** Versión corta para las métricas del resumen: { value: "2h 15", unit: " m" } */
export const compactDuration = (
  minutes: number,
): { value: string; unit: string } => {
  if (minutes < 60) {
    return { value: String(Math.round(minutes)), unit: ' min' };
  }
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return { value: `${h}h ${m}`, unit: ' m' };
};
