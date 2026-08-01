"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { CampaignStatus, CampaignType } from "@prisma/client";

function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function generateUniqueSlug(title: string, excludeId?: string): Promise<string> {
  const base = slugify(title) || "campagne";
  let slug = base;
  let i = 1;
  while (
    await prisma.campaign.findFirst({
      where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
      select: { id: true },
    })
  ) {
    i += 1;
    slug = `${base}-${i}`;
  }
  return slug;
}

export async function getCampaigns(params?: { search?: string; status?: CampaignStatus | "ALL" }) {
  const where: any = {};
  if (params?.search && params.search.trim() !== "") {
    where.title = { contains: params.search, mode: "insensitive" };
  }
  if (params?.status && params.status !== "ALL") where.status = params.status;

  return prisma.campaign.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
}

export async function createCampaign(data: any) {
  const slug = await generateUniqueSlug(data.title);
  await prisma.campaign.create({
    data: {
      title: data.title,
      slug,
      shortDescription: data.shortDescription || data.title.slice(0, 280),
      description: data.description || "",
      type: data.type as CampaignType,
      status: data.status as CampaignStatus,
      goalAmount: BigInt(Math.round(Number(data.goalAmount) * 100) || 0),
      currentAmount: BigInt(0),
      coverImageUrl: data.coverImageUrl || null,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
      location: data.location || null,
      isUrgent: !!data.isUrgent,
      isFeatured: !!data.isFeatured,
    },
  });
  revalidatePath("/admin/campaigns");
  revalidatePath("/campaigns");
}

export async function updateCampaign(id: string, data: any) {
  await prisma.campaign.update({
    where: { id },
    data: {
      title: data.title,
      shortDescription: data.shortDescription,
      description: data.description,
      type: data.type as CampaignType,
      status: data.status as CampaignStatus,
      goalAmount: BigInt(Math.round(Number(data.goalAmount) * 100) || 0),
      coverImageUrl: data.coverImageUrl || null,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
      location: data.location || null,
      isUrgent: !!data.isUrgent,
      isFeatured: !!data.isFeatured,
    },
  });
  revalidatePath("/admin/campaigns");
  revalidatePath("/campaigns");
  revalidatePath(`/campaigns/${data.slug}`);
}

export async function deleteCampaign(id: string) {
  await prisma.campaign.delete({ where: { id } });
  revalidatePath("/admin/campaigns");
  revalidatePath("/campaigns");
}
