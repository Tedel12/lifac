"use client";

import { useState } from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getCommunityUsers, toggleUserActive } from "@/actions/admin-users-actions";
import { toast } from "sonner";

const ROLE_LABELS: Record<string, string> = {
  DONOR: "Donateur",
  MEMBER: "Membre",
};

export default function UsersPage({ users: initialUsers }: { users: any[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"DONOR" | "MEMBER" | "ALL">("ALL");

  const refresh = async () => {
    const updated = await getCommunityUsers({ search, role: roleFilter });
    setUsers(updated);
  };

  const handleToggle = async (id: string, current: boolean) => {
    await toggleUserActive(id, !current);
    setUsers(users.map((u) => (u.id === id ? { ...u, isActive: !current } : u)));
    toast.success(!current ? "Compte réactivé" : "Compte désactivé");
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Utilisateurs"
        description="Comptes donateurs et membres de la communauté LiFAC (hors missionnaires et administrateurs)."
      />

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Rechercher par nom ou email..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && refresh()}
          />
        </div>
        <select
          className="border rounded-md px-3 text-sm"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as any)}
        >
          <option value="ALL">Tous les rôles</option>
          <option value="DONOR">Donateurs</option>
          <option value="MEMBER">Membres</option>
        </select>
        <Button onClick={refresh} variant="outline">
          <Filter size={18} className="mr-2" /> Filtrer
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 uppercase font-medium">
              <tr>
                <th className="px-6 py-4">Nom</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Téléphone</th>
                <th className="px-6 py-4">Rôle</th>
                <th className="px-6 py-4">Dons</th>
                <th className="px-6 py-4">Inscrit le</th>
                <th className="px-6 py-4 text-center">Actif</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.length > 0 ? (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{u.name ?? "—"}</td>
                    <td className="px-6 py-4">{u.email}</td>
                    <td className="px-6 py-4">{u.phone ?? "—"}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                        {ROLE_LABELS[u.role] ?? u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">{u._count.donations}</td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(u.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggle(u.id, u.isActive)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          u.isActive ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                        }`}
                      >
                        {u.isActive ? "Actif" : "Inactif"}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center p-6 text-gray-500">
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
