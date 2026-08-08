"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { testimonySchema } from "@/lib/validations";
import { logAudit } from "@/lib/audit-log";

export type SubmitTestimonyResult =
  | { success: true; message: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[] | undefined> };

// -----------------------------------
// PUBLIC
// -----------------------------------

export async function getApprovedTestimonies() {
  return prisma.testimony.findMany({
    where: { isApproved: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      authorName: true,
      authorRole: true,
      authorAvatar: true,
      content: true,
      createdAt: true,
    },
  });
}

export async function submitTestimony(input: {
  authorName: string;
  authorRole?: string;
  content: string;
}): Promise<SubmitTestimonyResult> {
  const parsed = testimonySchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Données invalides",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const data = parsed.data;

  try {
    await prisma.testimony.create({
      data: {
        authorName: data.authorName,
        authorRole: data.authorRole || null,
        content: data.content,
        isApproved: false,
        isFeatured: false,
      },
    });
  } catch (e) {
    console.error("[submitTestimony] Erreur :", e);
    return { success: false, error: "Erreur lors de l'enregistrement. Veuillez réessayer." };
  }

  await prisma.notification.create({
    data: {
      title: "Nouveau témoignage à valider",
      message: `${data.authorName} a soumis un témoignage.`,
      type: "info",
    },
  });

  return {
    success: true,
    message: "Merci ! Votre témoignage sera visible après validation par notre équipe.",
  };
}

// -----------------------------------
// ADMIN
// -----------------------------------

export async function getAllTestimoniesAdmin() {
  return prisma.testimony.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function approveTestimony(id: string) {
  await prisma.testimony.update({ where: { id }, data: { isApproved: true } });
  await logAudit("TESTIMONY_APPROVE", "Testimony", id);
  revalidatePath("/admin/testimonials");
  revalidatePath("/testimonials");
  revalidatePath("/");
}

export async function rejectTestimony(id: string) {
  await prisma.testimony.update({ where: { id }, data: { isApproved: false } });
  await logAudit("TESTIMONY_REJECT", "Testimony", id);
  revalidatePath("/admin/testimonials");
  revalidatePath("/testimonials");
}

export async function deleteTestimony(id: string) {
  await prisma.testimony.delete({ where: { id } });
  await logAudit("TESTIMONY_DELETE", "Testimony", id);
  revalidatePath("/admin/testimonials");
  revalidatePath("/testimonials");
  revalidatePath("/");
}

export async function toggleTestimonyFeatured(id: string, isFeatured: boolean) {
  await prisma.testimony.update({ where: { id }, data: { isFeatured } });
  revalidatePath("/admin/testimonials");
  revalidatePath("/testimonials");
  revalidatePath("/");
}
