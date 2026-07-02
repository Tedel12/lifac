import { AdminLoginForm } from "@/components/forms/admin-login-form";

export const metadata = {
  title: "Connexion Administrateur | LiFAC",
};

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Côté gauche : Image avec contenu */}
      <div 
        className="relative flex-1 hidden md:flex flex-col justify-center items-center p-12 text-white bg-cover bg-center" 
        style={{ backgroundImage: "url('/login-back.jpg')" }}
      >
        <div className="absolute inset-0 bg-lifac-navy-950/70" />
        <div className="relative z-10 text-center space-y-4">
          <h1 className="text-4xl font-bold">Bienvenue sur l'Espace Admin</h1>
          <p className="text-lg text-white/90">Gérez votre plateforme LiFAC en toute simplicité.</p>
        </div>
      </div>

      {/* Côté droit : Formulaire */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl">
          <h2 className="text-2xl font-bold text-center text-lifac-navy-900 mb-6">Connexion</h2>
          <AdminLoginForm />
        </div>
      </div>
    </div>
  );
}
