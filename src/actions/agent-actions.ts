"use server";

import { prisma } from "@/lib/prisma";

export async function getAgents() {
  return await prisma.user.findMany({
    where: {
      role: {
        in: ["VOLUNTEER"] // Assuming agents have the VOLUNTEER role
      },
      isActive: true
    },
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      // We don't have a specific 'status' field on User for availability in schema,
      // but we can mock it or derive it based on volunteer profile
      volunteerProfile: {
        select: {
          status: true
        }
      }
    }
  });
}

export async function assignSchoolToAgent(schoolId: string, agentId: string) {
    console.log(`Assigning school ${schoolId} to agent ${agentId}`);
    
    try {
        await prisma.$transaction([
            prisma.school.update({
                where: { id: schoolId },
                data: { 
                    agentId: agentId,
                    status: "AFFECTEE"
                }
            }),
            prisma.schoolAssignmentHistory.create({
                data: {
                    schoolId: schoolId,
                    agentId: agentId
                }
            })
        ]);
        revalidatePath("/admin/schools");
        return { success: true };
    } catch (error) {
        console.error("Erreur affectation agent:", error);
        return { success: false, error: "Erreur lors de l'affectation." };
    }
}

export async function getAssignmentHistory() {
    return await prisma.schoolAssignmentHistory.findMany({
        include: {
            school: { select: { name: true } },
            agent: { select: { name: true } }
        },
        orderBy: { assignedAt: "desc" }
    });
}
