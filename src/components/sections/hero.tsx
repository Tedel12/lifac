"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ArrowRight, Flame, MapPin, Calendar } from "lucide-react";

interface HeroProps {
  upcomingDate?: string;
  upcomingMeta?: { date: string; time: string };
}

function useCountdown(target: Date) {
  const [diff, setDiff] = useState<{ d: number; h: number; m: number; s: number }>(
    () => computeDiff(target)
  );

  useEffect(() => {
    const id = setInterval(() => setDiff(computeDiff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  return diff;
}

function computeDiff(target: Date) {
  const ms = Math.max(0, target.getTime() - Date.now());
  const d = Math.floor(ms / 86_400_000);
  const h = Math.floor((ms % 86_400_000) / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  return { d, h, m, s };
}

// Image de crowd worship par défaut (Unsplash). Remplaçable par /hero.jpg si fourni.
const HERO_IMAGE =
  "https://images.unsplash.com/photo-1519834785169-98be25ec3f84?auto=format&fit=crop&w=2000&q=80";

export function Hero({ upcomingDate, upcomingMeta }: HeroProps = {}) {
  const t = useTranslations("hero");
  const tc = useTranslations("common");

  const target = new Date(upcomingDate ?? Date.now() + 12 * 86_400_000 + 8 * 3_600_000);
  const { d, h, m, s } = useCountdown(target);

  return (
    <section className="relative overflow-hidden pt-24 pb-12 lg:pt-28 lg:pb-16 min-h-[640px] bg-black">
      {/* Image de fond : foule en adoration */}
      <div className="absolute inset-0 z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={HERO_IMAGE}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Overlay rouge sombre + dégradé bas */}
        <div className="absolute inset-0 bg-black/60" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 70% 40%, rgba(220,38,38,0.45), transparent 55%), linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.85) 100%)",
          }}
        />
        {/* Croix lumineuse subtile */}
        <div className="absolute inset-0 flex items-center justify-end pr-[14%] hidden md:flex">
          <div className="relative w-44 h-56 opacity-70">
            <div className="absolute left-1/2 top-0 -translate-x-1/2 w-3 h-full bg-gradient-to-b from-white via-red-200 to-red-500 blur-[2px] shadow-[0_0_60px_rgba(252,165,165,0.7)]" />
            <div className="absolute top-12 left-0 right-0 h-3 bg-gradient-to-r from-red-500 via-red-200 to-red-500 blur-[2px] shadow-[0_0_60px_rgba(252,165,165,0.7)]" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-6 relative z-10">
        <div className="grid lg:grid-cols-[1fr_400px] gap-8 lg:gap-12 items-center">
          {/* Colonne texte */}
          <div className="space-y-7 animate-slide-up text-white max-w-2xl">
            <h1 className="font-display font-extrabold leading-[0.95] tracking-tight drop-shadow-2xl">
              <span className="block text-4xl md:text-5xl lg:text-[60px]">
                {t("titleLine1")}
              </span>
              <span className="block text-4xl md:text-5xl lg:text-[60px]">
                {t("titleLine2")}{" "}
                <span className="text-lifac-red-500">{t("titleHighlight")}</span>{" "}
                {t("titleLine3")}
              </span>
              <span className="block text-5xl md:text-6xl lg:text-[96px] text-lifac-red-500 mt-1 drop-shadow-[0_0_40px_rgba(220,38,38,0.5)]">
                {t("titleLine4")}
              </span>
            </h1>

            <p className="text-base md:text-lg text-white/85 leading-relaxed max-w-lg drop-shadow">
              {t("subtitle")}
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/register">
                <Button variant="default" size="lg" className="uppercase tracking-wider">
                  {tc("joinMovement")}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/activities">
                <Button variant="outline" size="lg" className="uppercase tracking-wider">
                  {tc("discoverActivities")}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Card événement à venir */}
          <div className="relative animate-fade-in">
            <div className="relative bg-gradient-to-br from-[#1a0a0f]/95 to-[#0a0506]/95 backdrop-blur rounded-2xl border border-lifac-red-600/50 shadow-2xl shadow-lifac-red-900/40 p-6 lg:p-7">
              <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-lifac-red-600/50 to-transparent -z-10 blur-md" />

              <div className="flex items-center gap-2 text-lifac-red-500 text-[10px] tracking-[0.2em] uppercase font-bold mb-3">
                <Flame className="h-3.5 w-3.5 animate-flame" />
                {t("upcomingLabel")}
              </div>

              <h3 className="font-display text-3xl lg:text-4xl font-extrabold text-white leading-tight mb-3">
                {t("upcomingTitle")}
              </h3>

              <div className="flex items-center gap-2 text-white/85 text-sm mb-5">
                <MapPin className="h-4 w-4 text-lifac-red-500" />
                {t("upcomingLocation")}
              </div>

              <div className="grid grid-cols-4 gap-2 mb-5">
                <CountBox value={d} label={t("countdownDays")} />
                <CountBox value={h} label={t("countdownHours")} />
                <CountBox value={m} label={t("countdownMinutes")} />
                <CountBox value={s} label={t("countdownSeconds")} />
              </div>

              <div className="flex items-center gap-3 text-xs text-white/70 pb-4 border-b border-white/10 mb-4 flex-wrap">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-lifac-red-500" />
                  {upcomingMeta?.date ?? "09 Mai 2025"}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-lifac-red-500" />
                  {upcomingMeta?.time ?? "18h00"}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-lifac-red-500" />
                  Campus UAC
                </span>
              </div>

              <Link href="/events" className="block">
                <Button variant="default" size="default" className="w-full uppercase tracking-wider">
                  {tc("registerNow")}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CountBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="bg-white/5 rounded-lg border border-white/10 py-3 text-center">
      <div className="font-display text-2xl lg:text-3xl font-extrabold text-white tabular-nums">
        {value.toString().padStart(2, "0")}
      </div>
      <div className="text-[9px] tracking-[0.15em] text-white/55 mt-1 font-semibold">
        {label}
      </div>
    </div>
  );
}
