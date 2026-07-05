"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Check } from "lucide-react";
import { useTranslations } from "next-intl";

// Mock agents for now, would be passed as props or fetched in production
const mockAgents = [
    { id: "1", name: "Agent Alpha", status: "disponible", avatar: "" },
    { id: "2", name: "Agent Beta", status: "occupé", avatar: "" },
    { id: "3", name: "Agent Gamma", status: "disponible", avatar: "" },
];

export function AgentSelectionModal({ isOpen, onClose, school, onAssign }: any) {
  const t = useTranslations("adminSchools");
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-2 right-2 p-2 hover:bg-gray-100 rounded-full">
            <X size={18} />
        </button>
        <CardContent className="p-6 space-y-4">
          <h3 className="font-bold text-lg">Affecter {school.name}</h3>
          <div className="space-y-2">
            {mockAgents.map(agent => (
                <div key={agent.id} className={`flex items-center justify-between p-3 border rounded ${selectedAgentId === agent.id ? 'border-emerald-500 bg-emerald-50' : ''}`}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200" />
                        <div>
                            <p className="font-medium">{agent.name}</p>
                            <p className="text-xs text-gray-500">{agent.status}</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedAgentId(agent.id)}>
                        {selectedAgentId === agent.id ? <Check size={18} className="text-emerald-600" /> : <div className="w-5 h-5 border rounded-full" />}
                    </Button>
                </div>
            ))}
          </div>
          <Button className="w-full" disabled={!selectedAgentId} onClick={() => onAssign(selectedAgentId)}>Affecter à l'agent</Button>
        </CardContent>
      </Card>
    </div>
  );
}
