"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, School, ShoppingCart, Target, Users, ShieldCheck, FileBarChart, Settings, UserCog, LogOut, Menu, X, IdCard, QrCode, CalendarDays } from "lucide-react";
import { logoutAdmin } from "@/actions/auth";
import { useTranslations } from "next-intl";

export function AdminSidebar() {
  const router = useRouter();
  const t = useTranslations("adminSidebar");
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: t("dashboard"), href: "/admin/dashboard", icon: LayoutDashboard },
    { name: t("activities"), href: "/admin/activities", icon: CalendarDays },
    { name: t("schools"), href: "/admin/schools", icon: School },
    { name: t("markets"), href: "/admin/markets", icon: ShoppingCart },
    { name: t("popCrusade"), href: "/admin/pop-crusades", icon: Target },
    { name: t("oneToOne"), href: "/admin/one-on-one", icon: Users },
    { name: t("crusades"), href: "/admin/crusades", icon: ShieldCheck },
    { name: t("registrations"), href: "/admin/registrations", icon: IdCard },
    { name: t("attendance"), href: "/admin/attendance", icon: QrCode },
    { name: t("reports"), href: "/admin/reports", icon: FileBarChart },
    { name: t("settings"), href: "/admin/settings", icon: Settings },
    { name: t("users"), href: "/admin/users", icon: UserCog },
  ];

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

      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-lifac-red-600 text-white p-6 flex flex-col transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="text-2xl font-bold mb-10 text-white">Administration</div>
        <nav className="flex-1 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-lifac-red-700 transition font-medium text-sm"
              onClick={() => setIsOpen(false)}
            >
              <item.icon size={18} />
              {item.name}
            </Link>
          ))}
        </nav>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 p-2.5 text-white/90 hover:text-white hover:bg-lifac-red-700 rounded-lg transition text-sm"
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
