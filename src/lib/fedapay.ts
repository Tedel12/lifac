/**
 * =====================================================
 * INTÉGRATION FEDAPAY - LiFAC
 * =====================================================
 *
 * Module centralisant toute la logique d'interaction
 * avec l'API FedaPay (paiements Mobile Money + cartes).
 *
 * Documentation officielle :
 *   - https://docs.fedapay.com
 *   - SDK Node.js : https://github.com/fedapay/fedapay-node
 *
 * Variables d'environnement requises :
 *   - FEDAPAY_ENVIRONMENT (sandbox | live)
 *   - FEDAPAY_SECRET_KEY (clé serveur, jamais côté client)
 *   - FEDAPAY_WEBHOOK_SECRET (vérification HMAC)
 *   - FEDAPAY_CALLBACK_URL (URL de retour après paiement)
 * =====================================================
 */

import { FedaPay, Transaction } from "fedapay";
import crypto from "node:crypto";

// -----------------------------------
// CONFIGURATION
// -----------------------------------

const FEDAPAY_ENV = (process.env.FEDAPAY_ENVIRONMENT || "sandbox") as
  | "sandbox"
  | "live";
const FEDAPAY_SECRET = process.env.FEDAPAY_SECRET_KEY || "";

/**
 * Initialise le SDK FedaPay de manière paresseuse.
 *
 * Cette approche évite de crasher au build (Vercel build phase peut ne pas
 * avoir accès aux variables d'env) tout en garantissant l'initialisation
 * avant le premier appel réel à l'API.
 */
let fedaPayInitialized = false;
function ensureFedaPayInitialized(): boolean {
  if (fedaPayInitialized) return true;
  if (!FEDAPAY_SECRET) {
    console.warn(
      "[FedaPay] ⚠️  FEDAPAY_SECRET_KEY non défini. Les paiements ne fonctionneront pas."
    );
    return false;
  }
  try {
    FedaPay.setApiKey(FEDAPAY_SECRET);
    FedaPay.setEnvironment(FEDAPAY_ENV);
    fedaPayInitialized = true;
    return true;
  } catch (e) {
    console.error("[FedaPay] Échec d'initialisation :", e);
    return false;
  }
}

// -----------------------------------
// TYPES
// -----------------------------------

export interface CreateDonationPaymentInput {
  /** Montant en XOF (entier, pas de décimales pour le FCFA) */
  amount: number;
  /** Description visible par le donateur (ex: "Don pour orphelinat") */
  description: string;
  /** Référence interne unique (notre identifiant Donation.reference) */
  reference: string;
  /** URL absolue de retour après paiement */
  callbackUrl: string;
  /** Informations donateur */
  customer: {
    firstname: string;
    lastname: string;
    email: string;
    phone?: string;
  };
  /** Méthode de paiement préférée (optionnelle, sinon page de choix) */
  preferredMethod?: "mtn" | "moov" | "sbin" | "card";
  /** Métadonnées additionnelles (ID campagne, etc.) */
  metadata?: Record<string, unknown>;
}

export interface CreateDonationPaymentResult {
  success: boolean;
  transactionId?: string;
  paymentUrl?: string;
  reference?: string;
  error?: string;
}

// -----------------------------------
// CRÉATION D'UNE TRANSACTION
// -----------------------------------

/**
 * Crée une transaction FedaPay et génère le lien de paiement.
 *
 * Le donateur sera redirigé vers la page hébergée par FedaPay
 * où il pourra choisir entre Mobile Money (MTN/Moov) et carte.
 *
 * Conformément à la doc FedaPay v1, le flux est :
 *   1. (optionnel) Créer/retrouver le Customer
 *   2. Créer la Transaction
 *   3. Appeler generateToken() pour obtenir l'URL de paiement
 */
export async function createDonationPayment(
  input: CreateDonationPaymentInput
): Promise<CreateDonationPaymentResult> {
  try {
    if (!ensureFedaPayInitialized()) {
      return {
        success: false,
        error: "FedaPay non configuré (FEDAPAY_SECRET_KEY manquant)",
      };
    }

    // Validation basique côté serveur (XOF n'accepte pas les centimes)
    if (!Number.isInteger(input.amount) || input.amount < 100) {
      return {
        success: false,
        error: "Le montant minimum est de 100 XOF",
      };
    }

    // Création de la transaction FedaPay
    const transaction = await Transaction.create({
      description: input.description,
      amount: input.amount,
      currency: { iso: "XOF" },
      callback_url: input.callbackUrl,
      merchant_reference: input.reference,
      customer: {
        firstname: input.customer.firstname,
        lastname: input.customer.lastname,
        email: input.customer.email,
        phone_number: input.customer.phone
          ? {
              number: input.customer.phone,
              country: "BJ",
            }
          : undefined,
      },
      metadata: input.metadata,
    });

    // Génération de l'URL de paiement hébergée
    const tokenResponse = await transaction.generateToken();

    return {
      success: true,
      transactionId: String(transaction.id),
      paymentUrl: tokenResponse.url,
      reference: input.reference,
    };
  } catch (error) {
    console.error("[FedaPay] Erreur création transaction :", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur inconnue lors de la création de la transaction",
    };
  }
}

