import { getEventRegistrations, getEventsForFilter } from "@/actions/attendance";
import RegistrationsPage from "./registrations-client";

export default async function AdminRegistrationsPage() {
  const [registrations, events] = await Promise.all([
    getEventRegistrations(),
    getEventsForFilter(),
  ]);

  return <RegistrationsPage registrations={registrations} events={events} />;
}
