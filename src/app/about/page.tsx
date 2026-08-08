import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Flame, Wind, Globe, Shield, Star, Heart, Users, Quote, ArrowRight, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("about");
  return {
    title: t("kicker"),
    description: t("intro"),
  };
}

export default function AboutPage() {
  return (
    <div className="bg-white">
      <AboutHero />
      <IdentitySection />
      <VisionPillars />
      <MissionDomains />
      <KeyFigures />
      <GrowthTable />
      <CoreValues />
      <FieldActivities />
      <VerseSection />
      <JoinUs />
    </div>
  );
}

function AboutHero() {
  const t = useTranslations("about");
  const tp = useTranslations("aboutPage");
  return (
    <section className="relative bg-white pt-32 pb-20 lg:pt-40 lg:pb-28 text-center overflow-hidden">
      <div className="container mx-auto px-4 lg:px-6 relative">
        <p className="text-xs tracking-[0.3em] text-lifac-navy-400 uppercase mb-4">
          {tp("heroSubtitle")}
        </p>
        <h1 className="font-display text-6xl md:text-7xl lg:text-8xl font-extrabold text-lifac-red-600 mb-6 tracking-tight">
          LIFAC
        </h1>
        <p className="text-sm md:text-base tracking-[0.25em] text-lifac-navy-700 uppercase">
          {t("kicker")}
        </p>
        <div className="mt-8 w-24 h-1 bg-lifac-red-600 mx-auto rounded-full" />
      </div>
    </section>
  );
}

function IdentitySection() {
  const t = useTranslations("about");
  const tp = useTranslations("aboutPage");
  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-extrabold mb-3 text-lifac-navy-900">
            {tp("identityTitle")}
          </h2>
          <div className="w-20 h-1 bg-lifac-red-600 mx-auto rounded-full mb-4" />
          <p className="text-lifac-navy-600">
            {tp("identitySubtitle")}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center max-w-5xl mx-auto">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="h-8 w-1 bg-lifac-red-600 rounded-full" />
              <h3 className="font-display text-2xl lg:text-3xl font-extrabold text-lifac-navy-900">
                {tp("identityHeading")}
              </h3>
            </div>
            <h4 className="font-bold text-lifac-navy-900 mb-3 text-sm tracking-wider">
              {tp("identityLabel")}
            </h4>
            <p className="text-lifac-navy-600 leading-relaxed mb-4">
              {t("longIntro")}
            </p>
            <p className="text-lifac-navy-600 leading-relaxed">
              <strong className="text-lifac-navy-900">{tp("identitySloganLabel")}</strong> « {t("slogan")} »
            </p>
          </div>

          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border-2 border-lifac-red-600/60">
            <Image src="/activities/crusade.jpg" alt="" fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-lifac-navy-950/50 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}

function VisionPillars() {
  const t = useTranslations("about.pillars");
  return (
    <section className="bg-[#F4F5F7] py-16 lg:py-20">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center gap-3 mb-12">
          <div className="h-8 w-1 bg-lifac-red-600 rounded-full" />
          <h2 className="font-display text-2xl lg:text-3xl font-extrabold text-lifac-navy-900">
            {t("pillars.visionTitle")}
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          <PillarCard
            icon={<Flame className="h-7 w-7 text-lifac-red-500" />}
            title={t("passion.title")}
            desc={t("passion.desc")}
          />
          <PillarCard
            icon={<Wind className="h-7 w-7 text-lifac-red-500" />}
            title={t("spirit.title")}
            desc={t("spirit.desc")}
          />
          <PillarCard
            icon={<Globe className="h-7 w-7 text-lifac-red-500" />}
            title={t("impact.title")}
            desc={t("impact.desc")}
          />
        </div>
      </div>
    </section>
  );
}

function PillarCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="relative bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center border-b-2 border-lifac-red-600">
      <div className="h-14 w-14 rounded-full bg-lifac-red-600/10 flex items-center justify-center mx-auto mb-4">
        {icon}
      </div>
      <h3 className="font-bold text-lifac-navy-900 tracking-wider mb-2">{title}</h3>
      <p className="text-lifac-navy-600 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

