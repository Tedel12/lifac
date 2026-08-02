import Link from "next/link";
import { School, CalendarDays, HeartHandshake, Users, TrendingUp, Sparkles, PieChart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getCurrentAgentName } from "@/actions/auth";
import { getMyOverview, getMyActivities, getMyChartData } from "@/actions/volunteer-actions";

export const dynamic = "force-dynamic";

export default async function VolunteerDashboardPage() {
  const [agentName, overview, upcoming, chartData] = await Promise.all([
    getCurrentAgentName(),
    getMyOverview(),
    getMyActivities({ upcoming: true }),
    getMyChartData(),
  ]);

  const stats = [
    { icon: School, label: "Écoles assignées", value: overview.schoolsCount, bg: "bg-lifac-red-50" },
    { icon: CalendarDays, label: "Activités à venir", value: overview.upcomingActivitiesCount, bg: "bg-blue-50" },
    { icon: HeartHandshake, label: "Décisions pour Christ (cumul)", value: overview.totalDecisions, bg: "bg-emerald-50" },
    { icon: Users, label: "Nouveaux contacts (cumul)", value: overview.totalNewContacts, bg: "bg-amber-50" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <AdminPageHeader
        title={`Bienvenue, ${agentName ?? "Missionnaire"} !`}
        description="Voici un aperçu de vos affectations et de votre impact sur le terrain."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="hover:-translate-y-1 transition-transform duration-300">
            <CardContent className="p-5">
              <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${s.bg} mb-3`}>
                <s.icon className="h-5 w-5 text-lifac-red-600" />
              </div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">{s.label}</p>
              <p className="font-display text-2xl font-bold text-lifac-navy-900 mt-1">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <TrendingUp className="h-4 w-4 text-lifac-red-600" />
            <CardTitle className="text-sm">Mes activités (6 mois)</CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const max = Math.max(1, ...chartData.monthlyActivity.map((m) => m.activities));
              return (
                <div className="flex items-end gap-2 h-28">
                  {chartData.monthlyActivity.map((m) => (
                    <div key={m.key} className="flex-1 flex flex-col items-center justify-end h-full gap-1">
                      <span className="text-[10px] font-semibold text-lifac-navy-900">{m.activities}</span>
                      <div
                        className="w-full max-w-6 rounded-t-md bg-lifac-red-500/80"
                        style={{ height: `${Math.max(4, (m.activities / max) * 100)}%` }}
                      />
                      <span className="text-[9px] text-gray-400 capitalize">{m.label}</span>
                    </div>
                  ))}
                </div>
              );
            })()}
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Sparkles className="h-4 w-4 text-lifac-red-600" />
            <CardTitle className="text-sm">Décisions pour Christ (6 mois)</CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const points = chartData.monthlyActivity;
              const max = Math.max(1, ...points.map((p) => p.decisions));
              const width = 100;
              const height = 40;
              const stepX = points.length > 1 ? width / (points.length - 1) : 0;
              const coords = points.map((p, i) => ({ x: i * stepX, y: height - (p.decisions / max) * (height - 4) - 2 }));
              const linePath = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`).join(" ");
              const total = points.reduce((sum, p) => sum + p.decisions, 0);
              return (
                <div>
                  <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-24" preserveAspectRatio="none">
                    <path d={linePath} fill="none" stroke="#DC2626" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
                    {coords.map((c, i) => (
                      <circle key={i} cx={c.x} cy={c.y} r={1.4} fill="#DC2626" vectorEffect="non-scaling-stroke" />
                    ))}
                  </svg>
                  <p className="text-xs text-gray-400 mt-2">Total sur la période : {total}</p>
                </div>
              );
            })()}
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <PieChart className="h-4 w-4 text-lifac-red-600" />
            <CardTitle className="text-sm">Mes activités par type</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.activitiesByType.length === 0 ? (
              <p className="text-xs text-gray-500 py-2">Aucune activité assignée pour le moment.</p>
            ) : (
              <div className="space-y-2.5">
                {(() => {
                  const max = Math.max(1, ...chartData.activitiesByType.map((t) => t.count));
                  return chartData.activitiesByType.map((t) => (
                    <div key={t.label} className="flex items-center gap-2">
                      <span className="w-24 shrink-0 text-xs text-lifac-navy-900 truncate">{t.label}</span>
                      <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div className="h-full rounded-full bg-lifac-red-600" style={{ width: `${(t.count / max) * 100}%` }} />
                      </div>
                      <span className="w-5 text-right text-xs font-semibold text-lifac-navy-900">{t.count}</span>
                    </div>
                  ));
                })()}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-lifac-navy-900">Prochaines activités</h2>
            <Link href="/volunteer/assignments" className="text-sm text-lifac-red-600 font-semibold hover:underline">
              Voir tout
            </Link>
          </div>
          {upcoming.length === 0 ? (
            <p className="p-6 text-sm text-gray-500">Aucune activité à venir ne vous est actuellement assignée.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {upcoming.slice(0, 5).map((a) => (
                <div key={a.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="font-medium text-lifac-navy-900">{a.title}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(a.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
                      {a.commune ? ` — ${a.commune}` : ""}
                    </p>
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">{a.status}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
