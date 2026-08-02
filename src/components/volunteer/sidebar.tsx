"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { Home, Calendar, FileText, UserPlus, Flame, Bot, User, LogOut, Menu, X } from "lucide-react";
import { logoutAdmin } from "@/actions/auth";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export function AgentSidebar({ agentName }: { agentName?: string | null }) {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("agentSidebar");
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: t("home"), href: "/volunteer/dashboard", icon: Home },
    { name: t("assignments"), href: "/volunteer/assignments", icon: Calendar },
    { name: t("reports"), href: "/volunteer/reports", icon: FileText },
    { name: t("converts"), href: "/volunteer/converts", icon: UserPlus },
    { name: t("prayer"), href: "/volunteer/prayer", icon: Flame },
    { name: t("aiAssistant"), href: "/volunteer/ai-assistant", icon: Bot },
    { name: t("profile"), href: "/volunteer/profile", icon: User },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const handleLogout = async () => {
    await logoutAdmin();
    router.push("/");
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-lifac-red-600 text-white rounded-md"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white text-lifac-navy-900 border-r border-gray-100 p-5 flex flex-col transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="mb-8 px-1">
          <div className="text-2xl font-bold text-lifac-red-600">{t("missionaryLabel")}</div>
          {agentName && <p className="text-lifac-navy-400 text-xs mt-1">{agentName}</p>}
        </div>
        <nav className="flex-1 space-y-1">
          {menuItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 p-2.5 rounded-lg transition font-medium text-sm text-lifac-red-600",
                  active ? "bg-lifac-red-600 text-white shadow-sm" : "hover:bg-lifac-red-600/10"
                )}
                onClick={() => setIsOpen(false)}
              >
                <item.icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 p-2.5 mt-4 text-lifac-navy-500 hover:text-lifac-red-600 hover:bg-lifac-red-600/10 rounded-lg transition text-sm"
        >
          <LogOut size={18} />
          {t("logout")}
        </button>
      </aside>

      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/50" onClick={() => setIsOpen(false)} />
      )}
    </>
  );
}
