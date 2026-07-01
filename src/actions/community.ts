"use server";

/**
 * =====================================================
 * SERVER ACTIONS - EVENTS & VOLUNTEERS
 * =====================================================
 */

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  eventRegistrationSchema,
  volunteerApplicationSchema,
  contactFormSchema,
  prayerRequestSchema,
  type EventRegistrationInput,
  type VolunteerApplicationInput,
  type ContactFormInput,
} from "@/lib/validations";

type FieldErrors = Record<string, string[] | undefined>;

export type ActionResult =
  | { success: true; message?: string }
  | { success: false; error: string; fieldErrors?: FieldErrors };

// -----------------------------------
// INSCRIPTION À UN ÉVÉNEMENT
// -----------------------------------

export async function registerForEvent(
  input: EventRegistrationInput
): Promise<ActionResult> {
  const parsed = eventRegistrationSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Données invalides",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const data = parsed.data;

  // Vérifier que l'événement existe et accepte les inscriptions
  const event = await prisma.event.findUnique({
    where: { id: data.eventId },
    select: {
      id: true,
      slug: true,
      maxAttendees: true,
      currentAttendees: true,
      status: true,
      requiresRegistration: true,
    },
  });

  if (!event) {
    return { success: false, error: "Événement introuvable" };
  }

  if (event.status !== "UPCOMING" && event.status !== "ONGOING") {
    return { success: false, error: "Cet événement n'est plus ouvert" };
  }

  if (
    event.maxAttendees &&
    event.currentAttendees >= event.maxAttendees
  ) {
    return { success: false, error: "Cet événement est complet" };
  }

  // Empêcher les doublons (même téléphone, même événement)
  const existing = await prisma.eventRegistration.findFirst({
    where: { eventId: data.eventId, phone: data.phone },
    select: { id: true },
  });
  if (existing) {
    return {
      success: false,
      error: "Vous êtes déjà inscrit(e) avec ce numéro",
    };
  }

  // Création + incrémentation du compteur en transaction
  try {
    await prisma.$transaction([
      prisma.eventRegistration.create({
        data: {
          eventId: data.eventId,
          fullName: data.fullName,
          email: data.email || null,
          phone: data.phone,
          city: data.city || null,
          message: data.message || null,
        },
      }),
      prisma.event.update({
        where: { id: data.eventId },
        data: { currentAttendees: { increment: 1 } },
      }),
    ]);
  } catch (e) {
    console.error("[registerForEvent] Erreur :", e);
    return {
      success: false,
      error: "Erreur lors de l'inscription. Veuillez réessayer.",
    };
  }

  revalidatePath(`/events/${event.slug}`);
  revalidatePath("/events");

  return {
    success: true,
    message: "Inscription confirmée ! Nous vous enverrons les détails par SMS.",
  };
}

// -----------------------------------
// CANDIDATURE BÉNÉVOLE
// -----------------------------------

export async function applyAsVolunteer(
  input: VolunteerApplicationInput
): Promise<ActionResult> {
  const parsed = volunteerApplicationSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Données invalides",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const data = parsed.data;

  // Vérifier si un utilisateur existe avec cet email, sinon en créer un
  let user = await prisma.user.findUnique({
    where: { email: data.email },
    select: { id: true, volunteerProfile: { select: { id: true } } },
  });

  if (user?.volunteerProfile) {
    return {
      success: false,
      error: "Une candidature existe déjà pour cet email",
    };
  }

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.fullName,
        phone: data.phone,
        city: data.city || null,
        role: "VOLUNTEER",
      },
      select: { id: true, volunteerProfile: { select: { id: true } } },
    });
  }

  // Création du profil bénévole en attente d'approbation
  try {
    await prisma.volunteer.create({
      data: {
        userId: user.id,
        status: "PENDING",
        skills: data.skills,
        availability: data.availability || null,
        motivation: data.motivation,
      },
    });
  } catch (e) {
    console.error("[applyAsVolunteer] Erreur :", e);
    return {
      success: false,
      error: "Erreur lors de la soumission. Veuillez réessayer.",
    };
  }

  return {
    success: true,
    message:
      export type ActionResult =
        | { success: true; messageKey?: string }
        | { success: false; errorKey: string; fieldErrors?: FieldErrors };

      // ... (skipping to sendContactMessage update)

      export async function sendContactMessage(
        input: ContactFormInput
      ): Promise<ActionResult> {
        const parsed = contactFormSchema.safeParse(input);
        if (!parsed.success) {
          return {
            success: false,
            errorKey: "forms.required",
            fieldErrors: parsed.error.flatten().fieldErrors,
          };
        }
        const data = parsed.data;

        try {
          await prisma.contactMessage.create({
            data: {
              fullName: data.fullName,
              email: data.email,
              phone: data.phone || null,
              subject: data.subject,
              message: data.message,
            },
          });
        } catch (e) {
          console.error("[sendContactMessage] Erreur :", e);
          return { success: false, errorKey: "forms.error" };
        }

        // TODO : envoyer une notification email à l'équipe LiFAC (Resend)

        return {
          success: true,
          messageKey: "forms.success",
        };
      }

// -----------------------------------
// DEMANDE DE PRIÈRE
// -----------------------------------

export async function submitPrayerRequest(input: {
  authorName: string;
  authorEmail?: string;
  title: string;
  content: string;
  isPublic?: boolean;
}): Promise<ActionResult> {
  const parsed = prayerRequestSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Données invalides",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const data = parsed.data;

  try {
    await prisma.prayerRequest.create({
      data: {
        authorName: data.authorName,
        authorEmail: data.authorEmail || null,
        title: data.title,
        content: data.content,
        isPublic: data.isPublic,
      },
    });
  } catch (e) {
    console.error("[submitPrayerRequest] Erreur :", e);
    return {
      success: false,
      error: "Erreur lors de l'enregistrement. Veuillez réessayer.",
    };
  }

  return {
    success: true,
    message: "Votre demande de prière a été reçue. Nous prierons pour vous.",
  };
}
