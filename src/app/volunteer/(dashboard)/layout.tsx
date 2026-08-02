import { AgentSidebar } from "@/components/volunteer/sidebar";
import { getCurrentAgentName } from "@/actions/auth";

export default async function VolunteerDashboardLayout({ children }: { children: React.ReactNode }) {
  const agentName = await getCurrentAgentName();
  return (
    <div className="flex min-h-screen bg-white">
      <AgentSidebar agentName={agentName} />
      <main className="flex-1 p-8 lg:p-12 bg-white">{children}</main>
    </div>
  );
}
