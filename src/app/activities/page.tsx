import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { getActivities } from "@/actions/activity-actions";
import { prisma } from "@/lib/prisma";
import { ACTIVITY_TYPES_ORDER, ACTIVITY_TYPE_META } from "@/lib/activity-types";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Handshake,
  HeartHandshake,
  Flame,
  BookOpenCheck,
  Send,
  Stethoscope,
  Users,
  Sprout,
  GraduationCap,
  Images,
  PlayCircle,
  Quote,
  MapPin,
  Calendar,
} from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("activitiesPage");
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
  };
}

export default async function ActivitiesPage() {
  const [activities, testimony, soulsAgg, crusadesCount, schoolsCount, volunteersCount] = await Promise.all([
    getActivities(),
    prisma.testimony.findFirst({
      where: { isApproved: true, isFeatured: true },
      orderBy: { createdAt: "desc" },
      select: { authorName: true, authorRole: true, authorAvatar: true, content: true },
    }),
    prisma.activity.aggregate({ _sum: { decisionsForChrist: true } }),
    prisma.activity.count({ where: { type: "CRUSADE" } }),
    prisma.school.count(),
    prisma.user.count({ where: { role: "VOLUNTEER", isActive: true } }),
  ]);

  const impactStats = {
    totalSoulsWon: soulsAgg._sum.decisionsForChrist ?? 0,
    totalCrusades: crusadesCount,
    schoolsVisited: schoolsCount,
    totalVolunteers: volunteersCount,
  };

  const now = new Date();
  const upcoming = activities
    .filter((a) => a.date >= now && a.status !== "CANCELED")
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 3);
  const recentField = upcoming.length > 0 ? upcoming : activities.slice(0, 3);

  return (
    <div>
      <Hero />
      <ActivityGrid />
      <ImpactBanner stats={impactStats} />
      <ProcessSteps />
      <GalleryVideoTestimony testimony={testimony} />
      <ServeAndUpcoming activities={recentField} hasUpcoming={upcoming.length > 0} />
      <FinalCta />
    </div>
  );
}

