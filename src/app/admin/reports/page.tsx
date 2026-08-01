"use client";

import { useState } from "react";
import { Download, HeartHandshake, IdCard, CalendarDays } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

const REPORTS = [
  {
    key: "donations",
    icon: HeartHandshake,
    title: "Dons",
    desc: "Référence, donateur, campagne, montant, statut et méthode de paiement.",
    endpoint: "/admin/reports/donations",
  },
  {
    key: "registrations",
    icon: IdCard,
    title: "Inscriptions aux événements",
    desc: "Participants inscrits, coordonnées, événement et statut d'inscription.",
    endpoint: "/admin/reports/registrations",
  },
  {
    key: "activities",
    icon: CalendarDays,
    title: "Activités de terrain",
    desc: "Toutes les activités avec leurs indicateurs d'impact (décisions, participants).",
    endpoint: "/admin/reports/activities",
  },
];

export default function ReportsPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const buildUrl = (endpoint: string) => {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    const qs = params.toString();
    return qs ? `${endpoint}?${qs}` : endpoint;
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Rapports"
        description="Exportez les données LiFAC au format CSV (compatible Excel), avec filtre de période optionnel."
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
          {(from || to) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFrom("");
                setTo("");
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
              <a href={buildUrl(report.endpoint)} download>
                <Button variant="outline" size="sm" className="w-full">
                  <Download size={16} className="mr-2" /> Exporter en CSV
                </Button>
              </a>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
