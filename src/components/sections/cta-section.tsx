import Link from "next/link";
import { useTranslations } from "next-intl";
import { Users, Heart, Calendar, Cross } from "lucide-react";

export function CtaSection() {
  const t = useTranslations("cta");

  const actions = [
    {
      key: "volunteer",
      href: "/volunteer",
      icon: <Users className="h-5 w-5 text-lifac-red-600" />,
      variant: "light" as const,
    },
    {
      key: "donate",
      href: "/donate",
      icon: <Heart className="h-5 w-5 text-white" />,
      variant: "red" as const,
    },
    {
      key: "participate",
      href: "/events",
      icon: <Calendar className="h-5 w-5 text-lifac-red-600" />,
      variant: "light" as const,
    },
    {
      key: "giveLife",
      href: "/prayer",
      icon: <Cross className="h-5 w-5 text-lifac-red-600" />,
      variant: "light" as const,
    },
  ];

  return (
    <section className="bg-white py-8 lg:py-10 border-t border-gray-100">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="grid lg:grid-cols-[1fr_auto] gap-6 lg:gap-10 items-center">
          <h2 className="font-display text-xl md:text-2xl lg:text-3xl font-extrabold text-lifac-navy-900 leading-tight">
            {t("title")}
          </h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {actions.map((action) => (
              <Link
                key={action.key}
                href={action.href}
                className={
                  action.variant === "red"
                    ? "bg-lifac-red-600 hover:bg-lifac-red-700 text-white rounded-xl px-4 py-3 flex flex-col items-center justify-center gap-1.5 text-center transition-all hover:-translate-y-0.5 shadow-md shadow-lifac-red-600/30"
                    : "bg-[#F4F5F7] hover:bg-gray-100 text-lifac-navy-900 rounded-xl px-4 py-3 flex flex-col items-center justify-center gap-1.5 text-center transition-all hover:-translate-y-0.5 shadow-sm"
                }
              >
                <div
                  className={
                    action.variant === "red"
                      ? "h-10 w-10 rounded-full bg-white/15 flex items-center justify-center"
                      : "h-10 w-10 rounded-full bg-white flex items-center justify-center"
                  }
                >
                  {action.icon}
                </div>
                <span className="text-[11px] font-bold tracking-wider uppercase leading-tight">
                  {t(`actions.${action.key}`)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
