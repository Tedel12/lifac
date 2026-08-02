"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { getAllMedia, uploadMedia, deleteMedia } from "@/actions/admin-media-actions";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Trash2, X, FileText, Video, ImageIcon } from "lucide-react";
import { toast } from "sonner";

export default function MediaLibraryPage() {
  const [media, setMedia] = useState<any[]>([]);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    const data = await getAllMedia();
    setMedia(data);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce média de la médiathèque ?")) return;
    await deleteMedia(id);
    toast.success("Média supprimé");
    load();
  };

  return (
    <div className="p-8 space-y-8">
      <AdminPageHeader
        title="Médiathèque"
        description="Gérez les photos, vidéos et documents affichés sur la page Ressources du site public."
        action={
          <Button onClick={() => setUploadOpen(true)}>
            <Upload className="mr-2 h-4 w-4" /> Ajouter un média
          </Button>
        }
      />

      {loading ? (
        <p className="text-sm text-gray-500">Chargement...</p>
      ) : media.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-gray-500">
            Aucun média dans la bibliothèque pour le moment.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {media.map((m) => (
            <Card key={m.id} className="overflow-hidden group hover:shadow-lg transition-shadow duration-300">
              <div className="relative h-36 bg-gray-100 flex items-center justify-center">
                {m.type === "image" ? (
                  <Image src={m.url} alt={m.altText ?? m.filename ?? "media"} fill className="object-cover" unoptimized />
                ) : m.type === "video" ? (
                  <Video className="h-10 w-10 text-gray-400" />
                ) : (
                  <FileText className="h-10 w-10 text-gray-400" />
                )}
                <button
                  onClick={() => handleDelete(m.id)}
                  className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5 text-lifac-red-600" />
                </button>
              </div>
              <CardContent className="p-3 space-y-0.5">
                <p className="text-xs font-medium text-lifac-navy-900 truncate">{m.filename ?? "Sans nom"}</p>
                <p className="text-[11px] text-gray-400">
                  {m.campaign?.title ?? m.event?.title ?? "Médiathèque générale"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {uploadOpen && (
        <UploadModal
          onClose={() => setUploadOpen(false)}
          onUploaded={() => {
            setUploadOpen(false);
            load();
          }}
        />
      )}
    </div>
  );
}

function UploadModal({ onClose, onUploaded }: { onClose: () => void; onUploaded: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [caption, setCaption] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      toast.error("Veuillez sélectionner un fichier");
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("caption", caption);
      const result = await uploadMedia(formData);
      if (!result.success) {
        toast.error(result.error ?? "Erreur lors de l'envoi");
        return;
      }
      toast.success("Média ajouté à la médiathèque");
      onUploaded();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-2 right-2 p-2 hover:bg-gray-100 rounded-full">
          <X size={18} />
        </button>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-lifac-red-600" />
            <h3 className="font-bold text-lg">Ajouter un média</h3>
          </div>
          <div className="space-y-1">
            <Label>Fichier (image, vidéo ou document)</Label>
            <Input ref={fileRef} type="file" accept="image/*,video/*,.pdf,.doc,.docx" />
          </div>
          <div className="space-y-1">
            <Label>Légende (optionnelle)</Label>
            <Input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Ex : Croisade à Cotonou, juillet 2026" />
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? "Envoi..." : "Envoyer"}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
