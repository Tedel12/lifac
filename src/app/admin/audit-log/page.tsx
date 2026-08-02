import { getAuditLog } from "@/actions/admin-audit-log-actions";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const dynamic = "force-dynamic";

const ACTION_LABELS: Record<string, string> = {
  ADMIN_CREATE: "Création d'un administrateur",
  ADMIN_REACTIVATE: "Réactivation d'un administrateur",
  ADMIN_DEACTIVATE: "Désactivation d'un administrateur",
  AGENT_CREATE: "Création d'un missionnaire",
  AGENT_UPDATE: "Modification d'un missionnaire",
  AGENT_DELETE: "Suppression d'un missionnaire",
  VOLUNTEER_APPLICATION_APPROVE: "Approbation d'une candidature",
  VOLUNTEER_APPLICATION_REJECT: "Rejet d'une candidature",
  CAMPAIGN_CREATE: "Création d'une campagne",
  CAMPAIGN_DELETE: "Suppression d'une campagne",
  EVENT_CREATE: "Création d'un événement",
  EVENT_DELETE: "Suppression d'un événement",
  DONATION_STATUS_UPDATE: "Changement de statut d'un don",
};

export default async function AuditLogPage() {
  const logs = await getAuditLog();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Journal d'audit"
        description="Trace des actions sensibles effectuées depuis le tableau de bord administrateur (100 dernières entrées)."
      />

      <Card>
        <CardContent className="p-0">
          {logs.length === 0 ? (
            <p className="p-6 text-sm text-gray-500">Aucune action journalisée pour le moment.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entité</TableHead>
                  <TableHead>Effectuée par</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap text-xs text-gray-500">
                      {log.createdAt.toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
                    </TableCell>
                    <TableCell className="font-medium text-lifac-navy-900">
                      {ACTION_LABELS[log.action] ?? log.action}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {log.entity}
                      {log.entityId ? ` #${log.entityId.slice(0, 8)}` : ""}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">{log.user?.name ?? "Super-admin"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
