import Link from "next/link";
import { useTranslations } from "next-intl";
import { Users, Heart, Calendar, Cross } from "lucide-react";

export function CtaSection() {
  const t = useTranslations("cta");

  const actions = [
    {
      key: "volunteer",
      href: "/volunteer",
      icon: <Users className="h-5 w-5 text-lifac-navy-900" />,
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
      icon: <Calendar className="h-5 w-5 text-lifac-navy-900" />,
      variant: "light" as const,
    },
    {
      key: "giveLife",
      href: "/prayer",
      icon: <Cross className="h-5 w-5 text-lifac-navy-900" />,
      variant: "light" as const,
    },
  ];

  return (
    <section className="relative bg-lifac-red-600 py-8 lg:py-10 overflow-hidden">
      <div aria-hidden className="absolute inset-0 pointer-events-none opacity-20">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1440 200" preserveAspectRatio="xMidYMid slice">
          <g fill="#fff" opacity="0.1">
            <circle cx="100" cy="50" r="40" />
            <circle cx="1300" cy="150" r="60" />
            <circle cx="700" cy="100" r="30" />
          </g>
        </svg>
      </div>

      <div className="container mx-auto px-4 lg:px-6 relative">
        <div className="grid lg:grid-cols-[1fr_auto] gap-6 lg:gap-10 items-center">
          <h2 className="font-display text-xl md:text-2xl lg:text-3xl font-extrabold text-white leading-tight">
            {t("title")}
          </h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {actions.map((action) => (
              <Link
                key={action.key}
                href={action.href}
                className={
                  action.variant === "red"
                    ? "bg-lifac-red-700 hover:bg-lifac-red-800 border-2 border-white text-white rounded-xl px-4 py-3 flex flex-col items-center justify-center gap-1.5 text-center transition-all hover:-translate-y-0.5 shadow-md"
                    : "bg-white hover:bg-gray-50 text-lifac-navy-900 rounded-xl px-4 py-3 flex flex-col items-center justify-center gap-1.5 text-center transition-all hover:-translate-y-0.5 shadow-md"
                }
              >
                <div
                  className={
                    action.variant === "red"
                      ? "h-10 w-10 rounded-full bg-white/15 flex items-center justify-center"
                      : "h-10 w-10 rounded-full bg-lifac-red-50 flex items-center justify-center"
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
