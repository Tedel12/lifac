import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboardPage() {
  const kpis = [
    { title: "Activités exécutées", value: "127", change: "+18% ce mois" },
    { title: "Personnes touchées", value: "25 430", change: "+22% ce mois" },
    { title: "Décisions pour Christ", value: "17 821", change: "+119% ce mois" },
    { title: "Taux d'efficacité", value: "70,1%", change: "+4,3% ce mois" },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-lifac-navy-900">Tableau de bord</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">{kpi.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-lifac-navy-900">{kpi.value}</div>
              <p className="text-sm text-green-600 font-medium">{kpi.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
