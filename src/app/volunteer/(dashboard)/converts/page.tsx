import { HeartHandshake, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getMyOverview, getMyActivities } from "@/actions/volunteer-actions";

export const dynamic = "force-dynamic";

export default async function VolunteerConvertsPage() {
  const [overview, activities] = await Promise.all([
    getMyOverview(),
    getMyActivities({ upcoming: false }),
  ]);

  const withResults = activities.filter(
    (a) => (a.decisionsForChrist ?? 0) > 0 || (a.newContacts ?? 0) > 0
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <AdminPageHeader
        title="Nouveaux convertis"
        description="LiFAC ne suit pas encore les décisions individuellement — voici le cumul par activité que vous avez menée."
      />

      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="hover:-translate-y-1 transition-transform duration-300">
          <CardContent className="p-5">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 mb-3">
              <HeartHandshake className="h-5 w-5 text-lifac-red-600" />
            </div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Décisions pour Christ (cumul)</p>
            <p className="font-display text-3xl font-bold text-lifac-navy-900 mt-1">{overview.totalDecisions}</p>
          </CardContent>
        </Card>
        <Card className="hover:-translate-y-1 transition-transform duration-300">
          <CardContent className="p-5">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 mb-3">
              <Users className="h-5 w-5 text-lifac-red-600" />
            </div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Nouveaux contacts (cumul)</p>
            <p className="font-display text-3xl font-bold text-lifac-navy-900 mt-1">{overview.totalNewContacts}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-6 border-b border-gray-100">
            <h2 className="font-display text-lg font-bold text-lifac-navy-900">Détail par activité</h2>
          </div>
          {withResults.length === 0 ? (
            <p className="p-6 text-sm text-gray-500">
              Aucun résultat enregistré pour l&apos;instant — complétez vos comptes-rendus depuis
              la page Rapports.
            </p>
          ) : (
            <div className="divide-y divide-gray-100">
              {withResults.map((a) => (
                <div key={a.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium text-lifac-navy-900">{a.title}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(a.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
                    </p>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <span className="text-lifac-navy-700">
                      <strong>{a.decisionsForChrist ?? 0}</strong> décisions
                    </span>
                    <span className="text-lifac-navy-700">
                      <strong>{a.newContacts ?? 0}</strong> contacts
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
