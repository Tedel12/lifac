"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";

export async function getAgents() {
  return await prisma.user.findMany({
    where: {
      role: Role.VOLUNTEER,
      isActive: true
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatarUrl: true,
    }
  });
}

export async function createAgent(data: any) {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  await prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      phone: data.phone,
      password: hashedPassword,
      role: Role.VOLUNTEER,
    },
  });
  revalidatePath("/admin/agents");
}

export async function deleteAgent(id: string) {
  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin/agents");
}

export async function updateAgent(id: string, data: any) {
  await prisma.user.update({ where: { id }, data });
  revalidatePath("/admin/agents");
}
