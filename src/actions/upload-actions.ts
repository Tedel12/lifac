"use server";

import { uploadToCloudinary } from "@/lib/cloudinary";

// Upload générique d'une image admin (activités, couverture d'événement, etc.)
export async function uploadAdminImage(formData: FormData): Promise<{ success: boolean; url?: string; error?: string }> {
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) {
    return { success: false, error: "Aucun fichier sélectionné." };
  }
  if (!file.type.startsWith("image/")) {
    return { success: false, error: "Le fichier doit être une image." };
  }
  try {
    const url = await uploadToCloudinary(file, "admin-uploads");
    return { success: true, url };
  } catch (e) {
    console.error("[uploadAdminImage] Erreur :", e);
    return { success: false, error: "Erreur lors de l'envoi de l'image." };
  }
}
