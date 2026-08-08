"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Loader2, CheckCircle2, AlertCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { submitTestimony } from "@/actions/testimony-actions";

export function TestimonyForm() {
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({ authorName: "", authorRole: "", content: "" });
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[] | undefined>>({});
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
      const result = await submitTestimony({
        authorName: formData.authorName,
        authorRole: formData.authorRole || undefined,
        content: formData.content,
      });

      if (!result.success) {
        setError(result.error);
        if (result.fieldErrors) setFieldErrors(result.fieldErrors);
        return;
      }

      setSuccess(result.message);
      setFormData({ authorName: "", authorRole: "", content: "" });
    });
  }

  if (success) {
    return (
      <div className="text-center py-8 space-y-3 animate-fade-in">
        <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto" />
        <h3 className="font-display text-xl font-bold text-lifac-navy-900">Merci pour votre témoignage !</h3>
        <p className="text-gray-600">{success}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="authorName">
            Votre nom <span className="text-lifac-red-600">*</span>
          </Label>
          <Input
            id="authorName"
            value={formData.authorName}
            onChange={(e) => update("authorName", e.target.value)}
            required
            className="focus-visible:ring-lifac-red-600"
          />
          {fieldErrors.authorName && <p className="text-sm text-red-600 mt-1">{fieldErrors.authorName[0]}</p>}
        </div>
        <div>
          <Label htmlFor="authorRole">Rôle / ville (optionnel)</Label>
          <Input
            id="authorRole"
            placeholder="Ex : Étudiante, Cotonou"
            value={formData.authorRole}
            onChange={(e) => update("authorRole", e.target.value)}
            className="focus-visible:ring-lifac-red-600"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="content">
          Votre témoignage <span className="text-lifac-red-600">*</span>
        </Label>
        <Textarea
          id="content"
          rows={6}
          placeholder="Partagez ce que Dieu a fait dans votre vie à travers LiFAC..."
          value={formData.content}
          onChange={(e) => update("content", e.target.value)}
          maxLength={1500}
          required
          className="focus-visible:ring-lifac-red-600"
        />
        <p className="text-xs text-gray-500 mt-1">{formData.content.length}/1500</p>
        {fieldErrors.content && <p className="text-sm text-red-600 mt-1">{fieldErrors.content[0]}</p>}
      </div>

      <p className="text-xs text-gray-500 bg-[#F4F5F7] rounded-lg p-3">
        Votre témoignage sera relu par notre équipe avant d'être publié sur le site.
      </p>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl animate-fade-in">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <Button type="submit" variant="default" size="lg" className="w-full" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Envoi en cours...
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Partager mon témoignage
          </>
        )}
      </Button>
    </form>
  );
}
