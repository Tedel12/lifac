"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, HeartHandshake, Target, PartyPopper, Sparkles, UserPlus, Church, Users, TrendingUp, MapPin, Gauge } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { KPIUpdateModal } from "./kpi-update-modal";
import { DistributionUpdateModal } from "./distribution-update-modal";
import { formatAmountXof } from "@/lib/fedapay";

interface DashboardContentProps {
  initialGlobalStats: any;
  initialModuleDistributions: any[];
  recentActivities: any[];
  operationalStats: {
    donationsApproved: number;
    activeCampaigns: number;
    upcomingEvents: number;
  };
  extendedMetrics: {
    decisionsForChrist: number;
    newContacts: number;
    partnerChurchesCount: number;
    activeAgentsCount: number;
    monthlyEvolution: { key: string; label: string; activities: number; decisions: number }[];
    geoDistribution: { commune: string; count: number }[];
    efficiencyRate: number;
  };
}

const ACTIVITY_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Brouillon",
  PLANNED: "Planifiée",
  CONFIRMED: "Confirmée",
  ONGOING: "En cours",
  COMPLETED: "Terminée",
  POSTPONED: "Reportée",
  CANCELED: "Annulée",
};

export default function DashboardContent({
  initialGlobalStats,
  initialModuleDistributions,
  recentActivities,
  operationalStats,
  extendedMetrics,
}: DashboardContentProps) {
  const t = useTranslations("adminDashboard");
  const [stats, setStats] = useState(initialGlobalStats);
  const [distributions, setDistributions] = useState(initialModuleDistributions);
  const [activeKpi, setActiveKpi] = useState<any>(null);
  const [isDistModalOpen, setIsDistModalOpen] = useState(false);

  const kpis = [
    { title: t("kpi.activities"), key: "totalSoulsWon", value: stats?.totalSoulsWon || 0, change: "+18%" },
    { title: t("kpi.schools"), key: "schoolsVisited", value: stats?.schoolsVisited || 0, change: "+5%" },
    { title: t("kpi.markets"), key: "marketOutreach", value: stats?.marketOutreach || 0, change: "+10%" },
    { title: t("kpi.crusades"), key: "totalCrusades", value: stats?.totalCrusades || 0, change: "+2%" },
  ];

  const opStats = [
    {
      icon: <HeartHandshake className="h-5 w-5 text-emerald-600" />,
      label: "Dons confirmés",
      value: formatAmountXof(operationalStats.donationsApproved),
      href: "/admin/donations",
      bg: "bg-emerald-50",
    },
    {
      icon: <Target className="h-5 w-5 text-lifac-red-600" />,
      label: "Campagnes actives",
      value: String(operationalStats.activeCampaigns),
      href: "/admin/campaigns",
      bg: "bg-lifac-red-50",
    },
    {
      icon: <PartyPopper className="h-5 w-5 text-blue-600" />,
      label: "Événements à venir",
      value: String(operationalStats.upcomingEvents),
      href: "/admin/events",
      bg: "bg-blue-50",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <span className="text-2xl font-bold text-lifac-navy-900">{t("welcome")}</span>
        <p className="text-sm text-gray-500">{t("dashboardOverview")}</p>
      </div>
      {/* Stats opérationnelles réelles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {opStats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${s.bg} mb-3`}>{s.icon}</div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">{s.label}</p>
                <p className="font-display text-xl font-bold text-lifac-navy-900 mt-1">{s.value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-500">{kpi.title}</CardTitle>
              <button onClick={() => setActiveKpi(kpi)} className="p-1 hover:bg-gray-100 rounded">
                <RefreshCw size={14} className="text-gray-400" />
              </button>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-lifac-navy-900">{kpi.value}</div>
              <p className="text-sm text-green-600 font-semibold">{kpi.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* KPIs ministère (décisions pour Christ, convertis, églises partenaires, agents actifs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-5">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-lifac-red-50 mb-3">
              <Sparkles className="h-5 w-5 text-lifac-red-600" />
            </div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Décisions pour Christ</p>
            <p className="font-display text-2xl font-bold text-lifac-navy-900 mt-1">{extendedMetrics.decisionsForChrist}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 mb-3">
              <UserPlus className="h-5 w-5 text-emerald-600" />
            </div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Nouveaux contacts</p>
            <p className="font-display text-2xl font-bold text-lifac-navy-900 mt-1">{extendedMetrics.newContacts}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 mb-3">
              <Church className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Églises partenaires</p>
            <p className="font-display text-2xl font-bold text-lifac-navy-900 mt-1">{extendedMetrics.partnerChurchesCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 mb-3">
              <Users className="h-5 w-5 text-amber-600" />
            </div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Missionnaires actifs</p>
            <p className="font-display text-2xl font-bold text-lifac-navy-900 mt-1">{extendedMetrics.activeAgentsCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques : évolution mensuelle, répartition géographique, taux d'efficacité */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center gap-2">
            <TrendingUp className="h-4 w-4 text-lifac-red-600" />
            <CardTitle>Évolution mensuelle (6 derniers mois)</CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const max = Math.max(1, ...extendedMetrics.monthlyEvolution.map((m) => m.activities));
              return (
                <div className="flex items-end gap-4 h-48">
                  {extendedMetrics.monthlyEvolution.map((m) => (
                    <div key={m.key} className="flex-1 flex flex-col items-center justify-end h-full gap-1.5">
                      <span className="text-xs font-semibold text-lifac-navy-900">{m.activities}</span>
                      <div
                        className="w-full max-w-10 rounded-t-md bg-lifac-red-500/80 hover:bg-lifac-red-600 transition-colors"
                        style={{ height: `${Math.max(4, (m.activities / max) * 100)}%` }}
                        title={`${m.activities} activité(s), ${m.decisions} décision(s) pour Christ`}
                      />
                      <span className="text-[11px] text-gray-500 capitalize">{m.label}</span>
                    </div>
                  ))}
                </div>
              );
            })()}
            <p className="text-xs text-gray-400 mt-2">Nombre d&apos;activités de terrain par mois.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Gauge className="h-4 w-4 text-lifac-red-600" />
            <CardTitle>Taux d&apos;efficacité</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center gap-2 py-4">
            <div className="relative h-32 w-32 rounded-full flex items-center justify-center"
              style={{ background: `conic-gradient(#DC2626 ${extendedMetrics.efficiencyRate}%, #F1F5F9 0)` }}
            >
              <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center">
                <span className="text-2xl font-bold text-lifac-navy-900">{extendedMetrics.efficiencyRate}%</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">
              Décisions pour Christ / personnes touchées, sur les 6 derniers mois.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <MapPin className="h-4 w-4 text-lifac-red-600" />
          <CardTitle>Répartition géographique (6 derniers mois)</CardTitle>
        </CardHeader>
        <CardContent>
          {extendedMetrics.geoDistribution.length === 0 ? (
            <p className="text-sm text-gray-500 py-2">Aucune activité géolocalisée sur la période.</p>
          ) : (
            <div className="space-y-3">
              {(() => {
                const max = Math.max(1, ...extendedMetrics.geoDistribution.map((g) => g.count));
                return extendedMetrics.geoDistribution.map((g) => (
                  <div key={g.commune} className="flex items-center gap-3">
                    <span className="w-32 shrink-0 text-sm text-lifac-navy-900 truncate">{g.commune}</span>
                    <div className="flex-1 h-2.5 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-lifac-red-600"
                        style={{ width: `${(g.count / max) * 100}%` }}
                      />
                    </div>
                    <span className="w-6 text-right text-sm font-semibold text-lifac-navy-900">{g.count}</span>
                  </div>
                ));
              })()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Distribution & Recent Activities */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t("distribution")}</CardTitle>
            <button onClick={() => setIsDistModalOpen(true)} className="p-1 hover:bg-gray-100 rounded">
                <RefreshCw size={14} className="text-gray-400" />
            </button>
          </CardHeader>
          <CardContent>
            {/* Graphique en secteurs réel avec conic-gradient */}
            <div className="h-48 flex items-center justify-center gap-4">
              <div 
                className="w-32 h-32 rounded-full"
                style={{
                  background: `conic-gradient(${distributions.map((d, i) => `${d.color} ${i === 0 ? '0%' : ''} ${d.value}%`).join(', ')})`
                }}
              />
            </div>
            <div className="text-sm space-y-2 mt-4">
              {distributions.map((d) => (
                  <div key={d.category} className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                          <div className="w-3 h-3" style={{ backgroundColor: d.color }} /> 
                          {d.category}
                      </span>
                      <span>{d.value}%</span>
                  </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t("recentActivities")}</CardTitle>
            <Link href="/admin/activities" className="text-sm text-lifac-red-600 font-semibold hover:underline">
              {t("seeAll")}
            </Link>
          </CardHeader>
          <CardContent>
            {recentActivities.length === 0 ? (
              <p className="text-sm text-gray-500 py-4">Aucune activité enregistrée pour le moment.</p>
            ) : (
              <div className="space-y-4">
                {recentActivities.map((act) => (
                  <Link
                    key={act.id}
                    href={`/admin/activities`}
                    className="flex items-center justify-between p-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div>
                      <p className="font-medium text-lifac-navy-900">{act.title}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(act.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        act.status === "COMPLETED" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {ACTIVITY_STATUS_LABELS[act.status] ?? act.status}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {activeKpi && (
        <KPIUpdateModal 
          isOpen={true} 
          onClose={() => setActiveKpi(null)} 
          kpi={activeKpi} 
          stats={stats} 
          onUpdate={setStats} 
        />
      )}
      {isDistModalOpen && (
        <DistributionUpdateModal 
          isOpen={true} 
          onClose={() => setIsDistModalOpen(false)} 
          distributions={distributions} 
          onUpdate={setDistributions} 
        />
      )}
    </div>
  );
}
