import { getDashboardStats } from "@/actions/dashboard";
import { getNotifications } from "@/actions/admin-actions";
import DashboardContent from "@/components/admin/dashboard-content";
import { AdminHeaderBar } from "@/components/admin/admin-header-bar";

export default async function AdminDashboardPage() {
  const { globalStats, moduleDistributions } = await getDashboardStats();
  const notifications = await getNotifications();
  
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
        />
    </div>
  );
}
