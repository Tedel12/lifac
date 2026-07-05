"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginAdmin, loginAgent } from "@/actions/auth";

export function LoginForm() {
  const [role, setRole] = useState<"ADMIN" | "AGENT">("ADMIN");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    let result;
    if (role === "ADMIN") {
      result = await loginAdmin(email, password);
    } else {
      result = await loginAgent(email, password);
    }

    if (result.success) {
      if (role === "ADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.push("/volunteer/dashboard");
      }
      router.refresh();
    } else {
      setError(result.error || "Une erreur est survenue");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Type d'utilisateur</label>
        <select 
            value={role}
            onChange={(e) => setRole(e.target.value as "ADMIN" | "AGENT")}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
        >
          <option value="ADMIN">Administrateur</option>
          <option value="AGENT">Agent</option>
        </select>
      </div>

      <div>
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Email</label>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1" />
      </div>
      <div>
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Mot de passe</label>
        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1" />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <Button type="submit" className="w-full mt-2">Se connecter</Button>
    </form>
  );
}
