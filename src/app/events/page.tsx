import { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Flame, Globe, GraduationCap, Quote, MapPin, Phone, Calendar } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("events");
  return {
    title: t("title"),
    description: t("subtitle"),
  };
}

export default function EventsPage() {
  return (
    <div className="bg-lifac-navy-950">
      <EventsHero />
      <FireInAction />
      <NightOfHolySpirit />
      <EventTypes />
      <UpcomingTable />
      <Atmosphere />
      <BigCrusades />
      <ImpactNumbers />
      <FormationsSeminars />
      <TestimonyQuote />
      <ReadyCta />
      <PracticalInfo />
    </div>
  );
}

function EventsHero() {
  const t = useTranslations("events");
  const tp = useTranslations("eventsPage");
  return (
    <section className="relative bg-lifac-fire pt-32 pb-20 lg:pt-40 lg:pb-28 text-center text-white overflow-hidden">
      <div className="container mx-auto px-4 lg:px-6 relative">
        <p className="text-xs tracking-[0.3em] text-white/60 uppercase mb-4">
          {tp("kicker")}
        </p>
        <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-extrabold text-lifac-red-500 mb-5 tracking-tight">
          {tp("title")}
        </h1>
        <p className="text-white/80 max-w-2xl mx-auto">{t("subtitle")}</p>
        <div className="mt-8 w-24 h-1 bg-lifac-red-600 mx-auto rounded-full" />
      </div>
    </section>
  );
}

function FireInAction() {
  const t = useTranslations("events");
  return (
    <section className="bg-lifac-navy-950 py-20 text-white text-center">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="w-16 h-1 bg-lifac-red-600 mx-auto mb-6 rounded-full" />
        <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4">
          {t("title")}<br />{t("subtitle") === "..." ? "" : ""} {/* Adjust if needed */}
        </h2>
        <p className="text-white/70">{t("subtitle")}</p>
      </div>
    </section>
  );
}

