import { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { VolunteerForm } from "@/components/forms/volunteer-form";
import { Heart, Hand, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Devenir bénévole",
  description:
    "Rejoignez l'équipe LiFAC en tant que bénévole. Mettez vos compétences au service de la mission d'évangélisation et d'action humanitaire.",
};

export default function VolunteerPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <section className="bg-gradient-to-br from-lifac-blue-900 to-lifac-blue-950 text-white py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8 text-center max-w-3xl">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Devenez bénévole
          </h1>
          <p className="text-lg text-blue-100">
            Mettez vos talents et votre cœur au service de la mission. Chaque
            engagement compte.
          </p>
        </div>
      </section>

      <section className="py-12 lg:py-20">
        <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Pourquoi devenir bénévole */}
            <div className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  <Heart className="h-8 w-8 text-lifac-gold-500 mb-3" />
                  <h3 className="font-bold text-lifac-blue-900 mb-2">
                    Servir avec le cœur
                  </h3>
                  <p className="text-sm text-gray-600">
                    Mettez vos talents au service d'une mission qui transforme
                    réellement des vies au Bénin.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <Hand className="h-8 w-8 text-lifac-gold-500 mb-3" />
                  <h3 className="font-bold text-lifac-blue-900 mb-2">
                    Engagement flexible
                  </h3>
                  <p className="text-sm text-gray-600">
                    Choisissez vos missions selon vos disponibilités, vos
                    compétences et votre appel personnel.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <Sparkles className="h-8 w-8 text-lifac-gold-500 mb-3" />
                  <h3 className="font-bold text-lifac-blue-900 mb-2">
                    Croissance spirituelle
                  </h3>
                  <p className="text-sm text-gray-600">
                    Vivez des moments de communion, de formation et d'impact
                    qui marquent toute une vie.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Formulaire */}
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-6 lg:p-8">
                  <h2 className="font-display text-2xl font-bold text-lifac-blue-900 mb-2">
                    Candidature bénévole
                  </h2>
                  <p className="text-sm text-gray-600 mb-6">
                    Remplissez ce formulaire — nous vous recontactons sous 7
                    jours.
                  </p>
                  <VolunteerForm />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
