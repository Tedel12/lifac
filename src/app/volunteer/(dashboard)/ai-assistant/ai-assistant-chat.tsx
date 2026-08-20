"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { Bot, Send, User, Sparkles, AlertTriangle, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { askAiAssistant, getMyAiHistory, clearMyAiHistory, type ChatMessage } from "@/actions/ai-assistant-actions";

const SUGGESTIONS = [
  "Quelles sont mes activités à venir ?",
  "Donne-moi un message de 5 minutes sur le salut",
  "Propose-moi 3 sujets de prière pour une activité scolaire",
  "Quels versets utiliser pour l'évangélisation au marché ?",
];

export function AiAssistantChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [loadingHistory, setLoadingHistory] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Restaure le fil de conversation persisté (survit au refresh et à la reconnexion).
  useEffect(() => {
    getMyAiHistory()
      .then(setMessages)
      .finally(() => setLoadingHistory(false));
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isPending]);

  const handleClear = async () => {
    if (!confirm("Effacer tout l'historique de conversation ?")) return;
    await clearMyAiHistory();
    setMessages([]);
  };

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isPending) return;
    setError(null);
    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");

    startTransition(async () => {
      const result = await askAiAssistant(nextMessages);
      if (!result.success || !result.reply) {
        setError(result.error ?? "Erreur inconnue.");
        return;
      }
      setMessages((prev) => [...prev, { role: "assistant", content: result.reply! }]);
    });
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-0 flex flex-col h-[65vh]">
        {messages.length > 0 && (
          <div className="flex justify-end px-4 pt-3 shrink-0">
            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-lifac-red-600 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Effacer la conversation
            </button>
          </div>
        )}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
          {loadingHistory && (
            <p className="text-center text-sm text-gray-400 py-8">Chargement de votre conversation...</p>
          )}
          {!loadingHistory && messages.length === 0 && (
            <div className="text-center py-8">
              <div className="h-14 w-14 rounded-full bg-lifac-red-600/10 flex items-center justify-center mx-auto mb-4">
                <Bot className="h-7 w-7 text-lifac-red-600" />
              </div>
              <h2 className="font-display text-lg font-bold text-lifac-navy-900 mb-1">Bonjour, je suis l&apos;Assistant IA LiFAC</h2>
              <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
                Posez-moi une question sur vos activités, un sujet biblique ou vos rapports de terrain.
              </p>
              <div className="grid sm:grid-cols-2 gap-2 max-w-lg mx-auto">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-left text-xs px-3 py-2.5 rounded-lg border border-gray-200 text-gray-600 hover:border-lifac-red-600 hover:text-lifac-red-600 hover:-translate-y-0.5 transition-all duration-200"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}>
              {m.role === "assistant" && (
                <div className="h-8 w-8 shrink-0 rounded-full bg-lifac-red-600/10 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-lifac-red-600" />
                </div>
              )}
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === "user" ? "bg-lifac-red-600 text-white rounded-br-sm" : "bg-gray-100 text-lifac-navy-900 rounded-bl-sm"
                }`}
              >
                {m.content}
              </div>
              {m.role === "user" && (
                <div className="h-8 w-8 shrink-0 rounded-full bg-lifac-navy-900/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-lifac-navy-900" />
                </div>
              )}
            </div>
          ))}

          {isPending && (
            <div className="flex gap-3 justify-start">
              <div className="h-8 w-8 shrink-0 rounded-full bg-lifac-red-600/10 flex items-center justify-center">
                <Bot className="h-4 w-4 text-lifac-red-600" />
              </div>
              <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce" />
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              {error}
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-center gap-2 border-t border-gray-100 p-4"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Écrivez votre message..."
            disabled={isPending}
            className="flex-1 h-11 rounded-full border border-gray-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-lifac-red-600/30 disabled:opacity-50"
          />
          <Button type="submit" size="icon" disabled={isPending || !input.trim()} className="rounded-full h-11 w-11 shrink-0">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
