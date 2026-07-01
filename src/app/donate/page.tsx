import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import { prisma } from "@/lib/prisma";
import { DonationForm } from "@/components/forms/donation-form";
import { CreditCard, Landmark, Smartphone, Quote, Mail, Phone } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("donate");
  return {
    title: t("title"),
    description: t("subtitle"),
  };
}

export const dynamic = "force-dynamic";
export const maxDuration = 15;

interface DonatePageProps {
  searchParams: Promise<{ campaign?: string }>;
}

export default async function DonatePage({ searchParams }: DonatePageProps) {
  const { campaign: campaignSlug } = await searchParams;

  let campaign: { id: string; title: string; status: string } | null = null;
  if (campaignSlug) {
    try {
      const result = await prisma.campaign.findUnique({
        where: { slug: campaignSlug },
        select: { id: true, title: true, status: true },
      });
      if (result && result.status === "ACTIVE") campaign = result;
    } catch (e) {
      console.error("[DonatePage] Erreur DB :", e);
    }
  }

  return (
    <div className="bg-lifac-navy-950">
      <DonateHero />
      <WhyGive />
      <InvestEternity />
      <ImpactOfGifts />
      <PaymentModes />
      <SupportProjects />
      <PartnershipLevels />
      <VerseSection />
      <ProcessSection />
      <ChangeLifeCta>
        <div className="max-w-2xl mx-auto">
          <DonationForm campaignId={campaign?.id} campaignTitle={campaign?.title} />
        </div>
      </ChangeLifeCta>
      <FinancialContact />
    </div>
  );
}

function DonateHero() {
  const t = useTranslations("donate");
  return (
    <section className="relative bg-lifac-fire pt-32 pb-20 lg:pt-40 lg:pb-28 text-center text-white overflow-hidden">
      <div className="container mx-auto px-4 lg:px-6 relative">
        <p className="text-xs tracking-[0.3em] text-white/60 uppercase mb-4">{t("kicker")}</p>
        <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-extrabold text-lifac-red-500 mb-5 tracking-tight">
          {t("title")}
        </h1>
        <p className="text-white/80 max-w-2xl mx-auto">{t("subtitle")}</p>
        <div className="mt-8 w-24 h-1 bg-lifac-red-600 mx-auto rounded-full" />
      </div>
    </section>
  );
}

function WhyGive() {
  const t = useTranslations("donate");
  return (
    <section className="bg-lifac-navy-950 py-20 text-white text-center">
      <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
        <div className="w-16 h-1 bg-lifac-red-600 mx-auto mb-6 rounded-full" />
        <h2 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight mb-5">
          {t("whyTitle")}
        </h2>
        <p className="text-white/75">{t("whyDesc")}</p>
      </div>
    </section>
  );
}

