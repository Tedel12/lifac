import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getActivityById } from "@/actions/activity-actions";
import { ACTIVITY_TYPE_META } from "@/lib/activity-types";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Calendar, User, Church, Users, Sparkles, BookOpen, Contact2 } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const activity = await getActivityById(id);
  if (!activity) return {};
  return { title: activity.title };
}

export default async function ActivityDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const activity = await getActivityById(id);

  if (!activity) {
    notFound();
  }

  const t = await getTranslations("activityDetailPage");
  const tt = await getTranslations("activityTypes");
  const meta = ACTIVITY_TYPE_META[activity.type];

  const metrics = [
    { label: t("estimatedParticipants"), value: activity.estimatedParticipants },
    { label: t("actualParticipants"), value: activity.actualParticipants },
    { label: t("decisionsForChrist"), value: activity.decisionsForChrist },
    { label: t("biblesDistributed"), value: activity.biblesDistributed },
    { label: t("newContacts"), value: activity.newContacts },
  ].filter((m) => m.value !== null && m.value !== undefined);

  const location = [activity.commune, activity.address].filter(Boolean).join(" — ") || activity.country;

  return (
    <div className="bg-white">
      <section className="relative pt-32 pb-16 lg:pt-40 lg:pb-20 text-white overflow-hidden">
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
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-2 bg-lifac-red-600 text-white text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full">
              {tt(`${meta.labelKey}.label`)}
            </span>
            <span className="inline-flex items-center bg-white/10 text-white/80 text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full">
              {activity.status}
            </span>
            <span className="text-white/50 text-xs font-mono">{activity.code}</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-6">
            {activity.title}
          </h1>

          <div className="grid sm:grid-cols-3 gap-4">
            <InfoCard icon={<Calendar className="h-5 w-5 text-lifac-red-500" />} label={t("date")}>
              {new Date(activity.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
            </InfoCard>
            <InfoCard icon={<MapPin className="h-5 w-5 text-lifac-red-500" />} label={t("location")}>
              {location}
            </InfoCard>
            {activity.responsibleName && (
              <InfoCard icon={<User className="h-5 w-5 text-lifac-red-500" />} label={t("responsible")}>
                {activity.responsibleName}
              </InfoCard>
            )}
          </div>
        </div>
      </section>

      {metrics.length > 0 && (
        <section className="bg-lifac-red-600 py-12 lg:py-14 text-white">
          <div className="container mx-auto px-4 lg:px-6 max-w-4xl">
            <h2 className="font-display text-center text-lg lg:text-xl font-extrabold uppercase tracking-wide mb-8">
              {t("impactTitle")}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 text-center">
              {metrics.map((m) => (
                <div key={m.label}>
                  <div className="font-display text-3xl md:text-4xl font-extrabold mb-1">{m.value}</div>
                  <div className="text-white/85 text-xs font-medium">{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4 lg:px-6 max-w-4xl">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-8 w-1 bg-lifac-red-600 rounded-full" />
                  <h3 className="font-display text-xl font-extrabold text-lifac-navy-900">{t("descriptionTitle")}</h3>
                </div>
                {activity.description ? (
                  <div className="text-lifac-navy-700 leading-relaxed space-y-4">
                    {activity.description.split("\n").filter(Boolean).map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                ) : (
                  <p className="text-lifac-navy-500 italic">{tt(`${meta.labelKey}.shortDesc`)}</p>
                )}
              </div>

              {activity.notes && (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-8 w-1 bg-lifac-red-600 rounded-full" />
                    <h3 className="font-display text-xl font-extrabold text-lifac-navy-900">{t("notesTitle")}</h3>
                  </div>
                  <p className="text-lifac-navy-600 leading-relaxed whitespace-pre-line">{activity.notes}</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {activity.partnerChurch && (
                <SideCard icon={<Church className="h-5 w-5 text-lifac-red-600" />} label={t("partnerChurch")}>
                  {activity.partnerChurch}
                </SideCard>
              )}
              {activity.contactName && (
                <SideCard icon={<Contact2 className="h-5 w-5 text-lifac-red-600" />} label={activity.contactPhone ?? ""}>
                  {activity.contactName}
                </SideCard>
              )}

              <Link
                href={`/activities/type/${meta.slug}`}
                className="flex items-center gap-3 bg-[#F4F5F7] rounded-2xl p-5 border border-gray-100 hover:border-lifac-red-600/40 transition-colors"
              >
                <Sparkles className="h-5 w-5 text-lifac-red-600 shrink-0" />
                <span className="text-lifac-navy-800 text-sm font-medium">{t("learnMoreAboutType")}</span>
              </Link>

              <Button asChild variant="outline" className="w-full">
                <Link href="/activities">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t("backToActivities")}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function InfoCard({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="bg-white/10 backdrop-blur rounded-xl p-4 flex items-start gap-3">
      {icon}
      <div>
        <p className="text-white/50 text-xs uppercase tracking-wide font-bold mb-0.5">{label}</p>
        <p className="text-white text-sm font-medium">{children}</p>
      </div>
    </div>
  );
}

function SideCard({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#F4F5F7] rounded-2xl p-5 border border-gray-100 flex items-start gap-3">
      {icon}
      <div>
        <p className="text-lifac-navy-900 font-medium text-sm">{children}</p>
        {label && <p className="text-lifac-navy-500 text-xs mt-0.5">{label}</p>}
      </div>
    </div>
  );
}