function MissionDomains() {
  const tp = useTranslations("aboutPage");
  const domains = [
    { label: tp("missionEvangelism"), percent: 40, color: "#DC2626" },
    { label: tp("missionLeadership"), percent: 30, color: "#F87171" },
    { label: tp("missionSocial"), percent: 20, color: "#7F1D1D" },
    { label: tp("missionUnity"), percent: 10, color: "#475569" },
  ];

  // Pie chart values (cumulative)
  let cumulative = 0;
  const segments = domains.map((d) => {
    const start = cumulative;
    cumulative += d.percent;
    return {
      ...d,
      start: (start / 100) * 2 * Math.PI,
      end: (cumulative / 100) * 2 * Math.PI,
    };
  });

  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center gap-3 mb-12">
          <div className="h-8 w-1 bg-lifac-red-600 rounded-full" />
          <h2 className="font-display text-2xl lg:text-3xl font-extrabold text-lifac-navy-900">
            {tp("missionTitle")}
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-4xl mx-auto">
          {/* Pie */}
          <div className="flex justify-center">
            <svg viewBox="-1 -1 2 2" className="w-60 h-60 -rotate-90">
              {segments.map((s) => {
                const x1 = Math.cos(s.start);
                const y1 = Math.sin(s.start);
                const x2 = Math.cos(s.end);
                const y2 = Math.sin(s.end);
                const large = s.end - s.start > Math.PI ? 1 : 0;
                return (
                  <path
                    key={s.label}
                    d={`M 0 0 L ${x1} ${y1} A 1 1 0 ${large} 1 ${x2} ${y2} Z`}
                    fill={s.color}
                    stroke="#F4F5F7"
                    strokeWidth="0.015"
                  />
                );
              })}
            </svg>
          </div>

          {/* Legend */}
          <div className="space-y-4">
            {domains.map((d) => (
              <div key={d.label} className="flex items-center gap-3">
                <span
                  className="h-4 w-4 rounded-sm shrink-0"
                  style={{ backgroundColor: d.color }}
                />
                <span className="text-lifac-navy-700">
                  {d.label} ({d.percent}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function KeyFigures() {
  const tp = useTranslations("aboutPage");
  return (
    <section className="bg-[#F4F5F7] py-16 lg:py-20">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center gap-3 mb-12">
          <div className="h-8 w-1 bg-lifac-red-600 rounded-full" />
          <h2 className="font-display text-2xl lg:text-3xl font-extrabold text-lifac-navy-900">
            {tp("figuresTitle")}
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-10 max-w-4xl mx-auto text-center">
          <div>
            <div className="font-display text-6xl md:text-7xl lg:text-8xl font-extrabold text-lifac-red-500 leading-none mb-3">
              32,500+
            </div>
            <div className="text-lifac-navy-900 font-bold">{tp("figuresSouls")}</div>
          </div>
          <div>
            <div className="font-display text-6xl md:text-7xl lg:text-8xl font-extrabold text-lifac-red-500 leading-none mb-3">
              100+
            </div>
            <div className="text-lifac-navy-900 font-bold">{tp("figuresActions")}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function GrowthTable() {
  const t = useTranslations("about.growth");
  const rows = t.raw("rows") as { label: string; result: string; goal: string }[];

  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="h-8 w-1 bg-lifac-red-600 rounded-full" />
          <h2 className="font-display text-2xl lg:text-3xl font-extrabold uppercase text-lifac-navy-900">
            {t("title")}
          </h2>
        </div>

        <div className="max-w-5xl mx-auto rounded-xl overflow-hidden border border-gray-100">
          <div className="grid grid-cols-3 bg-lifac-red-600 text-white font-bold text-sm">
            <div className="px-5 py-3.5">{t("indicator")}</div>
            <div className="px-5 py-3.5">{t("result")}</div>
            <div className="px-5 py-3.5">{t("goal")}</div>
          </div>
          {rows.map((row, i) => (
            <div
              key={row.label}
              className={`grid grid-cols-3 text-sm border-t border-gray-100 ${
                i % 2 === 0 ? "bg-[#F4F5F7]" : ""
              }`}
            >
              <div className="px-5 py-4 text-lifac-navy-700">{row.label}</div>
              <div className="px-5 py-4 text-lifac-navy-600">{row.result}</div>
              <div className="px-5 py-4 text-lifac-navy-600">{row.goal}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CoreValues() {
  const t = useTranslations("about.coreValues");
  const tp = useTranslations("aboutPage");
  return (
    <section className="bg-[#F4F5F7] py-16 lg:py-20">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center gap-3 mb-12">
          <div className="h-8 w-1 bg-lifac-red-600 rounded-full" />
          <h2 className="font-display text-2xl lg:text-3xl font-extrabold text-lifac-navy-900">
            {tp("missionTitle")}
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 max-w-6xl mx-auto">
          <ValueCard icon={<Shield className="h-7 w-7 text-lifac-red-500" />} title={t("integrity.title")} desc={t("integrity.desc")} />
          <ValueCard icon={<Star className="h-7 w-7 text-lifac-red-500" />} title={t("excellence.title")} desc={t("excellence.desc")} />
          <ValueCard icon={<Heart className="h-7 w-7 text-lifac-red-500" />} title={t("compassion.title")} desc={t("compassion.desc")} />
          <ValueCard icon={<Users className="h-7 w-7 text-lifac-red-500" />} title={t("unity.title")} desc={t("unity.desc")} />
        </div>
      </div>
    </section>
  );
}

function ValueCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 lg:p-6 text-center border-b-2 border-lifac-red-600">
      <div className="h-14 w-14 rounded-full bg-lifac-red-600/10 flex items-center justify-center mx-auto mb-4">
        {icon}
      </div>
      <h3 className="font-bold text-lifac-navy-900 tracking-wider mb-2 text-sm">{title}</h3>
      <p className="text-lifac-navy-500 text-xs leading-relaxed">{desc}</p>
    </div>
  );
}

function FieldActivities() {
  const tp = useTranslations("aboutPage");
  const items = [
    { title: tp("fieldEvangelismTitle"), desc: tp("fieldEvangelismDesc"), image: "/activities/personal-evangelism.jpg" },
    { title: tp("fieldTrainingTitle"), desc: tp("fieldTrainingDesc"), image: "/activities/evangelism-training.jpg" },
    { title: tp("fieldHumanitarianTitle"), desc: tp("fieldHumanitarianDesc"), image: "/activities/humanitarian-action.jpg" },
  ];
  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center gap-3 mb-12">
          <div className="h-8 w-1 bg-lifac-red-600 rounded-full" />
          <h2 className="font-display text-2xl lg:text-3xl font-extrabold text-lifac-navy-900">
            {tp("fieldTitle")}
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5 max-w-6xl mx-auto">
          {items.map((item) => (
            <div
              key={item.title}
              className="bg-[#F4F5F7] rounded-2xl overflow-hidden border border-gray-100 hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
            >
              <div className="aspect-[16/10] relative overflow-hidden border-b border-lifac-red-600/40">
                <Image src={item.image} alt="" fill className="object-cover" />
              </div>
              <div className="p-5 text-center">
                <h3 className="font-bold text-lifac-navy-900 tracking-wider mb-2">{item.title}</h3>
                <p className="text-lifac-navy-500 text-sm">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function VerseSection() {
  const t = useTranslations("about");
  return (
    <section className="bg-lifac-navy-950 py-20 lg:py-24 text-white text-center">
      <div className="container mx-auto px-4 lg:px-6 max-w-4xl">
        <Quote className="h-12 w-12 text-lifac-red-600 mx-auto mb-6 opacity-60" />
        <blockquote className="font-display text-2xl md:text-3xl lg:text-4xl italic font-bold text-white leading-relaxed mb-4">
          {t("verse")}
        </blockquote>
        <p className="text-lifac-red-500 font-semibold">{t("verseRef")}</p>
      </div>
    </section>
  );
}

function JoinUs() {
  const tp = useTranslations("aboutPage");
  return (
    <section className="bg-lifac-navy-950 py-20 text-white text-center">
      <div className="container mx-auto px-4 lg:px-6">
        <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 tracking-tight">
          {tp("joinTitle")}
        </h2>
        <p className="text-white/70 max-w-xl mx-auto mb-10">
          {tp("joinDesc")}
        </p>

        <Link href="/volunteer">
          <Button variant="default" size="lg" className="uppercase tracking-wider mb-12">
            {tp("joinTitle")}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>

        <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm p-8 grid sm:grid-cols-3 gap-6 text-left">
          <a href="mailto:info@lifac.org" className="flex items-start gap-3 group">
            <Mail className="h-5 w-5 text-lifac-red-600 shrink-0 mt-0.5" />
            <span className="text-sm text-lifac-navy-700 group-hover:text-lifac-red-600 transition-colors break-all">
              info@lifac.org
            </span>
          </a>
          <a href="tel:+2290140131359" className="flex items-start gap-3 group">
            <Phone className="h-5 w-5 text-lifac-red-600 shrink-0 mt-0.5" />
            <span className="text-sm text-lifac-navy-700 group-hover:text-lifac-red-600 transition-colors">
              +229 01 40 13 13 59
            </span>
          </a>
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-lifac-red-600 shrink-0 mt-0.5" />
            <span className="text-sm text-lifac-navy-700">Zopah, Abomey-Calavi, Bénin</span>
          </div>
        </div>
      </div>
    </section>
  );
}
