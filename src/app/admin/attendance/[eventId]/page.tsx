import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAttendanceSessions, getAttendanceStats } from "@/actions/attendance";
import AttendanceClient from "./attendance-client";

export default async function AdminEventAttendancePage({
    params,
}: {
    params: Promise<{ eventId: string }>;
}) {
    const { eventId } = await params;

    const event = await prisma.event.findUnique({
        where: { id: eventId },
        select: { id: true, title: true },
    });

    if (!event) {
        notFound();
    }

    const [sessions, stats] = await Promise.all([
        getAttendanceSessions(eventId),
        getAttendanceStats(eventId),
    ]);

    return <AttendanceClient event={event} initialSessions={sessions} initialStats={stats} />;
}
