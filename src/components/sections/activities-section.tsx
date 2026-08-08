import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActivityType } from "@prisma/client";
import { ACTIVITY_TYPE_META } from "@/lib/activity-types";

// Ordre demandé par le client (identique à /activities) : les 5 premiers types
// mis en avant sur la page d'accueil.
const HOME_ACTIVITY_TYPES: ActivityType[] = [
  ActivityType.CRUSADE,
  ActivityType.YOUTH_CRUSADE,
  ActivityType.POP_UP_CRUSADE,
  ActivityType.MARKET_OUTREACH,
  ActivityType.ONE_ON_ONE,
];

export function ActivitiesSection() {
  const t = useTranslations("activities");

  return (
    <section className="relative bg-white py-16 lg:py-20">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="text-center mb-12">
          <div className="inline-block text-[11px] font-bold tracking-[0.25em] text-red-600 mb-3 uppercase">
            {t("kicker")}
          </div>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 max-w-3xl mx-auto leading-tight">
            {t("title")}
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-5">
          {HOME_ACTIVITY_TYPES.map((type) => (
            <ActivityCard key={type} type={type} />
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/activities">
            <Button variant="default" size="lg" className="uppercase tracking-wider">
              {t("viewAll")}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function ActivityCard({ type }: { type: ActivityType }) {
  const t = useTranslations("activityTypes");
  const meta = ACTIVITY_TYPE_META[type];
  const Icon = meta.icon;

  return (
    <Link
      href={`/activities/type/${meta.slug}`}
      aria-label={t(`${meta.labelKey}.label`)}
      className="group rounded-2xl bg-gray-50 border border-gray-100 hover:border-red-600/40 transition-all duration-300 hover:-translate-y-1 block shadow-sm"
    >
      <div className="relative">
        <div className="relative aspect-[4/3] overflow-hidden rounded-t-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={meta.image}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
        </div>

        <div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 z-10">
          <div className="h-12 w-12 rounded-full bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/40 ring-4 ring-white">
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
      </div>

      <div className="pt-10 pb-6 px-5 text-center min-h-[160px]">
        <h3 className="font-display text-sm font-bold text-gray-900 tracking-wider uppercase mb-2 break-words">
          {t(`${meta.labelKey}.label`)}
        </h3>
        <p className="text-xs text-gray-600 leading-relaxed">
          {t(`${meta.labelKey}.shortDesc`)}
        </p>
      </div>
    </Link>
  );
}
