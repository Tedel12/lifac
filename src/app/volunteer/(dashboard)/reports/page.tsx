import { getMyActivities } from "@/actions/volunteer-actions";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import ReportsClient from "./reports-client";

export const dynamic = "force-dynamic";

export default async function VolunteerReportsPage() {
  const activities = await getMyActivities({ upcoming: false });

  return (
    <div className="space-y-6 animate-fade-in">
      <AdminPageHeader
        title="Rapports de terrain"
        description="Complétez les résultats de vos activités passées : participants, décisions pour Christ, Bibles distribuées."
      />
      <ReportsClient activities={activities} />
    </div>
  );
}
