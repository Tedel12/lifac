import { AgentSidebar } from "@/components/volunteer/sidebar";

export default function VolunteerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AgentSidebar />
      <main className="flex-1 p-8 lg:p-12">{children}</main>
    </div>
  );
}