// -----------------------------------
// RÉCUPÉRATION D'UNE TRANSACTION
// -----------------------------------

/**
 * Récupère le statut d'une transaction depuis FedaPay.
 * Utile pour vérifier manuellement après un retour de callback.
 */
export async function retrieveTransaction(transactionId: string) {
  try {
    if (!ensureFedaPayInitialized()) {
      return {
        success: false,
        error: "FedaPay non configuré",
      };
    }
    const transaction = await Transaction.retrieve(transactionId);
    return {
      success: true,
      data: {
        id: String(transaction.id),
        status: transaction.status, // 'pending' | 'approved' | 'declined' | 'canceled'
        amount: transaction.amount,
        reference: transaction.reference,
        merchantReference: transaction.merchant_reference,
        approvedAt: transaction.approved_at,
        declinedAt: transaction.declined_at,
      },
    };
  } catch (error) {
    console.error("[FedaPay] Erreur récupération transaction :", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inconnue",
    };
  }
}

// -----------------------------------
// VÉRIFICATION SIGNATURE WEBHOOK
// -----------------------------------

/**
 * Vérifie la signature HMAC d'un webhook FedaPay.
 *
 * Le header `x-fedapay-signature` contient :
 *   t=TIMESTAMP,s=SIGNATURE_HMAC_SHA256
 *
 * On reconstruit la signature avec le secret partagé et on compare
 * en timing-safe pour éviter les attaques par mesure de temps.
 *
 * Référence : https://docs.fedapay.com/integration-api/en/webhooks-en
 */
export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  webhookSecret: string,
  toleranceSeconds: number = 300
): { valid: boolean; reason?: string } {
  if (!signatureHeader) {
    return { valid: false, reason: "En-tête signature manquant" };
  }
  if (!webhookSecret) {
    return { valid: false, reason: "Secret webhook non configuré" };
  }

  // Parsing du header : "t=12345,s=abc..."
  const parts = signatureHeader.split(",").reduce<Record<string, string>>(
    (acc, part) => {
      const [k, v] = part.split("=");
      if (k && v) acc[k.trim()] = v.trim();
      return acc;
    },
    {}
  );

  const timestamp = parts.t;
  const providedSignature = parts.s;

  if (!timestamp || !providedSignature) {
    return { valid: false, reason: "Format de signature invalide" };
  }

  // Protection contre les replay attacks
  const now = Math.floor(Date.now() / 1000);
  const ts = parseInt(timestamp, 10);
  if (Number.isNaN(ts) || Math.abs(now - ts) > toleranceSeconds) {
    return { valid: false, reason: "Timestamp expiré ou invalide" };
  }

  // Reconstruction de la signature (HMAC SHA256 timing-safe)
  const signedPayload = `${timestamp}.${rawBody}`;
  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(signedPayload)
    .digest("hex");

  // Comparaison timing-safe
  const expectedBuffer = Buffer.from(expectedSignature, "hex");
  const providedBuffer = Buffer.from(providedSignature, "hex");

  if (expectedBuffer.length !== providedBuffer.length) {
    return { valid: false, reason: "Signature de longueur incorrecte" };
  }

  const valid = crypto.timingSafeEqual(expectedBuffer, providedBuffer);
  return valid
    ? { valid: true }
    : { valid: false, reason: "Signature invalide" };
}

// -----------------------------------
// MAPPING STATUTS FEDAPAY → INTERNES
// -----------------------------------

/**
 * Convertit le statut FedaPay vers notre enum interne PaymentStatus.
 */
export function mapFedaPayStatus(
  status: string
): "PENDING" | "APPROVED" | "DECLINED" | "CANCELED" | "FAILED" {
  switch (status?.toLowerCase()) {
    case "approved":
      return "APPROVED";
    case "declined":
      return "DECLINED";
    case "canceled":
    case "cancelled":
      return "CANCELED";
    case "pending":
      return "PENDING";
    default:
      return "FAILED";
  }
}

// -----------------------------------
// HELPERS DE FORMATAGE
// -----------------------------------

/**
 * Convertit centimes (BigInt) → XOF entier pour FedaPay.
 * Comme XOF n'a pas de décimales, on stocke en centimes pour une cohérence
 * inter-devises mais on transmet l'entier à FedaPay.
 */
export function centsToXof(amountInCents: bigint | number): number {
  const cents =
    typeof amountInCents === "bigint" ? Number(amountInCents) : amountInCents;
  return Math.round(cents / 100);
}

export function xofToCents(amountInXof: number): bigint {
  return BigInt(Math.round(amountInXof * 100));
}

/**
 * Formate un montant pour affichage (ex: 15000 → "15 000 FCFA")
 */
export function formatAmountXof(amountInCents: bigint | number): string {
  const xof = centsToXof(amountInCents);
  return new Intl.NumberFormat("fr-FR").format(xof) + " FCFA";
}
