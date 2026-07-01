"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  GraduationCap,
  ShoppingBag,
  Megaphone,
  Users,
  Flame,
  ArrowRight,
} from "lucide-react";

export default function ActivitiesPage() {
  const t = useTranslations("activitiesPage");
  
  const activities = [
    {
      id: "schools",
      label: t("schoolsLabel"),
      icon: GraduationCap,
      color: "from-blue-400 to-blue-600",
      description: t("schoolsDesc"),
      impact: t("schoolsImpact"),
    },
    {
      id: "markets",
      label: t("marketsLabel"),
      icon: ShoppingBag,
      color: "from-cyan-400 to-teal-600",
      description: t("marketsDesc"),
      impact: t("marketsImpact"),
    },
    {
      id: "pop-up",
      label: t("popUpLabel"),
      icon: Megaphone,
      color: "from-orange-400 to-red-500",
      description: t("popUpDesc"),
      impact: t("popUpImpact"),
    },
    {
      id: "one-on-one",
      label: t("oneOnOneLabel"),
      icon: Users,
      color: "from-emerald-400 to-green-600",
      description: t("oneOnOneDesc"),
      impact: t("oneOnOneImpact"),
    },
    {
      id: "crusades",
      label: t("crusadesLabel"),
      icon: Flame,
      color: "from-indigo-500 to-lifac-blue-900",
      description: t("crusadesDesc"),
      impact: t("crusadesImpact"),
    },
  ];

  return (
    <div className="bg-white">
      <section className="bg-gradient-to-br from-lifac-blue-900 to-lifac-blue-950 text-white py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8 text-center max-w-3xl">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            {t("title")}
          </h1>
          <p className="text-lg text-blue-100">
            {t("subtitle")}
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
          <div className="space-y-16">
            {activities.map((activity, index) => {
              const Icon = activity.icon;
              const isReversed = index % 2 === 1;
              return (
                <div
                  key={activity.id}
                  id={activity.id}
                  className={`grid md:grid-cols-2 gap-8 lg:gap-12 items-center scroll-mt-24 ${isReversed ? "md:[direction:rtl]" : ""}`}
                >
                  <div className="md:[direction:ltr]">
                    <div
                      className={`aspect-square max-w-md mx-auto rounded-3xl bg-gradient-to-br ${activity.color} shadow-2xl flex items-center justify-center`}
                    >
                      <Icon className="h-32 w-32 text-white/90" strokeWidth={1.5} />
                    </div>
                  </div>
                  <div className="md:[direction:ltr] space-y-4">
                    <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-lifac-blue-900">
                      {activity.label}
                    </h2>
                    <p className="text-gray-700 leading-relaxed text-lg">
                      {activity.description}
                    </p>
                    <div className="inline-block px-4 py-2 bg-lifac-gold-100 rounded-full">
                      <span className="text-sm font-semibold text-lifac-gold-800">
                        {activity.impact}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <Card className="mt-20 bg-gradient-to-br from-lifac-blue-900 to-lifac-blue-950 text-white border-0">
            <CardContent className="p-8 lg:p-12 text-center">
              <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">
                {t("joinTitle")}
              </h2>
              <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                {t("joinDesc")}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/volunteer">
                  <Button variant="default" size="lg">
                    {t("joinVolunteer")}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/donate">
                  <Button variant="ghost" size="lg" className="border-2 border-white/30 hover:border-white">
                    {t("joinSupport")}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
