"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { createSchool, updateSchool } from "@/actions/school-actions";
import { SchoolStatus } from "@prisma/client";

export function SchoolModal({ isOpen, onClose, school, onUpdate }: any) {
  const t = useTranslations("adminSchools"); // Assume I will add this to messages
  const [formData, setFormData] = useState(school || {
    code: "",
    name: "",
    address: "",
    commune: "",
    department: "",
    responsibleName: "",
    phone: "",
    estimatedStudents: 0,
    status: SchoolStatus.NON_CONFIRMEE
  });

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (school) {
        await updateSchool(school.id, formData);
    } else {
        await createSchool(formData);
    }
    onUpdate && onUpdate();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg relative">
        <button onClick={onClose} className="absolute top-2 right-2 p-2 hover:bg-gray-100 rounded-full">
            <X size={18} />
        </button>
        <CardContent className="p-6 space-y-4">
          <h3 className="font-bold text-lg">{school ? "Modifier l'école" : "Ajouter une école"}</h3>
          <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                  <Label>Code</Label>
                  <Input value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} />
              </div>
              <div className="space-y-1">
                  <Label>Nom</Label>
                  <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
          </div>
          <div className="space-y-1">
              <Label>Adresse</Label>
              <Input value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                  <Label>Commune</Label>
                  <Input value={formData.commune} onChange={(e) => setFormData({...formData, commune: e.target.value})} />
              </div>
              <div className="space-y-1">
                  <Label>Département</Label>
                  <Input value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})} />
              </div>
          </div>
          <div className="space-y-1">
              <Label>Responsable</Label>
              <Input value={formData.responsibleName} onChange={(e) => setFormData({...formData, responsibleName: e.target.value})} />
          </div>
          <div className="space-y-1">
              <Label>Téléphone</Label>
              <Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
          </div>
          <div className="space-y-1">
              <Label>Effectif estimé</Label>
              <Input type="number" value={formData.estimatedStudents} onChange={(e) => setFormData({...formData, estimatedStudents: parseInt(e.target.value)})} />
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSubmit}>Sauvegarder</Button>
            <Button variant="outline" onClick={onClose}>Annuler</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
