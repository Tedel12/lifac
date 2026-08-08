"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { SchoolStatus } from "@prisma/client";
import { getCurrentAgentId } from "@/actions/auth";

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
