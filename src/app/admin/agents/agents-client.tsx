"use client";

import { useState } from "react";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { deleteAgent, getAgents } from "@/actions/admin-agent-actions";
import { AgentModal } from "@/components/admin/agent-modal";
import { toast } from "sonner";

export default function AgentsPage({ agents: initialAgents }: { agents: any[] }) {
  const [agents, setAgents] = useState(initialAgents);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);

  const refresh = async () => {
    const updated = await getAgents();
    setAgents(updated);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet agent ?")) {
      await deleteAgent(id);
      await refresh();
      toast.success("Agent supprimé");
    }
  };

  const handleEdit = (agent: any) => {
    setSelectedAgent(agent);
    setIsModalOpen(true);
  };

  const filteredAgents = agents.filter((a) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      a.name?.toLowerCase().includes(q) ||
      a.email?.toLowerCase().includes(q) ||
      a.phone?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-lifac-navy-900">Gestion des agents</h1>
        <Button
          onClick={() => {
            setSelectedAgent(null);
            setIsModalOpen(true);
          }}
        >
          <Plus size={18} className="mr-2" /> Ajouter un agent
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Input
          placeholder="Rechercher par nom, email ou téléphone..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 uppercase font-medium">
              <tr>
                <th className="px-6 py-4">Nom</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Téléphone</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAgents.length > 0 ? (
                filteredAgents.map((agent) => (
                  <tr key={agent.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{agent.name}</td>
                    <td className="px-6 py-4">{agent.email}</td>
                    <td className="px-6 py-4">{agent.phone}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-1">
                        <Button variant="ghost" size="sm" className="text-blue-600 text-xs gap-1" onClick={() => handleEdit(agent)}>
                          <Edit size={14} />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600 text-xs gap-1" onClick={() => handleDelete(agent.id)}>
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center p-6 text-gray-500">
                    Aucun agent trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {isModalOpen && (
        <AgentModal isOpen={true} onClose={() => setIsModalOpen(false)} agent={selectedAgent} onUpdate={refresh} />
      )}
    </div>
  );
}
