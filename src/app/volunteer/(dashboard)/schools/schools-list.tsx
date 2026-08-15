"use client";

import { useState } from "react";
import { Plus, MapPin, Phone, Users, Pencil, Eye, X, LocateFixed, Loader2, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { SchoolStatus } from "@prisma/client";
import { createMySchool, updateMySchool, deleteMySchool } from "@/actions/volunteer-school-actions";
import { toast } from "sonner";

const STATUS_LABELS: Record<SchoolStatus, string> = {
  NON_CONFIRMEE: "Non confirmée",
  CONFIRMEE: "Confirmée",
  AFFECTEE: "Affectée",
  EN_COURS: "En cours",
  EXECUTEE: "Exécutée",
};

const STATUS_COLORS: Record<SchoolStatus, string> = {
  NON_CONFIRMEE: "bg-gray-100 text-gray-700",
  CONFIRMEE: "bg-blue-100 text-blue-700",
  AFFECTEE: "bg-amber-100 text-amber-700",
  EN_COURS: "bg-purple-100 text-purple-700",
  EXECUTEE: "bg-emerald-100 text-emerald-700",
};

export function SchoolsList({
  schools: initialSchools,
  currentAgentId,
  canDeleteSchools,
}: {
  schools: any[];
  currentAgentId: string | null;
  canDeleteSchools: boolean;
}) {
  const [schools, setSchools] = useState(initialSchools);
  const [modalSchool, setModalSchool] = useState<any>(null);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");
  const [modalOpen, setModalOpen] = useState(false);

  const openCreate = () => {
    setModalSchool(null);
    setModalMode("create");
    setModalOpen(true);
  };

  const openEdit = (school: any) => {
    setModalSchool(school);
    setModalMode("edit");
    setModalOpen(true);
  };

  const openView = (school: any) => {
    setModalSchool(school);
    setModalMode("view");
    setModalOpen(true);
  };

  const refresh = (newSchool?: any, updatedId?: string, updatedData?: any) => {
    if (newSchool) {
      setSchools((prev) => [newSchool, ...prev]);
    } else if (updatedId && updatedData) {
      setSchools((prev) => prev.map((s) => (s.id === updatedId ? { ...s, ...updatedData } : s)));
    }
  };

  const handleDelete = async (school: any) => {
    if (!confirm(`Supprimer définitivement l'école "${school.name}" ? Cette action est irréversible.`)) return;
    try {
      await deleteMySchool(school.id);
      setSchools((prev) => prev.filter((s) => s.id !== school.id));
      toast.success("École supprimée");
    } catch (e: any) {
      toast.error(e?.message ?? "Erreur lors de la suppression");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" /> Ajouter une école
        </Button>
      </div>

      {schools.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-gray-500">Aucune école enregistrée pour le moment.</CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {schools.map((school) => {
            const isMine = school.createdById === currentAgentId;
            return (
              <Card key={school.id} className="hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-5 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-lifac-navy-900">{school.name}</h3>
                    <span className={`shrink-0 px-2 py-0.5 rounded-full text-[11px] font-medium ${STATUS_COLORS[school.status as SchoolStatus]}`}>
                      {STATUS_LABELS[school.status as SchoolStatus]}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-lifac-red-600 shrink-0" />
                    {school.commune}, {school.department}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-lifac-red-600 shrink-0" />
                    {school.phone}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-lifac-red-600 shrink-0" />
                    {school.estimatedStudents ?? 0} élèves estimés
                  </p>
                  {isMine && <p className="text-[11px] text-lifac-red-600 font-medium">Ajoutée par vous</p>}
                  <div className="flex gap-2 pt-2">
                    {isMine ? (
                      <>
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => openEdit(school)}>
                          <Pencil className="h-3.5 w-3.5 mr-1.5" /> Modifier
                        </Button>
                        {canDeleteSchools && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-lifac-red-600 hover:bg-lifac-red-50"
                            onClick={() => handleDelete(school)}
                            title="Supprimer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </>
                    ) : (
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => openView(school)}>
                        <Eye className="h-3.5 w-3.5 mr-1.5" /> Détails
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <SchoolFormModal
          mode={modalMode}
          school={modalSchool}
          onClose={() => setModalOpen(false)}
          onCreated={(created) => {
            refresh(created);
            setModalOpen(false);
          }}
          onUpdated={(id, data) => {
            refresh(undefined, id, data);
            setModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

function SchoolFormModal({
  mode,
  school,
  onClose,
  onCreated,
  onUpdated,
}: {
  mode: "create" | "edit" | "view";
  school: any;
  onClose: () => void;
  onCreated: (school: any) => void;
  onUpdated: (id: string, data: any) => void;
}) {
  const isReadOnly = mode === "view";
  const [formData, setFormData] = useState(
    school || {
      name: "",
      department: "",
      commune: "",
      address: "",
      latitude: null as number | null,
      longitude: null as number | null,
      estimatedStudents: 0,
      responsibleName: "",
      phone: "",
      status: SchoolStatus.NON_CONFIRMEE,
    }
  );
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);

  const handleUseCurrentPosition = () => {
    if (!navigator.geolocation) {
      setLocateError("Géolocalisation non disponible sur cet appareil.");
      return;
    }
    setLocating(true);
    setLocateError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData((prev: any) => ({ ...prev, latitude: pos.coords.latitude, longitude: pos.coords.longitude }));
        setLocating(false);
      },
      () => {
        setLocateError("Impossible d'obtenir votre position. Vérifiez les autorisations du navigateur.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      if (mode === "create") {
        await createMySchool({
          name: formData.name,
          department: formData.department,
          commune: formData.commune,
          address: formData.address,
          latitude: formData.latitude,
          longitude: formData.longitude,
          estimatedStudents: formData.estimatedStudents,
          responsibleName: formData.responsibleName,
          phone: formData.phone,
          status: formData.status,
        });
        toast.success("École ajoutée");
        onCreated(formData);
      } else {
        await updateMySchool(school.id, {
          name: formData.name,
          department: formData.department,
          commune: formData.commune,
          address: formData.address,
          latitude: formData.latitude,
          longitude: formData.longitude,
          estimatedStudents: formData.estimatedStudents,
          responsibleName: formData.responsibleName,
          phone: formData.phone,
          status: formData.status,
        });
        toast.success("École mise à jour");
        onUpdated(school.id, formData);
      }
    } catch (e: any) {
      toast.error(e?.message ?? "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-2 right-2 p-2 hover:bg-gray-100 rounded-full">
          <X size={18} />
        </button>
        <CardContent className="p-6 space-y-4">
          <h3 className="font-bold text-lg text-lifac-navy-900">
            {mode === "create" ? "Ajouter une école" : mode === "edit" ? "Modifier l'école" : formData.name}
          </h3>

          <fieldset disabled={isReadOnly} className="space-y-4">
            <div className="space-y-1">
              <Label>Nom de l'école</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Département</Label>
                <Input value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Commune</Label>
                <Input value={formData.commune} onChange={(e) => setFormData({ ...formData, commune: e.target.value })} />
              </div>
            </div>

            <div className="space-y-1">
              <Label>Adresse complète</Label>
              <Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
            </div>

            {!isReadOnly && (
              <div className="space-y-1">
                <Label>Coordonnées GPS</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="number"
                    step="any"
                    placeholder="Latitude"
                    value={formData.latitude ?? ""}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value ? parseFloat(e.target.value) : null })}
                  />
                  <Input
                    type="number"
                    step="any"
                    placeholder="Longitude"
                    value={formData.longitude ?? ""}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value ? parseFloat(e.target.value) : null })}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleUseCurrentPosition}
                  disabled={locating}
                  className="flex items-center gap-1.5 text-xs font-medium text-lifac-red-600 hover:text-lifac-red-700 mt-1.5 disabled:opacity-50"
                >
                  {locating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LocateFixed className="h-3.5 w-3.5" />}
                  {locating ? "Localisation..." : "Utiliser ma position actuelle"}
                </button>
                {locateError && <p className="text-xs text-red-600 mt-1">{locateError}</p>}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Responsable</Label>
                <Input value={formData.responsibleName} onChange={(e) => setFormData({ ...formData, responsibleName: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Téléphone</Label>
                <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              </div>
            </div>

            <div className="space-y-1">
              <Label>Effectif estimé</Label>
              <Input
                type="number"
                value={formData.estimatedStudents ?? ""}
                onChange={(e) => setFormData({ ...formData, estimatedStudents: e.target.value ? parseInt(e.target.value) : 0 })}
              />
            </div>

            <div className="space-y-1">
              <Label>Statut</Label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as SchoolStatus })}
                className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm"
              >
                {Object.values(SchoolStatus).map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
          </fieldset>

          {!isReadOnly && (
            <div className="flex gap-2 pt-2">
              <Button onClick={handleSubmit} disabled={saving}>
                {saving ? "Enregistrement..." : "Enregistrer"}
              </Button>
              <Button variant="outline" onClick={onClose}>
                Annuler
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
