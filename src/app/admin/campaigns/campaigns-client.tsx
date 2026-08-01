"use client";

import { useState } from "react";
import { Search, Plus, Filter, Trash2, Edit, Flame } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { deleteCampaign, getCampaigns } from "@/actions/admin-campaigns-actions";
import { CampaignStatus } from "@prisma/client";
import { CampaignModal } from "@/components/admin/campaign-modal";
import { formatAmountXof } from "@/lib/fedapay";
import { toast } from "sonner";

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Brouillon",
  ACTIVE: "Active",
  COMPLETED: "Objectif atteint",
  CLOSED: "Fermée",
  ARCHIVED: "Archivée",
};

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  ACTIVE: "bg-emerald-100 text-emerald-700",
  COMPLETED: "bg-blue-100 text-blue-700",
  CLOSED: "bg-amber-100 text-amber-700",
  ARCHIVED: "bg-gray-200 text-gray-700",
};

export default function CampaignsPage({ campaigns: initialCampaigns }: { campaigns: any[] }) {
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | "ALL">("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);

  const refresh = async () => {
    const updated = await getCampaigns({ search, status: statusFilter });
    setCampaigns(updated.map((c: any) => ({ ...c, goalAmount: Number(c.goalAmount), currentAmount: Number(c.currentAmount) })));
  };

  const handleDelete = async (id: string) => {
    if (confirm("Supprimer cette campagne ? Les dons associés perdront leur lien de campagne.")) {
      await deleteCampaign(id);
      await refresh();
      toast.success("Campagne supprimée");
    }
  };

  const handleEdit = (campaign: any) => {
    setSelectedCampaign(campaign);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Gestion des campagnes"
        description="Créez et suivez les campagnes de collecte de dons."
        action={
          <Button
            onClick={() => {
              setSelectedCampaign(null);
              setIsModalOpen(true);
            }}
          >
            <Plus size={18} className="mr-2" /> Créer une campagne
          </Button>
        }
      />

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Rechercher par titre..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && refresh()}
          />
        </div>
        <select
          className="border rounded-md px-3 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
        >
          <option value="ALL">Tous les statuts</option>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <Button onClick={refresh} variant="outline">
          <Filter size={18} className="mr-2" /> Filtrer
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {campaigns.length > 0 ? (
          campaigns.map((c) => {
            const progress = c.goalAmount > 0 ? Math.min(100, Math.round((c.currentAmount / c.goalAmount) * 100)) : 0;
            return (
              <Card key={c.id}>
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-lifac-navy-900 leading-tight flex items-center gap-1.5">
                      {c.isUrgent && <Flame size={14} className="text-lifac-red-600 shrink-0" />}
                      {c.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs shrink-0 ${STATUS_COLORS[c.status] ?? "bg-gray-100 text-gray-700"}`}>
                      {STATUS_LABELS[c.status] ?? c.status}
                    </span>
                  </div>
                  <div>
                    <Progress value={progress} size="sm" variant="green" />
                    <div className="flex justify-between text-xs text-gray-500 mt-1.5">
                      <span className="font-semibold text-lifac-navy-900">{formatAmountXof(c.currentAmount)}</span>
                      <span>sur {formatAmountXof(c.goalAmount)}</span>
                    </div>
                  </div>
                  <div className="flex justify-end gap-1 pt-1">
                    <Button variant="ghost" size="sm" className="text-blue-600 text-xs gap-1" onClick={() => handleEdit(c)}>
                      <Edit size={14} /> Modifier
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600 text-xs gap-1" onClick={() => handleDelete(c.id)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <p className="text-gray-500 text-sm col-span-full text-center py-6">Aucune campagne trouvée</p>
        )}
      </div>

      {isModalOpen && (
        <CampaignModal isOpen={true} onClose={() => setIsModalOpen(false)} campaign={selectedCampaign} onUpdate={refresh} />
      )}
    </div>
  );
}
