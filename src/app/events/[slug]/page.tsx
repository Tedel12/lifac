import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { EventRegistrationForm } from "@/components/forms/event-registration-form";
import { formatDateTime, formatDate } from "@/lib/utils";
import { Calendar, MapPin, Users, ArrowLeft, Clock } from "lucide-react";

export const revalidate = 300;
export const dynamic = "force-dynamic";

interface EventPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: EventPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await prisma.event.findUnique({
    where: { slug },
    select: { title: true, shortDescription: true },
  });
  if (!event) return { title: "Événement introuvable" };
  return {
    title: event.title,
    description: event.shortDescription,
  };
}

export default async function EventDetailPage({ params }: EventPageProps) {
  const { slug } = await params;
  const event = await prisma.event.findUnique({
    where: { slug },
    include: {
      organizer: { select: { name: true, avatarUrl: true } },
      partnerChurch: { select: { name: true, city: true } },
    },
  });

  if (!event) notFound();

  const isFull =
    !!event.maxAttendees && event.currentAttendees >= event.maxAttendees;
  const isClosed = event.status === "COMPLETED" || event.status === "CANCELED";

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-lifac-blue-700 to-lifac-blue-950 text-white">
        {event.coverImageUrl && (
          <div className="absolute inset-0 opacity-30">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={event.coverImageUrl}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-lifac-blue-950 to-transparent" />
          </div>
        )}

        <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-20 relative">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-blue-200 hover:text-white mb-6 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Tous les événements
          </Link>

          <div className="max-w-3xl">
            <span className="inline-block px-3 py-1 bg-white/90 text-lifac-blue-900 text-xs font-bold rounded-full uppercase tracking-wider mb-4">
              {eventTypeLabel(event.type)}
            </span>
            <h1 className="font-display text-3xl md:text-5xl font-bold mb-6 leading-tight">
              {event.title}
            </h1>
            <p className="text-lg text-blue-100 leading-relaxed mb-6">
              {event.shortDescription}
            </p>

            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-lifac-gold-400" />
                <span>{formatDateTime(event.startDate)}</span>
              </div>
              {event.endDate && (
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-lifac-gold-400" />
                  <span>Jusqu'au {formatDate(event.endDate)}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-lifac-gold-400" />
                <span>
                  {event.location}
                  {event.city ? `, ${event.city}` : ""}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6 lg:p-8">
                <h2 className="font-display text-2xl font-bold text-lifac-blue-900 mb-4">
                  À propos de cet événement
                </h2>
                <div className="prose prose-blue max-w-none whitespace-pre-line text-gray-700 leading-relaxed">
                  {event.description}
                </div>

                {event.partnerChurch && (
                  <div className="mt-8 pt-8 border-t border-gray-100">
                    <p className="text-sm text-gray-500 uppercase tracking-wider mb-2">
                      En partenariat avec
                    </p>
                    <p className="font-semibold text-lifac-blue-900">
                      {event.partnerChurch.name}
                      {event.partnerChurch.city &&
                        ` — ${event.partnerChurch.city}`}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar : inscription */}
          <aside className="lg:sticky lg:top-24 self-start space-y-6">
            <Card>
              <CardContent className="p-6 lg:p-8">
                {event.maxAttendees && (
                  <div className="mb-6 pb-6 border-b border-gray-100">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">Inscriptions</span>
                      <span className="font-bold text-lifac-blue-900">
                        {event.currentAttendees}/{event.maxAttendees}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-lifac-gold-400 to-lifac-gold-600 transition-all"
                        style={{
                          width: `${Math.min(
                            100,
                            (event.currentAttendees / event.maxAttendees) * 100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {isClosed ? (
                  <div className="text-center py-4">
                    <p className="font-semibold text-gray-700">
                      {event.status === "COMPLETED"
                        ? "Événement terminé"
                        : "Événement annulé"}
                    </p>
                  </div>
                ) : isFull ? (
                  <div className="text-center py-4">
                    <p className="font-semibold text-red-600">Complet</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Toutes les places ont été réservées.
                    </p>
                  </div>
                ) : event.requiresRegistration ? (
                  <>
                    <h3 className="font-display text-xl font-bold text-lifac-blue-900 mb-4">
                      S'inscrire
                    </h3>
                    <EventRegistrationForm eventId={event.id} />
                  </>
                ) : (
                  <div className="text-center py-4">
                    <Users className="h-10 w-10 text-lifac-gold-500 mx-auto mb-2" />
                    <p className="font-semibold text-lifac-blue-900">
                      Entrée libre
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Aucune inscription requise. Venez comme vous êtes !
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}

function eventTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    CRUSADE: "Croisade",
    POP_UP_CRUSADE: "Croisade éclair",
    SCHOOL_OUTREACH: "Évangélisation école",
    MARKET_OUTREACH: "Évangélisation marché",
    ONE_ON_ONE: "Évangélisation personnelle",
    YOUTH_CAMP: "Camp de jeunes",
    TRAINING: "Formation",
    HUMANITARIAN_MISSION: "Mission humanitaire",
    PRAYER_MEETING: "Réunion de prière",
  };
  return labels[type] || type;
}
