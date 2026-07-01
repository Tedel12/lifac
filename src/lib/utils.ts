import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combine des classes Tailwind en gérant les conflits.
 * Utilisé partout dans les composants UI.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Génère un slug URL-friendly depuis un titre.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 80);
}

/**
 * Génère une référence unique pour les transactions de don.
 * Format : LIFAC-YYYYMMDD-XXXXX
 */
export function generateDonationReference(): string {
  const now = new Date();
  const datePart =
    now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0");
  const random = Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, "0");
  return `LIFAC-${datePart}-${random}`;
}

/**
 * Formate une date en français.
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Calcule le pourcentage de progression d'une campagne (0-100).
 */
export function calculateProgress(
  current: bigint | number,
  goal: bigint | number
): number {
  const c = typeof current === "bigint" ? Number(current) : current;
  const g = typeof goal === "bigint" ? Number(goal) : goal;
  if (g <= 0) return 0;
  return Math.min(100, Math.round((c / g) * 100));
}

/**
 * Formate les nombres pour affichage (32500 → "32 500" ou "32,5K").
 */
export function formatNumber(n: number, compact: boolean = false): string {
  if (compact && n >= 1000) {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    return `${(n / 1000).toFixed(1)}K`;
  }
  return new Intl.NumberFormat("fr-FR").format(n);
}

/**
 * Validation d'un numéro de téléphone béninois.
 * Format accepté : +229XXXXXXXX ou 229XXXXXXXX ou XXXXXXXX (8 chiffres)
 */
export function normalizePhoneBenin(phone: string): string | null {
  const cleaned = phone.replace(/\s+/g, "");
  // +229XXXXXXXX ou 00229XXXXXXXX
  if (/^\+?229\d{8}$/.test(cleaned.replace(/^00/, "+"))) {
    return cleaned.startsWith("+")
      ? cleaned
      : cleaned.startsWith("00")
        ? "+" + cleaned.substring(2)
        : "+" + cleaned;
  }
  // 8 chiffres seuls (numéro local)
  if (/^\d{8}$/.test(cleaned)) {
    return "+229" + cleaned;
  }
  return null;
}

/**
 * Tronque un texte à N caractères en gardant les mots entiers.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  return (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated) + "…";
}
