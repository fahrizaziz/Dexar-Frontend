/**
 * Utility functions for Date and Formatting in Indonesian Locale
 */

export function formatIndonesianDate(dateInput: Date | string): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function formatTimeWIB(dateInput: Date | string): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date) + ' WIB';
}

export function getTodayDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isLateCheckIn(timeStr: string = '08:30:00'): boolean {
  // WFH Clock-in standard limit is 08:30 WIB
  const [hours, minutes] = timeStr.split(':').map(Number);
  if (hours > 8) return true;
  if (hours === 8 && minutes > 30) return true;
  return false;
}

export const PRESET_LOCATIONS = [
  { address: 'Jakarta Selatan, DKI Jakarta (Home Office)', latitude: -6.2615, longitude: 106.8106 },
  { address: 'Tangerang Selatan, Banten (Home Office)', latitude: -6.2886, longitude: 106.7179 },
  { address: 'Bandung, Jawa Barat (Remote WFH)', latitude: -6.9175, longitude: 107.6191 },
  { address: 'Depok, Jawa Barat (Home Office)', latitude: -6.4025, longitude: 106.7942 },
  { address: 'Surabaya, Jawa Timur (Remote WFH)', latitude: -7.2575, longitude: 112.7521 },
];

export function getRandomLocation() {
  const randomIndex = Math.floor(Math.random() * PRESET_LOCATIONS.length);
  return PRESET_LOCATIONS[randomIndex];
}
