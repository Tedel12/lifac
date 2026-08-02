"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateMyProfile } from "@/actions/volunteer-actions";
import { toast } from "sonner";

interface Profile {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  city: string | null;
}

export default function ProfileClient({ profile }: { profile: Profile | null }) {
  const [name, setName] = useState(profile?.name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  if (!profile) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-gray-500">Impossible de charger votre profil.</CardContent>
      </Card>
    );
  }

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Le nom est obligatoire");
      return;
    }
    if (password && password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    setSaving(true);
    try {
      await updateMyProfile({ name, phone, password: password || undefined });
      toast.success("Profil mis à jour");
      setPassword("");
      setConfirmPassword("");
    } catch (e: any) {
      toast.error(e?.message ?? "Erreur lors de la mise à jour");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="max-w-lg hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-6 space-y-4">
        <div className="space-y-1">
          <Label>Email</Label>
          <Input value={profile.email} disabled />
        </div>
        <div className="space-y-1">
          <Label>Nom complet</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>Téléphone</Label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>Nouveau mot de passe (optionnel)</Label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {password && (
          <div className="space-y-1">
            <Label>Confirmer le mot de passe</Label>
            <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>
        )}
        <Button onClick={handleSubmit} disabled={saving}>
          {saving ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </CardContent>
    </Card>
  );
}
