"use client";

import { useLocale } from "next-intl";
import { useTransition } from "react";
import { Globe } from "lucide-react";
import { setLocale } from "@/actions/locale";
import { cn } from "@/lib/utils";
import type { Locale } from "@/i18n/config";

interface LanguageSwitcherProps {
  className?: string;
  variant?: "light" | "dark";
}

export function LanguageSwitcher({ className, variant = "light" }: LanguageSwitcherProps) {
  const locale = useLocale() as Locale;
  const [pending, startTransition] = useTransition();

  const change = (next: Locale) => {
    if (next === locale || pending) return;
    startTransition(() => {
      setLocale(next);
    });
  };

  const isDark = variant === "dark";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 text-xs font-semibold",
        isDark ? "text-lifac-navy-900" : "text-white/80",
        className
      )}
    >
      <Globe className={cn("h-3.5 w-3.5", isDark ? "text-lifac-navy-700" : "text-white/60")} />
      <button
        type="button"
        onClick={() => change("fr")}
        disabled={pending}
        className={cn(
          "px-1.5 py-0.5 rounded transition-colors",
          locale === "fr"
            ? "text-lifac-red-500"
            : isDark
            ? "text-lifac-navy-500 hover:text-lifac-navy-900"
            : "text-white/60 hover:text-white"
        )}
        aria-pressed={locale === "fr"}
      >
        FR
      </button>
      <span className={cn(isDark ? "text-lifac-navy-300" : "text-white/30")}>|</span>
      <button
        type="button"
        onClick={() => change("en")}
        disabled={pending}
        className={cn(
          "px-1.5 py-0.5 rounded transition-colors",
          locale === "en"
            ? "text-lifac-red-500"
            : isDark
            ? "text-lifac-navy-500 hover:text-lifac-navy-900"
            : "text-white/60 hover:text-white"
        )}
        aria-pressed={locale === "en"}
      >
        EN
      </button>
    </div>
  );
}
