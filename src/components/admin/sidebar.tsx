import Link from "next/link";
import { LayoutDashboard, School, ShoppingCart, Target, Users, ShieldCheck, FileBarChart, Settings, UserCog, LogOut } from "lucide-react";

const menuItems = [
  { name: "Tableau de bord", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Écoles", href: "/admin/schools", icon: School },
  { name: "Marchés", href: "/admin/markets", icon: ShoppingCart },
  { name: "Pop-croisade", href: "/admin/pop-crusades", icon: Target },
  { name: "One-to-one", href: "/admin/one-on-one", icon: Users },
  { name: "Croisades", href: "/admin/crusades", icon: ShieldCheck },
  { name: "Rapports", href: "/admin/reports", icon: FileBarChart },
  { name: "Paramètres", href: "/admin/settings", icon: Settings },
  { name: "Utilisateurs", href: "/admin/users", icon: UserCog },
];

export function AdminSidebar() {
  return (
    <aside className="w-64 bg-lifac-navy-950 text-white min-h-screen p-6 flex flex-col">
      <div className="text-2xl font-bold mb-10 text-lifac-red-500">LiFAC Admin</div>
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-lifac-navy-900 transition"
          >
            <item.icon size={20} />
            {item.name}
          </Link>
        ))}
      </nav>
      <button className="flex items-center gap-3 p-3 text-red-400 hover:text-red-300">
        <LogOut size={20} />
        Déconnexion
      </button>
    </aside>
  );
}
