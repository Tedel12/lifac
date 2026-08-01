"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { createCampaign, updateCampaign } from "@/actions/admin-campaigns-actions";
import { CampaignStatus, CampaignType } from "@prisma/client";
import { toast } from "sonner";

const TYPE_LABELS: Record<string, string> = {
  HUMANITARIAN: "Humanitaire",
  EVANGELISM: "Évangélisation",
  EMERGENCY: "Urgence",
  CONSTRUCTION: "Construction",
  EDUCATION: "Éducation",
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Brouillon",
  ACTIVE: "Active",
  COMPLETED: "Objectif atteint",
  CLOSED: "Fermée",
  ARCHIVED: "Archivée",
};

export function CampaignModal({ isOpen, onClose, campaign, onUpdate }: any) {
  const [formData, setFormData] = useState(
    campaign
      ? {
          ...campaign,
          goalAmount: (Number(campaign.goalAmount) / 100).toString(),
          startDate: campaign.startDate ? new Date(campaign.startDate).toISOString().slice(0, 10) : "",
          endDate: campaign.endDate ? new Date(campaign.endDate).toISOString().slice(0, 10) : "",
        }
      : {
          title: "",
          shortDescription: "",
          description: "",
          type: CampaignType.HUMANITARIAN,
          status: CampaignStatus.DRAFT,
          goalAmount: "",
          coverImageUrl: "",
          startDate: "",
          endDate: "",
          location: "",
          isUrgent: false,
          isFeatured: false,
        }
  );

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.goalAmount) {
      toast.error("Titre et objectif de collecte sont obligatoires");
      return;
    }
    try {
      if (campaign) {
        await updateCampaign(campaign.id, formData);
        toast.success("Campagne mise à jour");
      } else {
        await createCampaign(formData);
        toast.success("Campagne créée");
      }
      onUpdate && onUpdate();
      onClose();
    } catch (e: any) {
      toast.error(e?.message ?? "Une erreur est survenue");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl relative">
        <button onClick={onClose} className="absolute top-2 right-2 p-2 hover:bg-gray-100 rounded-full">
          <X size={18} />
        </button>

        <CardContent className="p-6">
          <fieldset className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
            <h3 className="font-bold text-lg">{campaign ? "Modifier la campagne" : "Créer une campagne"}</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Type de campagne</Label>
                <select
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  {Object.entries(TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label>Statut</Label>
                <select
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <Label>Titre</Label>
              <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
            </div>

            <div className="space-y-1">
              <Label>Description courte (max 280 caractères)</Label>
              <Input
                maxLength={280}
                value={formData.shortDescription ?? ""}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <Label>Description complète</Label>
              <textarea
                className="w-full border rounded-md px-3 py-2 text-sm min-h-[90px]"
                value={formData.description ?? ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Objectif de collecte (XOF)</Label>
                <Input
                  type="number"
                  value={formData.goalAmount}
                  onChange={(e) => setFormData({ ...formData, goalAmount: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>Localisation</Label>
                <Input value={formData.location ?? ""} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Date de début</Label>
                <Input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Date de fin</Label>
                <Input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} />
              </div>
            </div>

            <div className="space-y-1">
              <Label>Image de couverture (URL)</Label>
              <Input
                value={formData.coverImageUrl ?? ""}
                onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="flex items-center gap-6 pt-1">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={!!formData.isUrgent}
                  onChange={(e) => setFormData({ ...formData, isUrgent: e.target.checked })}
                />
                Urgente
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={!!formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                />
                Mise en avant
              </label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSubmit}>Sauvegarder</Button>
              <Button variant="outline" onClick={onClose}>
                Annuler
              </Button>
            </div>
          </fieldset>
        </CardContent>
      </Card>
    </div>
  );
}
