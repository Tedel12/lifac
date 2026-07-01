"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Loader2, CheckCircle2, AlertCircle, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { registerForEvent } from "@/actions/community";

interface EventRegistrationFormProps {
  eventId: string;
}

export function EventRegistrationForm({ eventId }: EventRegistrationFormProps) {
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    city: "",
    message: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Record<string, string[] | undefined>
  >({});
  const [success, setSuccess] = useState<string | null>(null);

  function update<K extends keyof typeof formData>(key: K, value: string) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setFieldErrors({});

    startTransition(async () => {
      const result = await registerForEvent({
        eventId,
        fullName: formData.fullName,
        email: formData.email || undefined,
        phone: formData.phone,
        city: formData.city || undefined,
        message: formData.message || undefined,
      });

      if (!result.success) {
        setError(result.error);
        if (result.fieldErrors) setFieldErrors(result.fieldErrors);
        return;
      }

      setSuccess(result.message || "Inscription confirmée !");
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        city: "",
        message: "",
      });
    });
  }

  if (success) {
    return (
      <div className="text-center py-4 space-y-3">
        <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
        <p className="font-semibold text-emerald-700">{success}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSuccess(null)}
        >
          Inscrire une autre personne
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="fullName">
          Nom complet <span className="text-red-500">*</span>
        </Label>
        <Input
          id="fullName"
          value={formData.fullName}
          onChange={(e) => update("fullName", e.target.value)}
          required
        />
        {fieldErrors.fullName && (
          <p className="text-sm text-red-600 mt-1">{fieldErrors.fullName[0]}</p>
        )}
      </div>

      <div>
        <Label htmlFor="phone">
          Téléphone <span className="text-red-500">*</span>
        </Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+229 XX XX XX XX"
          value={formData.phone}
          onChange={(e) => update("phone", e.target.value)}
          required
        />
        {fieldErrors.phone && (
          <p className="text-sm text-red-600 mt-1">{fieldErrors.phone[0]}</p>
        )}
      </div>

      <div>
        <Label htmlFor="email">Email (optionnel)</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => update("email", e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="city">Ville</Label>
        <Input
          id="city"
          value={formData.city}
          onChange={(e) => update("city", e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="message">Message (optionnel)</Label>
        <Textarea
          id="message"
          rows={3}
          value={formData.message}
          onChange={(e) => update("message", e.target.value)}
          maxLength={500}
        />
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <Button
        type="submit"
        variant="default"
        size="default"
        className="w-full"
        disabled={isPending}
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Inscription...
          </>
        ) : (
          <>
            <UserPlus className="h-4 w-4" />
            Confirmer mon inscription
          </>
        )}
      </Button>
    </form>
  );
}
