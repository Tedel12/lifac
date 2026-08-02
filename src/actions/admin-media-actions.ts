"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function getAllMedia() {
  return prisma.media.findMany({
    orderBy: { uploadedAt: "desc" },
    include: {
      campaign: { select: { title: true } },
      event: { select: { title: true } },
    },
  });
}

export async function uploadMedia(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const file = formData.get("file") as File | null;
  const caption = (formData.get("caption") as string | null) ?? null;
  const altText = (formData.get("altText") as string | null) ?? null;

  if (!file || file.size === 0) {
    return { success: false, error: "Aucun fichier sélectionné." };
  }

  try {
    const url = await uploadToCloudinary(file, "media-library");
    const type = file.type.startsWith("video/") ? "video" : file.type.startsWith("image/") ? "image" : "document";

    await prisma.media.create({
      data: {
        url,
        type,
        filename: file.name,
        size: file.size,
        mimeType: file.type,
        caption: caption || null,
        altText: altText || null,
      },
    });
    revalidatePath("/admin/media");
    revalidatePath("/resources");
    return { success: true };
  } catch (e) {
    console.error("[uploadMedia] Erreur :", e);
    return { success: false, error: "Erreur lors de l'envoi du fichier." };
  }
}

export async function deleteMedia(id: string) {
  await prisma.media.delete({ where: { id } });
  revalidatePath("/admin/media");
  revalidatePath("/resources");
}
