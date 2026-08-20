"use client";

import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  School,
  Target,
  ShoppingCart,
  MessageCircle,
  Flame,
  ShieldCheck,
  FileBarChart,
  Settings,
  UserCog,
  LogOut,
  Menu,
  X,
  IdCard,
  QrCode,
  CalendarDays,
  PartyPopper,
  HeartHandshake,
  Users2,
  Banknote,
  Image as ImageIcon,
  ClipboardList,
  Quote,
} from "lucide-react";
import { logoutAdmin } from "@/actions/auth";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export function AdminSidebar({ adminName }: { adminName?: string | null }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("adminSidebar");
  const [isOpen, setIsOpen] = useState(false);

  const sections = [
    {
      label: t("sectionOverview"),
      items: [{ name: t("dashboard"), href: "/admin/dashboard", icon: LayoutDashboard }],
    },
    {
      label: t("sectionContent"),
      items: [
        { name: t("activities"), href: "/admin/activities", icon: CalendarDays },
        { name: t("crusades"), href: "/admin/activities?type=CRUSADE", icon: Flame, indent: true },
        { name: t("markets"), href: "/admin/activities?type=MARKET_OUTREACH", icon: ShoppingCart, indent: true },
        { name: t("popCrusade"), href: "/admin/activities?type=POP_UP_CRUSADE", icon: Target, indent: true },
        { name: t("oneToOne"), href: "/admin/activities?type=ONE_ON_ONE", icon: MessageCircle, indent: true },
        { name: t("events"), href: "/admin/events", icon: PartyPopper },
        { name: t("campaigns"), href: "/admin/campaigns", icon: Banknote },
        { name: t("donations"), href: "/admin/donations", icon: HeartHandshake },
        { name: t("media"), href: "/admin/media", icon: ImageIcon },
        { name: t("testimonials"), href: "/admin/testimonials", icon: Quote },
        { name: t("prayer"), href: "/admin/prayer", icon: Flame },
      ],
    },
    {
      label: t("sectionTeam"),
      items: [
        { name: t("missionaries"), href: "/admin/agents", icon: UserCog },
        { name: t("admins"), href: "/admin/admins", icon: ShieldCheck },
        { name: t("users"), href: "/admin/users", icon: Users2 },
      ],
    },
    {
      label: t("sectionField"),
      items: [
        { name: t("schools"), href: "/admin/schools", icon: School },
        { name: t("registrations"), href: "/admin/registrations", icon: IdCard },
        { name: t("attendance"), href: "/admin/attendance", icon: QrCode },
      ],
    },
    {
      label: t("sectionSystem"),
      items: [
        { name: t("reports"), href: "/admin/reports", icon: FileBarChart },
        { name: t("auditLog"), href: "/admin/audit-log", icon: ClipboardList },
        { name: t("settings"), href: "/admin/settings", icon: Settings },
      ],
    },
  ];

  const isActive = (href: string) => {
    const [path, query] = href.split("?");
    if (query) {
      const params = new URLSearchParams(query);
      return pathname === path && [...params.entries()].every(([k, v]) => searchParams.get(k) === v);
    }
    return (pathname === path || pathname.startsWith(path + "/")) && !searchParams.get("type");
  };

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
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white text-lifac-navy-900 border-r border-gray-100 p-5 flex flex-col transform transition-transform duration-300 overflow-y-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="mb-8 px-1">
          <div className="text-2xl font-bold text-lifac-red-600">Administration</div>
          {adminName && (
            <p className="text-lifac-navy-400 text-xs mt-1">
              {t("connectedAs")} {adminName}
            </p>
          )}
        </div>
        <nav className="flex-1 space-y-5">
          {sections.map((section) => (
            <div key={section.label}>
              <p className="px-2.5 mb-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-lifac-navy-400">
                {section.label}
              </p>
              <div className="space-y-1">
                {section.items.map((item: any) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg transition font-medium text-sm text-lifac-red-600",
                        item.indent ? "pl-6 py-1.5 text-xs" : "p-2.5",
                        active ? "bg-lifac-red-600 text-white shadow-sm" : "hover:bg-lifac-red-600/10"
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      <item.icon size={item.indent ? 14 : 18} />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
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
