"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Flame, MapPin, Calendar, ChevronLeft, ChevronRight } from "lucide-react";

// Helper pour extraire une date de début depuis la chaîne de traduction
function parseEventDate(dateStr: string): Date | null {
  // Tente de parser "May 09, 2027" ou "09 Mai 2027" ou des formats similaires
  const date = new Date(dateStr);
  if (!isNaN(date.getTime())) return date;
  
  // Cas simple : extraire le premier groupe de date trouvé
  const match = dateStr.match(/\d{2} \w{3,9},? \d{4}/);
  if (match) return new Date(match[0]);
  
  return null;
}

function computeTimeLeft(target: Date | null) {
  if (!target) return null;
  const ms = Math.max(0, target.getTime() - Date.now());
  if (ms === 0) return null;
  return {
    d: Math.floor(ms / 86_400_000),
    h: Math.floor((ms % 86_400_000) / 3_600_000),
    m: Math.floor((ms % 3_600_000) / 60_000),
    s: Math.floor((ms % 60_000) / 1000),
  };
}

const HERO_IMAGE = "https://images.unsplash.com/photo-1519834785169-98be25ec3f84?auto=format&fit=crop&w=2000&q=80";

export function Hero() {
  const t = useTranslations("hero");
  const tc = useTranslations("common");
  const events = t.raw("events") as any[];
  const [currentEventIndex, setCurrentEventIndex] = useState(0);

  // Auto-scroll
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentEventIndex((prev) => (prev + 1) % events.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [events.length]);

  const nextEvent = () => setCurrentEventIndex((prev) => (prev + 1) % events.length);
  const prevEvent = () => setCurrentEventIndex((prev) => (prev - 1 + events.length) % events.length);

  const currentEvent = events[currentEventIndex];
  const targetDate = useMemo(() => parseEventDate(currentEvent.date), [currentEvent.date]);
  const [timeLeft, setTimeLeft] = useState(() => computeTimeLeft(targetDate));

  useEffect(() => {
    setTimeLeft(computeTimeLeft(targetDate));
    const id = setInterval(() => setTimeLeft(computeTimeLeft(targetDate)), 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return (
    <section className="relative overflow-hidden pt-24 pb-12 lg:pt-28 lg:pb-16 min-h-[640px] bg-black">
      <div className="absolute inset-0 z-0">
        <img src={HERO_IMAGE} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 70% 40%, rgba(220,38,38,0.45), transparent 55%), linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.85) 100%)" }} />
      </div>

      <div className="container mx-auto px-4 lg:px-6 relative z-10">
        <div className="grid lg:grid-cols-[1fr_400px] gap-8 lg:gap-12 items-center">
          <div className="space-y-7 animate-slide-up text-white max-w-2xl">
            <h1 className="font-display font-extrabold leading-[0.95] tracking-tight drop-shadow-2xl">
              <span className="block text-4xl md:text-5xl lg:text-[60px]">{t("titleLine1")}</span>
              <span className="block text-4xl md:text-5xl lg:text-[60px]">
                {t("titleLine2")} <span className="text-lifac-red-500">{t("titleHighlight")}</span> {t("titleLine3")} <br /> {t("titleLine4")}
              </span>
            </h1>
            <p className="text-base md:text-lg text-white/85 leading-relaxed max-w-lg drop-shadow">{t("subtitle")}</p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/register"><Button variant="default" size="lg" className="uppercase tracking-wider">{tc("joinMovement")}</Button></Link>
              <Link href="/activities"><Button variant="outline" size="lg" className="uppercase tracking-wider">{tc("discoverActivities")}</Button></Link>
            </div>
          </div>

          <div className="relative animate-fade-in">
            <div className="relative bg-gradient-to-br from-[#1a0a0f]/95 to-[#0a0506]/95 backdrop-blur rounded-2xl border border-lifac-red-600/50 shadow-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2 text-lifac-red-500 text-[10px] tracking-[0.2em] uppercase font-bold">
                  <Flame className="h-3.5 w-3.5" /> {t("upcomingLabel")}
                </div>
                <div className="flex gap-1">
                  <button onClick={prevEvent} className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white"><ChevronLeft className="h-4 w-4" /></button>
                  <button onClick={nextEvent} className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white"><ChevronRight className="h-4 w-4" /></button>
                </div>
              </div>

              <div key={currentEventIndex} className="animate-fade-in">
                <h3 className="font-display text-2xl font-extrabold text-white mb-2">{currentEvent.title}</h3>
                <div className="flex items-center gap-2 text-white/85 text-xs mb-1"><MapPin className="h-3 w-3 text-lifac-red-500" /> {currentEvent.location}</div>
                <div className="flex items-center gap-2 text-white/85 text-xs mb-4"><Calendar className="h-3 w-3 text-lifac-red-500" /> {currentEvent.date} ({currentEvent.time})</div>

                {timeLeft && (
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    <CountBox value={timeLeft.d} label="D" />
                    <CountBox value={timeLeft.h} label="H" />
                    <CountBox value={timeLeft.m} label="M" />
                    <CountBox value={timeLeft.s} label="S" />
                  </div>
                )}
              </div>

              <Link href="/register" className="block"><Button className="w-full uppercase">{t("registerNow")}</Button></Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CountBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="bg-white/5 rounded-lg py-2 text-center">
      <div className="font-display text-lg font-extrabold text-white">{value.toString().padStart(2, "0")}</div>
      <div className="text-[8px] text-white/50">{label}</div>
    </div>
  );
}
