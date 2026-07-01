import Link from "next/link";
import { Metadata } from "next";
import { CheckCircle2, Clock, XCircle, Home, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getDonationByReference } from "@/actions/donations";
import { formatAmountXof } from "@/lib/fedapay";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Confirmation de don",
  robots: { index: false, follow: false },
};

// Toujours rendre frais : le statut du don peut changer entre la
// redirection FedaPay et l'affichage de la page (webhook async)
export const dynamic = "force-dynamic";

interface SuccessPageProps {
  searchParams: Promise<{ ref?: string; status?: string }>;
}

export default async function DonateSuccessPage({
  searchParams,
}: SuccessPageProps) {
  const { ref } = await searchParams;

  if (!ref) {
    return <NoReferenceState />;
  }

  const donation = await getDonationByReference(ref);

  if (!donation) {
    return <NotFoundState reference={ref} />;
  }

  return (
    <div className="bg-gradient-to-br from-lifac-blue-50 via-white to-lifac-gold-50 min-h-[80vh] py-12 lg:py-20">
      <div className="container mx-auto px-4 lg:px-8 max-w-2xl">
        <Card>
          <CardContent className="p-8 lg:p-12 text-center">
            <StatusBadge status={donation.status} />

            <h1 className="font-display text-3xl md:text-4xl font-bold text-lifac-blue-900 mt-6 mb-3">
              {statusTitle(donation.status)}
            </h1>

            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {statusMessage(donation.status)}
            </p>

            {/* Récap */}
            <div className="bg-gray-50 rounded-xl p-6 text-left space-y-3 mb-8">
              <DetailRow label="Référence" value={donation.reference} mono />
              <DetailRow
                label="Montant"
                value={formatAmountXof(donation.amount)}
                bold
              />
              <DetailRow label="Donateur" value={donation.donorName || "—"} />
              {donation.campaign && (
                <DetailRow
                  label="Campagne"
                  value={donation.campaign.title}
                />
              )}
              <DetailRow
                label="Date"
                value={formatDateTime(donation.createdAt)}
              />
              {donation.receiptNumber && (
                <DetailRow
                  label="N° de reçu"
                  value={donation.receiptNumber}
                  mono
                />
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  <Home className="h-4 w-4" />
                  Retour à l'accueil
                </Button>
              </Link>
              {donation.status !== "APPROVED" && (
                <Link href="/donate">
                  <Button variant="default" size="lg" className="w-full sm:w-auto">
                    <Heart className="h-4 w-4" />
                    Réessayer
                  </Button>
                </Link>
              )}
              {donation.status === "APPROVED" && (
                <Link href="/campaigns">
                  <Button variant="default" size="lg" className="w-full sm:w-auto">
                    Voir d'autres campagnes
                  </Button>
                </Link>
              )}
            </div>

            {donation.status === "APPROVED" && (
              <p className="text-xs text-gray-500 mt-6">
                Un reçu détaillé vous sera envoyé par email à l'adresse fournie.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "APPROVED") {
    return (
      <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
        <CheckCircle2 className="h-12 w-12 text-emerald-600" />
      </div>
    );
  }
  if (status === "PENDING") {
    return (
      <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-amber-100">
        <Clock className="h-12 w-12 text-amber-600 animate-pulse" />
      </div>
    );
  }
  return (
    <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
      <XCircle className="h-12 w-12 text-red-600" />
    </div>
  );
}

function statusTitle(status: string): string {
  switch (status) {
    case "APPROVED":
      return "Merci pour votre don !";
    case "PENDING":
      return "Paiement en cours de traitement";
    case "DECLINED":
      return "Paiement refusé";
    case "CANCELED":
      return "Paiement annulé";
    case "FAILED":
      return "Échec du paiement";
    default:
      return "Statut inconnu";
  }
}

function statusMessage(status: string): string {
  switch (status) {
    case "APPROVED":
      return "Votre don a été reçu avec succès. Que Dieu vous bénisse pour votre générosité.";
    case "PENDING":
      return "Nous attendons la confirmation de votre établissement bancaire ou opérateur Mobile Money. Cela peut prendre quelques minutes.";
    case "DECLINED":
      return "Le paiement a été refusé. Vérifiez votre solde ou essayez avec un autre moyen de paiement.";
    case "CANCELED":
      return "Le paiement a été annulé. Vous pouvez réessayer quand vous le souhaitez.";
    case "FAILED":
      return "Une erreur technique est survenue. Notre équipe a été notifiée.";
    default:
      return "Statut indéterminé. Merci de nous contacter si le problème persiste.";
  }
}

function DetailRow({
  label,
  value,
  bold,
  mono,
}: {
  label: string;
  value: string;
  bold?: boolean;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between items-center gap-4 text-sm">
      <span className="text-gray-500 shrink-0">{label}</span>
      <span
        className={`text-right ${bold ? "font-bold text-lifac-blue-900 text-base" : "text-gray-900"} ${mono ? "font-mono" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}

function NoReferenceState() {
  return (
    <div className="container mx-auto px-4 py-20 text-center">
      <h1 className="text-2xl font-bold mb-4">Référence manquante</h1>
      <p className="text-gray-600 mb-8">
        Aucune référence de transaction n'a été fournie.
      </p>
      <Link href="/">
        <Button variant="default">Retour à l'accueil</Button>
      </Link>
    </div>
  );
}

function NotFoundState({ reference }: { reference: string }) {
  return (
    <div className="container mx-auto px-4 py-20 text-center max-w-lg">
      <h1 className="text-2xl font-bold mb-4">Transaction introuvable</h1>
      <p className="text-gray-600 mb-2">
        La référence <code className="bg-gray-100 px-2 py-0.5 rounded">{reference}</code> ne
        correspond à aucune transaction enregistrée.
      </p>
      <p className="text-sm text-gray-500 mb-8">
        Si vous venez d'effectuer un paiement, attendez quelques instants puis
        rafraîchissez la page.
      </p>
      <Link href="/donate">
        <Button variant="default">Faire un don</Button>
      </Link>
    </div>
  );
}
