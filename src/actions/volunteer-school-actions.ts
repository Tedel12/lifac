"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { SchoolStatus } from "@prisma/client";
import { getCurrentAgentId } from "@/actions/auth";
import { logAudit } from "@/lib/audit-log";

async function requireAgentId(): Promise<string> {
  const id = await getCurrentAgentId();
  if (!id) throw new Error("Non authentifié");
  return id;
}

// Vue en lecture seule : toutes les écoles, avec l'info de qui les a créées
// (pour déterminer côté client si le missionnaire connecté peut les modifier).
export async function getAllSchoolsReadOnly() {
  return prisma.school.findMany({
    orderBy: { createdAt: "desc" },
    include: { createdBy: { select: { id: true, name: true } }, agent: { select: { id: true, name: true } } },
  });
}

export async function createMySchool(data: {
  name: string;
  countryCode?: string;
  department: string;
  commune: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  estimatedStudents?: number;
  responsibleName: string;
  phone: string;
  status?: SchoolStatus;
}) {
  const agentId = await requireAgentId();
  const year = new Date().getFullYear();
  const countInYear = await prisma.school.count({
    where: { createdAt: { gte: new Date(`${year}-01-01`) } },
  });
  const code = `ECO-${year}-${String(countInYear + 1).padStart(4, "0")}`;

  await prisma.school.create({
    data: {
      code,
      name: data.name,
      countryCode: data.countryCode || "BJ",
      department: data.department,
      commune: data.commune,
      address: data.address,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      estimatedStudents: data.estimatedStudents ?? 0,
      responsibleName: data.responsibleName,
      phone: data.phone,
      status: data.status ?? SchoolStatus.NON_CONFIRMEE,
      createdById: agentId,
      agentId, // le missionnaire qui ajoute l'école en devient responsable par défaut
    },
  });
  revalidatePath("/volunteer/schools");
  revalidatePath("/admin/schools");
}

export async function updateMySchool(
  id: string,
  data: Partial<{
    name: string;
    department: string;
    commune: string;
    address: string;
    latitude: number | null;
    longitude: number | null;
    estimatedStudents: number;
    responsibleName: string;
    phone: string;
    status: SchoolStatus;
  }>
) {
  const agentId = await requireAgentId();
  const school = await prisma.school.findUnique({ where: { id }, select: { createdById: true } });
  if (!school || school.createdById !== agentId) {
    throw new Error("Vous ne pouvez modifier que les écoles que vous avez vous-même ajoutées.");
  }
  await prisma.school.update({ where: { id }, data });
  revalidatePath("/volunteer/schools");
  revalidatePath("/admin/schools");
}

// --- Suivi des déplacements terrain (bouton "M'y rendre" puis "Je suis arrivé") ---

export async function startSchoolVisit(schoolId: string) {
  const agentId = await requireAgentId();
  const visit = await prisma.schoolVisit.create({
    data: { schoolId, agentId },
    select: { id: true, departedAt: true },
  });
  return { id: visit.id, departedAt: visit.departedAt.toISOString() };
}

export async function arriveAtSchool(
  visitId: string,
  position: { latitude: number; longitude: number; distanceMeters: number }
) {
  const agentId = await requireAgentId();
  const visit = await prisma.schoolVisit.findUnique({ where: { id: visitId }, select: { agentId: true } });
  if (!visit || visit.agentId !== agentId) {
    throw new Error("Déplacement introuvable.");
  }

  const updated = await prisma.schoolVisit.update({
    where: { id: visitId },
    data: {
      arrivedAt: new Date(),
      arrivalLatitude: position.latitude,
      arrivalLongitude: position.longitude,
      distanceMeters: position.distanceMeters,
    },
    select: { departedAt: true, arrivedAt: true },
  });

  revalidatePath("/volunteer/assignments");
  return {
    departedAt: updated.departedAt.toISOString(),
    arrivedAt: updated.arrivedAt!.toISOString(),
  };
}

// Suppression réservée aux écoles créées par le missionnaire lui-même, et uniquement
// si l'admin lui a explicitement accordé la permission (User.canDeleteSchools).
export async function deleteMySchool(id: string) {
  const agentId = await requireAgentId();
  const [agent, school] = await Promise.all([
    prisma.user.findUnique({ where: { id: agentId }, select: { canDeleteSchools: true } }),
    prisma.school.findUnique({ where: { id }, select: { createdById: true, name: true } }),
  ]);

  if (!agent?.canDeleteSchools) {
    throw new Error("Vous n'avez pas la permission de supprimer des écoles.");
  }
  if (!school || school.createdById !== agentId) {
    throw new Error("Vous ne pouvez supprimer que les écoles que vous avez vous-même ajoutées.");
  }

  await prisma.school.delete({ where: { id } });
  await logAudit("SCHOOL_DELETE", "School", id, { name: school.name, deletedBy: "missionnaire" }, undefined);
  revalidatePath("/volunteer/schools");
  revalidatePath("/admin/schools");
}
