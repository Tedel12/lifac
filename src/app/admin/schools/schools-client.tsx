"use client";

import { useState, useMemo } from "react";
import { Search, Plus, UserPlus, List, Eye, ChevronDown, ArrowUpDown, School as SchoolIcon, MapPinned, UserCheck, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getSchools, updateSchoolStatus } from "@/actions/school-actions";
import { assignSchoolToAgent, getAssignmentHistory } from "@/actions/agent-actions";
import { SchoolStatus } from "@prisma/client";
import { SchoolModal } from "@/components/admin/school-modal";
import { AgentSelectionModal } from "@/components/admin/agent-selection-modal";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<SchoolStatus, string> = {
  NON_CONFIRMEE: "Non confirmée",
  CONFIRMEE: "Confirmée",
  AFFECTEE: "Affectée",
  EN_COURS: "En cours",
  EXECUTEE: "Exécutée",
};

export default function SchoolsPage({ schools: initialSchools }: { schools: any[] }) {
  const t = useTranslations("adminSchools");
  const [allSchools] = useState(initialSchools); // baseline non filtré, pour les statistiques
  const [schools, setSchools] = useState(initialSchools);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<SchoolStatus | "ALL">("ALL");
  const [dateSort, setDateSort] = useState<"none" | "asc" | "desc">("none");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<any>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [isAssignmentsOpen, setIsAssignmentsOpen] = useState(false);
  const [assignments, setAssignments] = useState<any[]>([]);

  const refreshSchools = async (status: SchoolStatus | "ALL" = statusFilter, searchValue: string = search) => {
    const updated = await getSchools({ search: searchValue, status: status !== "ALL" ? status : undefined });
    setSchools(updated);
  };

  const handleStatusClick = (status: SchoolStatus | "ALL") => {
    setStatusFilter(status);
    refreshSchools(status, search);
  };

  const handleSearch = () => {
    refreshSchools(statusFilter, search);
  };

  const toggleDateSort = () => {
    setDateSort((prev) => (prev === "asc" ? "desc" : prev === "desc" ? "none" : "asc"));
  };

  // Tri par date de création (plus proche → plus tard, ou l'inverse). En cas d'égalité
  // exacte de date/heure, l'école avec le plus grand effectif estimé passe en premier.
  const displayedSchools = useMemo(() => {
    if (dateSort === "none") return schools;
    const sorted = [...schools].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      if (dateA !== dateB) return dateSort === "asc" ? dateA - dateB : dateB - dateA;
      return (b.estimatedStudents ?? 0) - (a.estimatedStudents ?? 0);
    });
    return sorted;
  }, [schools, dateSort]);

  const stats = useMemo(() => {
    const byStatus = Object.values(SchoolStatus).reduce((acc, s) => {
      acc[s] = allSchools.filter((sc) => sc.status === s).length;
      return acc;
    }, {} as Record<SchoolStatus, number>);
    const totalStudents = allSchools.reduce((sum, sc) => sum + (sc.estimatedStudents ?? 0), 0);
    const withAgent = allSchools.filter((sc) => sc.agentId).length;
    return { total: allSchools.length, byStatus, totalStudents, withAgent };
  }, [allSchools]);

  const handleStatusChange = async (id: string, status: SchoolStatus) => {
    setSchools((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
    await updateSchoolStatus(id, status);
  };

  const handleView = (school: any) => {
    setSelectedSchool(school);
    setIsViewMode(true);
    setIsModalOpen(true);
  };

  const handleAssign = (school: any) => {
    setSelectedSchool(school);
    setIsAgentModalOpen(true);
  };

  const performAssignment = async (agentId: string) => {
      const res = await assignSchoolToAgent(selectedSchool.id, agentId);
      if(res.success) {
          toast.success("Affectation réussie !");
          setIsAgentModalOpen(false);
          refreshSchools();
          loadAssignments();
      } else {
          toast.error("Erreur lors de l'affectation.");
      }
  }

  const loadAssignments = async () => {
    const data = await getAssignmentHistory();
    setAssignments(data);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-lifac-navy-900">{t("title")}</h1>
        <Button onClick={() => { setSelectedSchool(null); setIsViewMode(false); setIsModalOpen(true); }}>
          <Plus size={18} className="mr-2" /> {t("add")}
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-lifac-red-50 flex items-center justify-center shrink-0">
              <SchoolIcon className="h-5 w-5 text-lifac-red-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-lifac-navy-900 leading-none">{stats.total}</p>
              <p className="text-[11px] text-gray-500 mt-1">Écoles enregistrées</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
              <UserCheck className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-lifac-navy-900 leading-none">{stats.withAgent}</p>
              <p className="text-[11px] text-gray-500 mt-1">Avec missionnaire affecté</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-lifac-navy-900 leading-none">{stats.byStatus.NON_CONFIRMEE ?? 0}</p>
              <p className="text-[11px] text-gray-500 mt-1">Non confirmées</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
              <MapPinned className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-lifac-navy-900 leading-none">{stats.totalStudents.toLocaleString("fr-FR")}</p>
              <p className="text-[11px] text-gray-500 mt-1">Élèves estimés au total</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder={t("search")}
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <Button onClick={toggleDateSort} variant="outline" className="shrink-0">
          <ArrowUpDown size={16} className="mr-2" />
          {dateSort === "none" ? "Trier par date" : dateSort === "asc" ? "Date : plus proche → plus tard" : "Date : plus tard → plus proche"}
        </Button>
      </div>

      {/* Filtres par statut, cliquables (filtrent immédiatement) */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleStatusClick("ALL")}
          className={cn(
            "px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors",
            statusFilter === "ALL"
              ? "bg-lifac-red-600 border-lifac-red-600 text-white"
              : "bg-white border-gray-200 text-lifac-navy-700 hover:border-lifac-red-600/40"
          )}
        >
          {t("allStatus")} ({stats.total})
        </button>
        {Object.values(SchoolStatus).map((s) => (
          <button
            key={s}
            onClick={() => handleStatusClick(s)}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors",
              statusFilter === s
                ? "bg-lifac-red-600 border-lifac-red-600 text-white"
                : "bg-white border-gray-200 text-lifac-navy-700 hover:border-lifac-red-600/40"
            )}
          >
            {STATUS_LABELS[s]} ({stats.byStatus[s] ?? 0})
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 uppercase font-medium">
              <tr>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Nom</th>
                <th className="px-6 py-4">Commune</th>
                <th className="px-6 py-4">Responsable</th>
                <th className="px-6 py-4">Effectif</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayedSchools.length > 0 ? displayedSchools.map((school) => (
                <tr key={school.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{school.code}</td>
                  <td className="px-6 py-4">{school.name}</td>
                  <td className="px-6 py-4">{school.commune}</td>
                  <td className="px-6 py-4">{school.responsibleName}</td>
                  <td className="px-6 py-4">{school.estimatedStudents ?? "—"}</td>
                  <td className="px-6 py-4">
                    <select
                      value={school.status}
                      onChange={(e) => handleStatusChange(school.id, e.target.value as SchoolStatus)}
                      className="text-xs bg-blue-50 text-blue-700 rounded-full px-2 py-1 border-0 focus:ring-2 focus:ring-lifac-red-600 cursor-pointer"
                    >
                      {Object.values(SchoolStatus).map((s) => (
                        <option key={s} value={s}>
                          {STATUS_LABELS[s]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-1">
                        <Button variant="ghost" size="sm" className="text-emerald-600 text-xs gap-1" onClick={() => handleAssign(school)} title={t("actions.assign")}><UserPlus size={14} /></Button>
                        <Button variant="ghost" size="sm" className="text-slate-600 text-xs gap-1" onClick={() => handleView(school)} title={t("actions.view")}><Eye size={14} /></Button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                    <td colSpan={7} className="text-center p-6 text-gray-500">Aucune école trouvée</td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="relative">
        <Button variant="outline" onClick={() => { setIsAssignmentsOpen(!isAssignmentsOpen); if(!isAssignmentsOpen) loadAssignments(); }} className="mr-2 text-black" >
            <List size={18} className="mr-2 text-black" /> {t("assignments")} <ChevronDown size={18} className="ml-2"/>
        </Button>
        {isAssignmentsOpen && (
            <div className="absolute bottom-full left-0 mb-2 w-80 bg-white border rounded-md shadow-lg p-4 max-h-64 overflow-y-auto">
                {assignments.length === 0 ? (
                    <p className="text-sm text-gray-500">Aucune affectation pour le moment.</p>
                ) : (
                    assignments.map(a => (
                        <div key={a.id} className="text-sm border-b py-2">
                            <p className="font-medium">{a.school.name}</p>
                            <p className="text-xs text-gray-500">Missionnaire : {a.agent.name} - {new Date(a.assignedAt).toLocaleDateString()}</p>
                        </div>
                    ))
                )}
            </div>
        )}
      </div>

      {isModalOpen && (
          <SchoolModal
            isOpen={true}
            onClose={() => setIsModalOpen(false)}
            school={selectedSchool}
            onUpdate={refreshSchools}
            isReadOnly={isViewMode}
          />
      )}
      {isAgentModalOpen && (
          <AgentSelectionModal
            isOpen={true}
            onClose={() => setIsAgentModalOpen(false)}
            school={selectedSchool}
            onAssign={performAssignment}
          />
      )}
    </div>
  );
}
