"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/audit-log";

export async function getAllPrayerRequests() {
  return prisma.prayerRequest.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      intercessions: {
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { intercessorName: true, createdAt: true },
      },
    },
  });
}

export async function createPrayerRequestAdmin(input: {
  title: string;
  content: string;
  authorName: string;
  category: "PROTECTION" | "SALUT" | "GUERISON" | "DELIVRANCE" | "AUTRE";
  isPublic: boolean;
}): Promise<{ success: boolean; error?: string }> {
  const title = input.title?.trim();
  const content = input.content?.trim();
  if (!title || title.length < 3) return { success: false, error: "Le sujet est trop court." };
  if (!content || content.length < 10) return { success: false, error: "La demande est trop courte." };

  const created = await prisma.prayerRequest.create({
    data: {
      authorName: input.authorName?.trim() || "Équipe LiFAC",
      title,
      content,
      category: input.category,
      isPublic: input.isPublic,
    },
  });

  await logAudit("PRAYER_CREATE", "PrayerRequest", created.id, undefined, { title });
  revalidatePath("/admin/prayer");
  revalidatePath("/volunteer/prayer");
  revalidatePath("/prayer");
  return { success: true };
}

export async function togglePrayerAnswered(id: string, isAnswered: boolean) {
  await prisma.prayerRequest.update({ where: { id }, data: { isAnswered } });
  revalidatePath("/admin/prayer");
  revalidatePath("/volunteer/prayer");
}

export async function deletePrayerRequest(id: string) {
  await prisma.prayerRequest.delete({ where: { id } });
  await logAudit("PRAYER_DELETE", "PrayerRequest", id);
  revalidatePath("/admin/prayer");
  revalidatePath("/volunteer/prayer");
  revalidatePath("/prayer");
}
