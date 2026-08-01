import type { ReactNode } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import { Logo } from "./logo";
import { Button } from "@/components/ui/button";

export function Footer() {
  const t = useTranslations("footer");
  const tn = useTranslations("nav");
  const tc = useTranslations("common");

  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="container mx-auto px-4 lg:px-6 pt-14 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <Logo variant="default" />
            <p className="text-sm text-lifac-navy-600 leading-relaxed pt-1">
              {t("tagline")}
            </p>
            <div className="flex gap-2 pt-2">
              <SocialLink href="https://www.facebook.com/profile.php?id=61571025699263" label="Facebook">
                <Facebook className="h-4 w-4" />
              </SocialLink>
              <SocialLink href="https://www.instagram.com/lightforallcenter" label="Instagram">
                <Instagram className="h-4 w-4" />
              </SocialLink>
              <SocialLink href="https://www.youtube.com" label="YouTube">
                <Youtube className="h-4 w-4" />
              </SocialLink>
            </div>
          </div>

          {/* Liens rapides */}
          <div>
            <h3 className="text-lifac-navy-900 font-bold text-xs uppercase tracking-[0.18em] mb-5">
              {t("quickLinks")}
            </h3>
            <div className="grid grid-cols-2 gap-x-2">
              <ul className="space-y-2.5">
                <FooterLink href="/">{tn("home")}</FooterLink>
                <FooterLink href="/about">{tn("about")}</FooterLink>
                <FooterLink href="/activities">{tn("activities")}</FooterLink>
                <FooterLink href="/events">{tn("events")}</FooterLink>
              </ul>
              <ul className="space-y-2.5">
                <FooterLink href="/#testimonies">{tn("testimonies")}</FooterLink>
                <FooterLink href="/resources">{tn("resources")}</FooterLink>
                <FooterLink href="/donate">{tc("donate")}</FooterLink>
                <FooterLink href="/contact">{tn("contact")}</FooterLink>
              </ul>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lifac-navy-900 font-bold text-xs uppercase tracking-[0.18em] mb-5">
              {t("contact")}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 shrink-0 text-lifac-red-600" />
                <a href="tel:+2290140131359" className="text-lifac-navy-600 hover:text-lifac-red-600 transition-colors">
                  01 40 13 13 59
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 shrink-0 text-lifac-red-600" />
                <a href="tel:+2290162930001" className="text-lifac-navy-600 hover:text-lifac-red-600 transition-colors">
                  01 62 93 00 01
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 shrink-0 text-lifac-red-600" />
                <a href="mailto:info@lifac.org" className="text-lifac-navy-600 hover:text-lifac-red-600 transition-colors break-all">
                  info@lifac.org
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <MapPin className="h-4 w-4 shrink-0 text-lifac-red-600 mt-0.5" />
                <span className="text-lifac-navy-600">{t("address")}</span>
              </li>
            </ul>
          </div>

          {/* Stay connected */}
          <div>
            <h3 className="text-lifac-navy-900 font-bold text-xs uppercase tracking-[0.18em] mb-5">
              {t("stayConnected")}
            </h3>
            <p className="text-sm text-lifac-navy-600 mb-4">
              {t("joinGroupHelp")}
            </p>
            <a
              href="https://wa.me/22961000000"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block w-full"
            >
              <Button variant="default" size="default" className="w-full uppercase tracking-wider">
                <MessageCircle className="h-4 w-4" />
                {t("joinGroup")}
              </Button>
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-4 pb-2 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <p className="text-lifac-navy-400">{t("rights")}</p>
          <div className="flex items-center gap-5">
            <Link href="/legal/privacy" className="text-lifac-navy-400 hover:text-lifac-red-600 transition-colors">
              {t("privacy")}
            </Link>
            <Link href="/legal/terms" className="text-lifac-navy-400 hover:text-lifac-red-600 transition-colors">
              {t("terms")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="text-sm text-lifac-navy-600 hover:text-lifac-red-600 transition-colors"
      >
        {children}
      </Link>
    </li>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="h-8 w-8 rounded-full bg-lifac-red-600/10 hover:bg-lifac-red-600 flex items-center justify-center text-lifac-red-600 hover:text-white transition-colors"
    >
      {children}
    </a>
  );
}
