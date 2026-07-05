"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Home, Calendar, FileText, UserPlus, Flame, Bot, User, LogOut, Menu, X } from "lucide-react";
import { logoutAdmin } from "@/actions/auth";
import { useTranslations } from "next-intl";

export function AgentSidebar() {
  const router = useRouter();
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

  const handleLogout = async () => {
    await logoutAdmin();
    router.push("/");
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-lifac-blue-900 text-white rounded-md"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-lifac-blue-900 text-white p-6 flex flex-col transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="text-2xl font-bold mb-10 text-white">Agent</div>
        <nav className="flex-1 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-lifac-blue-800 transition font-medium text-sm"
              onClick={() => setIsOpen(false)}
            >
              <item.icon size={18} />
              {item.name}
            </Link>
          ))}
        </nav>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 p-2.5 text-white/90 hover:text-white hover:bg-lifac-blue-800 rounded-lg transition text-sm"
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
