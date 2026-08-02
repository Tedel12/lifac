import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AiAssistantChat } from "./ai-assistant-chat";

export default function VolunteerAiAssistantPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <AdminPageHeader
        title="Assistant IA LiFAC"
        description="Un assistant conversationnel pour vous accompagner sur le terrain — activités, versets, sujets de prière, rapports."
      />
      <AiAssistantChat />
    </div>
  );
}
