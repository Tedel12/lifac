"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { PaymentStatus } from "@prisma/client";
import { logAudit } from "@/lib/audit-log";

export async function getDonations(params?: {
  search?: string;
  status?: PaymentStatus | "ALL";
}) {
  const where: any = {};
  if (params?.search && params.search.trim() !== "") {
    where.OR = [
      { reference: { contains: params.search, mode: "insensitive" } },
      { donorName: { contains: params.search, mode: "insensitive" } },
      { donorEmail: { contains: params.search, mode: "insensitive" } },
    ];
  }
  if (params?.status && params.status !== "ALL") where.status = params.status;

  return prisma.donation.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { campaign: { select: { title: true } }, donor: { select: { name: true, email: true } } },
  });
}

export async function getDonationStats() {
  const [approvedAgg, pendingCount, totalCount] = await Promise.all([
    prisma.donation.aggregate({ _sum: { amount: true }, where: { status: "APPROVED" } }),
    prisma.donation.count({ where: { status: "PENDING" } }),
    prisma.donation.count(),
  ]);
  return {
    totalApproved: approvedAgg._sum.amount ?? BigInt(0),
    pendingCount,
    totalCount,
  };
}

export async function updateDonationStatus(id: string, status: PaymentStatus) {
  const donation = await prisma.donation.findUnique({ where: { id } });
  if (!donation) return;

  const wasApproved = donation.status === "APPROVED";
  const willBeApproved = status === "APPROVED";

  await prisma.donation.update({
    where: { id },
    data: {
      status,
      approvedAt: willBeApproved ? new Date() : donation.approvedAt,
    },
  });

  // Garde la progression de la campagne cohérente avec les dons confirmés manuellement
  // (le webhook FedaPay fait le même incrément pour les paiements en ligne)
  if (donation.campaignId && wasApproved !== willBeApproved) {
    await prisma.campaign.update({
      where: { id: donation.campaignId },
      data: {
        currentAmount: { [willBeApproved ? "increment" : "decrement"]: donation.amount },
      },
    });
  }

  await logAudit("DONATION_STATUS_UPDATE", "Donation", id, { status: donation.status }, { status });

  revalidatePath("/admin/donations");
  revalidatePath("/admin/dashboard");
  revalidatePath("/campaigns");
}
