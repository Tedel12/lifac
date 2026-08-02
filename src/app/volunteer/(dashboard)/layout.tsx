import { AgentSidebar } from "@/components/volunteer/sidebar";
import { AgentHeaderBar } from "@/components/volunteer/agent-header-bar";
import { getCurrentAgentName } from "@/actions/auth";
import { getMyNotifications } from "@/actions/volunteer-actions";

export default async function VolunteerDashboardLayout({ children }: { children: React.ReactNode }) {
  const [agentName, notifications] = await Promise.all([getCurrentAgentName(), getMyNotifications()]);
  return (
    <div className="flex min-h-screen bg-white">
      <AgentSidebar agentName={agentName} />
      <main className="flex-1 p-8 lg:p-12 bg-white space-y-6">
        <AgentHeaderBar notifications={notifications} />
        {children}
      </main>
    </div>
  );
}
