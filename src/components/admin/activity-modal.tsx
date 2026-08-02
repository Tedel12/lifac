"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Upload, Loader2 } from "lucide-react";
import { createActivity, updateActivity } from "@/actions/activity-actions";
import { getAgents } from "@/actions/admin-agent-actions";
import { uploadAdminImage } from "@/actions/upload-actions";
import { ActivityStatus, ActivityType } from "@prisma/client";

const ACTIVITY_TYPE_LABELS: Record<string, string> = {
    CRUSADE: "Croisade d'évangélisation",
    YOUTH_CRUSADE: "Youth Crusade",
    POP_UP_CRUSADE: "Pop-up Crusade",
    MARKET_OUTREACH: "Évangélisation au marché",
    ONE_ON_ONE: "Évangélisation personnelle",
    NIGHT_OF_HOPE: "La Nuit de l'Espoir",
    HUMANITARIAN: "Actions Humanitaires",
    TRAINING: "Formation en Évangélisation",
    OTHER: "Autre",
};

const ACTIVITY_STATUS_LABELS: Record<string, string> = {
    DRAFT: "Brouillon",
    PLANNED: "Planifiée",
    CONFIRMED: "Confirmée",
    ONGOING: "En cours",
    COMPLETED: "Terminée",
    POSTPONED: "Reportée",
    CANCELED: "Annulée",
};

