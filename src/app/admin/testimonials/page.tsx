"use client";

import { useState, useEffect } from "react";
import {
  getAllTestimoniesAdmin,
  approveTestimony,
  rejectTestimony,
  deleteTestimony,
  toggleTestimonyFeatured,
  getPendingComments,
  approveComment,
  deleteComment,
} from "@/actions/testimony-actions";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, Trash2, Star, Clock, MessageCircle } from "lucide-react";
import { toast } from "sonner";

export default function AdminTestimonialsPage() {
  const [testimonies, setTestimonies] = useState<any[]>([]);
  const [pendingComments, setPendingComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    const [data, comments] = await Promise.all([getAllTestimoniesAdmin(), getPendingComments()]);
    setTestimonies(data);
    setPendingComments(comments);
    setLoading(false);
  };

  const handleApproveComment = async (id: string) => {
    await approveComment(id);
    toast.success("Commentaire validé");
    load();
  };

  const handleDeleteComment = async (id: string) => {
    if (!confirm("Supprimer ce commentaire ?")) return;
    await deleteComment(id);
    toast.success("Commentaire supprimé");
    load();
  };

  const pending = testimonies.filter((t) => !t.isApproved);
  const approved = testimonies.filter((t) => t.isApproved);

  const handleApprove = async (id: string) => {
    await approveTestimony(id);
    toast.success("Témoignage validé — désormais visible sur le site");
    load();
  };

  const handleReject = async (id: string) => {
    await rejectTestimony(id);
    toast.success("Témoignage repassé en attente");
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer définitivement ce témoignage ?")) return;
    await deleteTestimony(id);
    toast.success("Témoignage supprimé");
    load();
  };

  const handleToggleFeatured = async (id: string, current: boolean) => {
    await toggleTestimonyFeatured(id, !current);
    load();
  };

  return (
    <div className="p-8 space-y-8">
      <AdminPageHeader
        title="Témoignages"
        description="Validez les témoignages soumis par les visiteurs avant qu'ils n'apparaissent sur le site public."
      />

      {loading ? (
        <p className="text-sm text-gray-500">Chargement...</p>
      ) : (
        <>
          {pendingComments.length > 0 && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-lifac-red-600" />
                <h2 className="font-display font-bold text-lifac-navy-900">
                  Commentaires en attente ({pendingComments.length})
                </h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {pendingComments.map((c) => (
                  <Card key={c.id} className="border-l-4 border-amber-500 hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-5 space-y-3">
                      <div>
                        <p className="font-bold text-lifac-navy-900">{c.authorName}</p>
                        <p className="text-[11px] text-gray-400">
                          sur le témoignage de {c.testimony?.authorName ?? "—"}
                        </p>
                      </div>
                      <p className="text-sm text-lifac-navy-700">{c.content}</p>
                      <div className="flex gap-2 pt-1">
                        <Button size="sm" onClick={() => handleApproveComment(c.id)}>
                          <Check className="h-3.5 w-3.5 mr-1" /> Valider
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeleteComment(c.id)}>
                          <Trash2 className="h-3.5 w-3.5 mr-1" /> Supprimer
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-lifac-red-600" />
              <h2 className="font-display font-bold text-lifac-navy-900">En attente de validation ({pending.length})</h2>
            </div>
            {pending.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-sm text-gray-500">Aucun témoignage en attente.</CardContent>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {pending.map((t) => (
                  <Card key={t.id} className="border-l-4 border-lifac-red-600 hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-5 space-y-3">
                      <div>
                        <p className="font-bold text-lifac-navy-900">{t.authorName}</p>
                        {t.authorRole && <p className="text-xs text-gray-500">{t.authorRole}</p>}
                      </div>
                      <p className="text-sm text-lifac-navy-700 italic">« {t.content} »</p>
                      <div className="flex gap-2 pt-1">
                        <Button size="sm" onClick={() => handleApprove(t.id)}>
                          <Check className="h-3.5 w-3.5 mr-1" /> Valider
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(t.id)}>
                          <Trash2 className="h-3.5 w-3.5 mr-1" /> Supprimer
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h2 className="font-display font-bold text-lifac-navy-900">Publiés sur le site ({approved.length})</h2>
            {approved.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-sm text-gray-500">Aucun témoignage publié pour le moment.</CardContent>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {approved.map((t) => (
                  <Card key={t.id} className="hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-5 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-bold text-lifac-navy-900">{t.authorName}</p>
                          {t.authorRole && <p className="text-xs text-gray-500">{t.authorRole}</p>}
                        </div>
                        <button
                          onClick={() => handleToggleFeatured(t.id, t.isFeatured)}
                          title={t.isFeatured ? "Retirer la mise en avant" : "Mettre en avant"}
                          className="p-1.5 rounded-full hover:bg-gray-100"
                        >
                          <Star className={`h-4 w-4 ${t.isFeatured ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />
                        </button>
                      </div>
                      <p className="text-sm text-lifac-navy-700 italic">« {t.content} »</p>
                      <div className="flex gap-2 pt-1">
                        <Button size="sm" variant="outline" onClick={() => handleReject(t.id)}>
                          <X className="h-3.5 w-3.5 mr-1" /> Dépublier
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(t.id)}>
                          <Trash2 className="h-3.5 w-3.5 mr-1" /> Supprimer
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
