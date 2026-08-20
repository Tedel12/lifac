"use client";

import { useState, useMemo } from "react";
import { Plus, Pencil, Eye, X, LocateFixed, Loader2, Trash2, Search, ArrowUpDown, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { SchoolStatus, SchoolType } from "@prisma/client";
import { createMySchool, updateMySchool, deleteMySchool } from "@/actions/volunteer-school-actions";
import { SCHOOL_STATUS_LABELS as STATUS_LABELS, SCHOOL_STATUS_COLORS as STATUS_COLORS, SCHOOL_TYPE_LABELS } from "@/lib/school-labels";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type SortKey = "date" | "address" | "country";

export function SchoolsList({
  schools: initialSchools,
  currentAgentId,
  canDeleteSchools,
  isEvangelist = false,
}: {
  schools: any[];
  currentAgentId: string | null;
  canDeleteSchools: boolean;
  isEvangelist?: boolean;
}) {
  const [schools, setSchools] = useState(initialSchools);
  const [modalSchool, setModalSchool] = useState<any>(null);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<SchoolStatus | "ALL">("ALL");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const displayedSchools = useMemo(() => {
    const term = search.trim().toLowerCase();
    const filtered = schools.filter((s) => {
      if (statusFilter !== "ALL" && s.status !== statusFilter) return false;
      if (!term) return true;
      return [s.name, s.code, s.commune, s.department, s.address, s.country]
        .filter(Boolean)
        .some((v: string) => v.toLowerCase().includes(term));
    });

    const dir = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "date") {
        cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortKey === "address") {
        cmp = `${a.commune ?? ""} ${a.address ?? ""}`.localeCompare(`${b.commune ?? ""} ${b.address ?? ""}`, "fr");
      } else {
        cmp = (a.country ?? "").localeCompare(b.country ?? "", "fr");
      }
      // À égalité, la plus grande effectif remonte en premier.
      if (cmp === 0) return (b.estimatedStudents ?? 0) - (a.estimatedStudents ?? 0);
      return cmp * dir;
    });
  }, [schools, search, statusFilter, sortKey, sortDir]);

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

  const statusButtons: (SchoolStatus | "ALL")[] = ["ALL", ...Object.values(SchoolStatus)];

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Écoles au total", value: schools.length },
          { label: "Ajoutées par moi", value: schools.filter((s) => s.createdById === currentAgentId).length },
          { label: "Exécutées", value: schools.filter((s) => s.status === SchoolStatus.EXECUTEE).length },
          { label: "Élèves estimés", value: schools.reduce((n, s) => n + (s.estimatedStudents ?? 0), 0) },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <p className="text-[11px] text-gray-500 uppercase tracking-wider">{stat.label}</p>
              <p className="font-display text-2xl font-bold text-lifac-navy-900 mt-1">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher (nom, code, commune, adresse, pays)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" /> Ajouter une école
        </Button>
      </div>

      {/* Filtres de statut en boutons */}
      <div className="flex flex-wrap gap-2">
        {statusButtons.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
              statusFilter === s
                ? "bg-lifac-red-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            {s === "ALL" ? "Toutes" : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {displayedSchools.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-gray-500">Aucune école ne correspond à ces critères.</CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] uppercase tracking-wider text-gray-400">
                  <th className="px-4 py-3 text-left font-bold">Code</th>
                  <th className="px-4 py-3 text-left font-bold">École</th>
                  <th className="px-4 py-3 text-left font-bold">Type</th>
                  <th className="px-4 py-3 text-left font-bold">
                    <button onClick={() => toggleSort("address")} className="inline-flex items-center gap-1 hover:text-lifac-navy-900">
                      Adresse <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left font-bold">
                    <button onClick={() => toggleSort("country")} className="inline-flex items-center gap-1 hover:text-lifac-navy-900">
                      Pays <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left font-bold">Fondateur / Directeur</th>
                  <th className="px-4 py-3 text-left font-bold">Contact</th>
                  <th className="px-4 py-3 text-left font-bold">Effectif</th>
                  <th className="px-4 py-3 text-left font-bold">Statut</th>
                  <th className="px-4 py-3 text-left font-bold">
                    <button onClick={() => toggleSort("date")} className="inline-flex items-center gap-1 hover:text-lifac-navy-900">
                      Ajoutée le <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {displayedSchools.map((school) => {
                  const isMine = school.createdById === currentAgentId;
                  const isLocked = school.status === SchoolStatus.EXECUTEE;
                  // L'évangéliste peut agir sur toutes les écoles, même exécutées.
                  const canEdit = isEvangelist || (isMine && !isLocked);
                  return (
                    <tr key={school.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-4 py-3 text-xs text-gray-500">{school.code}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-lifac-navy-900">{school.name}</p>
                        {isMine && <p className="text-[11px] text-lifac-red-600">Ajoutée par vous</p>}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        {school.schoolType ? SCHOOL_TYPE_LABELS[school.schoolType as SchoolType] : "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        {school.commune}, {school.department}
                        <span className="block text-gray-400">{school.address}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">{school.country ?? "—"}</td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        {school.founderName ?? "—"}
                        {school.founderPhone && <span className="block text-gray-400">{school.founderPhone}</span>}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        {school.responsibleName}
                        <span className="block text-gray-400">{school.phone}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">{school.estimatedStudents ?? 0}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${STATUS_COLORS[school.status as SchoolStatus]}`}>
                          {STATUS_LABELS[school.status as SchoolStatus]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                        {new Date(school.createdAt).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          {canEdit ? (
                            <>
                              <button
                                onClick={() => openEdit(school)}
                                title="Modifier"
                                className="p-2 rounded-lg text-gray-400 hover:text-lifac-red-600 hover:bg-lifac-red-50 transition-colors"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              {canDeleteSchools && (
                                <button
                                  onClick={() => handleDelete(school)}
                                  title="Supprimer"
                                  className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </>
                          ) : (
                            <button
                              onClick={() => openView(school)}
                              title={isMine && isLocked ? "École exécutée — seul un administrateur peut la modifier" : "Voir les détails"}
                              className="p-2 rounded-lg text-gray-400 hover:text-lifac-navy-900 hover:bg-gray-100 transition-colors"
                            >
                              {isMine && isLocked ? <Lock className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
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
      country: "Bénin",
      department: "",
      commune: "",
      address: "",
      schoolType: "" as SchoolType | "",
      founderName: "",
      founderPhone: "",
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
          country: formData.country || "Bénin",
          department: formData.department,
          commune: formData.commune,
          address: formData.address,
          schoolType: formData.schoolType ? (formData.schoolType as SchoolType) : null,
          founderName: formData.founderName || null,
          founderPhone: formData.founderPhone || null,
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
          country: formData.country || "Bénin",
          department: formData.department,
          commune: formData.commune,
          address: formData.address,
          schoolType: formData.schoolType ? (formData.schoolType as SchoolType) : null,
          founderName: formData.founderName || null,
          founderPhone: formData.founderPhone || null,
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

            <div className="space-y-1">
              <Label>Type d&apos;établissement</Label>
              <select
                value={formData.schoolType ?? ""}
                onChange={(e) => setFormData({ ...formData, schoolType: e.target.value })}
                disabled={isReadOnly}
                className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 disabled:bg-gray-50"
              >
                <option value="">— Sélectionner —</option>
                {Object.entries(SCHOOL_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Pays</Label>
                <Input value={formData.country ?? ""} onChange={(e) => setFormData({ ...formData, country: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Département</Label>
                <Input value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} />
              </div>
            </div>

            <div className="space-y-1">
              <Label>Commune</Label>
              <Input value={formData.commune} onChange={(e) => setFormData({ ...formData, commune: e.target.value })} />
            </div>

            <div className="space-y-1">
              <Label>Adresse complète</Label>
              <Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Fondateur / Directeur</Label>
                <Input value={formData.founderName ?? ""} onChange={(e) => setFormData({ ...formData, founderName: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Téléphone du fondateur</Label>
                <Input value={formData.founderPhone ?? ""} onChange={(e) => setFormData({ ...formData, founderPhone: e.target.value })} />
              </div>
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
                <Label>Personne à contacter</Label>
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
