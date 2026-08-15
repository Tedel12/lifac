"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { SchoolStatus } from "@prisma/client";
import { logAudit } from "@/lib/audit-log";

export async function getSchools(params?: { search?: string; status?: SchoolStatus }) {
  const where: any = {};
  if (params?.search && params.search.trim() !== "") {
    where.OR = [
      { name: { contains: params.search, mode: "insensitive" } },
      { code: { contains: params.search, mode: "insensitive" } },
    ];
  }
  if (params?.status && params.status !== ("ALL" as any)) {
    where.status = params.status;
  }
  return await prisma.school.findMany({ where, orderBy: { createdAt: "desc" } });
}

export async function createSchool(data: any) {
  await prisma.school.create({ data });
  revalidatePath("/admin/schools");
}

export async function updateSchool(id: string, data: any) {
  await prisma.school.update({ where: { id }, data });
  revalidatePath("/admin/schools");
}

// Changement de statut uniquement (utilisé par l'admin, qui ne peut plus modifier
// les autres informations d'une école une fois qu'un missionnaire peut en être l'auteur).
export async function updateSchoolStatus(id: string, status: SchoolStatus) {
  await prisma.school.update({ where: { id }, data: { status } });
  revalidatePath("/admin/schools");
}

export async function deleteSchool(id: string) {
  const existing = await prisma.school.findUnique({ where: { id }, select: { name: true, code: true } });
  await prisma.school.delete({ where: { id } });
  await logAudit("SCHOOL_DELETE", "School", id, existing ?? undefined, undefined);
  revalidatePath("/admin/schools");
}
