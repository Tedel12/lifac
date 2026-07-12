"use client";

import { useState } from "react";
import { Search, Filter, Download, CircleAlert } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getEventRegistrations } from "@/actions/attendance";
import { useTranslations } from "next-intl";

interface EventOption {
  id: string;
  title: string;
}

export default function RegistrationsPage({
  registrations: initialRegistrations,
  events,
}: {
  registrations: any[];
  events: EventOption[];
}) {
  const t = useTranslations("adminRegistrations");
  const [registrations, setRegistrations] = useState(initialRegistrations);
  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState<string>("ALL");

  const refresh = async () => {
    const updated = await getEventRegistrations({
      search: search || undefined,
      eventId: eventFilter !== "ALL" ? eventFilter : undefined,
    });
    setRegistrations(updated);
  };

  const statusLabel: Record<string, string> = {
    PENDING: t("status.pending"),
    CONFIRMED: t("status.confirmed"),
    CANCELED: t("status.canceled"),
  };

  const statusColor: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-700",
    CONFIRMED: "bg-emerald-100 text-emerald-700",
    CANCELED: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-lifac-navy-900">{t("title")}</h1>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder={t("search")}
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && refresh()}
          />
        </div>
        <select
          className="border rounded-md px-3 text-sm"
          value={eventFilter}
          onChange={(e) => setEventFilter(e.target.value)}
        >
          <option value="ALL">{t("allEvents")}</option>
          {events.map((ev) => (
            <option key={ev.id} value={ev.id}>
              {ev.title}
            </option>
          ))}
        </select>
        <Button onClick={refresh} variant="outline">
          <Filter size={18} className="mr-2" /> {t("filter")}
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 uppercase font-medium">
              <tr>
                <th className="px-6 py-4">{t("columns.number")}</th>
                <th className="px-6 py-4">{t("columns.fullName")}</th>
                <th className="px-6 py-4">{t("columns.phone")}</th>
                <th className="px-6 py-4">{t("columns.event")}</th>
                <th className="px-6 py-4">{t("columns.status")}</th>
                <th className="px-6 py-4 text-center">{t("columns.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {registrations.length > 0 ? (
                registrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">
                      {reg.participantNumber ?? (
                        <span className="text-gray-400 italic">{t("noNumber")}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">{reg.fullName}</td>
                    <td className="px-6 py-4">{reg.phone}</td>
                    <td className="px-6 py-4">{reg.event?.title ?? "—"}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          statusColor[reg.status] ?? "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {statusLabel[reg.status] ?? reg.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {reg.participantNumber ? (
                        <a href={`/api/admin/registrations/${reg.id}/card`} target="_blank" rel="noreferrer">
                          <Button variant="ghost" size="sm" className="text-lifac-red-600 text-xs gap-1">
                            <Download size={14} className="mr-1" /> {t("downloadCard")}
                          </Button>
                        </a>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1 text-xs text-gray-400"
                          title={t("noNumberTooltip")}
                        >
                          <CircleAlert size={14} />
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center p-6 text-gray-500">
                    {t("empty")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
