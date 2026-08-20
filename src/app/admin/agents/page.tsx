"use client";

import { useState, useEffect } from "react";
import {
  getAgents,
  deleteAgent,
  getPendingApplications,
  approveVolunteerApplication,
  rejectVolunteerApplication,
  setAgentCanDeleteSchools,
  setAgentRole,
} from "@/actions/admin-agent-actions";
import { AgentModal } from "@/components/admin/agent-modal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Eye, Pencil, Trash2, Plus, Check, X, Clock, School } from "lucide-react";
import { toast } from "sonner";

export default function AgentsPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  useEffect(() => {
    loadAgents();
    loadApplications();
  }, []);

  const loadAgents = async () => {
    const data = await getAgents();
    setAgents(data);
  };

  const loadApplications = async () => {
    const data = await getPendingApplications();
    setApplications(data);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce missionnaire ?")) {
      await deleteAgent(id);
      loadAgents();
      toast.success("Missionnaire supprimé");
    }
  };

  const handleReject = async (volunteerId: string) => {
    if (confirm("Rejeter cette candidature ?")) {
      await rejectVolunteerApplication(volunteerId);
      await loadApplications();
      toast.success("Candidature rejetée");
    }
  };

  const handleToggleRole = async (agent: any) => {
    const next = agent.role === "EVANGELIST" ? "VOLUNTEER" : "EVANGELIST";
    setAgents((prev) => prev.map((a) => (a.id === agent.id ? { ...a, role: next } : a)));
    await setAgentRole(agent.id, next);
    toast.success(
      next === "EVANGELIST"
        ? `${agent.name} est désormais évangéliste (droits étendus sur les écoles).`
        : `${agent.name} est repassé missionnaire.`
    );
  };

  const handleToggleDeletePermission = async (agent: any) => {
    const next = !agent.canDeleteSchools;
    setAgents((prev) => prev.map((a) => (a.id === agent.id ? { ...a, canDeleteSchools: next } : a)));
    await setAgentCanDeleteSchools(agent.id, next);
    toast.success(
      next
        ? `${agent.name} peut désormais supprimer les écoles qu'il a ajoutées.`
        : `Droit de suppression d'écoles retiré à ${agent.name}.`
    );
  };

  return (
    <div className="p-8 space-y-8">
      <AdminPageHeader
        title="Missionnaires & Évangélistes"
        action={
          <Button onClick={() => { setSelectedAgent(null); setModalOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Ajouter un missionnaire
          </Button>
        }
      />

      {applications.length > 0 && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-lifac-red-600" />
            <h2 className="font-display font-bold text-lifac-navy-900">
              Candidatures en attente ({applications.length})
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {applications.map((app) => (
              <Card key={app.id} className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-lifac-red-600">
                <CardContent className="p-5 space-y-2">
                  <h3 className="font-bold text-lifac-navy-900">{app.user.name}</h3>
                  <p className="text-xs text-gray-500">{app.user.email}</p>
                  <p className="text-xs text-gray-500">{app.user.phone}</p>
                  {app.skills?.length > 0 && (
                    <p className="text-xs text-gray-500">Compétences : {app.skills.join(", ")}</p>
                  )}
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" onClick={() => setApprovingId(app.id)}>
                      <Check className="h-3.5 w-3.5 mr-1" /> Approuver
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleReject(app.id)}>
                      <X className="h-3.5 w-3.5 mr-1" /> Rejeter
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-lifac-navy-900">Missionnaires actifs</h2>
          <span className="text-xs text-gray-400">{agents.length} missionnaire{agents.length !== 1 ? "s" : ""}</span>
        </div>
        {agents.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-sm text-gray-500">Aucun missionnaire pour le moment.</CardContent>
          </Card>
        ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400">Missionnaire</th>
                  <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400">Contact</th>
                  <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400">Statut</th>
                  <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400">Permissions</th>
                  <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {agents.map((agent) => (
                  <tr key={agent.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 shrink-0 rounded-full bg-lifac-red-50 text-lifac-red-600 flex items-center justify-center font-bold text-xs">
                          {(agent.name || agent.email || "?").slice(0, 1).toUpperCase()}
                        </div>
                        <span className="font-medium text-lifac-navy-900">{agent.name || "—"}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-lifac-navy-700">{agent.email}</p>
                      <p className="text-xs text-gray-400">{agent.phone || "—"}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col gap-1.5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 w-fit">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Actif
                        </span>
                        <button
                          onClick={() => handleToggleRole(agent)}
                          title="Basculer entre missionnaire et évangéliste"
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium w-fit transition-colors ${
                            agent.role === "EVANGELIST"
                              ? "bg-purple-50 text-purple-700 hover:bg-purple-100"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {agent.role === "EVANGELIST" ? "Évangéliste" : "Missionnaire"}
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        type="button"
                        onClick={() => handleToggleDeletePermission(agent)}
                        title="Autoriser ce missionnaire à supprimer les écoles qu'il a ajoutées"
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                          agent.canDeleteSchools
                            ? "bg-lifac-red-50 text-lifac-red-700 hover:bg-lifac-red-100"
                            : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                        }`}
                      >
                        <School className="h-3.5 w-3.5" />
                        {agent.canDeleteSchools ? "Suppr. écoles autorisée" : "Suppr. écoles refusée"}
                      </button>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-1.5">
                        <button
                          title="Voir"
                          onClick={() => { setSelectedAgent(agent); setModalOpen(true); }}
                          className="p-2 rounded-lg text-gray-400 hover:text-lifac-navy-900 hover:bg-gray-100 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          title="Modifier"
                          onClick={() => { setSelectedAgent(agent); setModalOpen(true); }}
                          className="p-2 rounded-lg text-gray-400 hover:text-lifac-red-600 hover:bg-lifac-red-50 transition-colors"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          title="Supprimer"
                          onClick={() => handleDelete(agent.id)}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        )}
      </div>

      {modalOpen && (
        <AgentModal
          isOpen={modalOpen}
          onClose={() => { setModalOpen(false); loadAgents(); }}
          agent={selectedAgent}
        />
      )}

      {approvingId && (
        <ApproveModal
          onClose={() => setApprovingId(null)}
          onApprove={async (password) => {
            await approveVolunteerApplication(approvingId, password);
            setApprovingId(null);
            await Promise.all([loadApplications(), loadAgents()]);
            toast.success("Candidature approuvée — le missionnaire peut désormais se connecter");
          }}
        />
      )}
    </div>
  );
}

function ApproveModal({ onClose, onApprove }: { onClose: () => void; onApprove: (password: string) => Promise<void> }) {
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!password.trim() || password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }
    setSaving(true);
    try {
      await onApprove(password);
    } catch (e: any) {
      toast.error(e?.message ?? "Erreur lors de l'approbation");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-sm relative">
        <button onClick={onClose} className="absolute top-2 right-2 p-2 hover:bg-gray-100 rounded-full">
          <X size={18} />
        </button>
        <CardContent className="p-6 space-y-4">
          <h3 className="font-bold text-lg">Approuver la candidature</h3>
          <p className="text-sm text-gray-500">
            Définissez un mot de passe pour permettre à ce missionnaire de se connecter à son espace.
          </p>
          <div className="space-y-1">
            <Label>Mot de passe</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? "..." : "Approuver"}
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
