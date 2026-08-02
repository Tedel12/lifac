import { getDashboardStats, getExtendedDashboardMetrics } from "@/actions/dashboard";
import { getNotifications } from "@/actions/admin-actions";
import { getActivities } from "@/actions/activity-actions";
import { prisma } from "@/lib/prisma";
import DashboardContent from "@/components/admin/dashboard-content";
import { AdminHeaderBar } from "@/components/admin/admin-header-bar";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [{ globalStats, moduleDistributions }, notifications, recentActivities, approvedAgg, activeCampaigns, upcomingEvents, extendedMetrics] =
    await Promise.all([
      getDashboardStats(),
      getNotifications(),
      getActivities().then((a) => a.slice(0, 5)),
      prisma.donation.aggregate({ _sum: { amount: true }, where: { status: "APPROVED" } }),
      prisma.campaign.count({ where: { status: "ACTIVE" } }),
      prisma.event.count({ where: { status: "UPCOMING" } }),
      getExtendedDashboardMetrics(),
    ]);

  // Default values if database is empty
  const defaultDistributions = [
      { category: "School", value: 30, color: "#EF4444" },
      { category: "Markets", value: 20, color: "#1E293B" },
      { category: "Pop-up Crusade", value: 20, color: "#22C55E" },
      { category: "One-to-one", value: 15, color: "#EAB308" },
      { category: "Crusade", value: 15, color: "#A855F7" },
  ];

  return (
    <div className="space-y-6">
        <div className="flex justify-end">
            <AdminHeaderBar notifications={notifications} />
        </div>
        <DashboardContent
            initialGlobalStats={globalStats}
            initialModuleDistributions={moduleDistributions.length > 0 ? moduleDistributions : defaultDistributions}
            recentActivities={recentActivities}
            operationalStats={{
                donationsApproved: Number(approvedAgg._sum.amount ?? 0),
                activeCampaigns,
                upcomingEvents,
            }}
            extendedMetrics={extendedMetrics}
        />
    </div>
  );
}
