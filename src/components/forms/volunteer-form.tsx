"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Loader2, CheckCircle2, AlertCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { applyAsVolunteer } from "@/actions/community";
import { cn } from "@/lib/utils";

const SKILLS_OPTIONS = [
  { value: "musique", label: "Musique / Louange" },
  { value: "communication", label: "Communication / Médias" },
  { value: "logistique", label: "Logistique / Organisation" },
  { value: "accueil", label: "Accueil / Hospitalité" },
  { value: "priere", label: "Intercession / Prière" },
  { value: "enseignement", label: "Enseignement / Formation" },
  { value: "traduction", label: "Traduction" },
  { value: "informatique", label: "Informatique / Web" },
  { value: "comptabilite", label: "Comptabilité / Administration" },
  { value: "sante", label: "Santé / Médical" },
  { value: "construction", label: "Construction / BTP" },
  { value: "autre", label: "Autre" },
];

export function VolunteerForm() {
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    city: "",
    availability: "",
    motivation: "",
  });
  const [skills, setSkills] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Record<string, string[] | undefined>
  >({});
  const [success, setSuccess] = useState<string | null>(null);

  function update<K extends keyof typeof formData>(key: K, value: string) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  function toggleSkill(skill: string) {
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setFieldErrors({});

    startTransition(async () => {
      const result = await applyAsVolunteer({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        city: formData.city || undefined,
        skills,
        availability: formData.availability || undefined,
        motivation: formData.motivation,
      });

      if (!result.success) {
        setError(result.error);
        if (result.fieldErrors) setFieldErrors(result.fieldErrors);
        return;
      }

      setSuccess(result.message || "Candidature reçue !");
    });
  }

  if (success) {
    return (
      <div className="text-center py-8 space-y-3 animate-fade-in">
        <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto" />
        <h3 className="font-display text-xl font-bold text-lifac-navy-900">
          Merci pour votre engagement !
        </h3>
        <p className="text-gray-600">{success}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="fullName">
            Nom complet <span className="text-lifac-red-600">*</span>
          </Label>
          <Input
            id="fullName"
            value={formData.fullName}
            onChange={(e) => update("fullName", e.target.value)}
            required
            className="focus-visible:ring-lifac-red-600"
          />
          {fieldErrors.fullName && (
            <p className="text-sm text-red-600 mt-1">{fieldErrors.fullName[0]}</p>
          )}
        </div>
        <div>
          <Label htmlFor="city">Ville</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => update("city", e.target.value)}
            className="focus-visible:ring-lifac-red-600"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email">
            Email <span className="text-lifac-red-600">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => update("email", e.target.value)}
            required
            className="focus-visible:ring-lifac-red-600"
          />
          {fieldErrors.email && (
            <p className="text-sm text-red-600 mt-1">{fieldErrors.email[0]}</p>
          )}
        </div>
        <div>
          <Label htmlFor="phone">
            Téléphone <span className="text-lifac-red-600">*</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+229 XX XX XX XX"
            value={formData.phone}
            onChange={(e) => update("phone", e.target.value)}
            required
            className="focus-visible:ring-lifac-red-600"
          />
          {fieldErrors.phone && (
            <p className="text-sm text-red-600 mt-1">{fieldErrors.phone[0]}</p>
          )}
        </div>
      </div>

      <div>
        <Label>
          Domaines de compétence <span className="text-lifac-red-600">*</span>
        </Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {SKILLS_OPTIONS.map((skill) => (
            <button
              type="button"
              key={skill.value}
              onClick={() => toggleSkill(skill.value)}
              className={cn(
                "px-3 py-2.5 rounded-lg border-2 text-sm font-medium transition-all duration-200 text-left",
                skills.includes(skill.value)
                  ? "border-lifac-red-600 bg-lifac-red-50 text-lifac-red-700 shadow-sm"
                  : "border-gray-200 text-gray-700 hover:border-lifac-red-600/40 hover:bg-gray-50"
              )}
            >
              {skill.label}
            </button>
          ))}
        </div>
        {fieldErrors.skills && (
          <p className="text-sm text-red-600 mt-1">{fieldErrors.skills[0]}</p>
        )}
      </div>

      <div>
        <Label htmlFor="availability">Vos disponibilités</Label>
        <Textarea
          id="availability"
          rows={2}
          placeholder="Ex : Soirs de semaine, weekends, vacances scolaires..."
          value={formData.availability}
          onChange={(e) => update("availability", e.target.value)}
          className="focus-visible:ring-lifac-red-600"
        />
      </div>

      <div>
        <Label htmlFor="motivation">
          Pourquoi voulez-vous rejoindre LiFAC ?{" "}
          <span className="text-lifac-red-600">*</span>
        </Label>
        <Textarea
          id="motivation"
          rows={5}
          placeholder="Partagez ce qui vous motive à servir avec nous..."
          value={formData.motivation}
          onChange={(e) => update("motivation", e.target.value)}
          maxLength={1000}
          required
          className="focus-visible:ring-lifac-red-600"
        />
        <p className="text-xs text-gray-500 mt-1">
          {formData.motivation.length}/1000
        </p>
        {fieldErrors.motivation && (
          <p className="text-sm text-red-600 mt-1">{fieldErrors.motivation[0]}</p>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl animate-fade-in">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <Button
        type="submit"
        variant="default"
        size="lg"
        className="w-full"
        disabled={isPending}
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Envoi en cours...
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Soumettre ma candidature
          </>
        )}
      </Button>
    </form>
  );
}