async function Hero() {
  const t = await getTranslations("activitiesPage");
  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 text-center text-white overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="/activities/crusade.jpg"
          alt=""
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/70 to-black" />
      </div>
      <div className="container mx-auto px-4 lg:px-6 relative">
        <p className="text-xs tracking-[0.3em] text-white/60 uppercase mb-4">{t("heroKicker")}</p>
        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-5 tracking-tight max-w-4xl mx-auto">
          {t("heroTitle")}
        </h1>
        <p className="text-white/80 max-w-2xl mx-auto">{t("heroSubtitle")}</p>
        <div className="mt-8 w-24 h-1 bg-lifac-red-600 mx-auto rounded-full" />
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="/volunteer">
            <Button variant="default" size="xl" className="uppercase tracking-wider">
              {t("heroCtaMission")}
            </Button>
          </Link>
          <Link href="/donate">
            <Button
              variant="outline"
              size="xl"
              className="uppercase tracking-wider border-white/40 bg-transparent text-white hover:bg-white hover:text-lifac-navy-950"
            >
              {t("heroCtaSupport")}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

async function ActivityGrid() {
  const t = await getTranslations("activitiesPage");
  const tt = await getTranslations("activityTypes");
  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="text-center mb-12">
          <div className="inline-block text-[11px] font-bold tracking-[0.25em] text-lifac-red-600 mb-3 uppercase">
            {t("gridTitle")}
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-extrabold text-lifac-navy-900 max-w-2xl mx-auto leading-tight">
            {t("gridSubtitle")}
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {ACTIVITY_TYPES_ORDER.filter((type) => type !== "OTHER").map((type) => {
            const meta = ACTIVITY_TYPE_META[type];
            const Icon = meta.icon;
            return (
              <Link
                key={type}
                href={`/activities/type/${meta.slug}`}
                className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-lifac-red-600/40 transition-all duration-300"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={meta.image}
                    alt={tt(`${meta.labelKey}.label`)}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute bottom-3 left-3 h-10 w-10 rounded-full bg-lifac-red-600 flex items-center justify-center shadow-lg shadow-lifac-red-600/40 ring-4 ring-white">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-display font-bold text-lifac-navy-900 mb-2 leading-tight">
                    {tt(`${meta.labelKey}.label`)}
                  </h3>
                  <p className="text-lifac-navy-600 text-sm leading-relaxed mb-4 flex-1">
                    {tt(`${meta.labelKey}.shortDesc`)}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-lifac-red-600 text-sm font-bold uppercase tracking-wide">
                    {t("learnMore")}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

async function ImpactBanner({
  stats: statsData,
}: {
  stats: { totalSoulsWon: number; totalCrusades: number; schoolsVisited: number; totalVolunteers: number };
}) {
  const t = await getTranslations("activitiesPage");
  const stats = [
    { icon: HeartHandshake, value: statsData.totalSoulsWon, label: t("impactSouls"), suffix: "+" },
    { icon: Flame, value: statsData.totalCrusades, label: t("impactCrusades"), suffix: "+" },
    { icon: GraduationCap, value: statsData.schoolsVisited, label: t("impactSchools"), suffix: "+" },
    { icon: Users, value: statsData.totalVolunteers, label: t("impactVolunteers"), suffix: "+" },
  ];
  return (
    <section className="relative bg-white py-14 lg:py-16 overflow-hidden border-y border-gray-100">
      <div className="container mx-auto px-4 lg:px-6 relative">
        <h2 className="font-display text-center text-xl lg:text-2xl font-extrabold uppercase tracking-wide mb-10 text-lifac-navy-900">
          {t("impactTitle")}
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="h-12 w-12 rounded-full bg-lifac-red-600 flex items-center justify-center mx-auto mb-3 shadow-md shadow-lifac-red-600/30">
                <s.icon className="h-6 w-6 text-white" />
              </div>
              <div className="font-display text-4xl md:text-5xl font-extrabold mb-2 text-lifac-navy-900">
                {s.value.toLocaleString("fr-FR")}
                {s.suffix}
              </div>
              <div className="text-lifac-navy-600 text-sm font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

async function ProcessSteps() {
  const t = await getTranslations("activitiesPage");
  const steps = t.raw("processSteps") as { title: string; desc: string }[];
  const icons = [Handshake, BookOpenCheck, Send, Flame, Stethoscope, Sprout, Users];

  return (
    <section className="bg-[#F4F5F7] py-16 lg:py-24 overflow-hidden">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="text-center mb-12">
          <div className="inline-block text-[11px] font-bold tracking-[0.25em] text-lifac-red-600 mb-3 uppercase">
            {t("processTitle")}
          </div>
          <p className="text-lifac-navy-600 max-w-2xl mx-auto">{t("processSubtitle")}</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
          {steps.map((step, i) => {
            const Icon = icons[i] ?? HeartHandshake;
            return (
              <div key={step.title} className="relative flex flex-col items-center text-center">
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[calc(50%+2.5rem)] w-[calc(100%-5rem)] h-px bg-lifac-red-600/30" />
                )}
                <div className="h-16 w-16 rounded-full bg-white border-2 border-lifac-red-600 flex items-center justify-center mb-4 relative z-10 shadow-sm">
                  <Icon className="h-7 w-7 text-lifac-red-600" />
                </div>
                <span className="text-xs font-bold text-lifac-red-600 mb-1">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="font-display font-bold text-lifac-navy-900 mb-2">{step.title}</h3>
                <p className="text-lifac-navy-600 text-sm leading-relaxed">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

async function GalleryVideoTestimony({
  testimony,
}: {
  testimony: { authorName: string; authorRole: string | null; authorAvatar: string | null; content: string } | null;
}) {
  const t = await getTranslations("activitiesPage");
  const tt = await getTranslations("testimonies");
  const galleryImages = [
    "/activities/crusade.jpg",
    "/activities/youth-crusade.jpg",
    "/activities/humanitarian-action.jpg",
    "/activities/night-of-hope.jpg",
  ];
  const current = testimony ?? {
    authorName: "Marie K.",
    authorRole: null,
    authorAvatar: null,
    content: tt("quote"),
  };

  return (
    <section className="bg-white py-16 lg:py-20">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Galerie */}
          <div>
            <h3 className="text-[11px] font-bold tracking-[0.25em] text-lifac-red-600 uppercase mb-2">
              {t("galleryKicker")}
            </h3>
            <p className="font-display text-xl font-extrabold text-lifac-navy-900 mb-5">{t("galleryTitle")}</p>
            <div className="grid grid-cols-2 gap-2 mb-5">
              {galleryImages.map((src) => (
                <div key={src} className="relative aspect-square rounded-xl overflow-hidden">
                  <Image src={src} alt="" fill className="object-cover" />
                </div>
              ))}
            </div>
            <Link href="/resources">
              <Button variant="default" size="sm" className="w-full uppercase tracking-wider">
                <Images className="h-4 w-4" />
                {t("galleryCta")}
              </Button>
            </Link>
          </div>

          {/* Vidéo */}
          <div>
            <h3 className="text-[11px] font-bold tracking-[0.25em] text-lifac-red-600 uppercase mb-2">
              {t("videoKicker")}
            </h3>
            <p className="font-display text-xl font-extrabold text-lifac-navy-900 mb-5">{t("videoTitle")}</p>
            <div className="relative aspect-square rounded-xl overflow-hidden mb-5 bg-lifac-navy-950">
              <Image src="/activities/pop-up-crusade.jpg" alt="" fill className="object-cover opacity-80" />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="h-16 w-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                  <PlayCircle className="h-8 w-8 text-lifac-red-600" />
                </div>
              </div>
            </div>
            <Link href="/resources">
              <Button
                variant="outline"
                size="sm"
                className="w-full uppercase tracking-wider"
              >
                {t("videoCta")}
              </Button>
            </Link>
          </div>

          {/* Témoignage */}
          <div>
            <h3 className="text-[11px] font-bold tracking-[0.25em] text-lifac-red-600 uppercase mb-2">
              {t("testimonyKicker")}
            </h3>
            <p className="font-display text-xl font-extrabold text-lifac-navy-900 mb-5">{t("testimonyTitle")}</p>
            <div className="bg-[#F4F5F7] rounded-2xl p-6 h-full flex flex-col">
              <Quote className="h-8 w-8 text-lifac-red-500/40 mb-3" />
              <p className="text-sm text-lifac-navy-700 leading-relaxed italic flex-1">« {current.content} »</p>
              <div className="flex items-center gap-3 mt-5">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-lifac-navy-700 to-lifac-navy-900 flex items-center justify-center text-white font-bold shrink-0 overflow-hidden">
                  {current.authorAvatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={current.authorAvatar} alt={current.authorName} className="h-full w-full object-cover" />
                  ) : (
                    current.authorName.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <p className="font-bold text-lifac-navy-900 text-sm">{current.authorName}</p>
                  {current.authorRole && <p className="text-xs text-lifac-navy-500">{current.authorRole}</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

async function ServeAndUpcoming({
  activities,
  hasUpcoming,
}: {
  activities: Awaited<ReturnType<typeof getActivities>>;
  hasUpcoming: boolean;
}) {
  const t = await getTranslations("activitiesPage");
  const cities = t.raw("serveCities") as string[];

  return (
    <section className="bg-[#F4F5F7] py-16 lg:py-24">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="grid lg:grid-cols-[1fr_1.6fr] gap-8 lg:gap-10 items-start">
          {/* Où nous servons */}
          <div className="bg-white rounded-2xl p-7 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-8 w-1 bg-lifac-red-600 rounded-full" />
              <h3 className="font-display text-xl font-extrabold text-lifac-navy-900">{t("serveTitle")}</h3>
            </div>
            <p className="text-lifac-navy-600 text-sm leading-relaxed mb-6">{t("serveSubtitle")}</p>
            <ul className="space-y-2.5">
              {cities.map((city) => (
                <li key={city} className="flex items-center gap-2.5 text-lifac-navy-800 text-sm font-medium">
                  <MapPin className="h-4 w-4 text-lifac-red-600 shrink-0" />
                  {city}
                </li>
              ))}
            </ul>
          </div>

          {/* Missions à venir */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-1 bg-lifac-red-600 rounded-full" />
              <h3 className="font-display text-xl font-extrabold text-lifac-navy-900">{t("upcomingTitle")}</h3>
            </div>
            <p className="text-lifac-navy-600 text-sm mb-6">{t("upcomingSubtitle")}</p>

            {activities.length === 0 ? (
              <p className="text-lifac-navy-500 text-sm bg-white rounded-2xl p-6">{t("upcomingEmpty")}</p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {activities.map((activity) => {
                  const meta = ACTIVITY_TYPE_META[activity.type];
                  return (
                    <Link
                      key={activity.id}
                      href={`/activities/${activity.id}`}
                      className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                    >
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <Image
                          src={meta.image}
                          alt={activity.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute top-3 left-3 bg-white rounded-lg px-2.5 py-1.5 text-center shadow-md">
                          <Calendar className="h-3.5 w-3.5 text-lifac-red-600 inline-block mr-1" />
                          <span className="text-[11px] font-bold text-lifac-navy-900">
                            {new Date(activity.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h4 className="font-display font-bold text-lifac-navy-900 mb-1 leading-tight line-clamp-1">
                          {activity.title}
                        </h4>
                        {activity.commune && <p className="text-lifac-navy-500 text-xs mb-2">{activity.commune}</p>}
                        <span className="inline-flex items-center gap-1.5 text-lifac-red-600 text-xs font-bold uppercase tracking-wide">
                          {t("upcomingViewDetails")}
                          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

async function FinalCta() {
  const t = await getTranslations("activitiesPage");
  return (
    <section className="bg-white py-20 text-center border-t border-gray-100">
      <div className="container mx-auto px-4 lg:px-6 max-w-3xl">
        <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-5 text-lifac-navy-900">
          {t("ctaTitle")}
        </h2>
        <p className="text-lifac-navy-600 mb-8">{t("ctaDesc")}</p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/volunteer">
            <Button variant="default" size="xl" className="uppercase tracking-wider">
              {t("ctaVolunteer")}
            </Button>
          </Link>
          <Link href="/donate">
            <Button variant="outline" size="xl" className="uppercase tracking-wider">
              {t("ctaDonate")}
            </Button>
          </Link>
          <Link href="/contact">
            <Button variant="outline" size="xl" className="uppercase tracking-wider">
              {t("ctaPartner")}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
