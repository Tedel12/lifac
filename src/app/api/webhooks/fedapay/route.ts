/**
 * =====================================================
 * WEBHOOK FEDAPAY
 * =====================================================
 *
 * Endpoint : POST /api/webhooks/fedapay
 *
 * Reçoit les notifications de FedaPay lors des changements
 * de statut des transactions (approved, declined, canceled).
 *
 * SÉCURITÉ :
 *   - Vérification HMAC obligatoire de la signature
 *   - Idempotence (un même événement ne peut être traité 2 fois)
 *   - Pas de retour d'info sensible en cas d'échec
 *
 * Documentation : https://docs.fedapay.com/integration-api/en/webhooks-en
 * =====================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature, mapFedaPayStatus } from "@/lib/fedapay";
import { revalidateAfterDonation } from "@/actions/donations";

// Force runtime Node.js (pas Edge — on utilise crypto natif)
export const runtime = "nodejs";
export const maxDuration = 30;

// Le webhook ne doit JAMAIS être pré-rendu ni mis en cache.
// `force-dynamic` empêche Next/Vercel de tenter d'optimiser cette route.
export const dynamic = "force-dynamic";

// Désactive la revalidation statique
export const revalidate = 0;

export async function POST(request: NextRequest) {
  // 1. Lecture du body brut (nécessaire pour vérifier la signature)
  const rawBody = await request.text();
  const signature = request.headers.get("x-fedapay-signature");
  const webhookSecret = process.env.FEDAPAY_WEBHOOK_SECRET;

  // 2. Vérification de la signature HMAC
  if (!webhookSecret) {
    console.error("[FedaPay Webhook] FEDAPAY_WEBHOOK_SECRET manquant");
    return NextResponse.json(
      { error: "Configuration serveur incomplète" },
      { status: 500 }
    );
  }

  const verification = verifyWebhookSignature(rawBody, signature, webhookSecret);
  if (!verification.valid) {
    console.warn(
      "[FedaPay Webhook] Signature invalide :",
      verification.reason
    );
    return NextResponse.json(
      { error: "Signature invalide" },
      { status: 401 }
    );
  }

  // 3. Parsing de l'événement
  let event;
  try {
    event = JSON.parse(rawBody);
  } catch (e) {
    return NextResponse.json(
      { error: "Payload JSON invalide" },
      { status: 400 }
    );
  }

  const eventName: string = event?.name || event?.event;
  const eventId: string | undefined = event?.id;
  const transactionData = event?.entity || event?.data || event?.object;

  if (!eventName || !transactionData) {
    return NextResponse.json(
      { error: "Structure d'événement invalide" },
      { status: 400 }
    );
  }

  console.log(
    `[FedaPay Webhook] Événement reçu : ${eventName} (id: ${eventId})`
  );

  // 4. Idempotence : ignorer si on a déjà traité cet événement
  if (eventId) {
    const alreadyProcessed = await prisma.paymentTransaction.findFirst({
      where: { fedapayEventId: eventId },
      select: { id: true },
    });
    if (alreadyProcessed) {
      console.log(
        `[FedaPay Webhook] Événement ${eventId} déjà traité, ignoré.`
      );
      return NextResponse.json({ received: true, idempotent: true });
    }
  }

  // 5. Identification de la donation associée
  const merchantReference: string | undefined =
    transactionData.merchant_reference || transactionData.reference;

  if (!merchantReference) {
    console.error("[FedaPay Webhook] Pas de merchant_reference dans l'event");
    return NextResponse.json(
      { error: "Référence marchande manquante" },
      { status: 400 }
    );
  }

  const donation = await prisma.donation.findUnique({
    where: { reference: merchantReference },
    include: { campaign: { select: { id: true, slug: true } } },
  });

  if (!donation) {
    console.error(
      `[FedaPay Webhook] Donation introuvable pour référence ${merchantReference}`
    );
    // On répond 200 pour éviter que FedaPay re-tente indéfiniment un don orphelin
    return NextResponse.json({ received: true, orphan: true });
  }

  // 6. Détermination du nouveau statut
  const fedaPayStatus = transactionData.status as string;
  const newStatus = mapFedaPayStatus(fedaPayStatus);

  // 7. Traitement transactionnel : update donation + log + update campagne
  try {
    await prisma.$transaction(async (tx) => {
      // Log technique de l'événement
      await tx.paymentTransaction.create({
        data: {
          donationId: donation.id,
          fedapayEventId: eventId || null,
          eventName,
          status: newStatus,
          rawPayload: event,
          signature: signature || null,
        },
      });

      // Mise à jour du statut de la donation
      const wasApproved = donation.status === "APPROVED";
      const isNowApproved = newStatus === "APPROVED";

      const previousMetadata =
        donation.metadata &&
        typeof donation.metadata === "object" &&
        !Array.isArray(donation.metadata)
          ? (donation.metadata as Record<string, unknown>)
          : {};

      const newFedapayId =
        transactionData.id != null
          ? String(transactionData.id)
          : donation.fedapayId ?? null;

      await tx.donation.update({
        where: { id: donation.id },
        data: {
          status: newStatus,
          fedapayId: newFedapayId,
          paymentMethod: detectPaymentMethod(transactionData),
          approvedAt: isNowApproved ? new Date() : donation.approvedAt,
          metadata: {
            ...previousMetadata,
            lastEventName: eventName,
            lastUpdate: new Date().toISOString(),
          } as Prisma.InputJsonValue,
        },
      });

      // Si APPROVED et pas déjà comptabilisé : incrémenter la campagne et les stats
      if (isNowApproved && !wasApproved) {
        if (donation.campaignId) {
          await tx.campaign.update({
            where: { id: donation.campaignId },
            data: {
              currentAmount: { increment: donation.amount },
            },
          });
        }

        // Mise à jour stats globales
        const stats = await tx.globalStats.findFirst({
          orderBy: { updatedAt: "desc" },
        });
        if (stats) {
          await tx.globalStats.update({
            where: { id: stats.id },
            data: {
              totalDonations: { increment: donation.amount },
            },
          });
        }

        // Génération du numéro de reçu fiscal
        const receiptNumber = `RECU-${new Date().getFullYear()}-${String(
          Date.now()
        ).slice(-8)}`;
        await tx.donation.update({
          where: { id: donation.id },
          data: { receiptNumber },
        });
      }
    });
  } catch (e) {
    console.error("[FedaPay Webhook] Erreur transaction :", e);
    return NextResponse.json(
      { error: "Erreur traitement interne" },
      { status: 500 }
    );
  }

  // 8. Revalidation des pages affichant les compteurs
  await revalidateAfterDonation(donation.campaign?.slug);

  // TODO : envoyer email de reçu au donateur si APPROVED
  // TODO : notifier l'équipe LiFAC si don > seuil

  return NextResponse.json({ received: true });
}

// -----------------------------------
// HELPERS
// -----------------------------------

function detectPaymentMethod(
  transactionData: Record<string, unknown>
): "MTN_MOBILE_MONEY" | "MOOV_MOBILE_MONEY" | "CELTIIS_CASH" | "SBIN" | "CARD" | null {
  const mode = String(transactionData.mode || "").toLowerCase();
  if (mode.includes("mtn")) return "MTN_MOBILE_MONEY";
  if (mode.includes("moov")) return "MOOV_MOBILE_MONEY";
  if (mode.includes("celtiis")) return "CELTIIS_CASH";
  if (mode === "sbin") return "SBIN";
  if (mode.includes("card") || mode.includes("visa") || mode.includes("master"))
    return "CARD";
  return null;
}

// Réponse aux pings GET (utile pour vérifier que l'endpoint répond)
export async function GET() {
  return NextResponse.json({
    status: "ok",
    endpoint: "FedaPay webhook",
    accepts: "POST",
  });
}
