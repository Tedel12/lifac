import { redirect } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { LogOut, Users, Heart, Calendar, DollarSign } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { logoutAdmin } from "@/actions/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatAmountXof } from "@/lib/fedapay";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Tableau de bord",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "ADMIN" && session.role !== "EDITOR") {
    redirect("/");
  }

  const [donationsCount, approvedDonations, campaignsCount, eventsCount, recentDonations] =
    await Promise.all([
      prisma.donation.count(),
      prisma.donation.aggregate({
        _sum: { amount: true },
        where: { status: "APPROVED" },
      }),
      prisma.campaign.count({ where: { status: "ACTIVE" } }),
      prisma.event.count({ where: { status: { in: ["UPCOMING", "ONGOING"] } } }),
      prisma.donation.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          reference: true,
          amount: true,
          status: true,
          donorName: true,
          createdAt: true,
          campaign: { select: { title: true } },
        },
      }),
    ]);

  const totalApproved = approvedDonations._sum.amount ?? BigInt(0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-display text-xl font-bold text-lifac-blue-900">
              Tableau de bord
            </h1>
            <p className="text-xs text-gray-500">
              Connecté en tant que {session.email} ({session.role})
            </p>
          </div>
          <form action={logoutAdmin}>
            <Button type="submit" variant="outline" size="sm">
              <LogOut className="h-4 w-4" />
              Déconnexion
            </Button>
          </form>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-8 space-y-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<DollarSign className="h-5 w-5 text-emerald-600" />}
            label="Dons confirmés"
            value={formatAmountXof(totalApproved)}
            bgColor="bg-emerald-50"
          />
          <StatCard
            icon={<Heart className="h-5 w-5 text-red-500" />}
            label="Total transactions"
            value={String(donationsCount)}
            bgColor="bg-red-50"
          />
          <StatCard
            icon={<Users className="h-5 w-5 text-lifac-gold-600" />}
            label="Campagnes actives"
            value={String(campaignsCount)}
            bgColor="bg-lifac-gold-50"
          />
          <StatCard
            icon={<Calendar className="h-5 w-5 text-lifac-blue-700" />}
            label="Événements à venir"
            value={String(eventsCount)}
            bgColor="bg-lifac-blue-50"
          />
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="p-6 border-b border-gray-100">
              <h2 className="font-display text-lg font-bold text-lifac-blue-900">
                Dernières donations
              </h2>
            </div>
            {recentDonations.length === 0 ? (
              <p className="p-6 text-sm text-gray-500">
                Aucune donation pour le moment.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
                    <tr>
                      <th className="px-6 py-3">Référence</th>
                      <th className="px-6 py-3">Donateur</th>
                      <th className="px-6 py-3">Campagne</th>
                      <th className="px-6 py-3">Montant</th>
                      <th className="px-6 py-3">Statut</th>
                      <th className="px-6 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentDonations.map((d) => (
                      <tr key={d.id}>
                        <td className="px-6 py-3 font-mono text-xs">{d.reference}</td>
                        <td className="px-6 py-3">{d.donorName ?? "—"}</td>
                        <td className="px-6 py-3">{d.campaign?.title ?? "Don général"}</td>
                        <td className="px-6 py-3 font-semibold">
                          {formatAmountXof(d.amount)}
                        </td>
                        <td className="px-6 py-3">
                          <StatusPill status={d.status} />
                        </td>
                        <td className="px-6 py-3 text-gray-500">
                          {formatDateTime(d.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-xs text-gray-500 text-center">
          <Link href="/" className="hover:text-lifac-blue-900">
            ← Retour au site public
          </Link>
        </p>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  bgColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  bgColor: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${bgColor} mb-3`}>
          {icon}
        </div>
        <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
        <p className="font-display text-xl font-bold text-lifac-blue-900 mt-1">
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    APPROVED: "bg-emerald-100 text-emerald-700",
    PENDING: "bg-amber-100 text-amber-700",
    DECLINED: "bg-red-100 text-red-700",
    CANCELED: "bg-gray-200 text-gray-700",
    FAILED: "bg-red-100 text-red-700",
    REFUNDED: "bg-blue-100 text-blue-700",
  };
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
        styles[status] ?? "bg-gray-200 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}
