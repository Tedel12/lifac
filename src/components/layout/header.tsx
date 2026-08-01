"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Logo } from "./logo";
import { LanguageSwitcher } from "./language-switcher";
import { cn } from "@/lib/utils";
import { isUserAuthenticated, logoutAdmin } from "@/actions/auth";

export function Header() {
  const t = useTranslations("nav");
  const tc = useTranslations("common");
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [auth, setAuth] = useState<{ isAuthenticated: boolean; role: string | null }>({ isAuthenticated: false, role: null });

  useEffect(() => {
    const checkAuth = async () => {
      const res = await isUserAuthenticated();
      setAuth(res);
    };
    checkAuth();
  }, [pathname]);

  const dashboardUrl = auth.role === "ADMIN" ? "/admin/dashboard" : "/volunteer/dashboard";


  const isHome = pathname === "/";
  const solid = scrolled || !isHome;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Ferme le menu mobile à chaque changement de page
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const navItems = [
    { label: t("home"), href: "/" },
    { label: t("about"), href: "/about" },
    { label: t("activities"), href: "/activities" },
    { label: t("events"), href: "/events" },
    { label: t("testimonies"), href: "/#testimonies" },
    { label: t("resources"), href: "/resources" },
    { label: t("contact"), href: "/contact" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href.startsWith("/#")) return false;
    return pathname.startsWith(href);
  };

  return (
    <header
      className={cn(
        "left-0 right-0 z-50 w-full transition-all duration-300",
        // Sur la home : transparent sur le hero, fixed+flou quand on scroll.
        // Sur les autres pages (thème clair partout) : barre blanche pleine en permanence.
        isHome
          ? scrolled
            ? "fixed top-0 bg-transparent backdrop-blur-md shadow-lg border-b border-white/5 animate-fade-in"
            : "absolute top-0"
          : "sticky top-0 bg-white shadow-sm border-b border-gray-100"
      )}
    >
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link href="/" className="flex-shrink-0">
            <Logo variant={isHome ? "white" : "default"} />
          </Link>

          {/* Navigation desktop */}
          <nav className="hidden xl:flex items-center gap-4 ml-10">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "text-[11px] font-bold tracking-[0.12em] uppercase transition-colors relative py-1",
                    active
                      ? "text-lifac-red-500"
                      : isHome
                        ? "text-white/85 hover:text-white"
                        : "text-lifac-navy-700 hover:text-lifac-red-600"
                  )}
                >
                  {item.label}
                  {active && (
                    <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-lifac-red-500" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <LanguageSwitcher />
            {auth.isAuthenticated ? (
              <Link href={dashboardUrl}>
                <Button variant="outline" size="sm" className="rounded-full">
                  DASHBOARD
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button variant="outline" size="sm" className="rounded-full">
                  SE CONNECTER
                </Button>
              </Link>
            )}
            <Link href="/donate">
              <Button variant="default" size="sm" className="rounded-full">
                {tc("donate").toUpperCase()}
              </Button>
            </Link>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={cn(
              "lg:hidden p-2 rounded-lg transition-colors",
              isHome ? "text-white hover:bg-white/10" : "text-lifac-navy-900 hover:bg-gray-100"
            )}
            aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileOpen && (
          <nav
            className={cn(
              "lg:hidden pb-6 pt-2 animate-fade-in",
              isHome ? "border-t border-white/10 bg-lifac-navy-950" : "border-t border-gray-100 bg-white"
            )}
          >
            <ul className="flex flex-col gap-1 pt-3">
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "block px-4 py-3 rounded-lg font-semibold text-sm transition-colors uppercase tracking-wider",
                        active
                          ? "text-lifac-red-500 bg-lifac-red-600/5"
                          : isHome
                            ? "text-white/85 hover:bg-white/5"
                            : "text-lifac-navy-700 hover:bg-gray-50"
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
              <li
                className={cn(
                  "pt-3 mt-3 flex flex-col gap-2 px-4",
                  isHome ? "border-t border-white/10" : "border-t border-gray-100"
                )}
              >
                <LanguageSwitcher className="self-start mb-2" />
                {auth.isAuthenticated ? (
                  <Link href={dashboardUrl} onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" size="default" className="w-full">
                      DASHBOARD
                    </Button>
                  </Link>
                ) : (
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" size="default" className="w-full">
                      {tc("register").toUpperCase()}
                    </Button>
                  </Link>
                )}
                <Link href="/donate" onClick={() => setMobileOpen(false)}>
                  <Button variant="default" size="default" className="w-full">
                    {tc("donate").toUpperCase()}
                  </Button>
                </Link>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
}
