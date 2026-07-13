"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ActivityStatus, ActivityType } from "@prisma/client";

export async function getActivities(params?: {
    search?: string;
    status?: ActivityStatus;
    type?: ActivityType;
}) {
    const where: any = {};
    if (params?.search && params.search.trim() !== "") {
        where.OR = [
            { title: { contains: params.search, mode: "insensitive" } },
            { code: { contains: params.search, mode: "insensitive" } },
        ];
    }
    if (params?.status && (params.status as any) !== "ALL") {
        where.status = params.status;
    }
    if (params?.type && (params.type as any) !== "ALL") {
        where.type = params.type;
    }
    return prisma.activity.findMany({ where, orderBy: { date: "desc" } });
}

// Génère un code séquentiel par année, ex: "ACT-2026-00001"
async function generateActivityCode(date: Date): Promise<string> {
    const year = date.getFullYear();
    const count = await prisma.activity.count({
        where: { code: { startsWith: `ACT-${year}-` } },
    });
    return `ACT-${year}-${String(count + 1).padStart(5, "0")}`;
}

export async function createActivity(data: any) {
    const date = data.date ? new Date(data.date) : new Date();
    const code = await generateActivityCode(date);

    await prisma.activity.create({
        data: { ...data, date, code },
    });
    revalidatePath("/admin/activities");
}

export async function updateActivity(id: string, data: any) {
    const updateData = { ...data };
    if (updateData.date) updateData.date = new Date(updateData.date);
    // Le code est généré une seule fois à la création, jamais modifiable ensuite
    delete updateData.code;

    await prisma.activity.update({ where: { id }, data: updateData });
    revalidatePath("/admin/activities");
}

export async function deleteActivity(id: string) {
    await prisma.activity.delete({ where: { id } });
    revalidatePath("/admin/activities");
}