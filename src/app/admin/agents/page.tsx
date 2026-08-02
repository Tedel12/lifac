"use client";

import { useState, useEffect } from "react";
import {
  getAgents,
  deleteAgent,
  getPendingApplications,
  approveVolunteerApplication,
  rejectVolunteerApplication,
} from "@/actions/admin-agent-actions";
import { AgentModal } from "@/components/admin/agent-modal";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Eye, Pencil, Trash2, Plus, Check, X, Clock } from "lucide-react";
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

  return (
    <div className="p-8 space-y-8">
      <AdminPageHeader
        title="Gestion des Missionnaires"
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
        <h2 className="font-display font-bold text-lifac-navy-900">Missionnaires actifs</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {agents.map((agent) => (
              <TableRow key={agent.id}>
                <TableCell>{agent.name}</TableCell>
                <TableCell>{agent.email}</TableCell>
                <TableCell>{agent.phone}</TableCell>
                <TableCell className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => { setSelectedAgent(agent); setModalOpen(true); }}>
                    <Eye className="h-4 w-4 mr-1" /> Voir
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => { setSelectedAgent(agent); setModalOpen(true); }}>
                    <Pencil className="h-4 w-4 mr-1" /> Modifier
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(agent.id)}>
                    <Trash2 className="h-4 w-4 mr-1" /> Supprimer
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
