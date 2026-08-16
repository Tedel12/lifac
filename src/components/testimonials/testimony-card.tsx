"use client";

import { useState, useTransition } from "react";
import { Quote, Heart, MessageCircle, Send, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { likeTestimony, submitTestimonyComment } from "@/actions/testimony-actions";
import { toast } from "sonner";

interface Comment {
  id: string;
  authorName: string;
  content: string;
  createdAt: Date | string;
}

export interface TestimonyCardData {
  id: string;
  authorName: string;
  authorRole: string | null;
  authorAvatar: string | null;
  content: string;
  likeCount: number;
  comments: Comment[];
}

export function TestimonyCard({ testimony }: { testimony: TestimonyCardData }) {
  const [likes, setLikes] = useState(testimony.likeCount);
  const [liked, setLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleLike = () => {
    if (liked) return; // un seul like par visite, pas de compte utilisateur public
    setLiked(true);
    setLikes((n) => n + 1);
    startTransition(async () => {
      try {
        await likeTestimony(testimony.id);
      } catch {
        setLiked(false);
        setLikes((n) => n - 1);
      }
    });
  };

  const handleComment = () => {
    startTransition(async () => {
      const result = await submitTestimonyComment({
        testimonyId: testimony.id,
        authorName: name,
        content: comment,
      });
      if (!result.success) {
        toast.error(result.error ?? "Erreur lors de l'envoi");
        return;
      }
      toast.success(result.message ?? "Commentaire envoyé");
      setName("");
      setComment("");
    });
  };

  return (
    <Card className="border-none shadow-sm hover:shadow-md transition-all duration-300">
      <CardContent className="p-6 space-y-4">
        <Quote className="h-7 w-7 text-lifac-red-600/60" />
        <p className="text-lifac-navy-700 leading-relaxed italic">« {testimony.content} »</p>

        <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
          <div className="h-10 w-10 rounded-full bg-lifac-red-600 flex items-center justify-center text-white font-bold shrink-0">
            {testimony.authorAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={testimony.authorAvatar} alt={testimony.authorName} className="h-full w-full rounded-full object-cover" />
            ) : (
              testimony.authorName.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <p className="font-bold text-lifac-navy-900 text-sm">{testimony.authorName}</p>
            {testimony.authorRole && <p className="text-xs text-gray-500">{testimony.authorRole}</p>}
          </div>
        </div>

        <div className="flex items-center gap-4 pt-1">
          <button
            onClick={handleLike}
            disabled={liked}
            className={`flex items-center gap-1.5 text-sm transition-colors ${
              liked ? "text-lifac-red-600" : "text-gray-500 hover:text-lifac-red-600"
            }`}
            aria-label="J'aime ce témoignage"
          >
            <Heart className={`h-4 w-4 transition-transform ${liked ? "fill-current scale-110" : ""}`} />
            {likes}
          </button>
          <button
            onClick={() => setShowComments((v) => !v)}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-lifac-navy-900 transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            {testimony.comments.length}
          </button>
        </div>

        {showComments && (
          <div className="space-y-4 pt-3 border-t border-gray-100 animate-fade-in">
            {testimony.comments.length > 0 && (
              <div className="space-y-3">
                {testimony.comments.map((c) => (
                  <div key={c.id} className="text-sm">
                    <p className="font-semibold text-lifac-navy-900 text-xs">{c.authorName}</p>
                    <p className="text-lifac-navy-600">{c.content}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <Input
                placeholder="Votre nom"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="focus-visible:ring-lifac-red-600"
              />
              <Textarea
                placeholder="Votre commentaire..."
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={1000}
                className="focus-visible:ring-lifac-red-600"
              />
              <Button size="sm" onClick={handleComment} disabled={isPending} className="w-full">
                {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5 mr-1.5" />}
                Commenter
              </Button>
              <p className="text-[11px] text-gray-400">
                Votre commentaire sera visible après validation par notre équipe.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
