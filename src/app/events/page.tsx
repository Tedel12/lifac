import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Calendar,
  Users,
  Mic,
  ArrowRight,
  Quote,
} from "lucide-react";
import { ACTIVITY_TYPES_ORDER, ACTIVITY_TYPE_META } from "@/lib/activity-types";

export const revalidate = 300;
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("events");
  return { title: t("title"), description: t("subtitle") };
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const yearEnd = new Date(now.getFullYear() + 1, 0, 1);

  const [allUpcoming, yearCount, testimony] = await Promise.all([
    prisma.event.findMany({
      where: {
        status: "UPCOMING",
        startDate: { gte: now },
        ...(type ? { type: type as any } : {}),
      },
      orderBy: { startDate: "asc" },
      take: 30,
    }),
    prisma.event.count({ where: { startDate: { gte: yearStart, lt: yearEnd } } }),
    prisma.testimony.findFirst({
      where: { isApproved: true, isFeatured: true },
      orderBy: { createdAt: "desc" },
      select: { authorName: true, authorRole: true, content: true },
    }),
  ]);

  const featured = allUpcoming.find((e) => e.isFeatured) ?? allUpcoming[0] ?? null;
  const upcoming = allUpcoming.filter((e) => e.id !== featured?.id).slice(0, 6);
  const cities = Array.from(new Set(allUpcoming.map((e) => e.city).filter(Boolean))) as string[];
  const expectedAttendance = allUpcoming.reduce((sum, e) => sum + (e.maxAttendees ?? 0), 0);
  const speakersCount = new Set(allUpcoming.map((e) => e.organizerId).filter(Boolean)).size;

  return (
    <div>
      <Hero />
      <StatsBar
        citiesCount={cities.length}
        eventsCount={yearCount}
        attendance={expectedAttendance}
        speakersCount={speakersCount}
      />
      {featured && <FeaturedEvent event={featured} />}
      {upcoming.length > 0 && <UpcomingEvents events={upcoming} />}
      <EventCategories />
      {allUpcoming.length > 0 && <CalendarList events={allUpcoming.slice(0, 6)} />}
      {cities.length > 0 && <CitiesList cities={cities} />}
      <TestimonyBanner testimony={testimony} />
      <NewsletterCta />
    </div>
  );
}

