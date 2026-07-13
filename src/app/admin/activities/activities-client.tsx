"use client";

import { useState } from "react";
import { Search, Plus, Filter, Trash2, Edit } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { deleteActivity, getActivities } from "@/actions/activity-actions";
import { ActivityStatus } from "@prisma/client";
import { ActivityModal } from "@/components/admin/activity-modal";
import { useTranslations } from "next-intl";

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

const STATUS_COLORS: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-700",
    PLANNED: "bg-blue-100 text-blue-700",
    CONFIRMED: "bg-emerald-100 text-emerald-700",
    ONGOING: "bg-amber-100 text-amber-700",
    COMPLETED: "bg-emerald-100 text-emerald-700",
    POSTPONED: "bg-orange-100 text-orange-700",
    CANCELED: "bg-red-100 text-red-700",
};

export default function ActivitiesPage({ activities: initialActivities }: { activities: any[] }) {
    const t = useTranslations("adminActivities");
    const [activities, setActivities] = useState(initialActivities);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<ActivityStatus | "ALL">("ALL");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState<any>(null);

    const refresh = async () => {
        const updated = await getActivities({ search, status: statusFilter !== "ALL" ? statusFilter : undefined });
        setActivities(updated);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Supprimer cette activité ?")) {
            await deleteActivity(id);
            await refresh();
        }
    };

    const handleEdit = (activity: any) => {
        setSelectedActivity(activity);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-lifac-navy-900">{t("title")}</h1>
                <Button
                    onClick={() => {
                        setSelectedActivity(null);
                        setIsModalOpen(true);
                    }}
                >
                    <Plus size={18} className="mr-2" /> {t("add")}
                </Button>
            </div>

            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                        placeholder={t("search")}
                        className="pl-10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && refresh()}
                    />
                </div>
                <select
                    className="border rounded-md px-3 text-sm"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                >
                    <option value="ALL">{t("allStatus")}</option>
                    {Object.entries(ACTIVITY_STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                            {label}
                        </option>
                    ))}
                </select>
                <Button onClick={refresh} variant="outline">
                    <Filter size={18} className="mr-2" /> {t("filter")}
                </Button>
            </div>

            <Card>
                <CardContent className="p-0">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-600 uppercase font-medium">
                            <tr>
                                <th className="px-6 py-4">Code</th>
                                <th className="px-6 py-4">Intitulé</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Lieu</th>
                                <th className="px-6 py-4">Statut</th>
                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {activities.length > 0 ? (
                                activities.map((activity) => (
                                    <tr key={activity.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium">{activity.code}</td>
                                        <td className="px-6 py-4">{activity.title}</td>
                                        <td className="px-6 py-4">{ACTIVITY_TYPE_LABELS[activity.type] ?? activity.type}</td>
                                        <td className="px-6 py-4">{new Date(activity.date).toLocaleDateString("fr-FR")}</td>
                                        <td className="px-6 py-4">{activity.commune || "—"}</td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs ${STATUS_COLORS[activity.status] ?? "bg-gray-100 text-gray-700"
                                                    }`}
                                            >
                                                {ACTIVITY_STATUS_LABELS[activity.status] ?? activity.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex justify-center gap-1">
                                                <Button variant="ghost" size="sm" className="text-blue-600 text-xs gap-1" onClick={() => handleEdit(activity)}>
                                                    <Edit size={14} />
                                                </Button>
                                                <Button variant="ghost" size="sm" className="text-red-600 text-xs gap-1" onClick={() => handleDelete(activity.id)}>
                                                    <Trash2 size={14} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="text-center p-6 text-gray-500">
                                        {t("empty")}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </CardContent>
            </Card>

            {isModalOpen && (
                <ActivityModal isOpen={true} onClose={() => setIsModalOpen(false)} activity={selectedActivity} onUpdate={refresh} />
            )}
        </div>
    );
}
