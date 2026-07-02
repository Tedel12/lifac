"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateGlobalStats, updateModuleDistribution } from "@/actions/dashboard";

export function AdminContentManager({ initialStats, initialDistributions }: { 
    initialStats: any, 
    initialDistributions: any[] 
}) {
    const statsForm = useForm({
        defaultValues: {
            totalSoulsWon: initialStats?.totalSoulsWon || 0,
            schoolsVisited: initialStats?.schoolsVisited || 0,
            marketOutreach: initialStats?.marketOutreach || 0,
            totalCrusades: initialStats?.totalCrusades || 0,
            totalDonations: Number(initialStats?.totalDonations || 0),
            totalVolunteers: initialStats?.totalVolunteers || 0,
        }
    });

    const [isSavingStats, setIsSavingStats] = useState(false);

    const onStatsSubmit = async (data: any) => {
        setIsSavingStats(true);
        try {
            await updateGlobalStats(data);
            alert("Statistiques mises à jour avec succès");
        } catch (error) {
            alert("Erreur lors de la mise à jour");
        } finally {
            setIsSavingStats(false);
        }
    };

    return (
        <div className="grid md:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Mise à jour des KPIs</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={statsForm.handleSubmit(onStatsSubmit)} className="space-y-4">
                        <Input type="number" {...statsForm.register("totalSoulsWon", { valueAsNumber: true })} placeholder="Total âmes gagnées" />
                        <Input type="number" {...statsForm.register("schoolsVisited", { valueAsNumber: true })} placeholder="Écoles visitées" />
                        <Input type="number" {...statsForm.register("marketOutreach", { valueAsNumber: true })} placeholder="Marchés visités" />
                        <Input type="number" {...statsForm.register("totalCrusades", { valueAsNumber: true })} placeholder="Total croisades" />
                        <Button type="submit" disabled={isSavingStats}>
                            {isSavingStats ? "Enregistrement..." : "Sauvegarder les KPIs"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
