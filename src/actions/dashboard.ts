"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getDashboardStats() {
  const globalStats = await prisma.globalStats.findFirst();
  const moduleDistributions = await prisma.moduleDistribution.findMany();
  return { globalStats, moduleDistributions };
}

export async function updateGlobalStats(data: {
  totalSoulsWon: number;
  schoolsVisited: number;
  marketOutreach: number;
  totalCrusades: number;
  totalDonations: number;
  totalVolunteers: number;
}) {
  let stats = await prisma.globalStats.findFirst();
  if (stats) {
    stats = await prisma.globalStats.update({
      where: { id: stats.id },
      data,
    });
  } else {
    stats = await prisma.globalStats.create({
      data,
    });
  }
  revalidatePath("/admin/dashboard");
  return stats;
}

export async function updateModuleDistribution(distributions: {
  category: string;
  value: number;
  color: string;
}[]) {
  // Clear existing distributions and insert new ones
  await prisma.moduleDistribution.deleteMany();
  await prisma.moduleDistribution.createMany({
    data: distributions,
  });
  revalidatePath("/admin/dashboard");
}
