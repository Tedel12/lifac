import Link from "next/link";
import { useTranslations } from "next-intl";
import { Cross, Megaphone, HandHeart, Flame, GraduationCap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActivityCard {
  key: "crusades" | "evangelism" | "humanitarian" | "prayer" | "training";
  icon: React.ReactNode;
  image: string;
}

const cards: ActivityCard[] = [
  {
    key: "crusades",
    icon: <Cross className="h-5 w-5 text-white" />,
    image: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=600&q=80",
  },
  {
    key: "evangelism",
    icon: <Megaphone className="h-5 w-5 text-white" />,
    image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=600&q=80",
  },
  {
    key: "humanitarian",
    icon: <HandHeart className="h-5 w-5 text-white" />,
    image: "https://images.unsplash.com/photo-1497375638960-ca368c7231e4?auto=format&fit=crop&w=600&q=80",
  },
  {
    key: "prayer",
    icon: <Flame className="h-5 w-5 text-white" />,
    image: "https://images.unsplash.com/photo-1519834785169-98be25ec3f84?auto=format&fit=crop&w=600&q=80",
  },
  {
    key: "training",
    icon: <GraduationCap className="h-5 w-5 text-white" />,
    image: "https://images.unsplash.com/photo-1529390079861-591de354faf5?auto=format&fit=crop&w=600&q=80",
  },
];

export function ActivitiesSection() {
  const t = useTranslations("activities");

  return (
    <section className="relative bg-black py-16 lg:py-20">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="text-center mb-12">
          <div className="inline-block text-[11px] font-bold tracking-[0.25em] text-lifac-red-500 mb-3 uppercase">
            {t("kicker")}
          </div>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-extrabold text-white max-w-3xl mx-auto leading-tight">
            {t("title")}
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-5">
          {cards.map((card) => (
            <ActivityCard key={card.key} cardKey={card.key} icon={card.icon} image={card.image} />
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

function ActivityCard({
  cardKey,
  icon,
  image,
}: {
  cardKey: ActivityCard["key"];
  icon: React.ReactNode;
  image: string;
}) {
  const t = useTranslations("activities.cards");

  return (
    <Link
      href="/activities"
      aria-label={t(`${cardKey}.title`)}
      className="group rounded-2xl bg-black border border-white/5 hover:border-lifac-red-600/40 transition-all duration-300 hover:-translate-y-1 block"
    >
      {/* Wrapper image + icône : relatif mais sans overflow-hidden pour laisser sortir l'icône */}
      <div className="relative">
        {/* Image (seul élément clippé) */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-t-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        </div>

        {/* Icône ancrée au bord bas de l'image, à cheval */}
        <div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 z-10">
          <div className="h-12 w-12 rounded-full bg-lifac-red-600 flex items-center justify-center shadow-lg shadow-lifac-red-600/40 ring-4 ring-black">
            {icon}
          </div>
        </div>
      </div>

      {/* Texte */}
      <div className="pt-10 pb-6 px-5 text-center min-h-[160px]">
        <h3 className="font-display text-sm font-bold text-white tracking-wider uppercase mb-2 break-words">
          {t(`${cardKey}.title`)}
        </h3>
        <p className="text-xs text-white/70 leading-relaxed">
          {t(`${cardKey}.desc`)}
        </p>
      </div>
    </Link>
  );
}
