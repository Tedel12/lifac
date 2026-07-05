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
    // This is the assignment logic to be implemented later
    console.log(`Assigning school ${schoolId} to agent ${agentId}`);
    
    // Update school status to AFFECTEE
    await prisma.school.update({
        where: { id: schoolId },
        data: { status: "AFFECTEE" }
    });
    
    return { success: true };
}
