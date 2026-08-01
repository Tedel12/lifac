"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { createAgent, updateAgent } from "@/actions/admin-agent-actions";
import { toast } from "sonner";

export function AgentModal({ isOpen, onClose, agent, onUpdate }: any) {
  const [formData, setFormData] = useState(
    agent || { name: "", email: "", phone: "", password: "" }
  );

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!formData.name?.trim() || !formData.email?.trim() || !formData.phone?.trim()) {
      toast.error("Nom, email et téléphone sont obligatoires");
      return;
    }
    if (!agent && !formData.password?.trim()) {
      toast.error("Le mot de passe est obligatoire pour un nouveau missionnaire");
      return;
    }

    if (agent) {
      await updateAgent(agent.id, formData);
      toast.success("Missionnaire mis à jour");
    } else {
      await createAgent(formData);
      toast.success("Missionnaire ajouté");
    }
    onUpdate && onUpdate();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-2 right-2 p-2 hover:bg-gray-100 rounded-full">
          <X size={18} />
        </button>

        <CardContent className="p-6">
          <div className="space-y-4">
            <h3 className="font-bold text-lg">{agent ? "Modifier le missionnaire" : "Ajouter un missionnaire"}</h3>

            <div className="space-y-1">
              <Label>Nom complet</Label>
              <Input value={formData.name ?? ""} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>

            <div className="space-y-1">
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email ?? ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <Label>Téléphone</Label>
              <Input value={formData.phone ?? ""} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            </div>

            {!agent && (
              <div className="space-y-1">
                <Label>Mot de passe</Label>
                <Input
                  type="password"
                  value={formData.password ?? ""}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSubmit}>Sauvegarder</Button>
              <Button variant="outline" onClick={onClose}>
                Annuler
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
