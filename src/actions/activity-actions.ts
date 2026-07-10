"use server";

import { prisma } from "@/lib/prisma";

export async function getActivities() {
    return await prisma.activity.findMany({
        orderBy: { createdAt: "asc" }
    });
}

export async function getActivityById(id: string) {
    return await prisma.activity.findUnique({
        where: { id }
    });
}
