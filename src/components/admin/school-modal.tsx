"use client";

import { useState, useEffect, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, History } from "lucide-react";
import { useTranslations } from "next-intl";
import { createSchool, updateSchool } from "@/actions/school-actions";
import { getAvailableDonations, assignDonationsToSchool, getSchoolDonationsHistory } from "@/actions/admin-actions";
import { SchoolStatus } from "@prisma/client";

// Note: Ensure 'sonner' is installed. If not, replace with window.alert
import { toast } from "sonner";

export function SchoolModal({ isOpen, onClose, school, onUpdate }: any) {
  const t = useTranslations("adminSchools");
  const [activeTab, setActiveTab] = useState<'info' | 'funds'>('info');
  const [isPending, startTransition] = useTransition();
  const [donations, setDonations] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
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

  useEffect(() => {
    if (isOpen && school) {
      Promise.all([getAvailableDonations(), getSchoolDonationsHistory(school.id)])
        .then(([avail, hist]) => {
          setDonations(avail);
          setHistory(hist);
        });
    }
  }, [isOpen, school]);

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

  const handleAssign = async () => {
    startTransition(async () => {
      const res = await assignDonationsToSchool(school.id, selectedIds);
      if (res.success) {
        toast.success("Affectation réussie !");
        setSelectedIds([]);
        const [avail, hist] = await Promise.all([getAvailableDonations(), getSchoolDonationsHistory(school.id)]);
        setDonations(avail);
        setHistory(hist);
      } else {
        toast.error("Erreur lors de l'affectation.");
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl relative">
        <button onClick={onClose} className="absolute top-2 right-2 p-2 hover:bg-gray-100 rounded-full">
            <X size={18} />
        </button>
        
        <div className="flex border-b">
          <button className={`p-4 ${activeTab === 'info' ? 'border-b-2 border-primary font-bold' : ''}`} onClick={() => setActiveTab('info')}>Informations</button>
          {school && <button className={`p-4 ${activeTab === 'funds' ? 'border-b-2 border-primary font-bold' : ''}`} onClick={() => setActiveTab('funds')}>Gestion des fonds</button>}
        </div>

        <CardContent className="p-6">
          {activeTab === 'info' ? (
             <div className="space-y-4">
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
             </div>
          ) : (
            <div className="space-y-6">
              <section>
                <h4 className="font-bold mb-2">Dons disponibles (Approuvés)</h4>
                <div className="max-h-48 overflow-y-auto border rounded p-3 space-y-2">
                  {donations.length === 0 && <p className="text-sm text-muted-foreground">Aucun don disponible.</p>}
                  {donations.map(d => (
                    <div key={d.id} className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        className="h-5 w-5 accent-red-600 cursor-pointer"
                        checked={selectedIds.includes(d.id)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setSelectedIds(prev => checked ? [...prev, d.id] : prev.filter(id => id !== d.id));
                        }}
                      />
                      <span className="text-sm">{d.donorName} - {Number(d.amount).toLocaleString()} {d.currency}</span>
                    </div>
                  ))}
                </div>
                <Button className="mt-4" onClick={handleAssign} disabled={selectedIds.length === 0 || isPending}>
                  {isPending ? "Affectation..." : `Affecter les ${selectedIds.length} dons sélectionnés`}
                </Button>
              </section>

              <section>
                <h4 className="font-bold mb-2 flex items-center gap-2"><History size={16}/> Historique des fonds</h4>
                <div className="max-h-48 overflow-y-auto border rounded p-3 text-sm space-y-1">
                  {history.length === 0 && <p className="text-sm text-muted-foreground">Aucun historique.</p>}
                  {history.map(d => (
                    <div key={d.id} className="py-1 border-b last:border-0 flex justify-between">
                        <span>{d.donorName}</span>
                        <span className="font-semibold">{Number(d.amount).toLocaleString()} {d.currency}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
