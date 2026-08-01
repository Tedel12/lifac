"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { updateAdminProfile } from "@/actions/admin-management-actions";
import { toast } from "sonner";

interface Profile {
  id: string;
  name: string | null;
  email: string;
}

export default function SettingsPage({ profile }: { profile: Profile | null }) {
  const [name, setName] = useState(profile?.name ?? "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

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
      await updateAdminProfile({ name, password: password || undefined });
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
    <div className="space-y-6">
      <AdminPageHeader title="Paramètres" description="Gérez votre profil administrateur." />

      {!profile ? (
        <Card>
          <CardContent className="p-6 text-sm text-gray-600">
            Vous êtes connecté avec le compte super-admin défini par variables d&apos;environnement
            (<code className="bg-gray-100 px-1.5 py-0.5 rounded">ADMIN_EMAIL</code>). Ce compte n&apos;est
            pas modifiable ici — créez un compte administrateur classique depuis{" "}
            <a href="/admin/admins" className="text-lifac-red-600 font-medium hover:underline">
              Administrateurs
            </a>{" "}
            pour bénéficier d&apos;un profil éditable.
          </CardContent>
        </Card>
      ) : (
        <Card className="max-w-lg">
          <CardContent className="p-6 space-y-4">
            <div className="space-y-1">
              <Label>Email</Label>
              <Input value={profile.email} disabled />
            </div>
            <div className="space-y-1">
              <Label>Nom affiché</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
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
      )}
    </div>
  );
}
