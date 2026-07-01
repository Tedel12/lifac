"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/layout/logo";
import { loginAdmin } from "@/actions/auth";

export function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await loginAdmin(email, password);
    if (result.success) {
      router.push("/admin/dashboard");
    } else {
      alert(result.error);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      {/* Background Image Container */}
      <div className="absolute inset-0 z-0">
        <img
          src="/login-back.jpg"
          alt="Background"
          className="w-full h-full object-cover"
        />
        {/* Overlay Noir et Rouge */}
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 bg-gradient-to-br from-lifac-navy-950/80 to-lifac-red-950/70" />
      </div>

      <Card className="relative z-10 w-full max-w-md bg-transparent backdrop-blur-xl shadow-2xl border border-white/20 text-white">
        <CardContent className="p-8">
          <div className="flex flex-col items-center mb-8">
            <Logo variant="white" className="mb-4" />
            <p className="text-white/60 text-sm font-medium">Gagner - Édifier - Envoyer</p>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Connexion administrateur</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">Email ou identifiant</label>
              <Input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-white/20 text-white placeholder:text-white/30"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">Mot de passe</label>
              <Input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border-white/20 text-white placeholder:text-white/30"
                required
              />
            </div>
            
            <div className="flex items-center justify-between text-sm text-white/70">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" /> Se souvenir de moi
              </label>
              <a href="/forgot-password" className="hover:underline text-lifac-red-300">Mot de passe oublié ?</a>
            </div>

            <Button type="submit" className="w-full bg-lifac-red-500 hover:bg-lifac-red-600 text-white font-bold py-3 rounded-lg mt-4">
              Se connecter
            </Button>
          </form>
          
          <p className="mt-8 text-center text-xs text-white/40">
            © 2026 LiFAC - Tous droits réservés
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
