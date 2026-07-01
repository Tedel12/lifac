import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
  "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "LiFAC — Une génération en feu pour Jésus-Christ",
    template: "%s | LiFAC",
  },
  description:
    "LiFAC (Light For All Center) — Mouvement chrétien dédié à l'évangélisation, à la formation de leaders et à l'action humanitaire au Bénin et au-delà.",
  keywords: [
    "LiFAC",
    "Light For All Center",
    "évangélisation",
    "Bénin",
    "humanitaire",
    "Christ",
    "croisade",
    "Saint-Esprit",
    "don",
    "Abomey-Calavi",
  ],
  authors: [{ name: "LiFAC" }],
  creator: "LiFAC",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://lifac.org",
    siteName: "LiFAC",
    title: "LiFAC — Une génération en feu pour Jésus-Christ",
    description:
      "Mouvement chrétien d'évangélisation et d'action humanitaire. Rejoignez la mission.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "LiFAC - Light For All Center",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LiFAC — Light For All Center",
    description: "Évangélisation et action humanitaire au Bénin.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#070E1F",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${inter.variable} ${poppins.variable}`}>
      <body className="min-h-screen flex flex-col font-sans bg-lifac-navy-950">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
