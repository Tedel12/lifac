import { getAllSchoolsReadOnly } from "@/actions/volunteer-school-actions";
import { getCurrentAgentId, isEvangelist } from "@/actions/auth";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { SchoolsList } from "./schools-list";

export const dynamic = "force-dynamic";

export default async function VolunteerSchoolsPage() {
  const [schools, agentId, evangelist] = await Promise.all([
    getAllSchoolsReadOnly(),
    getCurrentAgentId(),
    isEvangelist(),
  ]);
  const agent = agentId
    ? await prisma.user.findUnique({ where: { id: agentId }, select: { canDeleteSchools: true } })
    : null;

  return (
    <div className="space-y-6 animate-fade-in">
      <AdminPageHeader
        title="Écoles"
        description={
          evangelist
            ? "Toutes les écoles enregistrées. En tant qu'évangéliste, vous pouvez ajouter, modifier et supprimer n'importe quelle école."
            : "Toutes les écoles enregistrées. Vous pouvez ajouter une école et modifier celles que vous avez vous-même ajoutées."
        }
      />
      <SchoolsList
        schools={schools}
        currentAgentId={agentId}
        canDeleteSchools={evangelist || (agent?.canDeleteSchools ?? false)}
        isEvangelist={evangelist}
      />
    </div>
  );
}
