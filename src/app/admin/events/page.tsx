import { getEvents } from "@/actions/admin-events-actions";
import EventsPage from "./events-client";

export default async function AdminEventsPage() {
  const events = await getEvents();
  return <EventsPage events={events} />;
}
