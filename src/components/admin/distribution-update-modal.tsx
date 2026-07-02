"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateModuleDistribution } from "@/actions/dashboard";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";

export function DistributionUpdateModal({ isOpen, onClose, distributions, onUpdate }: any) {
  const t = useTranslations("adminDashboard");
  const [data, setData] = useState(distributions);

  if (!isOpen) return null;

  const handleValueChange = (index: number, value: string) => {
    const newData = [...data];
    newData[index].value = parseInt(value) || 0;
    setData(newData);
  };

  const handleSubmit = async () => {
    await updateModuleDistribution(data);
    onUpdate(data);
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
          <h3 className="font-bold text-lg">{t("updateDistribution")}</h3>
          {data.map((d: any, index: number) => (
            <div key={d.category} className="flex items-center gap-2">
              <span className="w-24 text-sm">{d.category}</span>
              <Input 
                type="number" 
                value={d.value} 
                onChange={(e) => handleValueChange(index, e.target.value)} 
              />
            </div>
          ))}
          <div className="flex gap-2 pt-4">
            <Button onClick={handleSubmit}>{t("save")}</Button>
            <Button variant="outline" onClick={onClose}>{t("cancel")}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
