"use client";

import { useState } from "react";
import { Search, Plus, Filter, Trash2, Edit, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { deleteEvent, getEvents } from "@/actions/admin-events-actions";
import { EventStatus } from "@prisma/client";
import { EventModal } from "@/components/admin/event-modal";
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

const STATUS_LABELS: Record<string, string> = {
  UPCOMING: "À venir",
  ONGOING: "En cours",
  COMPLETED: "Terminé",
  CANCELED: "Annulé",
};

const STATUS_COLORS: Record<string, string> = {
  UPCOMING: "bg-blue-100 text-blue-700",
  ONGOING: "bg-amber-100 text-amber-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  CANCELED: "bg-red-100 text-red-700",
};

export default function EventsPage({ events: initialEvents }: { events: any[] }) {
  const [events, setEvents] = useState(initialEvents);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<EventStatus | "ALL">("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const refresh = async () => {
    const updated = await getEvents({ search, status: statusFilter });
    setEvents(updated);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Supprimer cet événement ?")) {
      await deleteEvent(id);
      await refresh();
      toast.success("Événement supprimé");
    }
  };

  const handleEdit = (event: any) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Gestion des événements"
        description="Créez et gérez les événements publiés sur la page publique /events."
        action={
          <Button
            onClick={() => {
              setSelectedEvent(null);
              setIsModalOpen(true);
            }}
          >
            <Plus size={18} className="mr-2" /> Créer un événement
          </Button>
        }
      />

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Rechercher par titre, ville ou lieu..."
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

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 uppercase font-medium">
              <tr>
                <th className="px-6 py-4">Titre</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Lieu</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {events.length > 0 ? (
                events.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">
                      <div className="flex items-center gap-2">
                        {event.isFeatured && <Star size={14} className="text-lifac-red-600 fill-lifac-red-600" />}
                        {event.title}
                      </div>
                    </td>
                    <td className="px-6 py-4">{EVENT_TYPE_LABELS[event.type] ?? event.type}</td>
                    <td className="px-6 py-4">
                      {new Date(event.startDate).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-6 py-4">
                      {event.location}
                      {event.city ? `, ${event.city}` : ""}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${STATUS_COLORS[event.status] ?? "bg-gray-100 text-gray-700"}`}>
                        {STATUS_LABELS[event.status] ?? event.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-1">
                        <Button variant="ghost" size="sm" className="text-blue-600 text-xs gap-1" onClick={() => handleEdit(event)}>
                          <Edit size={14} />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600 text-xs gap-1" onClick={() => handleDelete(event.id)}>
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center p-6 text-gray-500">
                    Aucun événement trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {isModalOpen && (
        <EventModal isOpen={true} onClose={() => setIsModalOpen(false)} event={selectedEvent} onUpdate={refresh} />
      )}
    </div>
  );
}
