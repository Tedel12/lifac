import { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { PrayerRequestForm } from "@/components/forms/prayer-request-form";
import { HandHeart } from "lucide-react";

export const metadata: Metadata = {
  title: "Demande de prière",
  description:
    "Partagez votre demande de prière avec l'équipe LiFAC. Nous croyons en la puissance de l'intercession.",
};

export default function PrayerPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <section className="bg-gradient-to-br from-lifac-blue-900 to-lifac-blue-950 text-white py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8 text-center max-w-3xl">
          <HandHeart className="h-12 w-12 text-lifac-gold-400 mx-auto mb-4" />
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Demande de prière
          </h1>
          <p className="text-lg text-blue-100">
            « Si deux d'entre vous s'accordent sur la terre pour demander une
            chose quelconque, elle leur sera accordée par mon Père. »
            <br />
            <span className="text-sm italic">— Matthieu 18:19</span>
          </p>
        </div>
      </section>

      <section className="py-12 lg:py-20">
        <div className="container mx-auto px-4 lg:px-8 max-w-2xl">
          <Card>
            <CardContent className="p-6 lg:p-10">
              <p className="text-gray-600 mb-6">
                Notre équipe et notre communauté prieront pour vous. Vos
                informations restent confidentielles, sauf si vous choisissez
                explicitement de rendre votre demande publique.
              </p>
              <PrayerRequestForm />
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
