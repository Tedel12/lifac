import { useTranslations } from "next-intl";
import { Flame, Cross, GraduationCap, HandHeart } from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface StatsBarProps {
  stats: {
    totalSoulsWon: number;
    schoolsVisited: number;
    marketOutreach: number;
    totalCrusades: number;
  };
}

export function StatsBar({ stats }: StatsBarProps) {
  const t = useTranslations("stats");

  const items = [
    {
      icon: <Flame className="h-5 w-5 text-white" />,
      value: `${formatNumber(stats.totalSoulsWon)}+`,
      label: t("soulsWon"),
    },
    {
      icon: <Cross className="h-5 w-5 text-white" />,
      value: `${formatNumber(stats.totalCrusades)}+`,
      label: t("crusades"),
    },
    {
      icon: <GraduationCap className="h-5 w-5 text-white" />,
      value: formatNumber(stats.schoolsVisited),
      label: t("schoolsVisited"),
    },
    {
      icon: <HandHeart className="h-5 w-5 text-white" />,
      value: "100+",
      label: t("humanitarian"),
    },
  ];

  return (
    <section className="bg-[#F4F5F7] py-8 lg:py-10">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
          {items.map((item) => (
            <div key={item.label} className="flex items-center gap-3 lg:justify-center">
              <div className="h-12 w-12 rounded-full bg-lifac-red-600 flex items-center justify-center shrink-0 shadow-md shadow-lifac-red-600/30">
                {item.icon}
              </div>
              <div>
                <div className="font-display text-2xl lg:text-3xl font-extrabold text-lifac-navy-900 leading-none">
                  {item.value}
                </div>
                <div className="text-[10px] lg:text-[11px] tracking-[0.15em] text-lifac-navy-500 mt-1.5 font-bold uppercase">
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
