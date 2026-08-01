"use client";

import { useState, useEffect } from "react";
import { getAgents, deleteAgent } from "@/actions/admin-agent-actions";
import { AgentModal } from "@/components/admin/agent-modal";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

export default function AgentsPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    const data = await getAgents();
    setAgents(data);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce missionnaire ?")) {
      await deleteAgent(id);
      loadAgents();
      toast.success("Missionnaire supprimé");
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des Missionnaires</h1>
        <Button onClick={() => { setSelectedAgent(null); setModalOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Ajouter un missionnaire
        </Button>
      </div>

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

      {modalOpen && (
        <AgentModal
          isOpen={modalOpen}
          onClose={() => { setModalOpen(false); loadAgents(); }}
          agent={selectedAgent}
        />
      )}
    </div>
  );
}
