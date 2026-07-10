"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Flame, MapPin, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { EventRegistrationModal } from "@/components/ui/event-registration-modal";
import { RegistrationForm } from "@/components/forms/registration-form";

// Type des événements passés en props depuis src/app/page.tsx (résultat de prisma.event.findMany)
export interface HeroEvent {
  id: string;
  title: string;
  type: string;
  location: string;
  city: string | null;
  startDate: Date;
  endDate: Date | null;
}

interface HeroProps {
  events: HeroEvent[];
}

// Types d'événement considérés comme "FIRECAMP" côté formulaire.
// À ajuster si la vraie valeur d'EventType diffère (ex: si tu ajoutes un enum dédié FIRECAMP).
const FIRECAMP_EVENT_TYPES = new Set(["YOUTH_CAMP", "TRAINING"]);

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

export function Hero({ events }: HeroProps) {
  const t = useTranslations("hero");
  const tc = useTranslations("common");
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const hasEvents = events.length > 0;
  const currentEvent = hasEvents ? events[currentEventIndex] : null;

  // Auto-scroll
  useEffect(() => {
    if (isModalOpen || !hasEvents) return; // PAUSE WHEN MODAL IS OPEN OR NO EVENTS
    const timer = setInterval(() => {
      setCurrentEventIndex((prev) => (prev + 1) % events.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [events.length, isModalOpen, hasEvents]);

  const nextEvent = () => setCurrentEventIndex((prev) => (prev + 1) % events.length);
  const prevEvent = () => setCurrentEventIndex((prev) => (prev - 1 + events.length) % events.length);

  const targetDate = currentEvent?.startDate ?? null;
  const [timeLeft, setTimeLeft] = useState(() => computeTimeLeft(targetDate));

  useEffect(() => {
    setTimeLeft(computeTimeLeft(targetDate));
    if (!targetDate) return;
    const id = setInterval(() => setTimeLeft(computeTimeLeft(targetDate)), 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  const formattedDate = useMemo(() => {
    if (!currentEvent) return "";
    return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "long", year: "numeric" }).format(
      currentEvent.startDate
    );
  }, [currentEvent]);

  const formattedTime = useMemo(() => {
    if (!currentEvent) return "";
    return new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(currentEvent.startDate);
  }, [currentEvent]);

  const isFireCamp = currentEvent ? FIRECAMP_EVENT_TYPES.has(currentEvent.type) : false;

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

          {hasEvents && currentEvent && (
            <div className="relative animate-fade-in">
              <div className="relative bg-gradient-to-br from-[#1a0a0f]/95 to-[#0a0506]/95 backdrop-blur rounded-2xl border border-lifac-red-600/50 shadow-2xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2 text-lifac-red-500 text-[10px] tracking-[0.2em] uppercase font-bold">
                    <Flame className="h-3.5 w-3.5" /> {t("upcomingLabel")}
                  </div>
                  {events.length > 1 && (
                    <div className="flex gap-1">
                      <button onClick={prevEvent} className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white"><ChevronLeft className="h-4 w-4" /></button>
                      <button onClick={nextEvent} className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white"><ChevronRight className="h-4 w-4" /></button>
                    </div>
                  )}
                </div>

                <div key={currentEvent.id} className="animate-fade-in">
                  <h3 className="font-display text-2xl font-extrabold text-white mb-2">{currentEvent.title}</h3>
                  <div className="flex items-center gap-2 text-white/85 text-xs mb-1">
                    <MapPin className="h-3 w-3 text-lifac-red-500" /> {currentEvent.location}
                    {currentEvent.city ? `, ${currentEvent.city}` : ""}
                  </div>
                  <div className="flex items-center gap-2 text-white/85 text-xs mb-4">
                    <Calendar className="h-3 w-3 text-lifac-red-500" /> {formattedDate} ({formattedTime})
                  </div>

                  {timeLeft && (
                    <div className="grid grid-cols-4 gap-2 mb-4">
                      <CountBox value={timeLeft.d} label="D" />
                      <CountBox value={timeLeft.h} label="H" />
                      <CountBox value={timeLeft.m} label="M" />
                      <CountBox value={timeLeft.s} label="S" />
                    </div>
                  )}
                </div>

                <Button className="w-full uppercase" onClick={() => setIsModalOpen(true)}>{t("registerNow")}</Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {currentEvent && (
        <EventRegistrationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Inscription : ${currentEvent.title}`}
        >
          <RegistrationForm eventId={currentEvent.id} isFireCamp={isFireCamp} />
        </EventRegistrationModal>
      )}
    </section>
  );
}

function CountBox({ value, label }: { value: number; label: string }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="bg-white/5 rounded-lg py-2 text-center">
      <div className="font-display text-lg font-extrabold text-white">
        {mounted ? value.toString().padStart(2, "0") : "00"}
      </div>
      <div className="text-[8px] text-white/50">{label}</div>
    </div>
  );
}
