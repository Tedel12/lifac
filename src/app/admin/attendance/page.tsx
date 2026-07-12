import Link from "next/link";
import { getEventsForFilter } from "@/actions/attendance";

export default async function AdminAttendanceHomePage() {
    const events = await getEventsForFilter();

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-lifac-navy-900">Gestion de la présence</h1>
            <p className="text-gray-600 text-sm">Choisis un événement pour scanner les présences ou consulter les statistiques.</p>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {events.map((event) => (
                    <Link
                        key={event.id}
                        href={`/admin/attendance/${event.id}`}
                        className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-lifac-red-400 hover:shadow-md transition"
                    >
                        <div className="text-xs uppercase text-gray-400 mb-1">{event.status}</div>
                        <div className="font-bold text-lifac-navy-900 mb-2">{event.title}</div>
                        <div className="text-sm text-gray-500">{event.currentAttendees} inscrit(s)</div>
                    </Link>
                ))}
                {events.length === 0 && (
                    <p className="text-gray-500 text-sm">Aucun événement pour le moment.</p>
                )}
            </div>
        </div>
    );
}
