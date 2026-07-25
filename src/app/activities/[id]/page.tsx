import { getActivityById } from "@/actions/activity-actions";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function ActivityDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const activity = await getActivityById(id);

  if (!activity) {
    notFound();
  }

  return (
    <div className="bg-white min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <img 
          src={activity.title === "La Nuit de l’Espoir" ? "/nuit espoirt.jpg" : "/activites.jpg"} 
          alt={activity.title} 
          className="w-full h-64 object-cover rounded-2xl mb-8 shadow-md"
        />
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{activity.title}</h1>
        
        <div className="flex gap-4 text-sm text-gray-500 mb-6">
          <div className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            {new Date(activity.date).toLocaleDateString('fr-FR')}
          </div>
          {activity.address && (
            <div className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              {activity.address}
            </div>
          )}
        </div>

        <div className="prose prose-lg text-gray-800 leading-relaxed mb-8">
          {(activity.description ?? "").split('\n').map((paragraph, i) => (
            <p key={i} className="mb-4">{paragraph}</p>
          ))}
        </div>
        
        <Button asChild variant="outline">
          <Link href="/activities">← Retour aux activités</Link>
        </Button>
      </div>
    </div>
  );
}
