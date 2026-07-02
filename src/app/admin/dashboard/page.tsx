import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboardPage() {
  const kpis = [
    { title: "Activités réalisées", value: "127" },
    { title: "Écoles visitées", value: "45" },
    { title: "Marchés visités", value: "32" },
    { title: "Nombre de croisades", value: "14" },
    { title: "Attendance total", value: "25 430" },
    { title: "Décisions pour Christ", value: "17 821" },
    { title: "Nouveaux convertis", value: "1 250" },
    { title: "Agents actifs", value: "85" },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-lifac-navy-900">Tableau de bord Administrateur</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => (
          <Card key={kpi.title} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">{kpi.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-lifac-navy-900">{kpi.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