export function ActivityModal({ isOpen, onClose, activity, onUpdate }: any) {
    const [agents, setAgents] = useState<{ id: string; name: string | null; email: string }[]>([]);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    useEffect(() => {
        getAgents().then((data: any) => setAgents(data));
    }, []);

    const [formData, setFormData] = useState(() => {
        if (activity) {
            // On exclut la relation `assignedTo` (objet imbriqué) : seul `assignedToId` (scalaire) est modifiable.
            const { assignedTo, ...rest } = activity;
            return { ...rest, date: activity.date ? new Date(activity.date).toISOString().slice(0, 10) : "" };
        }
        return {
            type: ActivityType.CRUSADE,
            title: "",
            status: ActivityStatus.PLANNED,
            country: "Bénin",
            commune: "",
            address: "",
            date: "",
            startTime: "",
            endTime: "",
            responsibleName: "",
            imageUrl: "",
            assignedToId: "",
            partnerChurch: "",
            contactName: "",
            contactPhone: "",
            estimatedParticipants: 0,
            actualParticipants: 0,
            decisionsForChrist: 0,
            biblesDistributed: 0,
            newContacts: 0,
            notes: "",
        };
    });

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!formData.title.trim() || !formData.date) {
            alert("Le titre et la date sont obligatoires");
            return;
        }
        const payload = { ...formData, assignedToId: formData.assignedToId || null };
        if (activity) {
            await updateActivity(activity.id, payload);
        } else {
            await createActivity(payload);
        }
        onUpdate && onUpdate();
        onClose();
    };

    const handlePhotoChange = async (file: File | null) => {
        if (!file) return;
        setUploading(true);
        setUploadError(null);
        try {
            const fd = new FormData();
            fd.set("file", file);
            const result = await uploadAdminImage(fd);
            if (!result.success || !result.url) {
                setUploadError(result.error ?? "Erreur lors de l'envoi de l'image.");
                return;
            }
            setFormData((prev: any) => ({ ...prev, imageUrl: result.url }));
        } finally {
            setUploading(false);
        }
    };

    const numberField = (key: string, label: string) => (
        <div className="space-y-1">
            <Label>{label}</Label>
            <Input
                type="number"
                value={formData[key] ?? ""}
                onChange={(e) => setFormData({ ...formData, [key]: e.target.value ? parseInt(e.target.value) : 0 })}
            />
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl relative">
                <button onClick={onClose} className="absolute top-2 right-2 p-2 hover:bg-gray-100 rounded-full">
                    <X size={18} />
                </button>

                <CardContent className="p-6">
                    <fieldset className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
                        <h3 className="font-bold text-lg">{activity ? "Modifier l'activité" : "Ajouter une activité"}</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label>Type d&apos;activité</Label>
                                <select
                                    className="w-full border rounded-md px-3 py-2 text-sm"
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                >
                                    {Object.entries(ACTIVITY_TYPE_LABELS).map(([value, label]) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <Label>Statut</Label>
                                <select
                                    className="w-full border rounded-md px-3 py-2 text-sm"
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                >
                                    {Object.entries(ACTIVITY_STATUS_LABELS).map(([value, label]) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label>Intitulé de l&apos;activité</Label>
                            <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                        </div>

                        <div className="space-y-1">
                            <Label>Photo de l&apos;activité</Label>
                            <div className="flex items-center gap-3">
                                {formData.imageUrl && (
                                    <img src={formData.imageUrl} alt="" className="h-14 w-14 rounded-lg object-cover border" />
                                )}
                                <label className="flex items-center gap-2 border rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 cursor-pointer">
                                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                    {uploading ? "Envoi..." : formData.imageUrl ? "Changer la photo" : "Choisir une photo"}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        disabled={uploading}
                                        onChange={(e) => handlePhotoChange(e.target.files?.[0] ?? null)}
                                    />
                                </label>
                            </div>
                            {uploadError && <p className="text-xs text-red-600">{uploadError}</p>}
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-1">
                                <Label>Date</Label>
                                <Input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
                            </div>
                            <div className="space-y-1">
                                <Label>Heure de début</Label>
                                <Input type="time" value={formData.startTime ?? ""} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} />
                            </div>
                            <div className="space-y-1">
                                <Label>Heure de fin</Label>
                                <Input type="time" value={formData.endTime ?? ""} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-1">
                                <Label>Pays</Label>
                                <Input value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} />
                            </div>
                            <div className="space-y-1">
                                <Label>Commune / Ville</Label>
                                <Input value={formData.commune ?? ""} onChange={(e) => setFormData({ ...formData, commune: e.target.value })} />
                            </div>
                            <div className="space-y-1">
                                <Label>Lieu précis</Label>
                                <Input value={formData.address ?? ""} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label>Missionnaire responsable</Label>
                                <select
                                    className="w-full border rounded-md px-3 py-2 text-sm"
                                    value={formData.assignedToId ?? ""}
                                    onChange={(e) => setFormData({ ...formData, assignedToId: e.target.value })}
                                >
                                    <option value="">— Non assigné —</option>
                                    {agents.map((a) => (
                                        <option key={a.id} value={a.id}>
                                            {a.name || a.email}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <Label>Responsable (nom libre, affichage)</Label>
                                <Input value={formData.responsibleName ?? ""} onChange={(e) => setFormData({ ...formData, responsibleName: e.target.value })} />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label>Église / organisation partenaire</Label>
                            <Input value={formData.partnerChurch ?? ""} onChange={(e) => setFormData({ ...formData, partnerChurch: e.target.value })} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label>Contact local — Nom</Label>
                                <Input value={formData.contactName ?? ""} onChange={(e) => setFormData({ ...formData, contactName: e.target.value })} />
                            </div>
                            <div className="space-y-1">
                                <Label>Contact local — Téléphone</Label>
                                <Input value={formData.contactPhone ?? ""} onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {numberField("estimatedParticipants", "Participants estimés")}
                            {numberField("actualParticipants", "Participants réels")}
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            {numberField("decisionsForChrist", "Décisions pour Christ")}
                            {numberField("biblesDistributed", "Bibles distribuées")}
                            {numberField("newContacts", "Nouveaux contacts")}
                        </div>

                        <div className="space-y-1">
                            <Label>Observations</Label>
                            <textarea
                                className="w-full border rounded-md px-3 py-2 text-sm min-h-[80px]"
                                value={formData.notes ?? ""}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            />
                        </div>

                        <div className="flex gap-2 pt-4">
                            <Button onClick={handleSubmit}>Sauvegarder</Button>
                            <Button variant="outline" onClick={onClose}>
                                Annuler
                            </Button>
                        </div>
                    </fieldset>
                </CardContent>
            </Card>
        </div>
    );
}