function InvestEternity() {
  const t = useTranslations("donate");
  return (
    <section className="bg-lifac-navy-900 py-16 lg:py-20 text-white">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="h-8 w-1 bg-lifac-red-600 rounded-full" />
          <h2 className="font-display text-2xl lg:text-3xl font-extrabold">{t("investTitle")}</h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center max-w-5xl mx-auto">
          <div>
            <h4 className="font-bold text-sm tracking-wider mb-3">IMPACT DES RESSOURCES</h4>
            <p className="text-white/75 leading-relaxed">{t("investDesc")}</p>
          </div>
          <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-lifac-navy-700 to-lifac-navy-950 border border-lifac-red-600/30 relative overflow-hidden">
            <svg className="absolute inset-0 w-full h-full opacity-50" viewBox="0 0 400 300">
              <rect x="0" y="180" width="400" height="120" fill="#1F2A4D" />
              <rect x="190" y="190" width="20" height="80" fill="#0B1428" />
              <rect x="160" y="200" width="80" height="6" fill="#0B1428" />
              <g fill="#DC2626" opacity="0.7">
                <path d="M280 120 L 320 100 L 330 130 L 290 150 Z" />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}

function ImpactOfGifts() {
  const t = useTranslations("stats");
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
              32,5K
            </div>
            <div className="text-white font-bold text-lg">{t("soulsWon")}</div>
          </div>

          <div>
            <h4 className="font-bold text-sm tracking-wider mb-3">UNE MOISSON COLLECTIVE</h4>
            <p className="text-white/75 leading-relaxed mb-3">
              Chaque don contribue à atteindre ces chiffres impressionnants. Nous transformons votre
              soutien financier en actions concrètes sur le terrain, partout où le besoin se fait sentir.
            </p>
            <p className="text-white/75 leading-relaxed">
              <strong className="text-white">Bilan 2024 :</strong> 100+ actions humanitaires menées avec succès.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function PaymentModes() {
  const t = useTranslations("donate.modes");
  return (
    <section className="bg-lifac-navy-900 py-16 lg:py-20 text-white">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center gap-3 mb-12">
          <div className="h-8 w-1 bg-lifac-red-600 rounded-full" />
          <h2 className="font-display text-2xl lg:text-3xl font-extrabold">{t("title")}</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          <ModeCard icon={<CreditCard className="h-7 w-7 text-lifac-red-500" />} title={t("card.title")} desc={t("card.desc")} />
          <ModeCard icon={<Landmark className="h-7 w-7 text-lifac-red-500" />} title={t("transfer.title")} desc={t("transfer.desc")} />
          <ModeCard icon={<Smartphone className="h-7 w-7 text-lifac-red-500" />} title={t("mobile.title")} desc={t("mobile.desc")} />
        </div>
      </div>
    </section>
  );
}

function ModeCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="bg-lifac-navy-800 rounded-2xl p-6 text-center border-b-2 border-lifac-red-600">
      <div className="h-14 w-14 rounded-full bg-lifac-red-600/10 flex items-center justify-center mx-auto mb-4">
        {icon}
      </div>
      <h3 className="font-bold text-white tracking-wider mb-3">{title}</h3>
      <p className="text-white/70 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

function SupportProjects() {
  return (
    <section className="bg-lifac-navy-950 py-16 lg:py-20 text-white">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center max-w-6xl mx-auto">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-1 bg-lifac-red-600 rounded-full" />
              <h2 className="font-display text-2xl lg:text-3xl font-extrabold">SOUTIEN AUX PROJETS</h2>
            </div>

            <h4 className="font-bold text-sm tracking-wider mb-3">ACTIONS HUMANITAIRES</h4>
            <p className="text-white/75 leading-relaxed mb-3">
              Une partie de vos dons est spécifiquement allouée à l'accès à l'eau potable, à
              l'éducation des orphelins et au soutien des veuves.
            </p>
            <p className="text-white/75 leading-relaxed">
              Nous construisons des puits et des écoles là où l'État et les autres organisations ne
              vont pas, manifestant ainsi l'amour de Christ par les actes.
            </p>
          </div>

          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-900 via-amber-700 to-lifac-red-900" />
            <svg className="absolute inset-0 w-full h-full opacity-50" viewBox="0 0 400 300">
              <rect x="0" y="200" width="400" height="100" fill="#7c2d12" />
              <rect x="50" y="100" width="200" height="100" fill="#92400e" />
              <polygon points="50,100 150,40 250,100" fill="#7f1d1d" />
              <g fill="#020617">
                <circle cx="270" cy="220" r="12" />
                <circle cx="300" cy="225" r="14" />
                <circle cx="330" cy="220" r="12" />
                <circle cx="360" cy="225" r="14" />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}

function PartnershipLevels() {
  const t = useTranslations("donate.partners");
  const tp = useTranslations("donate");
  const rows = t.raw("rows") as { type: string; freq: string; benefit: string }[];

  return (
    <section className="bg-lifac-navy-900 py-16 lg:py-20 text-white">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="h-8 w-1 bg-lifac-red-600 rounded-full" />
          <h2 className="font-display text-2xl lg:text-3xl font-extrabold">{tp("partnersTitle")}</h2>
        </div>

        <div className="max-w-5xl mx-auto rounded-xl overflow-hidden border border-white/10">
          <div className="grid grid-cols-3 bg-lifac-red-600 text-white font-bold text-sm">
            <div className="px-5 py-3.5">{t("type")}</div>
            <div className="px-5 py-3.5">{t("frequency")}</div>
            <div className="px-5 py-3.5">{t("benefits")}</div>
          </div>
          {rows.map((row, i) => (
            <div
              key={row.type}
              className={`grid grid-cols-3 text-sm border-t border-white/5 ${
                i % 2 === 0 ? "bg-lifac-navy-950/40" : ""
              }`}
            >
              <div className="px-5 py-4 text-white font-bold">{row.type}</div>
              <div className="px-5 py-4 text-white/85">{row.freq}</div>
              <div className="px-5 py-4 text-white/75">{row.benefit}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function VerseSection() {
  const t = useTranslations("donate");
  return (
    <section className="bg-lifac-navy-950 py-20 lg:py-24 text-white text-center">
      <div className="container mx-auto px-4 lg:px-6 max-w-4xl">
        <Quote className="h-12 w-12 text-lifac-red-600 mx-auto mb-6 opacity-60" />
        <blockquote className="font-display text-2xl md:text-3xl font-extrabold text-white leading-relaxed mb-4">
          {t("verse")}
        </blockquote>
        <p className="text-white/60">{t("verseRef")}</p>
      </div>
    </section>
  );
}

function ProcessSection() {
  const t = useTranslations("donate");
  const steps = t.raw("process") as { step: string; desc: string }[];
  return (
    <section className="bg-lifac-navy-900 py-16 lg:py-20 text-white">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center gap-3 mb-12">
          <div className="h-8 w-1 bg-lifac-red-600 rounded-full" />
          <h2 className="font-display text-2xl lg:text-3xl font-extrabold">{t("processTitle")}</h2>
        </div>

        <div className="relative max-w-5xl mx-auto">
          {/* Horizontal line */}
          <div className="hidden md:block absolute top-5 left-[10%] right-[10%] h-px bg-white/20" />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative">
            {steps.map((step, i) => (
              <div key={step.step} className="text-center">
                <div className="relative w-10 h-10 rounded-full bg-lifac-red-600 text-white font-bold flex items-center justify-center mx-auto mb-4 shadow-lg shadow-lifac-red-600/40">
                  {i + 1}
                </div>
                <h3 className="font-bold text-white tracking-wider mb-2 text-sm">{step.step}</h3>
                <p className="text-white/65 text-xs leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ChangeLifeCta({ children }: { children?: React.ReactNode }) {
  const t = useTranslations("donate");
  return (
    <section className="relative bg-lifac-fire py-20 text-white text-center overflow-hidden">
      <div className="container mx-auto px-4 lg:px-6">
        <h2 className="font-display text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
          {t("changeLife")}
        </h2>
        <p className="text-white/80 mb-10 max-w-2xl mx-auto">{t("changeLifeDesc")}</p>
        {children}
      </div>
    </section>
  );
}

function FinancialContact() {
  return (
    <section className="bg-lifac-navy-950 py-16 lg:py-20 text-white text-center">
      <div className="container mx-auto px-4 lg:px-6">
        <h2 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight mb-4 uppercase">
          Contact Financier
        </h2>
        <p className="text-white/75 max-w-2xl mx-auto mb-10">
          Vous avez des questions sur la gestion de vos dons ?
        </p>

        <div className="max-w-3xl mx-auto bg-lifac-navy-800 rounded-2xl p-8 space-y-4">
          <div className="flex items-center justify-center gap-3 text-white/85">
            <Mail className="h-5 w-5 text-lifac-red-500" />
            finance@lifac-world.org
          </div>
          <div className="flex items-center justify-center gap-3 text-white/85">
            <Phone className="h-5 w-5 text-lifac-red-500" />
            +229 61 00 00 00 (Intendance)
          </div>
        </div>
      </div>
    </section>
  );
}
