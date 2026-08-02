import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function formatNumber(num: number, locale: string = "fr-FR"): string {
  return new Intl.NumberFormat(locale).format(num);
}

export function formatDate(date: Date | string, locale: string = "fr-FR"): string {
  return new Intl.DateTimeFormat(locale, { day: "2-digit", month: "long", year: "numeric" }).format(
    new Date(date)
  );
}

export function formatDateTime(date: Date | string, locale: string = "fr-FR"): string {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

// Progression d'une campagne en % (0-100), à partir de montants en BigInt centimes
export function calculateProgress(current: bigint | number, goal: bigint | number): number {
  const currentNum = Number(current);
  const goalNum = Number(goal);
  if (!goalNum) return 0;
  return Math.min(100, Math.round((currentNum / goalNum) * 100));
}

// Référence interne unique pour un don, ex: "LIFAC-20260801-A1B2C"
export function generateDonationReference(): string {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `LIFAC-${datePart}-${randomPart}`;
}

// Distance à vol d'oiseau entre deux points GPS (formule de Haversine), en mètres.
export function haversineDistanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // rayon terrestre en mètres
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function googleMapsDirectionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
}

export const PRAYER_CATEGORY_LABELS: Record<string, string> = {
  PROTECTION: "Protection",
  SALUT: "Salut",
  GUERISON: "Guérison",
  DELIVRANCE: "Délivrance",
  AUTRE: "Autre",
};