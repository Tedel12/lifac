import { Resend } from "resend";

const LIFAC_STAFF_EMAIL = "info@lifac.org";

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

// Envoi best-effort vers l'équipe LiFAC : ne doit jamais faire échouer l'action
// appelante (candidature/contact) si l'email ne part pas (clé absente, erreur API...).
export async function sendStaffNotificationEmail(params: {
  subject: string;
  replyTo?: string;
  html: string;
}): Promise<void> {
  const resend = getResendClient();
  if (!resend) {
    console.warn("[email] RESEND_API_KEY absente — email non envoyé :", params.subject);
    return;
  }

  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || "LiFAC <noreply@lifac.org>",
      to: LIFAC_STAFF_EMAIL,
      replyTo: params.replyTo,
      subject: params.subject,
      html: params.html,
    });
  } catch (e) {
    console.error("[email] Échec de l'envoi :", e);
  }
}
