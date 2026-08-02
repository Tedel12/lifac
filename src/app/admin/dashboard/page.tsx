import { getDashboardStats, getExtendedDashboardMetrics, computeModuleDistribution, getSecondaryDashboardCharts } from "@/actions/dashboard";
import { getNotifications } from "@/actions/admin-actions";
import { getActivities } from "@/actions/activity-actions";
import { prisma } from "@/lib/prisma";
import DashboardContent from "@/components/admin/dashboard-content";
import { AdminHeaderBar } from "@/components/admin/admin-header-bar";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [{ globalStats }, notifications, recentActivities, approvedAgg, activeCampaigns, upcomingEvents, extendedMetrics, moduleDistributions, secondaryCharts] =
    await Promise.all([
      getDashboardStats(),
      getNotifications(),
      getActivities().then((a) => a.slice(0, 5)),
      prisma.donation.aggregate({ _sum: { amount: true }, where: { status: "APPROVED" } }),
      prisma.campaign.count({ where: { status: "ACTIVE" } }),
      prisma.event.count({ where: { status: "UPCOMING" } }),
      getExtendedDashboardMetrics(),
      computeModuleDistribution(),
      getSecondaryDashboardCharts(),
    ]);

  return (
    <div className="space-y-6">
        <div className="flex justify-end">
            <AdminHeaderBar notifications={notifications} />
        </div>
        <DashboardContent
            initialGlobalStats={globalStats}
            initialModuleDistributions={moduleDistributions}
            recentActivities={recentActivities}
            operationalStats={{
                donationsApproved: Number(approvedAgg._sum.amount ?? 0),
                activeCampaigns,
                upcomingEvents,
            }}
            extendedMetrics={extendedMetrics}
            secondaryCharts={secondaryCharts}
        />
    </div>
  );
}
