import { ActivityType } from "@prisma/client";
import { getActivities } from "@/actions/activity-actions";
import ActivitiesPage from "./activities-client";

export default async function AdminActivitiesPage({
    searchParams,
}: {
    searchParams: Promise<{ type?: string }>;
}) {
    const { type } = await searchParams;
    const initialType = type && type in ActivityType ? (type as ActivityType) : undefined;
    const activities = await getActivities(initialType ? { type: initialType } : undefined);
    return <ActivitiesPage key={initialType ?? "all"} activities={activities} initialType={initialType} />;
}
