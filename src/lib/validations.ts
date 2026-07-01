/**
 * Schémas de validation Zod pour les Server Actions et API routes.
 * Single source of truth pour la validation des données entrantes.
 */
import { z } from "zod";

// -----------------------------------
// VALIDATEURS DE BASE
// -----------------------------------

const phoneRegex = /^(\+?229)?\d{8}$/;

// -----------------------------------
// DONS
// -----------------------------------

export const donationFormSchema = z.object({
  amount: z
    .number({ invalid_type_error: "Le montant doit être un nombre" })
    .int("Le montant doit être un entier")
    .min(500, "Le montant minimum est de 500 FCFA")
    .max(50_000_000, "Le montant maximum est de 50 000 000 FCFA"),
  campaignId: z.string().uuid().optional().nullable(),
  frequency: z
    .enum(["ONE_TIME", "MONTHLY", "QUARTERLY", "YEARLY"])
    .default("ONE_TIME"),
  isAnonymous: z.boolean().default(false),
  donorName: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne peut dépasser 100 caractères"),
  donorEmail: z.string().email("Email invalide"),
  donorPhone: z
    .string()
    .regex(phoneRegex, "Numéro de téléphone béninois invalide (8 chiffres)")
    .optional()
    .or(z.literal("")),
  message: z
    .string()
    .max(500, "Le message ne peut dépasser 500 caractères")
    .optional(),
});

export type DonationFormInput = z.infer<typeof donationFormSchema>;

// -----------------------------------
// INSCRIPTION ÉVÉNEMENT
// -----------------------------------

export const eventRegistrationSchema = z.object({
  eventId: z.string().uuid("Identifiant d'événement invalide"),
  fullName: z.string().min(2).max(100),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().regex(phoneRegex, "Numéro invalide"),
  city: z.string().max(80).optional(),
  message: z.string().max(500).optional(),
});

export type EventRegistrationInput = z.infer<typeof eventRegistrationSchema>;

// -----------------------------------
// BÉNÉVOLAT
// -----------------------------------

export const volunteerApplicationSchema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.string().email("Email invalide"),
  phone: z.string().regex(phoneRegex, "Numéro invalide"),
  city: z.string().max(80).optional(),
  skills: z
    .array(z.string())
    .min(1, "Sélectionnez au moins un domaine de compétence"),
  availability: z.string().max(500).optional(),
  motivation: z
    .string()
    .min(20, "Veuillez décrire votre motivation (min 20 caractères)")
    .max(1000),
});

export type VolunteerApplicationInput = z.infer<
  typeof volunteerApplicationSchema
>;

// -----------------------------------
// CONTACT
// -----------------------------------

export const contactFormSchema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.string().email("Email invalide"),
  phone: z.string().regex(phoneRegex).optional().or(z.literal("")),
  subject: z.string().min(3).max(200),
  message: z.string().min(10).max(2000),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;

// -----------------------------------
// AUTHENTIFICATION
// -----------------------------------

export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Mot de passe trop court"),
});

export const registerSchema = z
  .object({
    name: z.string().min(2).max(100),
    email: z.string().email("Email invalide"),
    phone: z.string().regex(phoneRegex).optional().or(z.literal("")),
    password: z
      .string()
      .min(8, "Le mot de passe doit faire au moins 8 caractères")
      .regex(/[A-Z]/, "Doit contenir au moins une majuscule")
      .regex(/[0-9]/, "Doit contenir au moins un chiffre"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

// -----------------------------------
// DEMANDE DE PRIÈRE
// -----------------------------------

export const prayerRequestSchema = z.object({
  authorName: z.string().min(2).max(100),
  authorEmail: z.string().email().optional().or(z.literal("")),
  title: z.string().min(3).max(200),
  content: z.string().min(10).max(1000),
  isPublic: z.boolean().default(true),
});
