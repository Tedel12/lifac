"use client";

import { useState, useTransition } from "react";
import { Flame, HandHeart, Plus, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { markPrayed, createPrayerRequestFromField } from "@/actions/volunteer-actions";
import { PRAYER_CATEGORY_LABELS } from "@/lib/utils";
import { toast } from "sonner";

interface PrayerItem {
  id: string;
  title: string;
  content: string;
  authorName: string;
  category: string;
  categoryLabel: string;
  prayerCount: number;
  intercessions: string[];
}

const CATEGORY_COLORS: Record<string, string> = {
  PROTECTION: "bg-blue-100 text-blue-700",
  SALUT: "bg-emerald-100 text-emerald-700",
  GUERISON: "bg-amber-100 text-amber-700",
  DELIVRANCE: "bg-purple-100 text-purple-700",
  AUTRE: "bg-gray-100 text-gray-700",
};

export function PrayerWallList({ requests }: { requests: PrayerItem[] }) {
  const [items, setItems] = useState(requests);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [formOpen, setFormOpen] = useState(false);

  const handlePray = (id: string) => {
    setPendingId(id);
    startTransition(async () => {
      await markPrayed(id);
      setItems((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, prayerCount: r.prayerCount + 1, intercessions: ["Vous", ...r.intercessions].slice(0, 3) }
            : r
        )
      );
      setPendingId(null);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Ajouter une intercession
        </Button>
      </div>

      {formOpen && <NewPrayerModal onClose={() => setFormOpen(false)} />}

      {items.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-gray-500">Aucune demande de prière publique pour le moment.</CardContent>
        </Card>
      ) : (
        <PrayerGrid items={items} onPray={handlePray} isPending={isPending} pendingId={pendingId} />
      )}
    </div>
  );
}

function PrayerGrid({
  items,
  onPray,
  isPending,
  pendingId,
}: {
  items: PrayerItem[];
  onPray: (id: string) => void;
  isPending: boolean;
  pendingId: string | null;
}) {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {items.map((r) => (
        <Card key={r.id} className="hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-lifac-red-600" />
                <h3 className="font-bold text-lifac-navy-900 text-sm">{r.title}</h3>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${CATEGORY_COLORS[r.category] ?? CATEGORY_COLORS.AUTRE}`}>
                {r.categoryLabel}
              </span>
            </div>
            <p className="text-sm text-lifac-navy-700 leading-relaxed">{r.content}</p>
            <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
              <span>{r.authorName}</span>
              <span>{r.prayerCount} prière(s)</span>
            </div>
            {r.intercessions.length > 0 && (
              <p className="text-[11px] text-gray-400 italic truncate">
                Ont prié récemment : {r.intercessions.join(", ")}
              </p>
            )}
            <Button
              size="sm"
              variant="outline"
              className="w-full mt-1"
              disabled={isPending && pendingId === r.id}
              onClick={() => onPray(r.id)}
            >
              <HandHeart className="h-3.5 w-3.5 mr-1.5" />
              {isPending && pendingId === r.id ? "..." : "J'ai prié"}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function NewPrayerModal({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [category, setCategory] = useState("AUTRE");
  const [isPublic, setIsPublic] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const result = await createPrayerRequestFromField({
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
      toast.success("Demande de prière enregistrée");
      onClose();
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
            <Input
              placeholder="Nom de la personne (ou laissez vide pour votre nom)"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
            />
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
            <Textarea rows={4} value={content} onChange={(e) => setContent(e.target.value)} maxLength={1000} />
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
