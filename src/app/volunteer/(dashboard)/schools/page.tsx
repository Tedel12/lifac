import { getAllSchoolsReadOnly } from "@/actions/volunteer-school-actions";
import { getCurrentAgentId } from "@/actions/auth";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { SchoolsList } from "./schools-list";

export const dynamic = "force-dynamic";

export default async function VolunteerSchoolsPage() {
  const [schools, agentId] = await Promise.all([getAllSchoolsReadOnly(), getCurrentAgentId()]);

  return (
    <div className="space-y-6 animate-fade-in">
      <AdminPageHeader
        title="Écoles"
        description="Toutes les écoles enregistrées. Vous pouvez ajouter une école et modifier celles que vous avez vous-même ajoutées."
      />
      <SchoolsList schools={schools} currentAgentId={agentId} />
    </div>
  );
}
