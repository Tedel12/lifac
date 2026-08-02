"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentAdminId } from "@/actions/auth";

// Journalisation best-effort des actions sensibles de l'admin (ne doit jamais faire
// échouer l'action appelante si l'écriture du log rencontre un problème).
export async function logAudit(
  action: string,
  entity: string,
  entityId?: string | null,
  oldValue?: unknown,
  newValue?: unknown
) {
  try {
    const adminId = await getCurrentAdminId();
    // "env-admin" est un compte admin de secours défini par variables d'environnement,
    // il ne correspond à aucune ligne User — on ne peut pas le référencer via la FK.
    const userId = adminId && adminId !== "env-admin" ? adminId : null;

    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId: entityId ?? null,
        oldValue: oldValue === undefined ? undefined : (oldValue as any),
        newValue: newValue === undefined ? undefined : (newValue as any),
      },
    });
  } catch (e) {
    console.error("[logAudit] Erreur :", e);
  }
}
