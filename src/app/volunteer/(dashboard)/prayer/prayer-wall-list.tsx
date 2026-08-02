"use client";

import { useState, useTransition } from "react";
import { Flame, HandHeart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { markPrayed } from "@/actions/volunteer-actions";

interface PrayerItem {
  id: string;
  title: string;
  content: string;
  authorName: string;
  category: string;
  categoryLabel: string;
  prayerCount: number;
  intercessions: string[];
}

const CATEGORY_COLORS: Record<string, string> = {
  PROTECTION: "bg-blue-100 text-blue-700",
  SALUT: "bg-emerald-100 text-emerald-700",
  GUERISON: "bg-amber-100 text-amber-700",
  DELIVRANCE: "bg-purple-100 text-purple-700",
  AUTRE: "bg-gray-100 text-gray-700",
};

export function PrayerWallList({ requests }: { requests: PrayerItem[] }) {
  const [items, setItems] = useState(requests);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handlePray = (id: string) => {
    setPendingId(id);
    startTransition(async () => {
      await markPrayed(id);
      setItems((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, prayerCount: r.prayerCount + 1, intercessions: ["Vous", ...r.intercessions].slice(0, 3) }
            : r
        )
      );
      setPendingId(null);
    });
  };

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-gray-500">Aucune demande de prière publique pour le moment.</CardContent>
      </Card>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {items.map((r) => (
        <Card key={r.id} className="hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-lifac-red-600" />
                <h3 className="font-bold text-lifac-navy-900 text-sm">{r.title}</h3>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${CATEGORY_COLORS[r.category] ?? CATEGORY_COLORS.AUTRE}`}>
                {r.categoryLabel}
              </span>
            </div>
            <p className="text-sm text-lifac-navy-700 leading-relaxed">{r.content}</p>
            <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
              <span>{r.authorName}</span>
              <span>{r.prayerCount} prière(s)</span>
            </div>
            {r.intercessions.length > 0 && (
              <p className="text-[11px] text-gray-400 italic truncate">
                Ont prié récemment : {r.intercessions.join(", ")}
              </p>
            )}
            <Button
              size="sm"
              variant="outline"
              className="w-full mt-1"
              disabled={isPending && pendingId === r.id}
              onClick={() => handlePray(r.id)}
            >
              <HandHeart className="h-3.5 w-3.5 mr-1.5" />
              {isPending && pendingId === r.id ? "..." : "J'ai prié"}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
