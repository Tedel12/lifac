import { getAllSchoolsReadOnly } from "@/actions/volunteer-school-actions";
import { getCurrentAgentId } from "@/actions/auth";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { SchoolsList } from "./schools-list";

export const dynamic = "force-dynamic";

export default async function VolunteerSchoolsPage() {
  const [schools, agentId] = await Promise.all([getAllSchoolsReadOnly(), getCurrentAgentId()]);
  const agent = agentId
    ? await prisma.user.findUnique({ where: { id: agentId }, select: { canDeleteSchools: true } })
    : null;

  return (
    <div className="space-y-6 animate-fade-in">
      <AdminPageHeader
        title="Écoles"
        description="Toutes les écoles enregistrées. Vous pouvez ajouter une école et modifier celles que vous avez vous-même ajoutées."
      />
      <SchoolsList schools={schools} currentAgentId={agentId} canDeleteSchools={agent?.canDeleteSchools ?? false} />
    </div>
  );
}
