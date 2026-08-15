import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import { ACTIVITY_TYPES_ORDER, ACTIVITY_TYPE_META, getActivityTypeMetaBySlug } from "@/lib/activity-types";

export function generateStaticParams() {
  return ACTIVITY_TYPES_ORDER.filter((type) => type !== "OTHER").map((type) => ({
    type: ACTIVITY_TYPE_META[type].slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string }>;
}): Promise<Metadata> {
  const { type } = await params;
  const meta = getActivityTypeMetaBySlug(type);
  if (!meta) return {};
  const tt = await getTranslations("activityTypes");
  return {
    title: tt(`${meta.labelKey}.label`),
    description: tt(`${meta.labelKey}.metaDesc`),
  };
}

export default async function ActivityTypePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  const meta = getActivityTypeMetaBySlug(type);
  if (!meta) notFound();

  const t = await getTranslations("activityTypes");
  const Icon = meta.icon;
  const paragraphs = t.raw(`${meta.labelKey}.paragraphs`) as string[];
  const bullets = t.raw(`${meta.labelKey}.bullets`) as string[];

  return (
    <div className="bg-white">
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-24 text-white overflow-hidden">
        <div className="absolute inset-0">
          <Image src={meta.image} alt="" fill priority className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/70 to-black" />
        </div>
        <div className="container mx-auto px-4 lg:px-6 relative max-w-4xl">
          <Link
            href="/activities"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("backToActivities")}
          </Link>
          <p className="text-xs tracking-[0.3em] text-white/60 uppercase mb-4">{t("heroKicker")}</p>
          <div className="flex items-center gap-4 mb-5">
            <div className="h-14 w-14 rounded-full bg-lifac-red-600 flex items-center justify-center shrink-0">
              <Icon className="h-7 w-7 text-white" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
              {t(`${meta.labelKey}.label`)}
            </h1>
          </div>
          <p className="text-white/80 max-w-2xl">{t(`${meta.labelKey}.intro`)}</p>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-6 max-w-4xl">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-5">
              {paragraphs.map((p, i) => (
                <p key={i} className="text-lifac-navy-700 leading-relaxed">
                  {p}
                </p>
              ))}
            </div>

            <div>
              <div className="bg-[#F4F5F7] rounded-2xl p-6 border-l-4 border-lifac-red-600">
                <h3 className="font-display font-bold text-lifac-navy-900 mb-4">{t("keyPointsTitle")}</h3>
                <ul className="space-y-3">
                  {bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2.5 text-lifac-navy-700 text-sm leading-relaxed">
                      <CheckCircle2 className="h-4 w-4 text-lifac-red-600 shrink-0 mt-0.5" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 lg:py-20 text-center border-t border-gray-100">
        <div className="container mx-auto px-4 lg:px-6 max-w-2xl">
          <h2 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight mb-4 text-lifac-navy-900">
            {t("ctaEventsTitle")}
          </h2>
          <p className="text-lifac-navy-600 mb-8">{t("ctaEventsDesc")}</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/events">
              <Button variant="default" size="xl" className="uppercase tracking-wider">
                {t("ctaEvents")}
              </Button>
            </Link>
            <Link href="/volunteer">
              <Button
                variant="outline"
                size="xl"
                className="uppercase tracking-wider"
              >
                {t("ctaVolunteer")}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
