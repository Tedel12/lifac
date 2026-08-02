import { Flame } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getPrayerWall } from "@/actions/volunteer-actions";

export const dynamic = "force-dynamic";

export default async function VolunteerPrayerPage() {
  const requests = await getPrayerWall();

  return (
    <div className="space-y-6 animate-fade-in">
      <AdminPageHeader
        title="Mur de prière"
        description="Demandes de prière partagées par la communauté LiFAC — intercédez avec nous."
      />

      {requests.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-gray-500">Aucune demande de prière publique pour le moment.</CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {requests.map((r) => (
            <Card key={r.id} className="hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-5 space-y-2">
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-lifac-red-600" />
                  <h3 className="font-bold text-lifac-navy-900 text-sm">{r.title}</h3>
                </div>
                <p className="text-sm text-lifac-navy-700 leading-relaxed">{r.content}</p>
                <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                  <span>{r.authorName}</span>
                  <span>{r.prayerCount} prière(s)</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
