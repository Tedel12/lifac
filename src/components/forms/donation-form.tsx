"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Heart, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { createDonation } from "@/actions/donations";
import { cn } from "@/lib/utils";

interface DonationFormProps {
  campaignId?: string;
  campaignTitle?: string;
}

const PRESET_AMOUNTS = [1000, 5000, 10000, 25000, 50000, 100000];

export function DonationForm({ campaignId, campaignTitle }: DonationFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [amount, setAmount] = useState<number>(5000);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [frequency, setFrequency] = useState<"ONE_TIME" | "MONTHLY">("ONE_TIME");
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [message, setMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Record<string, string[] | undefined>
  >({});

  function selectPreset(value: number) {
    setAmount(value);
    setCustomAmount("");
  }

  function handleCustomAmount(value: string) {
    setCustomAmount(value);
    const parsed = parseInt(value.replace(/\s+/g, ""), 10);
    if (!Number.isNaN(parsed) && parsed > 0) setAmount(parsed);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    startTransition(async () => {
      const result = await createDonation({
        amount,
        campaignId: campaignId || null,
        frequency,
        isAnonymous,
        donorName,
        donorEmail,
        donorPhone: donorPhone || undefined,
        message: message || undefined,
      });

      if (!result.success) {
        setError(result.error);
        if (result.fieldErrors) setFieldErrors(result.fieldErrors);
        return;
      }

      // Redirection vers la page de paiement FedaPay
      window.location.href = result.paymentUrl;
    });
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardContent className="p-6 lg:p-10">
        {campaignTitle && (
          <div className="mb-6 p-4 bg-lifac-gold-50 border border-lifac-gold-200 rounded-xl">
            <p className="text-sm text-gray-600">Vous soutenez :</p>
            <p className="font-bold text-lifac-blue-900">{campaignTitle}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Étape 1 : Montant */}
          <div>
            <Label className="text-base font-semibold mb-3">
              Choisissez un montant <span className="text-red-500">*</span>
            </Label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {PRESET_AMOUNTS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => selectPreset(preset)}
                  className={cn(
                    "py-3 px-4 rounded-lg border-2 font-semibold text-sm transition-all",
                    amount === preset && !customAmount
                      ? "border-lifac-gold-500 bg-lifac-gold-50 text-lifac-gold-700"
                      : "border-gray-200 hover:border-gray-300 text-gray-700"
                  )}
                >
                  {new Intl.NumberFormat("fr-FR").format(preset)} FCFA
                </button>
              ))}
            </div>

            <div className="relative">
              <Input
                type="text"
                inputMode="numeric"
                placeholder="Autre montant"
                value={customAmount}
                onChange={(e) =>
                  handleCustomAmount(e.target.value.replace(/\D/g, ""))
                }
                className="pr-16"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500">
                FCFA
              </span>
            </div>
            {fieldErrors.amount && (
              <p className="text-sm text-red-600 mt-1">{fieldErrors.amount[0]}</p>
            )}
          </div>

          {/* Fréquence */}
          <div>
            <Label className="text-base font-semibold mb-3">Fréquence</Label>
            <div className="grid grid-cols-2 gap-2">
              {(["ONE_TIME", "MONTHLY"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFrequency(f)}
                  className={cn(
                    "py-3 px-4 rounded-lg border-2 font-medium text-sm transition-all",
                    frequency === f
                      ? "border-lifac-blue-900 bg-lifac-blue-50 text-lifac-blue-900"
                      : "border-gray-200 hover:border-gray-300 text-gray-700"
                  )}
                >
                  {f === "ONE_TIME" ? "Don ponctuel" : "Mensuel"}
                </button>
              ))}
            </div>
          </div>

          {/* Étape 2 : Identité donateur */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h3 className="font-semibold text-lifac-blue-900">Vos coordonnées</h3>

            <div>
              <Label htmlFor="donorName">
                Nom complet <span className="text-red-500">*</span>
              </Label>
              <Input
                id="donorName"
                type="text"
                placeholder="Jean Dupont"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                required
              />
              {fieldErrors.donorName && (
                <p className="text-sm text-red-600 mt-1">{fieldErrors.donorName[0]}</p>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="donorEmail">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="donorEmail"
                  type="email"
                  placeholder="vous@exemple.com"
                  value={donorEmail}
                  onChange={(e) => setDonorEmail(e.target.value)}
                  required
                />
                {fieldErrors.donorEmail && (
                  <p className="text-sm text-red-600 mt-1">{fieldErrors.donorEmail[0]}</p>
                )}
              </div>

              <div>
                <Label htmlFor="donorPhone">Téléphone (Bénin)</Label>
                <Input
                  id="donorPhone"
                  type="tel"
                  placeholder="+229 XX XX XX XX"
                  value={donorPhone}
                  onChange={(e) => setDonorPhone(e.target.value)}
                />
                {fieldErrors.donorPhone && (
                  <p className="text-sm text-red-600 mt-1">{fieldErrors.donorPhone[0]}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="message">Message (optionnel)</Label>
              <Textarea
                id="message"
                placeholder="Une dédicace, une intention de prière..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={500}
                rows={3}
              />
              <p className="text-xs text-gray-500 mt-1">{message.length}/500</p>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="h-5 w-5 rounded border-gray-300 text-lifac-blue-900 focus:ring-lifac-blue-900"
              />
              <span className="text-sm text-gray-700">
                Je souhaite que mon don soit anonyme publiquement
              </span>
            </label>
          </div>

          {/* Erreur globale */}
          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Récap + bouton */}
          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-700">Total à payer</span>
              <span className="font-display text-3xl font-bold text-lifac-blue-900">
                {new Intl.NumberFormat("fr-FR").format(amount)}{" "}
                <span className="text-lg">FCFA</span>
              </span>
            </div>

            <Button
              type="submit"
              variant="default"
              size="xl"
              className="w-full"
              disabled={isPending || amount < 500}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Préparation du paiement...
                </>
              ) : (
                <>
                  <Heart className="h-5 w-5" />
                  Donner maintenant
                </>
              )}
            </Button>

            <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-500">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>Paiement sécurisé via FedaPay (MTN, Moov, Carte)</span>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
