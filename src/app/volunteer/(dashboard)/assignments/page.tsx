import Link from "next/link";
import { MapPin, Calendar, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getMySchools, getMyActivities } from "@/actions/volunteer-actions";

export const dynamic = "force-dynamic";

const ACTIVITY_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Brouillon",
  PLANNED: "Planifiée",
  CONFIRMED: "Confirmée",
  ONGOING: "En cours",
  COMPLETED: "Terminée",
  POSTPONED: "Reportée",
  CANCELED: "Annulée",
};

export default async function VolunteerAssignmentsPage() {
  const [schools, upcomingActivities] = await Promise.all([
    getMySchools(),
    getMyActivities({ upcoming: true }),
  ]);

  return (
    <div className="space-y-6 animate-fade-in">
      <AdminPageHeader
        title="Mes affectations"
        description="Les écoles qui vous sont confiées et vos prochaines activités de terrain."
      />

      <div>
        <h2 className="font-display text-lg font-bold text-lifac-navy-900 mb-4">
          Mes écoles ({schools.length})
        </h2>
        {schools.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-sm text-gray-500">Aucune école ne vous est assignée pour le moment.</CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {schools.map((school) => (
              <Card key={school.id} className="hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-5 space-y-2">
                  <h3 className="font-bold text-lifac-navy-900">{school.name}</h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-lifac-red-600 shrink-0" />
                    {school.commune}, {school.department}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-lifac-red-600 shrink-0" />
                    {school.phone}
                  </p>
                  <span className="inline-block mt-1 px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                    {school.status}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="font-display text-lg font-bold text-lifac-navy-900 mb-4">
          Activités à venir ({upcomingActivities.length})
        </h2>
        {upcomingActivities.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-sm text-gray-500">Aucune activité à venir ne vous est assignée.</CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0 divide-y divide-gray-100">
              {upcomingActivities.map((a) => (
                <div key={a.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="font-medium text-lifac-navy-900">{a.title}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                      <Calendar className="h-3.5 w-3.5 text-lifac-red-600" />
                      {new Date(a.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
                      {a.commune ? ` — ${a.commune}` : ""}
                    </p>
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                    {ACTIVITY_STATUS_LABELS[a.status] ?? a.status}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
