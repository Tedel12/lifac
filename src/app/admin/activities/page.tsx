import { getActivities } from "@/actions/activity-actions";
import ActivitiesPage from "./activities-client";

export default async function AdminActivitiesPage() {
    const activities = await getActivities();
    return <ActivitiesPage activities={activities} />;
}
