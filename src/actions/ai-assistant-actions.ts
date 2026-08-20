"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentAgentId, getCurrentAgentName } from "@/actions/auth";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const SYSTEM_PROMPT_BASE = `Tu es l'Assistant IA LiFAC, intégré à la plateforme LiFAC-Go (Light For All Center),
une organisation d'évangélisation et  d'action humanitaire au Bénin. Tu aides les missionnaires
de terrain avec :
- leurs activités (écoles, marchés, croisades, one-to-one) et leur planning ;
- des conseils pratiques de terrain (navigation, rapports, présence) ;
- de l'assistance biblique : versets, messages courts, sujets de prière, plans de prédication ;
- des questions administratives simples sur leurs statistiques personnelles.

Réponds toujours en français, de façon précise, claire et brève (quelques phrases ou une liste
courte). Si on te demande quelque chose hors de ton rôle (technique, non lié à LiFAC ou à la foi
chrétienne), réponds poliment que ce n'est pas ton domaine et recentre sur ce que tu peux faire.`;

async function buildGroundedSystemPrompt(): Promise<string> {
  const agentId = await getCurrentAgentId();
  if (!agentId) return SYSTEM_PROMPT_BASE;

  const [agentName, upcomingActivities, schoolsCount] = await Promise.all([
    getCurrentAgentName(),
    prisma.activity.findMany({
      where: { assignedToId: agentId, date: { gte: new Date() } },
      orderBy: { date: "asc" },
      take: 5,
      select: { title: true, type: true, date: true, commune: true, status: true },
    }),
    prisma.school.count({ where: { agentId } }),
  ]);

  const activitiesList = upcomingActivities.length
    ? upcomingActivities
        .map(
          (a) =>
            `- ${a.title} (${a.type}) le ${a.date.toLocaleDateString("fr-FR")}${a.commune ? " à " + a.commune : ""} — statut ${a.status}`
        )
        .join("\n")
    : "Aucune activité à venir programmée.";

  return `${SYSTEM_PROMPT_BASE}

Contexte connu sur le missionnaire actuellement connecté (utilise-le si pertinent, ne l'invente pas
pour d'autres missionnaires) :
- Nom : ${agentName ?? "inconnu"}
- Écoles qui lui sont assignées : ${schoolsCount}
- Ses prochaines activités :
${activitiesList}`;
}

export async function askAiAssistant(history: ChatMessage[]): Promise<{ success: boolean; reply?: string; error?: string }> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      error: "L'assistant IA n'est pas encore configuré (clé API manquante côté serveur).",
    };
  }

  const systemPrompt = await buildGroundedSystemPrompt();

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "system", content: systemPrompt }, ...history.slice(-12)],
        temperature: 0.4,
        max_tokens: 600,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[askAiAssistant] Erreur Groq :", res.status, errText);
      return { success: false, error: "L'assistant IA est momentanément indisponible. Réessayez dans un instant." };
    }

    const data = await res.json();
    const reply = data?.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      return { success: false, error: "Réponse vide de l'assistant. Réessayez." };
    }

    // Persistance du fil : le missionnaire retrouve sa conversation après un refresh
    // ou une reconnexion. Best-effort, ne doit pas faire échouer la réponse affichée.
    const agentId = await getCurrentAgentId();
    const lastUserMessage = [...history].reverse().find((m) => m.role === "user");
    if (agentId && lastUserMessage) {
      try {
        await prisma.aiMessage.createMany({
          data: [
            { userId: agentId, role: "user", content: lastUserMessage.content },
            { userId: agentId, role: "assistant", content: reply },
          ],
        });
      } catch (e) {
        console.error("[askAiAssistant] Historique non enregistré :", e);
      }
    }

    return { success: true, reply };
  } catch (e) {
    console.error("[askAiAssistant] Erreur :", e);
    return { success: false, error: "Erreur de connexion à l'assistant IA." };
  }
}

// Charge le fil de conversation persisté du missionnaire connecté.
export async function getMyAiHistory(): Promise<ChatMessage[]> {
  const agentId = await getCurrentAgentId();
  if (!agentId) return [];

  const messages = await prisma.aiMessage.findMany({
    where: { userId: agentId },
    orderBy: { createdAt: "asc" },
    take: 100,
    select: { role: true, content: true },
  });

  return messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
}

export async function clearMyAiHistory() {
  const agentId = await getCurrentAgentId();
  if (!agentId) return;
  await prisma.aiMessage.deleteMany({ where: { userId: agentId } });
}
