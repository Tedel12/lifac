"use server";

/**
 * =====================================================
 * SERVER ACTIONS - EVENTS & VOLUNTEERS
 * =====================================================
 */

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { uploadToCloudinary } from "@/lib/cloudinary";
import {
  eventRegistrationSchema,
  volunteerApplicationSchema,
  contactFormSchema,
  prayerRequestSchema,
  type EventRegistrationInput,
  type VolunteerApplicationInput,
  type ContactFormInput,
} from "@/lib/validations";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 Mo

export interface ExtendedEventRegistrationInput extends EventRegistrationInput {
  additionalData?: Record<string, any>;
}

type FieldErrors = Record<string, string[] | undefined>;

export type ActionResult =
  | { success: true; message?: string }
  | { success: false; error: string; fieldErrors?: FieldErrors };

// -----------------------------------
// INSCRIPTION À UN ÉVÉNEMENT
// -----------------------------------

// -----------------------------------
// INSCRIPTION À UN ÉVÉNEMENT
// -----------------------------------

export async function registerForEvent(
  input: EventRegistrationInput & { formData: any }
): Promise<ActionResult> {
  console.log("[registerForEvent] Input received:", JSON.stringify(input, (key, value) => (value instanceof File ? '[File]' : value), 2));

  // Assurer que les champs requis pour la validation Zod sont au premier niveau
  const validationInput = {
    ...input,
    // On s'assure que les champs attendus par le schéma sont bien définis
    eventId: input.eventId,
    fullName: input.fullName,
    phone: input.phone,
    email: input.email,
    isFireCamp: input.isFireCamp,
    participationMode: input.participationMode,
    formData: input.formData,
  };

  const parsed = eventRegistrationSchema.safeParse(validationInput);

  if (!parsed.success) {
    console.error("[registerForEvent] Validation failed:", parsed.error.flatten());
    return {
      success: false,
      error: "Données invalides",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const data = parsed.data;
  const rawFormData = input.formData;

  // Vérifier que l'événement existe et accepte les inscriptions
  const event = await prisma.event.findUnique({
    where: { id: data.eventId },
    select: {
      id: true,
      slug: true,
      type: true,
      maxAttendees: true,
      currentAttendees: true,
      status: true,
      requiresRegistration: true,
    },
  });

  if (!event) {
    return { success: false, error: "Événement introuvable" };
  }

  if (!event.requiresRegistration) {
    return {
      success: false,
      error: "Cet événement n'accepte pas d'inscription en ligne",
    };
  }

  if (event.status !== "UPCOMING" && event.status !== "ONGOING") {
    return { success: false, error: "Cet événement n'est plus ouvert" };
  }

  // event.maxAttendees peut légitimement valoir 0 → on teste "!= null", pas la vérité du nombre
  if (event.maxAttendees != null && event.currentAttendees >= event.maxAttendees) {
    return { success: false, error: "Cet événement est complet" };
  }

  // Anti-doublon "rapide" (l'unicité réelle est garantie en base par la contrainte @@unique,
  // voir la migration Prisma proposée à côté)
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

  // La décision "nécessite validation d'un admin" ne doit JAMAIS dépendre d'un booléen
  // envoyé par le client (data.isFireCamp) : on la déduit d'une donnée connue côté serveur.
  const requiresApproval = event.type === "YOUTH_CAMP" || event.type === "TRAINING";

  // Upload des fichiers — fait APRÈS les vérifs ci-dessus pour ne pas envoyer des fichiers
  // vers Cloudinary pour un événement complet / une inscription en double.
  let photoUrl: string | undefined;
  let idCardUrl: string | undefined;
  let recommendationLetterUrl: string | undefined;
  let cvUrl: string | undefined;
  const uploadedUrls: string[] = []; // pour un éventuel rollback si la suite échoue
  const sanitizedFormData: Record<string, any> = {};

  try {
    for (const key of Object.keys(rawFormData)) {
      const value = rawFormData[key];

      if (value instanceof File) {
        if (value.size > MAX_FILE_SIZE_BYTES) {
          return {
            success: false,
            error: `Le fichier "${key}" dépasse la taille maximale autorisée (5 Mo)`,
          };
        }

        const url = await uploadToCloudinary(value, "registrations");
        uploadedUrls.push(url);

        if (key === "photoIdentite" || key === "photoIdentiteDoc") photoUrl = url;
        if (key === "pieceIdentite") idCardUrl = url;
        if (key === "lettreRecommandation" || key === "lettreRecommandationDoc")
          recommendationLetterUrl = url;
        if (key === "cvMinisteriel") cvUrl = url;

        sanitizedFormData[key] = url; // on stocke l'URL (pas le File) dans le JSON
      } else {
        sanitizedFormData[key] = value;
      }
    }
  } catch (e) {
    console.error("[registerForEvent] Erreur upload :", e);
    return {
      success: false,
      error: "Erreur lors de l'envoi des documents. Veuillez réessayer.",
    };
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Incrément conditionnel et atomique : si maxAttendees est fixé, l'update échoue
      // (count === 0) si un autre inscrit a rempli l'événement entre-temps.
      if (event.maxAttendees != null) {
        const updated = await tx.event.updateMany({
          where: { id: event.id, currentAttendees: { lt: event.maxAttendees } },
          data: { currentAttendees: { increment: 1 } },
        });
        if (updated.count === 0) {
          throw new Error("EVENT_FULL");
        }
      } else {
        await tx.event.update({
          where: { id: event.id },
          data: { currentAttendees: { increment: 1 } },
        });
      }

      await tx.eventRegistration.create({
        data: {
          eventId: data.eventId,
          fullName: data.fullName,
          email: data.email || null,
          phone: data.phone,
          city: data.city || null,
          message: data.message || null,
          participationMode: sanitizedFormData.participationMode ?? null,
          photoUrl,
          idCardUrl,
          recommendationLetterUrl,
          cvUrl,
          pastorRecommended: sanitizedFormData.pasteurRecommande === "Oui",
          status: requiresApproval ? "PENDING" : "CONFIRMED",
          formData: sanitizedFormData,
        },
      });
    });
  } catch (e) {
    // Best-effort : on pourrait ici supprimer les fichiers déjà envoyés sur Cloudinary
    // via cloudinary.uploader.destroy(publicId) pour éviter des fichiers orphelins.

    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return {
        success: false,
        error: "Vous êtes déjà inscrit(e) avec ce numéro",
      };
    }
    if (e instanceof Error && e.message === "EVENT_FULL") {
      return { success: false, error: "Cet événement est complet" };
    }
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
    messageKey: "success.volunteer",
  };
}

export type ActionResultExtended =
  | { success: true; messageKey?: string }
  | { success: false; errorKey: string; fieldErrors?: FieldErrors };

export async function sendContactMessage(
  input: ContactFormInput
): Promise<ActionResultExtended> {
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