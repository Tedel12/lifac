"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Quote, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Testimony {
  id: string;
  authorName: string;
  authorRole: string | null;
  authorAvatar: string | null;
  content: string;
}

interface TestimoniesSectionProps {
  testimonies: Testimony[];
}

export function TestimoniesSection({ testimonies }: TestimoniesSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (testimonies.length === 0) return null;

  const current = testimonies[activeIndex];

  const goToPrevious = () =>
    setActiveIndex((i) => (i === 0 ? testimonies.length - 1 : i - 1));
  const goToNext = () =>
    setActiveIndex((i) => (i === testimonies.length - 1 ? 0 : i + 1));

  return (
    <section className="py-20 lg:py-24 bg-gradient-to-br from-lifac-blue-50 via-white to-lifac-gold-50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Colonne gauche : titre + CTA */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-lifac-gold-100">
              <Heart className="h-4 w-4 text-lifac-gold-600" />
              <span className="text-xs font-semibold text-lifac-gold-800 uppercase tracking-wider">
                Témoignages
              </span>
            </div>

            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-lifac-blue-900 leading-tight">
              Des vies transformées
            </h2>

            <p className="text-lg text-gray-700 leading-relaxed">
              Découvrez l'impact réel de nos programmes d'évangélisation et
              d'action humanitaire à travers les histoires de ceux qui ont été
              touchés.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link href="/volunteer">
                <Button variant="default" size="lg" className="w-full sm:w-auto">
                  Devenir bénévole
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/donate">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Soutenir la mission
                </Button>
              </Link>
            </div>
          </div>

          {/* Colonne droite : carte témoignage */}
          <div className="relative">
            <div className="relative bg-white rounded-3xl shadow-2xl p-8 lg:p-10 border border-gray-100">
              {/* Quote icône décorative */}
              <Quote className="absolute -top-6 -left-2 h-16 w-16 text-lifac-gold-300 opacity-50" />

              {/* En-tête : avatar + nom */}
              <div className="flex items-center gap-4 mb-6">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-lifac-blue-700 to-lifac-blue-900 flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-md">
                  {current.authorAvatar ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={current.authorAvatar}
                      alt={current.authorName}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    current.authorName.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-lifac-blue-900 text-lg">
                    {current.authorName}
                  </p>
                  {current.authorRole && (
                    <p className="text-sm text-gray-500">{current.authorRole}</p>
                  )}
                </div>
              </div>

              {/* Contenu */}
              <blockquote className="text-gray-700 text-base lg:text-lg leading-relaxed italic">
                « {current.content} »
              </blockquote>

              {/* Étoiles */}
              <div className="flex gap-1 mt-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg
                    key={i}
                    className="h-5 w-5 text-lifac-gold-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.539 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>

            {/* Contrôles navigation */}
            {testimonies.length > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="flex gap-2">
                  {testimonies.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveIndex(i)}
                      aria-label={`Témoignage ${i + 1}`}
                      className={`h-2 rounded-full transition-all ${
                        i === activeIndex
                          ? "w-8 bg-lifac-gold-500"
                          : "w-2 bg-gray-300 hover:bg-gray-400"
                      }`}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={goToPrevious}
                    aria-label="Témoignage précédent"
                    className="h-10 w-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-lifac-blue-900 hover:text-white hover:border-lifac-blue-900 transition-all shadow-sm"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={goToNext}
                    aria-label="Témoignage suivant"
                    className="h-10 w-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-lifac-blue-900 hover:text-white hover:border-lifac-blue-900 transition-all shadow-sm"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
