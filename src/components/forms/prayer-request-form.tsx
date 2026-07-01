"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Loader2, CheckCircle2, AlertCircle, HandHeart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { submitPrayerRequest } from "@/actions/community";

export function PrayerRequestForm() {
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    authorName: "",
    authorEmail: "",
    title: "",
    content: "",
  });
  const [isPublic, setIsPublic] = useState(false);
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
      const result = await submitPrayerRequest({
        authorName: formData.authorName,
        authorEmail: formData.authorEmail || undefined,
        title: formData.title,
        content: formData.content,
        isPublic,
      });

      if (!result.success) {
        setError(result.error);
        if (result.fieldErrors) setFieldErrors(result.fieldErrors);
        return;
      }

      setSuccess(result.message || "Demande reçue.");
      setFormData({ authorName: "", authorEmail: "", title: "", content: "" });
      setIsPublic(false);
    });
  }

  if (success) {
    return (
      <div className="text-center py-6 space-y-3">
        <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto" />
        <h3 className="font-display text-xl font-bold text-lifac-blue-900">
          Nous prions pour vous
        </h3>
        <p className="text-gray-600">{success}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSuccess(null)}
        >
          Soumettre une nouvelle demande
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="authorName">
            Votre prénom <span className="text-red-500">*</span>
          </Label>
          <Input
            id="authorName"
            value={formData.authorName}
            onChange={(e) => update("authorName", e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="authorEmail">Email (optionnel)</Label>
          <Input
            id="authorEmail"
            type="email"
            value={formData.authorEmail}
            onChange={(e) => update("authorEmail", e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="title">
          Sujet de prière <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          placeholder="Ex : Guérison, famille, travail..."
          value={formData.title}
          onChange={(e) => update("title", e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="content">
          Votre demande <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="content"
          rows={6}
          placeholder="Partagez ce que vous portez sur le cœur..."
          value={formData.content}
          onChange={(e) => update("content", e.target.value)}
          maxLength={1000}
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          {formData.content.length}/1000
        </p>
      </div>

      <label className="flex items-start gap-3 cursor-pointer p-4 bg-lifac-blue-50 rounded-lg">
        <input
          type="checkbox"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
          className="h-5 w-5 mt-0.5 rounded border-gray-300 text-lifac-blue-900 focus:ring-lifac-blue-900"
        />
        <span className="text-sm text-gray-700">
          Je souhaite que ma demande soit visible publiquement (sans mon
          identité) pour que la communauté prie aussi avec moi.
        </span>
      </label>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
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
            <HandHeart className="h-4 w-4" />
            Envoyer ma demande
          </>
        )}
      </Button>
    </form>
  );
}
