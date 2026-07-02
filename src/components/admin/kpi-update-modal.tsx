"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateGlobalStats } from "@/actions/dashboard";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";

export function KPIUpdateModal({ isOpen, onClose, kpi, stats, onUpdate }: any) {
  const t = useTranslations("adminDashboard");
  const [value, setValue] = useState(kpi.value.toString());

  if (!isOpen) return null;

  const handleSubmit = async () => {
    const updatedStats = await updateGlobalStats({
      ...stats,
      [kpi.key]: parseInt(value),
    });
    onUpdate(updatedStats);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-sm relative">
        <button 
            onClick={onClose}
            className="absolute top-2 right-2 p-2 hover:bg-gray-100 rounded-full"
        >
            <X size={18} />
        </button>
        <CardContent className="p-6 space-y-4">
          <h3 className="font-bold text-lg">{t("updateKpi")} {kpi.title}</h3>
          <Input type="number" value={value} onChange={(e) => setValue(e.target.value)} />
          <div className="flex gap-2">
            <Button onClick={handleSubmit}>{t("save")}</Button>
            <Button variant="outline" onClick={onClose}>{t("cancel")}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
