"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronUp } from "lucide-react";
import { updateMyActivityOutcome } from "@/actions/volunteer-actions";
import { toast } from "sonner";

export default function ReportsClient({ activities: initialActivities }: { activities: any[] }) {
  const [activities, setActivities] = useState(initialActivities);
  const [openId, setOpenId] = useState<string | null>(null);

  if (activities.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-gray-500">
          Aucune activité passée ne vous est assignée pour le moment.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <ActivityReportRow
          key={activity.id}
          activity={activity}
          isOpen={openId === activity.id}
          onToggle={() => setOpenId(openId === activity.id ? null : activity.id)}
          onSaved={(updated) => setActivities(activities.map((a) => (a.id === activity.id ? { ...a, ...updated } : a)))}
        />
      ))}
    </div>
  );
}

function ActivityReportRow({
  activity,
  isOpen,
  onToggle,
  onSaved,
}: {
  activity: any;
  isOpen: boolean;
  onToggle: () => void;
  onSaved: (data: any) => void;
}) {
  const [form, setForm] = useState({
    actualParticipants: activity.actualParticipants ?? "",
    decisionsForChrist: activity.decisionsForChrist ?? "",
    biblesDistributed: activity.biblesDistributed ?? "",
    newContacts: activity.newContacts ?? "",
    notes: activity.notes ?? "",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = {
        actualParticipants: form.actualParticipants === "" ? undefined : Number(form.actualParticipants),
        decisionsForChrist: form.decisionsForChrist === "" ? undefined : Number(form.decisionsForChrist),
        biblesDistributed: form.biblesDistributed === "" ? undefined : Number(form.biblesDistributed),
        newContacts: form.newContacts === "" ? undefined : Number(form.newContacts),
        notes: form.notes || undefined,
      };
      await updateMyActivityOutcome(activity.id, data);
      onSaved(data);
      toast.success("Compte-rendu enregistré");
    } catch (e: any) {
      toast.error(e?.message ?? "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-300">
      <CardContent className="p-0">
        <button onClick={onToggle} className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors rounded-t-xl">
          <div>
            <p className="font-medium text-lifac-navy-900">{activity.title}</p>
            <p className="text-xs text-gray-500">
              {new Date(activity.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
              {activity.commune ? ` — ${activity.commune}` : ""}
            </p>
          </div>
          {isOpen ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
        </button>

        {isOpen && (
          <div className="p-4 border-t border-gray-100 space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Participants réels</Label>
                <Input
                  type="number"
                  value={form.actualParticipants}
                  onChange={(e) => setForm({ ...form, actualParticipants: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Décisions pour Christ</Label>
                <Input
                  type="number"
                  value={form.decisionsForChrist}
                  onChange={(e) => setForm({ ...form, decisionsForChrist: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Bibles distribuées</Label>
                <Input
                  type="number"
                  value={form.biblesDistributed}
                  onChange={(e) => setForm({ ...form, biblesDistributed: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Nouveaux contacts</Label>
                <Input
                  type="number"
                  value={form.newContacts}
                  onChange={(e) => setForm({ ...form, newContacts: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Observations</Label>
              <textarea
                className="w-full border rounded-md px-3 py-2 text-sm min-h-[70px]"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? "Enregistrement..." : "Enregistrer le compte-rendu"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
