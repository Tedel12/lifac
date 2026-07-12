"use client";

import { useState } from "react";
import { Search, Plus, Filter, Trash2, Edit, UserPlus, List, Eye, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { deleteSchool, getSchools } from "@/actions/school-actions";
import { assignSchoolToAgent } from "@/actions/agent-actions";
import { SchoolStatus } from "@prisma/client";
import { SchoolModal } from "@/components/admin/school-modal";
import { AgentSelectionModal } from "@/components/admin/agent-selection-modal";
import { useTranslations } from "next-intl";

export default function SchoolsPage({ schools: initialSchools }: { schools: any[] }) {
  const t = useTranslations("adminSchools");
  const [schools, setSchools] = useState(initialSchools);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<SchoolStatus | "ALL">("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<any>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [isAssignmentsOpen, setIsAssignmentsOpen] = useState(false);

  const refreshSchools = async () => {
    const updated = await getSchools({ search, status: statusFilter !== "ALL" ? statusFilter : undefined });
    setSchools(updated);
  };

  const handleSearch = () => {
      refreshSchools();
  }

  const handleDelete = async (id: string) => {
    if (confirm(t("actions.delete") + "?")) {
      await deleteSchool(id);
      await refreshSchools();
    }
  };

  const handleEdit = (school: any) => {
    setSelectedSchool(school);
    setIsViewMode(false);
    setIsModalOpen(true);
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
      await assignSchoolToAgent(selectedSchool.id, agentId);
      setIsAgentModalOpen(false);
      refreshSchools();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-lifac-navy-900">{t("title")}</h1>
        <Button onClick={() => { setSelectedSchool(null); setIsModalOpen(true); }}>
          <Plus size={18} className="mr-2" /> {t("add")}
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            placeholder={t("search")} 
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <select 
            className="border rounded-md px-3 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
        >
            <option value="ALL">{t("allStatus")}</option>
            {Object.values(SchoolStatus).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <Button onClick={handleSearch} variant="outline"><Filter size={18} className="mr-2" /> {t("filter")}</Button>
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
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {schools.length > 0 ? schools.map((school) => (
                <tr key={school.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{school.code}</td>
                  <td className="px-6 py-4">{school.name}</td>
                  <td className="px-6 py-4">{school.commune}</td>
                  <td className="px-6 py-4">{school.responsibleName}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                        {school.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-1">
                        <Button variant="ghost" size="sm" className="text-emerald-600 text-xs gap-1" onClick={() => handleAssign(school)} title={t("actions.assign")}><UserPlus size={14} /></Button>
                        <Button variant="ghost" size="sm" className="text-blue-600 text-xs gap-1" onClick={() => handleEdit(school)}><Edit size={14} /></Button>
                        <Button variant="ghost" size="sm" className="text-slate-600 text-xs gap-1" onClick={() => handleView(school)} title={t("actions.view")}><Eye size={14} /></Button>
                        <Button variant="ghost" size="sm" className="text-red-600 text-xs gap-1" onClick={() => handleDelete(school.id)}><Trash2 size={14} /></Button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                    <td colSpan={6} className="text-center p-6 text-gray-500">Aucune école trouvée</td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
      
      <div className="relative">
        <Button variant="outline" onClick={() => setIsAssignmentsOpen(!isAssignmentsOpen)} className="mr-2 text-black" >
            <List size={18} className="mr-2 text-black" /> {t("assignments")} <ChevronDown size={18} className="ml-2"/>
        </Button>
        {isAssignmentsOpen && (
            <div className="absolute bottom-full left-0 mb-2 w-64 bg-white border rounded-md shadow-lg p-4">
                <p className="text-sm text-gray-500">Aucune affectation pour le moment.</p>
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
