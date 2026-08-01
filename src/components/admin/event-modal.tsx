"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { createEvent, updateEvent } from "@/actions/admin-events-actions";
import { EventStatus, EventType } from "@prisma/client";
import { toast } from "sonner";

const EVENT_TYPE_LABELS: Record<string, string> = {
  CRUSADE: "Croisade",
  POP_UP_CRUSADE: "Pop-Up Crusade",
  SCHOOL_OUTREACH: "Évangélisation école",
  MARKET_OUTREACH: "Évangélisation marché",
  ONE_ON_ONE: "Évangélisation personnelle",
  YOUTH_CAMP: "Camp de jeunes",
  TRAINING: "Formation",
  HUMANITARIAN_MISSION: "Mission humanitaire",
  PRAYER_MEETING: "Réunion de prière",
};

const EVENT_STATUS_LABELS: Record<string, string> = {
  UPCOMING: "À venir",
  ONGOING: "En cours",
  COMPLETED: "Terminé",
  CANCELED: "Annulé",
};

function toDateTimeLocal(date: any) {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 16);
}

export function EventModal({ isOpen, onClose, event, onUpdate }: any) {
  const [formData, setFormData] = useState(
    event
      ? {
          ...event,
          startDate: toDateTimeLocal(event.startDate),
          endDate: toDateTimeLocal(event.endDate),
        }
      : {
          title: "",
          shortDescription: "",
          description: "",
          type: EventType.CRUSADE,
          status: EventStatus.UPCOMING,
          startDate: "",
          endDate: "",
          location: "",
          address: "",
          city: "",
          country: "Bénin",
          maxAttendees: "",
          requiresRegistration: true,
          coverImageUrl: "",
          isFeatured: false,
        }
  );

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.startDate || !formData.location.trim()) {
      toast.error("Titre, date de début et lieu sont obligatoires");
      return;
    }
    if (event) {
      await updateEvent(event.id, formData);
      toast.success("Événement mis à jour");
    } else {
      await createEvent(formData);
      toast.success("Événement créé");
    }
    onUpdate && onUpdate();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl relative">
        <button onClick={onClose} className="absolute top-2 right-2 p-2 hover:bg-gray-100 rounded-full">
          <X size={18} />
        </button>

        <CardContent className="p-6">
          <fieldset className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
            <h3 className="font-bold text-lg">{event ? "Modifier l'événement" : "Créer un événement"}</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Type d&apos;événement</Label>
                <select
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  {Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => (
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
                  {Object.entries(EVENT_STATUS_LABELS).map(([value, label]) => (
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
                <Label>Date et heure de début</Label>
                <Input
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>Date et heure de fin</Label>
                <Input
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label>Lieu</Label>
                <Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Ville</Label>
                <Input value={formData.city ?? ""} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Pays</Label>
                <Input value={formData.country ?? "Bénin"} onChange={(e) => setFormData({ ...formData, country: e.target.value })} />
              </div>
            </div>

            <div className="space-y-1">
              <Label>Adresse précise</Label>
              <Input value={formData.address ?? ""} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Image de couverture (URL)</Label>
                <Input
                  value={formData.coverImageUrl ?? ""}
                  onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-1">
                <Label>Capacité max.</Label>
                <Input
                  type="number"
                  value={formData.maxAttendees ?? ""}
                  onChange={(e) => setFormData({ ...formData, maxAttendees: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center gap-6 pt-1">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={!!formData.requiresRegistration}
                  onChange={(e) => setFormData({ ...formData, requiresRegistration: e.target.checked })}
                />
                Inscription requise
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={!!formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                />
                Événement vedette (mis en avant sur /events)
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
