"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { createActivity, updateActivity } from "@/actions/activity-actions";
import { ActivityStatus, ActivityType } from "@prisma/client";

const ACTIVITY_TYPE_LABELS: Record<string, string> = {
    CRUSADE: "Croisade d'évangélisation",
    POP_UP_CRUSADE: "Croisade de proximité",
    NIGHT_OF_HOPE: "Nuit de l'Espoir",
    MARKET_OUTREACH: "Jésus au marché",
    ONE_ON_ONE: "Évangélisation personnelle",
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
    const [formData, setFormData] = useState(
        activity
            ? { ...activity, date: activity.date ? new Date(activity.date).toISOString().slice(0, 10) : "" }
            : {
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
                partnerChurch: "",
                contactName: "",
                contactPhone: "",
                estimatedParticipants: 0,
                actualParticipants: 0,
                decisionsForChrist: 0,
                biblesDistributed: 0,
                newContacts: 0,
                notes: "",
            }
    );

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!formData.title.trim() || !formData.date) {
            alert("Le titre et la date sont obligatoires");
            return;
        }
        if (activity) {
            await updateActivity(activity.id, formData);
        } else {
            await createActivity(formData);
        }
        onUpdate && onUpdate();
        onClose();
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
                                <Label>Responsable / coordinateur</Label>
                                <Input value={formData.responsibleName ?? ""} onChange={(e) => setFormData({ ...formData, responsibleName: e.target.value })} />
                            </div>
                            <div className="space-y-1">
                                <Label>Église / organisation partenaire</Label>
                                <Input value={formData.partnerChurch ?? ""} onChange={(e) => setFormData({ ...formData, partnerChurch: e.target.value })} />
                            </div>
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
