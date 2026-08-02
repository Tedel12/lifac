"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, HeartHandshake, Target, PartyPopper, Sparkles, UserPlus, Church, Users, TrendingUp, MapPin, Gauge, CalendarClock, Wallet } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { formatAmountXof } from "@/lib/fedapay";
import { recomputeGlobalStats } from "@/actions/dashboard";
import { toast } from "sonner";

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
    attendanceTotal: number;
    monthlyEvolution: { key: string; label: string; activities: number; decisions: number }[];
    geoDistribution: { commune: string; count: number }[];
    efficiencyRate: number;
  };
  secondaryCharts: {
    donationsEvolution: { key: string; label: string; value: number }[];
    registrationsEvolution: { key: string; label: string; value: number }[];
    activitiesByStatus: { label: string; count: number }[];
    donationsByMethod: { label: string; count: number }[];
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
  secondaryCharts,
}: DashboardContentProps) {
  const t = useTranslations("adminDashboard");
  const [stats, setStats] = useState(initialGlobalStats);
  const distributions = initialModuleDistributions;
  const [isRefreshing, startRefresh] = useTransition();

  const handleRefreshStats = () => {
    startRefresh(async () => {
      const updated = await recomputeGlobalStats();
      setStats(updated);
      toast.success("Statistiques recalculées depuis les données réelles");
    });
  };

  const kpis = [
    { title: t("kpi.activities"), key: "totalSoulsWon", value: stats?.totalSoulsWon || 0 },
    { title: t("kpi.schools"), key: "schoolsVisited", value: stats?.schoolsVisited || 0 },
    { title: t("kpi.markets"), key: "marketOutreach", value: stats?.marketOutreach || 0 },
    { title: t("kpi.crusades"), key: "totalCrusades", value: stats?.totalCrusades || 0 },
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-lifac-navy-900">Statistiques clés</h2>
          {stats?.updatedAt && (
            <p className="text-xs text-gray-400">
              Dernière mise à jour : {new Date(stats.updatedAt).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
            </p>
          )}
        </div>
        <button
          onClick={handleRefreshStats}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 text-xs font-medium text-lifac-red-600 hover:text-lifac-red-700 px-3 py-1.5 rounded-full border border-lifac-red-600/20 hover:bg-lifac-red-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={13} className={isRefreshing ? "animate-spin" : ""} />
          {isRefreshing ? "Calcul..." : "Rafraîchir depuis les données réelles"}
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">{kpi.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-lifac-navy-900">{kpi.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* KPIs ministère (attendance, décisions pour Christ, convertis, églises partenaires, agents actifs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-5">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 mb-3">
              <Users className="h-5 w-5 text-indigo-600" />
            </div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Attendance total</p>
            <p className="font-display text-2xl font-bold text-lifac-navy-900 mt-1">{extendedMetrics.attendanceTotal}</p>
          </CardContent>
        </Card>
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

      {/* 4 graphiques complémentaires (dons, inscriptions, activités par statut, méthodes de paiement) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <HeartHandshake className="h-4 w-4 text-lifac-red-600" />
            <CardTitle>Évolution des dons (6 derniers mois)</CardTitle>
          </CardHeader>
          <CardContent>
            <MiniLineChart points={secondaryCharts.donationsEvolution} formatValue={(v) => `${Math.round(v / 1000)}k`} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <PartyPopper className="h-4 w-4 text-lifac-red-600" />
            <CardTitle>Inscriptions aux événements (6 derniers mois)</CardTitle>
          </CardHeader>
          <CardContent>
            <MiniLineChart points={secondaryCharts.registrationsEvolution} formatValue={(v) => String(Math.round(v))} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <CalendarClock className="h-4 w-4 text-lifac-red-600" />
            <CardTitle>Activités par statut</CardTitle>
          </CardHeader>
          <CardContent>
            {secondaryCharts.activitiesByStatus.length === 0 ? (
              <p className="text-sm text-gray-500 py-2">Aucune activité enregistrée.</p>
            ) : (
              <HorizontalBarList items={secondaryCharts.activitiesByStatus.map((a) => ({ label: a.label, count: a.count }))} />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Wallet className="h-4 w-4 text-lifac-red-600" />
            <CardTitle>Dons par méthode de paiement</CardTitle>
          </CardHeader>
          <CardContent>
            {secondaryCharts.donationsByMethod.length === 0 ? (
              <p className="text-sm text-gray-500 py-2">Aucun don confirmé pour le moment.</p>
            ) : (
              <HorizontalBarList items={secondaryCharts.donationsByMethod.map((d) => ({ label: d.label, count: d.count }))} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Distribution & Recent Activities */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle>{t("distribution")}</CardTitle>
            <p className="text-xs text-gray-400">Calculée à partir de toutes les activités enregistrées, par type.</p>
          </CardHeader>
          <CardContent>
            {distributions.length === 0 ? (
              <p className="text-sm text-gray-500 py-4">Aucune activité enregistrée pour le moment.</p>
            ) : (
            <>
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
            </>
            )}
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

    </div>
  );
}

function MiniLineChart({
  points,
  formatValue,
}: {
  points: { key: string; label: string; value: number }[];
  formatValue: (v: number) => string;
}) {
  const width = 100;
  const height = 40;
  const max = Math.max(1, ...points.map((p) => p.value));
  const stepX = points.length > 1 ? width / (points.length - 1) : 0;
  const coords = points.map((p, i) => ({
    x: i * stepX,
    y: height - (p.value / max) * (height - 4) - 2,
  }));
  const linePath = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`).join(" ");
  const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;
  const total = points.reduce((sum, p) => sum + p.value, 0);

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-32" preserveAspectRatio="none">
        <path d={areaPath} fill="rgba(220,38,38,0.08)" />
        <path d={linePath} fill="none" stroke="#DC2626" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
        {coords.map((c, i) => (
          <circle key={i} cx={c.x} cy={c.y} r={1.4} fill="#DC2626" vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
      <div className="flex justify-between text-[11px] text-gray-400 mt-1">
        {points.map((p) => (
          <span key={p.key} className="capitalize">{p.label}</span>
        ))}
      </div>
      <p className="text-xs text-gray-400 mt-2">Total sur la période : {formatValue(total)}</p>
    </div>
  );
}

function HorizontalBarList({ items }: { items: { label: string; count: number }[] }) {
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <span className="w-32 shrink-0 text-sm text-lifac-navy-900 truncate">{item.label}</span>
          <div className="flex-1 h-2.5 rounded-full bg-gray-100 overflow-hidden">
            <div className="h-full rounded-full bg-lifac-red-600" style={{ width: `${(item.count / max) * 100}%` }} />
          </div>
          <span className="w-6 text-right text-sm font-semibold text-lifac-navy-900">{item.count}</span>
        </div>
      ))}
    </div>
  );
}