async function Hero() {
  const t = await getTranslations("eventsPage");
  const te = await getTranslations("events");
  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-24 text-center text-white overflow-hidden">
      <div className="absolute inset-0">
        <Image src="/activities/night-of-hope.jpg" alt="" fill priority className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/70 to-black" />
      </div>
      <div className="container mx-auto px-4 lg:px-6 relative">
        <p className="text-xs tracking-[0.3em] text-white/60 uppercase mb-4">{t("kicker")}</p>
        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-5 tracking-tight max-w-3xl mx-auto">
          {t("title")}
        </h1>
        <p className="text-white/80 max-w-2xl mx-auto">{te("subtitle")}</p>
        <div className="mt-8 w-24 h-1 bg-lifac-red-600 mx-auto rounded-full" />
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="/register">
            <Button variant="default" size="xl" className="uppercase tracking-wider">
              {t("registerCta")}
            </Button>
          </Link>
          <Link href="#calendar">
            <Button
              variant="outline"
              size="xl"
              className="uppercase tracking-wider border-white/40 bg-transparent text-white hover:bg-white hover:text-lifac-navy-950"
            >
              {t("calendarCta")}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

async function StatsBar({
  citiesCount,
  eventsCount,
  attendance,
  speakersCount,
}: {
  citiesCount: number;
  eventsCount: number;
  attendance: number;
  speakersCount: number;
}) {
  const t = await getTranslations("eventsPage");
  const items = [
    { icon: MapPin, value: citiesCount > 0 ? `${citiesCount}+` : "5+", label: t("statLocations") },
    { icon: Calendar, value: `${eventsCount || 20}+`, label: t("statEvents") },
    { icon: Users, value: attendance > 0 ? `${attendance.toLocaleString("fr-FR")}+` : "50K+", label: t("statAttendance") },
    { icon: Mic, value: `${speakersCount > 0 ? speakersCount : 1}+`, label: t("statSpeakers") },
  ];
  return (
    <section className="bg-[#F4F5F7] py-8 lg:py-10">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
          {items.map((item) => (
            <div key={item.label} className="flex items-center gap-3 lg:justify-center">
              <div className="h-12 w-12 rounded-full bg-lifac-red-600 flex items-center justify-center shrink-0 shadow-md shadow-lifac-red-600/30">
                <item.icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="font-display text-xl lg:text-2xl font-extrabold text-lifac-navy-900 leading-none">
                  {item.value}
                </div>
                <div className="text-[10px] lg:text-[11px] tracking-[0.1em] text-lifac-navy-500 mt-1.5 font-bold uppercase">
                  {item.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

async function FeaturedEvent({ event }: { event: Awaited<ReturnType<typeof prisma.event.findFirst>> }) {
  if (!event) return null;
  const t = await getTranslations("eventsPage");
  return (
    <section className="bg-white py-16 lg:py-20">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="grid lg:grid-cols-2 gap-8 items-center bg-[#F4F5F7] rounded-2xl overflow-hidden">
          <div className="relative aspect-[4/3] lg:aspect-auto lg:h-full min-h-[280px]">
            {event.coverImageUrl ? (
              <Image src={event.coverImageUrl} alt={event.title} fill className="object-cover" />
            ) : (
              <Image src="/activities/crusade.jpg" alt={event.title} fill className="object-cover" />
            )}
            <span className="absolute top-4 left-4 bg-lifac-red-600 text-white text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full">
              {t("featuredBadge")}
            </span>
          </div>
          <div className="p-6 lg:p-10">
            <h2 className="font-display text-2xl lg:text-3xl font-extrabold text-lifac-navy-900 mb-3">
              {event.title}
            </h2>
            <div className="flex flex-wrap gap-4 text-sm text-lifac-navy-600 mb-4">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-lifac-red-600" />
                {formatRange(event.startDate, event.endDate)}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-lifac-red-600" />
                {event.location}
                {event.city ? `, ${event.city}` : ""}
              </span>
            </div>
            <p className="text-lifac-navy-700 leading-relaxed mb-6">{event.shortDescription}</p>
            <Link href={`/events/${event.slug}`}>
              <Button variant="default" size="lg" className="uppercase tracking-wider">
                {t("registerCta")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

async function UpcomingEvents({ events }: { events: Awaited<ReturnType<typeof prisma.event.findMany>> }) {
  const t = await getTranslations("eventsPage");
  return (
    <section className="bg-[#F4F5F7] py-16 lg:py-20">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="h-8 w-1 bg-lifac-red-600 rounded-full mb-3" />
            <h2 className="font-display text-2xl lg:text-3xl font-extrabold text-lifac-navy-900">
              {t("upcomingTitle")}
            </h2>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Link
              key={event.id}
              href={`/events/${event.slug}`}
              className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                {event.coverImageUrl ? (
                  <Image src={event.coverImageUrl} alt={event.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <Image src="/activities/pop-up-crusade.jpg" alt={event.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                )}
                <div className="absolute top-3 left-3 bg-white rounded-lg px-2.5 py-1.5 text-center shadow-md">
                  <div className="text-base font-extrabold text-lifac-navy-900 leading-none">
                    {event.startDate.toLocaleDateString("fr-FR", { day: "2-digit" })}
                  </div>
                  <div className="text-[9px] tracking-widest text-lifac-red-600 font-bold mt-0.5 uppercase">
                    {event.startDate.toLocaleDateString("fr-FR", { month: "short" })}
                  </div>
                </div>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-display font-bold text-lifac-navy-900 mb-2 leading-tight line-clamp-2">
                  {event.title}
                </h3>
                <p className="text-lifac-navy-500 text-xs mb-4 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-lifac-red-600 shrink-0" />
                  {event.location}
                  {event.city ? `, ${event.city}` : ""}
                </p>
                <span className="mt-auto inline-flex items-center gap-1.5 text-lifac-red-600 text-sm font-bold uppercase tracking-wide">
                  {t("learnMore")}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

async function EventCategories() {
  const t = await getTranslations("eventsPage");
  const tt = await getTranslations("activityTypes");
  return (
    <section className="bg-white py-16 lg:py-20">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-8 w-1 bg-lifac-red-600 rounded-full" />
          <h2 className="font-display text-2xl lg:text-3xl font-extrabold text-lifac-navy-900">
            {t("categoriesTitle")}
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {ACTIVITY_TYPES_ORDER.filter((type) => type !== "OTHER").map((type) => {
            const meta = ACTIVITY_TYPE_META[type];
            const Icon = meta.icon;
            return (
              <Link
                key={type}
                href={`/activities/type/${meta.slug}`}
                className="rounded-2xl p-5 text-center border border-transparent bg-[#F4F5F7] hover:border-lifac-red-600/30 transition-all hover:-translate-y-1 hover:shadow-md"
              >
                <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center mx-auto mb-3">
                  <Icon className="h-5 w-5 text-lifac-red-600" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wide text-lifac-navy-800">
                  {tt(`${meta.labelKey}.label`)}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

async function CalendarList({ events }: { events: Awaited<ReturnType<typeof prisma.event.findMany>> }) {
  const t = await getTranslations("eventsPage");
  return (
    <section id="calendar" className="bg-[#F4F5F7] py-16 lg:py-20 scroll-mt-24">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-8 w-1 bg-lifac-red-600 rounded-full" />
          <h2 className="font-display text-2xl lg:text-3xl font-extrabold text-lifac-navy-900">
            {t("calendarTitle")}
          </h2>
        </div>
        <div className="max-w-3xl bg-white rounded-2xl overflow-hidden shadow-sm">
          {events.map((event, i) => (
            <Link
              key={event.id}
              href={`/events/${event.slug}`}
              className={`flex items-center gap-4 px-5 py-4 hover:bg-[#F4F5F7] transition-colors ${
                i > 0 ? "border-t border-gray-100" : ""
              }`}
            >
              <div className="text-center w-14 shrink-0">
                <div className="text-xl font-extrabold text-lifac-red-600 leading-none">
                  {event.startDate.toLocaleDateString("fr-FR", { day: "2-digit" })}
                </div>
                <div className="text-[10px] font-bold text-lifac-navy-500 uppercase tracking-wide">
                  {event.startDate.toLocaleDateString("fr-FR", { month: "short" })}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-lifac-navy-900 truncate">{event.title}</p>
                <p className="text-xs text-lifac-navy-500">
                  {event.location}
                  {event.city ? `, ${event.city}` : ""}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-lifac-red-600 shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

async function CitiesList({ cities }: { cities: string[] }) {
  const t = await getTranslations("eventsPage");
  return (
    <section className="bg-white py-16 lg:py-20">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-8 w-1 bg-lifac-red-600 rounded-full" />
          <h2 className="font-display text-2xl lg:text-3xl font-extrabold text-lifac-navy-900">
            {t("citiesTitle")}
          </h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {cities.map((city) => (
            <span
              key={city}
              className="inline-flex items-center gap-2 bg-[#F4F5F7] text-lifac-navy-800 text-sm font-medium px-4 py-2 rounded-full"
            >
              <MapPin className="h-4 w-4 text-lifac-red-600" />
              {city}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

async function TestimonyBanner({
  testimony,
}: {
  testimony: { authorName: string; authorRole: string | null; content: string } | null;
}) {
  const tt = await getTranslations("testimonies");
  const current = testimony ?? { authorName: "Marie C.", authorRole: null, content: tt("quote") };
  return (
    <section className="bg-white py-20 lg:py-24 text-center border-t border-gray-100">
      <div className="container mx-auto px-4 lg:px-6 max-w-3xl">
        <Quote className="h-10 w-10 text-lifac-red-600 mx-auto mb-6 opacity-70" />
        <blockquote className="font-display text-xl md:text-2xl lg:text-3xl italic font-bold text-lifac-navy-900 leading-relaxed mb-4">
          « {current.content} »
        </blockquote>
        <p className="text-lifac-red-600 font-bold">
          — {current.authorName}
          {current.authorRole ? `, ${current.authorRole}` : ""}
        </p>
      </div>
    </section>
  );
}

async function NewsletterCta() {
  const t = await getTranslations("eventsPage");
  return (
    <section className="bg-[#F4F5F7] py-10">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="grid lg:grid-cols-[1fr_auto] gap-6 items-center">
          <div>
            <h2 className="font-display text-xl lg:text-2xl font-extrabold text-lifac-navy-900">{t("newsletterTitle")}</h2>
            <p className="text-lifac-navy-600 text-sm mt-1">{t("newsletterDesc")}</p>
          </div>
          <Link href="/contact">
            <Button variant="default" size="lg" className="uppercase tracking-wider">
              {t("newsletterCta")}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function formatRange(start: Date, end: Date | null) {
  const opts: Intl.DateTimeFormatOptions = { day: "2-digit", month: "long", year: "numeric" };
  const startStr = start.toLocaleDateString("fr-FR", opts);
  if (!end) return startStr;
  return `${start.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })} — ${end.toLocaleDateString("fr-FR", opts)}`;
}
