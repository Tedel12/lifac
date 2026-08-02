"use client";

import { useState, useEffect } from "react";
import { Download, FileText, HeartHandshake, IdCard, CalendarDays, School } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getAgents } from "@/actions/admin-agent-actions";

const REPORTS = [
  {
    key: "donations",
    icon: HeartHandshake,
    title: "Dons",
    desc: "Référence, donateur, campagne, montant, statut et méthode de paiement.",
    endpoint: "/admin/reports/donations",
    supportsCity: false,
    supportsZone: false,
  },
  {
    key: "registrations",
    icon: IdCard,
    title: "Inscriptions aux événements",
    desc: "Participants inscrits, coordonnées, événement et statut d'inscription.",
    endpoint: "/admin/reports/registrations",
    supportsCity: true,
    supportsZone: false,
  },
  {
    key: "activities",
    icon: CalendarDays,
    title: "Activités de terrain",
    desc: "Toutes les activités avec leurs indicateurs d'impact (décisions, participants).",
    endpoint: "/admin/reports/activities",
    supportsCity: false,
    supportsZone: true,
  },
  {
    key: "schools",
    icon: School,
    title: "Écoles",
    desc: "Écoles enregistrées, commune, département, missionnaire affecté et statut.",
    endpoint: "/admin/reports/schools",
    supportsCity: false,
    supportsZone: true,
  },
];

export default function ReportsPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [agentId, setAgentId] = useState("");
  const [commune, setCommune] = useState("");
  const [department, setDepartment] = useState("");
  const [agents, setAgents] = useState<any[]>([]);

  useEffect(() => {
    getAgents().then(setAgents);
  }, []);

  const buildUrl = (report: (typeof REPORTS)[number], format: "csv" | "pdf") => {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (report.supportsZone) {
      if (agentId) params.set("agentId", agentId);
      if (commune) params.set("commune", commune);
      if (report.key === "schools" && department) params.set("department", department);
    }
    if (report.supportsCity && commune) params.set("city", commune);
    params.set("format", format);
    return `${report.endpoint}?${params.toString()}`;
  };

  const hasFilters = from || to || agentId || commune || department;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Rapports"
        description="Exportez les données LiFAC au format CSV (compatible Excel) ou PDF, avec filtres de période, missionnaire et zone."
      />

      <Card>
        <CardContent className="p-5 flex flex-wrap items-end gap-4">
          <div className="space-y-1">
            <Label>Depuis le</Label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Jusqu&apos;au</Label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Missionnaire</Label>
            <select
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900"
            >
              <option value="">Tous</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label>Commune / Ville</Label>
            <Input
              placeholder="Ex : Abomey-Calavi"
              value={commune}
              onChange={(e) => setCommune(e.target.value)}
              className="w-44"
            />
          </div>
          <div className="space-y-1">
            <Label>Département (écoles)</Label>
            <Input
              placeholder="Ex : Atlantique"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-44"
            />
          </div>
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFrom("");
                setTo("");
                setAgentId("");
                setCommune("");
                setDepartment("");
              }}
            >
              Réinitialiser
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {REPORTS.map((report) => (
          <Card key={report.key}>
            <CardContent className="p-6 space-y-4">
              <div className="h-11 w-11 rounded-full bg-lifac-red-600/10 flex items-center justify-center">
                <report.icon className="h-5 w-5 text-lifac-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-lifac-navy-900">{report.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{report.desc}</p>
              </div>
              <div className="flex gap-2">
                <a href={buildUrl(report, "csv")} download className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    <Download size={16} className="mr-2" /> CSV
                  </Button>
                </a>
                <a href={buildUrl(report, "pdf")} download className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    <FileText size={16} className="mr-2" /> PDF
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
