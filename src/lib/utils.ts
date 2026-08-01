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