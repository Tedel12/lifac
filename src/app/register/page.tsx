import Link from "next/link";
import { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Créer un compte",
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  return (
    <div className="min-h-[calc(100vh-200px)] bg-[#F4F5F7] flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-md">
        <Card className="border border-gray-100 shadow-lg">
          <CardContent className="p-8 text-center">
            <h1 className="font-display text-2xl font-extrabold text-lifac-navy-900 mb-3">
              Création de compte
            </h1>
            <p className="text-sm text-lifac-navy-600 mb-6 leading-relaxed">
              L'inscription publique n'est pas encore ouverte. Pour rejoindre
              LiFAC en tant que bénévole, partenaire ou donateur enregistré,
              contactez l'équipe.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/contact">
                <Button variant="default" size="default" className="w-full sm:w-auto">
                  Nous contacter
                </Button>
              </Link>
              <Link href="/volunteer">
                <Button variant="outlineDark" size="default" className="w-full sm:w-auto">
                  Devenir bénévole
                </Button>
              </Link>
            </div>

            <p className="text-center text-sm text-lifac-navy-600 mt-6">
              Déjà un accès ?{" "}
              <Link
                href="/login"
                className="text-lifac-red-600 font-semibold hover:text-lifac-red-700 underline-offset-2 hover:underline"
              >
                Se connecter
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
