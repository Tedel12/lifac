import { getActivities } from "@/actions/activity-actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function ActivitiesPage() {
  const activities = await getActivities();

  return (
    <div className="bg-white min-h-screen py-12 px-4">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Nos Activités</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((activity) => (
            <Link key={activity.id} href={`/activities/${activity.id}`} className="block group">
              <Card className="flex flex-col border-gray-100 shadow-sm overflow-hidden h-full transition-shadow group-hover:shadow-lg">
                <img 
                  src={activity.title === "La Nuit de l’Espoir" ? "/nuit espoirt.jpg" : "/activites.jpg"} 
                  alt={activity.title} 
                  className="w-full h-48 object-cover"
                />
                <CardContent className="p-6 space-y-4 flex-1">
                  <h2 className="text-xl font-bold text-gray-900 group-hover:text-red-600 transition-colors">{activity.title}</h2>
                  <p className="text-gray-600 flex-1">
                    {activity.description.substring(0, 150)}...
                  </p>
                  <Button variant="outline" className="w-full">Voir les détails</Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
