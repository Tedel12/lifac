import Link from "next/link";
import { School, CalendarDays, HeartHandshake, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getCurrentAgentName } from "@/actions/auth";
import { getMyOverview, getMyActivities } from "@/actions/volunteer-actions";

export const dynamic = "force-dynamic";

export default async function VolunteerDashboardPage() {
  const [agentName, overview, upcoming] = await Promise.all([
    getCurrentAgentName(),
    getMyOverview(),
    getMyActivities({ upcoming: true }),
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
