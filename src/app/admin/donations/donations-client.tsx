"use client";

import { useState } from "react";
import { Search, Filter, HeartHandshake, Clock, Hash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getDonations, updateDonationStatus } from "@/actions/admin-donations-actions";
import { PaymentStatus } from "@prisma/client";
import { formatAmountXof } from "@/lib/fedapay";
import { toast } from "sonner";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente",
  APPROVED: "Confirmé",
  DECLINED: "Refusé",
  CANCELED: "Annulé",
  REFUNDED: "Remboursé",
  FAILED: "Échoué",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  DECLINED: "bg-red-100 text-red-700",
  CANCELED: "bg-gray-200 text-gray-700",
  REFUNDED: "bg-blue-100 text-blue-700",
  FAILED: "bg-red-100 text-red-700",
};

interface Stats {
  totalApproved: number;
  pendingCount: number;
  totalCount: number;
}

export default function DonationsPage({ donations: initialDonations, stats }: { donations: any[]; stats: Stats }) {
  const [donations, setDonations] = useState(initialDonations);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "ALL">("ALL");

  const refresh = async () => {
    const updated = await getDonations({ search, status: statusFilter });
    setDonations(updated.map((d: any) => ({ ...d, amount: Number(d.amount) })));
  };

  const handleStatusChange = async (id: string, status: PaymentStatus) => {
    await updateDonationStatus(id, status);
    setDonations(donations.map((d) => (d.id === id ? { ...d, status } : d)));
    toast.success("Statut mis à jour");
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Gestion des dons"
        description="Historique des dons et transactions FedaPay, avec confirmation manuelle possible."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={<HeartHandshake className="h-5 w-5 text-emerald-600" />} label="Total confirmé" value={formatAmountXof(stats.totalApproved)} bg="bg-emerald-50" />
        <StatCard icon={<Clock className="h-5 w-5 text-amber-600" />} label="En attente" value={String(stats.pendingCount)} bg="bg-amber-50" />
        <StatCard icon={<Hash className="h-5 w-5 text-lifac-red-600" />} label="Total transactions" value={String(stats.totalCount)} bg="bg-lifac-red-50" />
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Rechercher par référence, donateur..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && refresh()}
          />
        </div>
        <select
          className="border rounded-md px-3 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
        >
          <option value="ALL">Tous les statuts</option>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
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
                <th className="px-6 py-4">Référence</th>
                <th className="px-6 py-4">Donateur</th>
                <th className="px-6 py-4">Campagne</th>
                <th className="px-6 py-4">Montant</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {donations.length > 0 ? (
                donations.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono text-xs">{d.reference}</td>
                    <td className="px-6 py-4">{d.isAnonymous ? "Anonyme" : d.donorName ?? d.donor?.name ?? "—"}</td>
                    <td className="px-6 py-4">{d.campaign?.title ?? "Don général"}</td>
                    <td className="px-6 py-4 font-semibold">{formatAmountXof(d.amount)}</td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(d.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={d.status}
                        onChange={(e) => handleStatusChange(d.id, e.target.value as PaymentStatus)}
                        className={`px-2 py-1 rounded-full text-xs border-0 font-medium ${STATUS_COLORS[d.status] ?? "bg-gray-100 text-gray-700"}`}
                      >
                        {Object.entries(STATUS_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center p-6 text-gray-500">
                    Aucun don trouvé
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

function StatCard({ icon, label, value, bg }: { icon: React.ReactNode; label: string; value: string; bg: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${bg} mb-3`}>{icon}</div>
        <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
        <p className="font-display text-xl font-bold text-lifac-navy-900 mt-1">{value}</p>
      </CardContent>
    </Card>
  );
}
