import Link from "next/link";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { LoginForm } from "@/components/forms/login-form";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Connexion",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const session = await getSession();
  if (session) {
    redirect(session.role === "ADMIN" || session.role === "EDITOR" ? "/admin" : "/");
  }

  return (
    <div className="min-h-[calc(100vh-200px)] bg-[#F4F5F7] flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-md">
        <Card className="border border-gray-100 shadow-lg">
          <CardContent className="p-8">
            <h1 className="font-display text-2xl font-extrabold text-lifac-navy-900 mb-2 text-center">
              Connexion
            </h1>
            <p className="text-sm text-lifac-navy-600 text-center mb-6">
              Accédez à votre tableau de bord donateur ou bénévole.
            </p>

            <LoginForm />

            <p className="text-center text-sm text-lifac-navy-600 mt-6">
              Mot de passe oublié ?{" "}
              <Link
                href="/contact"
                className="text-lifac-red-600 font-semibold hover:text-lifac-red-700 underline-offset-2 hover:underline"
              >
                Contactez-nous
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
