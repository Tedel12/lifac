import { getActivityById } from "@/actions/activity-actions";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function ActivityDetailsPage({ params }: { params: { id: string } }) {
  const activity = await getActivityById(params.id);

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
        <h1 className="text-4xl font-bold text-gray-900 mb-6">{activity.title}</h1>
        <div className="prose prose-lg text-gray-800 leading-relaxed mb-8">
          {activity.description.split('\n').map((paragraph, i) => (
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
