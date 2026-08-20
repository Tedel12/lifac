"use client";

import { useState, useEffect } from "react";
import {
  getAllPrayerRequests,
  createPrayerRequestAdmin,
  togglePrayerAnswered,
  deletePrayerRequest,
} from "@/actions/admin-prayer-actions";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, Trash2, CheckCircle2, Flame } from "lucide-react";
import { PRAYER_CATEGORY_LABELS } from "@/lib/utils";
import { toast } from "sonner";

const CATEGORY_COLORS: Record<string, string> = {
  PROTECTION: "bg-blue-100 text-blue-700",
  SALUT: "bg-emerald-100 text-emerald-700",
  GUERISON: "bg-amber-100 text-amber-700",
  DELIVRANCE: "bg-purple-100 text-purple-700",
  AUTRE: "bg-gray-100 text-gray-700",
};

export default function AdminPrayerPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    setRequests(await getAllPrayerRequests());
    setLoading(false);
  };

  const handleToggleAnswered = async (r: any) => {
    await togglePrayerAnswered(r.id, !r.isAnswered);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette demande de prière ?")) return;
    await deletePrayerRequest(id);
    toast.success("Demande supprimée");
    load();
  };

  return (
    <div className="p-8 space-y-8">
      <AdminPageHeader
        title="Intercession"
        description="Toutes les demandes de prière remontées par le site public et par les équipes de terrain."
        action={
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Ajouter une intercession
          </Button>
        }
      />

      {loading ? (
        <p className="text-sm text-gray-500">Chargement...</p>
      ) : requests.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-gray-500">
            Aucune demande de prière enregistrée.
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {requests.map((r) => (
            <Card key={r.id} className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-5 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4 text-lifac-red-600 shrink-0" />
                    <h3 className="font-bold text-lifac-navy-900 text-sm">{r.title}</h3>
                  </div>
                  <span className={`shrink-0 px-2 py-0.5 rounded-full text-[11px] font-medium ${CATEGORY_COLORS[r.category] ?? CATEGORY_COLORS.AUTRE}`}>
                    {PRAYER_CATEGORY_LABELS[r.category] ?? r.category}
                  </span>
                </div>
                <p className="text-sm text-lifac-navy-700 leading-relaxed">{r.content}</p>
                <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                  <span>{r.authorName}</span>
                  <span>{r.prayerCount} prière(s)</span>
                </div>
                {r.intercessions?.length > 0 && (
                  <p className="text-[11px] text-gray-400 italic truncate">
                    Ont prié : {r.intercessions.map((i: any) => i.intercessorName).join(", ")}
                  </p>
                )}
                <div className="flex gap-2 pt-1">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => handleToggleAnswered(r)}>
                    <CheckCircle2 className={`h-3.5 w-3.5 mr-1.5 ${r.isAnswered ? "text-emerald-600" : ""}`} />
                    {r.isAnswered ? "Exaucée" : "Marquer exaucée"}
                  </Button>
                  <Button size="sm" variant="outline" className="text-lifac-red-600" onClick={() => handleDelete(r.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {formOpen && (
        <NewPrayerModal
          onClose={() => setFormOpen(false)}
          onCreated={() => {
            setFormOpen(false);
            load();
          }}
        />
      )}
    </div>
  );
}

function NewPrayerModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [category, setCategory] = useState("AUTRE");
  const [isPublic, setIsPublic] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const result = await createPrayerRequestAdmin({
        title,
        content,
        authorName,
        category: category as any,
        isPublic,
      });
      if (!result.success) {
        toast.error(result.error ?? "Erreur lors de l'enregistrement");
        return;
      }
      toast.success("Intercession ajoutée");
      onCreated();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-2 right-2 p-2 hover:bg-gray-100 rounded-full">
          <X size={18} />
        </button>
        <CardContent className="p-6 space-y-4">
          <h3 className="font-bold text-lg text-lifac-navy-900">Ajouter une intercession</h3>

          <div className="space-y-1">
            <Label>Personne concernée</Label>
            <Input value={authorName} onChange={(e) => setAuthorName(e.target.value)} placeholder="Nom (ou Équipe LiFAC)" />
          </div>

          <div className="space-y-1">
            <Label>Sujet de prière</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="space-y-1">
            <Label>Catégorie</Label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900"
            >
              {Object.entries(PRAYER_CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <Label>Détail de la demande</Label>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={1000}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="h-4 w-4" />
            Visible sur le mur de prière public
          </label>

          <div className="flex gap-2 pt-2">
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? "Enregistrement..." : "Enregistrer"}
            </Button>
            <Button variant="outline" onClick={onClose}>Annuler</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
