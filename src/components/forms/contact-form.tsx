"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { sendContactMessage } from "@/actions/community";

export function ContactForm() {
  const t = useTranslations("forms");
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    subject: "",
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
      const result = await sendContactMessage({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone || undefined,
        subject: formData.subject,
        message: formData.message,
      });

      if (!result.success) {
        setError(t(result.errorKey as any));
        if (result.fieldErrors) setFieldErrors(result.fieldErrors);
        return;
      }

      setSuccess(t(result.messageKey as any));
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="fullName">
            {t("fullName")} <span className="text-red-500">*</span>
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
          <Label htmlFor="email">
            {t("email")} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => update("email", e.target.value)}
            required
          />
          {fieldErrors.email && (
            <p className="text-sm text-red-600 mt-1">{fieldErrors.email[0]}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="phone">{t("phone")}</Label>
        <Input
          id="phone"
          type="tel"
          placeholder={t("phonePlaceholder")}
          value={formData.phone}
          onChange={(e) => update("phone", e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="subject">
          {t("subject")} <span className="text-red-500">*</span>
        </Label>
        <Input
          id="subject"
          value={formData.subject}
          onChange={(e) => update("subject", e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="message">
          {t("message")} <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="message"
          value={formData.message}
          onChange={(e) => update("message", e.target.value)}
          rows={6}
          maxLength={2000}
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          {t("charLimit", { count: formData.message.length })}
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          <p className="text-sm text-emerald-700">{success}</p>
        </div>
      )}

      <Button
        type="submit"
        variant="default"
        size="lg"
        className="w-full sm:w-auto"
        disabled={isPending}
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("sending")}
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            {t("submit")}
          </>
        )}
      </Button>
    </form>
  );
}
