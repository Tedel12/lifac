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
    <footer className="bg-gradient-to-b from-lifac-red-700 via-lifac-red-800 to-lifac-red-900 text-white/85">
      <div className="container mx-auto px-4 lg:px-6 pt-14 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <Logo variant="white" />
            <p className="text-sm text-white/75 leading-relaxed pt-1">
              {t("tagline")}
            </p>
            <div className="flex gap-2 pt-2">
              <SocialLink href="https://facebook.com" label="Facebook">
                <Facebook className="h-4 w-4" />
              </SocialLink>
              <SocialLink href="https://instagram.com" label="Instagram">
                <Instagram className="h-4 w-4" />
              </SocialLink>
              <SocialLink href="https://youtube.com" label="YouTube">
                <Youtube className="h-4 w-4" />
              </SocialLink>
            </div>
          </div>

          {/* Liens rapides */}
          <div>
            <h3 className="text-white font-bold text-xs uppercase tracking-[0.18em] mb-5">
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
                <FooterLink href="/donate">{tc("donate")}</FooterLink>
                <FooterLink href="/contact">{tn("contact")}</FooterLink>
                <li><a href="/#newsletter" className="hover:text-white transition-colors">{tc("subscribe")}</a></li>
              </ul>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold text-xs uppercase tracking-[0.18em] mb-5">
              {t("contact")}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 shrink-0 text-white" />
                <a href="tel:+2290162950000" className="hover:text-white transition-colors">
                  +229 01 62 95 00 00
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 shrink-0 text-white" />
                <a href="tel:+2290140121250" className="hover:text-white transition-colors">
                  +229 01 40 12 12 50
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 shrink-0 text-white" />
                <a href="mailto:lifacworldcenter@gmail.com" className="hover:text-white transition-colors break-all">
                  lifacworldcenter@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <MapPin className="h-4 w-4 shrink-0 text-white mt-0.5" />
                <span className="text-white/80">{t("address")}</span>
              </li>
            </ul>
          </div>

          {/* Stay connected */}
          <div>
            <h3 className="text-white font-bold text-xs uppercase tracking-[0.18em] mb-5">
              {t("stayConnected")}
            </h3>
            <p className="text-sm text-white/75 mb-4">
              {t("joinGroupHelp")}
            </p>
            <a
              href="https://wa.me/22961000000"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block w-full"
            >
              <Button
                variant="secondary"
                size="default"
                className="w-full uppercase tracking-wider bg-white text-lifac-red-700 hover:bg-white/90"
              >
                <MessageCircle className="h-4 w-4" />
                {t("joinGroup")}
              </Button>
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-white/15 flex flex-col md:flex-row items-center justify-between gap-3 text-xs bg-lifac-red-900 -mx-4 lg:-mx-6 px-4 lg:px-6 pb-2 pt-4 rounded-b-sm">
          <p className="text-white/60">{t("rights")}</p>
          <div className="flex items-center gap-5">
            <Link href="/legal/privacy" className="text-white/60 hover:text-white transition-colors">
              {t("privacy")}
            </Link>
            <Link href="/legal/terms" className="text-white/60 hover:text-white transition-colors">
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
        className="text-sm text-white/75 hover:text-white transition-colors"
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
      className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
    >
      {children}
    </a>
  );
}
