import { Metadata } from "next";
import { HeartHandshake } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getApprovedTestimonies } from "@/actions/testimony-actions";
import { TestimonyForm } from "@/components/forms/testimony-form";
import { TestimonyCard } from "@/components/testimonials/testimony-card";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Témoignages",
  description:
    "Découvrez les témoignages de vies transformées à travers le ministère de LiFAC, et partagez le vôtre.",
};

export default async function TestimonialsPage() {
  const testimonies = await getApprovedTestimonies();

  return (
    <div className="bg-white min-h-screen">
      <section className="bg-white py-16 lg:py-24 border-b border-gray-100">
        <div className="container mx-auto px-4 lg:px-8 text-center max-w-3xl">
          <HeartHandshake className="h-12 w-12 text-lifac-red-600 mx-auto mb-4" />
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 text-lifac-navy-900">Témoignages</h1>
          <p className="text-lg text-lifac-navy-600">
            Des vies transformées par la puissance de l'Évangile, à travers le ministère de LiFAC.
          </p>
        </div>
      </section>

      <section className="py-12 lg:py-20 bg-[#F4F5F7]">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <Card className="border-none shadow-sm">
            <CardContent className="p-6 lg:p-8">
              <h2 className="font-display text-2xl font-bold text-lifac-navy-900 mb-2">Partagez votre témoignage</h2>
              <p className="text-sm text-gray-600 mb-6">
                Dieu a fait quelque chose de spécial dans votre vie à travers LiFAC ? Racontez-le-nous.
              </p>
              <TestimonyForm />
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-12 lg:py-20">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          <h2 className="font-display text-2xl lg:text-3xl font-extrabold text-lifac-navy-900 text-center mb-10">
            Ce que Dieu a fait
          </h2>

          {testimonies.length === 0 ? (
            <Card className="border-none shadow-sm">
              <CardContent className="p-8 text-center text-sm text-gray-500">
                Aucun témoignage publié pour le moment — soyez le premier à partager le vôtre !
              </CardContent>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 gap-5 items-start">
              {testimonies.map((t) => (
                <TestimonyCard key={t.id} testimony={t} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
