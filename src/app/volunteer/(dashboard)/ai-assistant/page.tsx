import { Bot, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

export default function VolunteerAiAssistantPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <AdminPageHeader
        title="Assistant IA LiFAC"
        description="Un assistant conversationnel pour vous accompagner sur le terrain."
      />

      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardContent className="p-12 text-center">
          <div className="h-16 w-16 rounded-full bg-lifac-red-600/10 flex items-center justify-center mx-auto mb-5 animate-fade-in">
            <Bot className="h-8 w-8 text-lifac-red-600" />
          </div>
          <h2 className="font-display text-xl font-bold text-lifac-navy-900 mb-2">Bientôt disponible</h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
            L&apos;assistant IA LiFAC est en préparation — il vous aidera bientôt à préparer vos
            messages, répondre aux questions courantes sur le terrain et rédiger vos rapports plus
            vite.
          </p>
          <div className="flex items-center justify-center gap-1.5 mt-5 text-lifac-red-600 text-xs font-bold uppercase tracking-wide">
            <Sparkles className="h-3.5 w-3.5" />
            En développement
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
