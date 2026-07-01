import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Eye, Target, Users, Check, ArrowRight } from "lucide-react";

const ABOUT_IMAGE =
  "https://images.unsplash.com/photo-1466442929976-97f336a657be?auto=format&fit=crop&w=900&q=80";

export function AboutSection() {
  const t = useTranslations("about");
  const tc = useTranslations("common");

  const values = t.raw("values.list") as string[];

  return (
    <section id="about" className="relative bg-[#F4F5F7] pt-6 pb-16 lg:pt-8 lg:pb-20">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="grid lg:grid-cols-[1.05fr_1fr_1fr_1fr] gap-4 lg:gap-5">
          {/* Bloc Qui sommes-nous (photo) */}
          <div className="relative rounded-2xl overflow-hidden min-h-[380px] p-7 lg:p-8 text-white flex flex-col justify-between bg-black">
            {/* Image en fond */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ABOUT_IMAGE}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover opacity-70"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/50 to-lifac-red-900/60" />

            <div className="relative">
              <h2 className="font-display text-3xl lg:text-4xl font-extrabold tracking-tight mb-5 leading-tight">
                {t("kicker").toUpperCase()}
              </h2>
              <p className="text-sm text-white/85 leading-relaxed">
                {t("intro")}
              </p>
            </div>
            <div className="relative mt-6">
              <Link href="/about">
                <Button variant="default" size="sm" className="uppercase tracking-wider">
                  {tc("learnMore")}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          <PillarCard
            icon={<Eye className="h-6 w-6 text-white" />}
            title={t("vision.title").toUpperCase()}
            description={t("vision.desc")}
          />

          <PillarCard
            icon={<Target className="h-6 w-6 text-white" />}
            title={t("mission.title").toUpperCase()}
            description={t("mission.desc")}
          />

          {/* Values */}
          <div className="bg-white rounded-2xl p-7 lg:p-8 text-center flex flex-col items-center shadow-sm">
            <div className="h-14 w-14 rounded-full bg-lifac-red-600 flex items-center justify-center mb-5 shadow-md shadow-lifac-red-600/30">
              <Users className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-display text-base font-extrabold text-lifac-navy-900 tracking-wider mb-4">
              {t("values.title").toUpperCase()}
            </h3>
            <ul className="space-y-2 text-sm text-lifac-navy-700 text-left w-full max-w-[180px]">
              {values.map((v) => (
                <li key={v} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-lifac-red-600 shrink-0" />
                  {v}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function PillarCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-7 lg:p-8 text-center flex flex-col items-center shadow-sm">
      <div className="h-14 w-14 rounded-full bg-lifac-red-600 flex items-center justify-center mb-5 shadow-md shadow-lifac-red-600/30">
        {icon}
      </div>
      <h3 className="font-display text-base font-extrabold text-lifac-navy-900 tracking-wider mb-3">
        {title}
      </h3>
      <p className="text-sm text-lifac-navy-600 leading-relaxed">{description}</p>
      <div className="mt-5 w-12 h-0.5 bg-lifac-red-600 rounded-full" />
    </div>
  );
}
