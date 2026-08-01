"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";

export async function getCommunityUsers(params?: { search?: string; role?: "DONOR" | "MEMBER" | "ALL" }) {
  const where: any = { role: { in: [Role.DONOR, Role.MEMBER] } };
  if (params?.role && params.role !== "ALL") where.role = params.role;
  if (params?.search && params.search.trim() !== "") {
    where.OR = [
      { name: { contains: params.search, mode: "insensitive" } },
      { email: { contains: params.search, mode: "insensitive" } },
    ];
  }

  return prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      isActive: true,
      createdAt: true,
      _count: { select: { donations: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function toggleUserActive(id: string, isActive: boolean) {
  await prisma.user.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/users");
}
