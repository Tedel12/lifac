"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { KPIUpdateModal } from "./kpi-update-modal";
import { DistributionUpdateModal } from "./distribution-update-modal";

interface DashboardContentProps {
  initialGlobalStats: any;
  initialModuleDistributions: any[];
}

export default function DashboardContent({ initialGlobalStats, initialModuleDistributions }: DashboardContentProps) {
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

  const recentActivities = [
    { id: 1, title: "Croisade Tokpa Domè", date: "01/07/2026", status: "Terminé" },
    { id: 2, title: "Formation Ste Rita", date: "30/06/2026", status: "Terminé" },
    { id: 3, title: "Visite Lycée Moderne", date: "29/06/2026", status: "En cours" },
  ];

  return (
    <div className="space-y-8">
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
            <button className="text-sm text-lifac-red-600 font-semibold">{t("seeAll")}</button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((act) => (
                <div key={act.id} className="flex items-center justify-between p-3 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium text-lifac-navy-900">{act.title}</p>
                    <p className="text-xs text-gray-500">{act.date}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${act.status === 'Terminé' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                    {act.status}
                  </span>
                </div>
              ))}
            </div>
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
