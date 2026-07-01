"use server";

/**
 * =====================================================
 * SERVER ACTIONS - DONATIONS
 * =====================================================
 *
 * Logique métier centralisée pour la création et le suivi
 * des dons. Toutes les transactions FedaPay sont initiées
 * ici côté serveur — les clés API ne quittent jamais Node.
 * =====================================================
 */

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { createDonationPayment, xofToCents } from "@/lib/fedapay";
import { donationFormSchema, type DonationFormInput } from "@/lib/validations";
import { generateDonationReference } from "@/lib/utils";

// -----------------------------------
// TYPES DE RETOUR
// -----------------------------------

export type FieldErrors = Record<string, string[] | undefined>;

export type DonationActionResult =
  | { success: true; paymentUrl: string; reference: string }
  | { success: false; error: string; fieldErrors?: FieldErrors };

// -----------------------------------
// CRÉER UN DON
// -----------------------------------

/**
 * Crée un don en base, initialise la transaction FedaPay
 * et retourne l'URL de paiement vers laquelle rediriger.
 *
 * Cette fonction est invoquée depuis le formulaire de don
 * via une Server Action (pas d'API route nécessaire).
 */
export async function createDonation(
  input: DonationFormInput
): Promise<DonationActionResult> {
  // 1. Validation
  const parsed = donationFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Données invalides. Vérifiez les champs.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const data = parsed.data;

  // 2. Vérification de la campagne (si renseignée)
  let campaign = null;
  if (data.campaignId) {
    campaign = await prisma.campaign.findUnique({
      where: { id: data.campaignId },
      select: { id: true, title: true, status: true },
    });
    if (!campaign) {
      return { success: false, error: "Campagne introuvable" };
    }
    if (campaign.status !== "ACTIVE") {
      return {
        success: false,
        error: "Cette campagne n'accepte plus de dons actuellement",
      };
    }
  }

  // 3. Génération de la référence interne unique
  const reference = generateDonationReference();

  // 4. Récupération metadata réseau (audit / fraude)
  const headersList = await headers();
  const ipAddress =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip") ||
    null;
  const userAgent = headersList.get("user-agent") || null;

  // 5. Création de la donation en base (statut PENDING)
  let donation;
  try {
    donation = await prisma.donation.create({
      data: {
        reference,
        amount: xofToCents(data.amount),
        currency: "XOF",
        status: "PENDING",
        frequency: data.frequency,
        isAnonymous: data.isAnonymous,
        donorName: data.donorName,
        donorEmail: data.donorEmail,
        donorPhone: data.donorPhone || null,
        message: data.message || null,
        campaignId: data.campaignId || null,
        ipAddress,
        userAgent,
      },
      select: {
        id: true,
        reference: true,
        amount: true,
      },
    });
  } catch (dbError) {
    console.error("[createDonation] Erreur base de données :", dbError);
    return {
      success: false,
      error: "Erreur lors de l'enregistrement du don. Veuillez réessayer.",
    };
  }

  // 6. Création de la transaction FedaPay
  const [firstname, ...rest] = data.donorName.trim().split(" ");
  const lastname = rest.join(" ") || firstname;

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
    "http://localhost:3000";
  const callbackUrl =
    process.env.FEDAPAY_CALLBACK_URL || `${baseUrl}/donate/success`;

  const description = campaign
    ? `Don à LiFAC pour : ${campaign.title}`
    : "Don à LiFAC - Soutien général";

  const fedaPayResult = await createDonationPayment({
    amount: data.amount, // XOF entier (pas de centimes pour le SDK)
    description,
    reference,
    callbackUrl: `${callbackUrl}?ref=${reference}`,
    customer: {
      firstname,
      lastname,
      email: data.donorEmail,
      phone: data.donorPhone || undefined,
    },
    metadata: {
      donationId: donation.id,
      campaignId: data.campaignId || undefined,
      frequency: data.frequency,
    },
  });

  // 7. Si erreur FedaPay → marquer la donation FAILED
  if (!fedaPayResult.success || !fedaPayResult.paymentUrl) {
    await prisma.donation.update({
      where: { id: donation.id },
      data: { status: "FAILED" },
    });
    return {
      success: false,
      error: fedaPayResult.error || "Impossible d'initier le paiement",
    };
  }

  // 8. Mise à jour de la donation avec l'ID FedaPay et l'URL
  await prisma.donation.update({
    where: { id: donation.id },
    data: {
      fedapayId: fedaPayResult.transactionId,
      paymentLink: fedaPayResult.paymentUrl,
    },
  });

  return {
    success: true,
    paymentUrl: fedaPayResult.paymentUrl,
    reference,
  };
}

// -----------------------------------
// RÉCUPÉRER UN DON PAR RÉFÉRENCE
// -----------------------------------

/**
 * Utilisé sur la page /donate/success pour afficher le statut au donateur.
 */
export async function getDonationByReference(reference: string) {
  if (!reference) return null;
  return prisma.donation.findUnique({
    where: { reference },
    select: {
      id: true,
      reference: true,
      amount: true,
      currency: true,
      status: true,
      donorName: true,
      message: true,
      receiptNumber: true,
      receiptUrl: true,
      createdAt: true,
      approvedAt: true,
      campaign: {
        select: { id: true, title: true, slug: true },
      },
    },
  });
}

// -----------------------------------
// REVALIDATION CACHE APRÈS WEBHOOK
// -----------------------------------

/**
 * Appelée par le handler webhook après mise à jour d'un don
 * pour rafraîchir les pages publiques (compteurs de campagnes).
 */
export async function revalidateAfterDonation(campaignSlug?: string) {
  revalidatePath("/");
  revalidatePath("/campaigns");
  if (campaignSlug) {
    revalidatePath(`/campaigns/${campaignSlug}`);
  }
}
