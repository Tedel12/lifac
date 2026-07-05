"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { SchoolStatus } from "@prisma/client";

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

export async function deleteSchool(id: string) {
  await prisma.school.delete({ where: { id } });
  revalidatePath("/admin/schools");
}
