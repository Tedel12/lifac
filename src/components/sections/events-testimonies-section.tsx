"use client";

import Link from "next/link";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { MapPin, ChevronLeft, ChevronRight, ArrowRight, Quote } from "lucide-react";

interface Testimony {
  id: string;
  authorName: string;
  authorRole: string | null;
  authorAvatar: string | null;
  content: string;
}

interface UpcomingEvent {
  date: string;
  title: string;
  location: string;
  time: string;
}

interface Props {
  testimonies: Testimony[];
}

const EVENT_IMAGES = [
  "https://images.unsplash.com/photo-1519834785169-98be25ec3f84?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=600&q=80",
];

export function EventsTestimoniesSection({ testimonies }: Props) {
  const te = useTranslations("events");
  const tt = useTranslations("testimonies");
  const upcoming = te.raw("upcoming") as UpcomingEvent[];

  const fallback: Testimony[] = [
    {
      id: "demo-1",
      authorName: "Marie K.",
      authorRole: null,
      authorAvatar: null,
      content: tt("quote"),
    },
  ];
  const list = testimonies.length > 0 ? testimonies : fallback;
  const [idx, setIdx] = useState(0);
  const current = list[idx];

  return (
    <section id="testimonies" className="bg-white py-16 lg:py-20">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="grid lg:grid-cols-[1.6fr_1fr] gap-6 lg:gap-8 items-start">
          <div>
            <div className="flex items-end justify-between mb-6">
              <h2 className="text-[11px] font-bold tracking-[0.25em] text-lifac-red-500 uppercase">
                {te("kicker")}
              </h2>
              <Link
                href="/events"
                className="text-[11px] font-bold tracking-[0.2em] text-lifac-red-600 hover:text-lifac-red-700 inline-flex items-center gap-1 uppercase"
              >
                {te("viewAll")}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcoming.slice(0, 3).map((evt, i) => (
                <EventCard key={evt.title} event={evt} image={EVENT_IMAGES[i % EVENT_IMAGES.length]} />
              ))}
            </div>
          </div>

          {/* Carrousel témoignages */}
          <div>
            <h2 className="text-[11px] font-bold tracking-[0.25em] text-lifac-red-500 uppercase mb-6">
              {tt("kicker")}
            </h2>

            <div className="relative bg-[#F4F5F7] rounded-2xl p-6 lg:p-7">
              <div className="flex gap-4 items-start">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-lifac-navy-700 to-lifac-navy-900 flex items-center justify-center text-white font-bold text-lg shrink-0 ring-2 ring-white shadow-md overflow-hidden">
                  {current.authorAvatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={current.authorAvatar}
                      alt={current.authorName}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    current.authorName.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-lifac-navy-900 mb-2">
                    {current.authorName}
                  </p>
                  <p className="text-sm text-lifac-navy-700 leading-relaxed italic">
                    « {current.content} »
                  </p>
                </div>
                <Quote className="h-8 w-8 text-lifac-red-500/30 shrink-0" />
              </div>

              {list.length > 1 && (
                <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-200">
                  <div className="flex gap-1.5">
                    {list.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setIdx(i)}
                        aria-label={`Témoignage ${i + 1}`}
                        className={`h-1.5 rounded-full transition-all ${
                          i === idx
                            ? "w-6 bg-lifac-red-600"
                            : "w-1.5 bg-gray-300 hover:bg-gray-400"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setIdx((i) => (i === 0 ? list.length - 1 : i - 1))}
                      className="h-8 w-8 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-lifac-red-600 hover:text-white hover:border-lifac-red-600 transition-all"
                      aria-label="Précédent"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setIdx((i) => (i === list.length - 1 ? 0 : i + 1))}
                      className="h-8 w-8 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-lifac-red-600 hover:text-white hover:border-lifac-red-600 transition-all"
                      aria-label="Suivant"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function EventCard({ event, image }: { event: UpcomingEvent; image: string }) {
  const [day, month] = event.date.split(" ");
  return (
    <Link
      href="/events"
      className="group relative rounded-2xl overflow-hidden bg-black border border-gray-200 hover:border-lifac-red-600/50 transition-all hover:-translate-y-1 shadow-sm hover:shadow-xl block"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

        {/* Date badge */}
        <div className="absolute top-3 left-3 bg-white rounded-lg px-3 py-2 text-center shadow-md min-w-[52px]">
          <div className="text-xl font-extrabold text-lifac-navy-900 leading-none">
            {day}
          </div>
          <div className="text-[9px] tracking-widest text-lifac-red-600 font-bold mt-0.5">
            {month}
          </div>
        </div>
      </div>

      <div className="p-4 bg-black">
        <h3 className="font-display text-sm font-extrabold text-white tracking-wider uppercase mb-2 line-clamp-1 group-hover:text-lifac-red-500 transition-colors">
          {event.title}
        </h3>
        <div className="flex items-center gap-1.5 text-xs text-white/70">
          <MapPin className="h-3 w-3 text-lifac-red-500 shrink-0" />
          <span className="truncate">{event.location}</span>
          <span className="text-white/40">·</span>
          <span>{event.time}</span>
        </div>
      </div>
    </Link>
  );
}