function NightOfHolySpirit() {
  const t = useTranslations("eventsPage");
  return (
    <section className="bg-lifac-navy-900 py-16 lg:py-20 text-white">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="h-8 w-1 bg-lifac-red-600 rounded-full" />
          <h2 className="font-display text-2xl lg:text-3xl font-extrabold">
            {t("nightTitle")}
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center max-w-5xl mx-auto">
          <div>
            <h4 className="font-bold text-sm tracking-wider mb-3">UNE RENCONTRE DIVINE</h4>
            <p className="text-white/75 leading-relaxed mb-5">
              {t("nightDesc")}
            </p>
            <ul className="space-y-3 text-white/85">
              <li className="flex items-center gap-3">
                <Flame className="h-5 w-5 text-lifac-red-500" />
                {t("nightPillar1")}
              </li>
              <li className="flex items-center gap-3">
                <Flame className="h-5 w-5 text-lifac-red-500" />
                {t("nightPillar2")}
              </li>
              <li className="flex items-center gap-3">
                <Flame className="h-5 w-5 text-lifac-red-500" />
                {t("nightPillar3")}
              </li>
            </ul>
          </div>

          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border-2 border-lifac-red-600/60">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400 via-lifac-red-600 to-lifac-navy-950" />
            <svg className="absolute inset-0 w-full h-full opacity-50" viewBox="0 0 400 300">
              <g stroke="#000" strokeWidth="4" strokeLinecap="round">
                <line x1="120" y1="250" x2="120" y2="150" />
                <line x1="180" y1="250" x2="180" y2="120" />
                <line x1="240" y1="250" x2="240" y2="120" />
                <line x1="300" y1="250" x2="300" y2="150" />
              </g>
              <g fill="#000" opacity="0.6">
                <circle cx="120" cy="265" r="20" />
                <circle cx="180" cy="265" r="22" />
                <circle cx="240" cy="265" r="22" />
                <circle cx="300" cy="265" r="20" />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}

function EventTypes() {
  const t = useTranslations("events.types");
  const tp = useTranslations("eventsPage");
  const types = [
    { key: "crusades", icon: <Globe className="h-7 w-7 text-lifac-red-500" /> },
    { key: "seminars", icon: <GraduationCap className="h-7 w-7 text-lifac-red-500" /> },
    { key: "vigils", icon: <Flame className="h-7 w-7 text-lifac-red-500" /> },
  ] as const;

  return (
    <section className="bg-lifac-navy-950 py-16 lg:py-20 text-white">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center gap-3 mb-12">
          <div className="h-8 w-1 bg-lifac-red-600 rounded-full" />
          <h2 className="font-display text-2xl lg:text-3xl font-extrabold">{tp("typesTitle")}</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {types.map((type) => (
            <div key={type.key} className="bg-lifac-navy-900 rounded-2xl p-6 text-center border-b-2 border-lifac-red-600">
              <div className="h-14 w-14 rounded-full bg-lifac-red-600/10 flex items-center justify-center mx-auto mb-4">
                {type.icon}
              </div>
              <h3 className="font-bold text-white tracking-wider mb-3">
                {t(`${type.key}.title`)}
              </h3>
              <p className="text-white/70 text-sm leading-relaxed">{t(`${type.key}.desc`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function UpcomingTable() {
  const t = useTranslations("events");
  const rows = t.raw("upcoming") as { date: string; title: string; location: string; time: string }[];

  return (
    <section className="bg-lifac-navy-900 py-16 lg:py-20 text-white">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="h-8 w-1 bg-lifac-red-600 rounded-full" />
          <h2 className="font-display text-2xl lg:text-3xl font-extrabold uppercase">{t("kicker")}</h2>
        </div>

        <div className="max-w-5xl mx-auto rounded-xl overflow-hidden border border-white/10">
          <div className="grid grid-cols-3 bg-lifac-red-600 text-white font-bold text-sm">
            <div className="px-5 py-3.5">{t("table.date")}</div>
            <div className="px-5 py-3.5">{t("table.event")}</div>
            <div className="px-5 py-3.5">{t("table.place")}</div>
          </div>
          {rows.map((row, i) => (
            <div
              key={row.title}
              className={`grid grid-cols-3 text-sm border-t border-white/5 ${
                i % 2 === 0 ? "bg-lifac-navy-950/40" : ""
              }`}
            >
              <div className="px-5 py-4 text-white font-bold">{row.date}</div>
              <div className="px-5 py-4 text-white/85">{row.title}</div>
              <div className="px-5 py-4 text-white/75">{row.location}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Atmosphere() {
  const t = useTranslations("eventsPage");
  return (
    <section className="bg-lifac-navy-950 py-16 lg:py-20 text-white">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="h-8 w-1 bg-lifac-red-600 rounded-full" />
          <h2 className="font-display text-2xl lg:text-3xl font-extrabold">{t("atmosphereTitle")}</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-5 max-w-5xl mx-auto">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="aspect-[16/10] rounded-2xl bg-lifac-navy-900 border border-lifac-red-600/40 overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-lifac-navy-800 to-lifac-navy-950" />
              <svg className="absolute inset-0 w-full h-full opacity-50" viewBox="0 0 200 130">
                <g fill="#020617">
                  <path d="M0 110 Q 50 90 100 100 T 200 105 L 200 130 L 0 130 Z" />
                </g>
                <g fill="#0B1428">
                  {[10, 30, 60, 90, 120, 150, 180].map((x) => (
                    <circle key={x} cx={x} cy={108} r={8} />
                  ))}
                </g>
                <ellipse cx="100" cy="40" rx="80" ry="35" fill={i === 0 ? "#DC2626" : "#F59E0B"} opacity="0.35" />
              </svg>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BigCrusades() {
  const t = useTranslations("eventsPage");
  return (
    <section className="bg-lifac-navy-900 py-16 lg:py-20 text-white">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center max-w-6xl mx-auto">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-1 bg-lifac-red-600 rounded-full" />
              <h2 className="font-display text-2xl lg:text-3xl font-extrabold leading-tight">
                {t("conquerTitle")}
              </h2>
            </div>

            <h4 className="font-bold text-sm tracking-wider mb-3">{t("conquerTitle")}</h4>
            <p className="text-white/75 leading-relaxed mb-4">
              {t("conquerDesc")}
            </p>
          </div>

          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-lifac-navy-700 to-lifac-navy-950" />
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
              <g fill="#1F2A4D">
                <rect x="0" y="180" width="400" height="120" />
              </g>
              <g fill="#070E1F">
                {Array.from({ length: 40 }, (_, i) => (
                  <circle key={i} cx={(i * 11) % 400} cy={200 + (i % 4) * 20} r="3" />
                ))}
              </g>
              <g fill="#DC2626" opacity="0.6">
                <ellipse cx="200" cy="80" rx="180" ry="60" />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}

function ImpactNumbers() {
  const t = useTranslations("eventsPage");
  return (
    <section className="bg-lifac-navy-950 py-16 lg:py-20 text-white">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center gap-3 mb-12">
          <div className="h-8 w-1 bg-lifac-red-600 rounded-full" />
          <h2 className="font-display text-2xl lg:text-3xl font-extrabold">IMPACT</h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 max-w-5xl mx-auto items-center">
          <div className="text-center lg:text-left">
            <div className="font-display text-7xl md:text-8xl lg:text-9xl font-extrabold text-lifac-red-500 leading-none mb-3">
              50K+
            </div>
            <div className="text-white font-bold text-lg">{t("impactParticipants")}</div>
          </div>

          <div>
            <h4 className="font-bold text-sm tracking-wider mb-4 uppercase">{t("mobilizationTitle")}</h4>
            <p className="text-white/75 leading-relaxed mb-3">
              {t("mobilizationDesc")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function FormationsSeminars() {
  const t = useTranslations("eventsPage");
  return (
    <section className="bg-lifac-navy-900 py-16 lg:py-20 text-white">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center gap-3 mb-12">
          <div className="h-8 w-1 bg-lifac-red-600 rounded-full" />
          <h2 className="font-display text-2xl lg:text-3xl font-extrabold">{t("trainingTitle")}</h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center max-w-6xl mx-auto">
          <div className="aspect-[4/3] rounded-2xl bg-lifac-navy-800 border border-lifac-red-600/40 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-lifac-navy-700 to-lifac-navy-900" />
            <svg className="absolute inset-0 w-full h-full opacity-60" viewBox="0 0 400 300">
              <ellipse cx="200" cy="100" rx="80" ry="40" fill="#DC2626" opacity="0.4" />
              <rect x="180" y="140" width="40" height="100" fill="#0B1428" />
              <circle cx="200" cy="120" r="22" fill="#0B1428" />
            </svg>
          </div>

          <div>
            <h4 className="font-bold text-sm tracking-wider mb-3 uppercase">{t("equipTitle")}</h4>
            <p className="text-white/75 leading-relaxed mb-5">
              {t("equipDesc")}
            </p>
            <ul className="space-y-2.5 text-white/85">
              <li className="flex items-center gap-3">
                <span className="text-lifac-red-500 font-bold">✓</span>
                {t("course1")}
              </li>
              <li className="flex items-center gap-3">
                <span className="text-lifac-red-500 font-bold">✓</span>
                {t("course2")}
              </li>
              <li className="flex items-center gap-3">
                <span className="text-lifac-red-500 font-bold">✓</span>
                {t("course3")}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonyQuote() {
  const t = useTranslations("eventsPage");
  return (
    <section className="bg-lifac-navy-950 py-20 lg:py-24 text-white text-center">
      <div className="container mx-auto px-4 lg:px-6 max-w-4xl">
        <Quote className="h-12 w-12 text-lifac-red-600 mx-auto mb-6 opacity-60" />
        <blockquote className="font-display text-xl md:text-2xl lg:text-3xl italic font-bold text-white leading-relaxed mb-4">
          {t("testimony")}
        </blockquote>
        <p className="text-lifac-red-500 font-bold">— Marie C., Participante</p>
      </div>
    </section>
  );
}

function ReadyCta() {
  const t = useTranslations("events");
  const tc = useTranslations("common");
  return (
    <section className="bg-lifac-navy-900 py-20 text-white text-center">
      <div className="container mx-auto px-4 lg:px-6 max-w-3xl">
        <h2 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight mb-5">
          {t("readyTitle")}
        </h2>
        <p className="text-white/75 mb-8">{t("readyDesc")}</p>
        <Link href="/register">
          <Button variant="default" size="xl" className="uppercase tracking-wider">
            {tc("registerNow")}
          </Button>
        </Link>
      </div>
    </section>
  );
}

function PracticalInfo() {
  const t = useTranslations("events");
  const tp = useTranslations("eventsPage");
  return (
    <section className="bg-lifac-navy-950 py-16 lg:py-20 text-white text-center">
      <div className="container mx-auto px-4 lg:px-6">
        <h2 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
          {t("infos")}
        </h2>
        <p className="text-white/75 max-w-2xl mx-auto mb-10">{t("infosDesc")}</p>

        <div className="grid md:grid-cols-2 gap-5 max-w-3xl mx-auto">
          <InfoCard
            icon={<MapPin className="h-5 w-5 text-lifac-red-500" />}
            title={t("offices")}
            content={t("officesAddress")}
          />
          <InfoCard
            icon={<Phone className="h-5 w-5 text-lifac-red-500" />}
            title={t("hotline")}
            content={t("hotlineNumber")}
          />
        </div>

        <p className="mt-10 text-white/50 text-sm">
          {tp("joinTagline")}
        </p>
      </div>
    </section>
  );
}

function InfoCard({ icon, title, content }: { icon: React.ReactNode; title: string; content: string }) {
  return (
    <div className="bg-lifac-navy-800 rounded-2xl p-6 border-l-4 border-lifac-red-600 text-left">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h3 className="font-bold text-white tracking-wider uppercase text-xs">{title}</h3>
      </div>
      <p className="text-white/75 text-sm">{content}</p>
    </div>
  );
}
