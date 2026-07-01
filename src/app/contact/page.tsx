import type { ReactNode } from "react";
import { Metadata } from "next";
import { useTranslations } from "next-intl";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ContactForm } from "@/components/forms/contact-form";

export default function ContactPage() {
  const t = useTranslations("contactPage");
  return (
    <div className="bg-gray-50 min-h-screen">
      <section className="bg-gradient-to-br from-lifac-blue-900 to-lifac-blue-950 text-white py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8 text-center max-w-3xl">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            {t("title")}
          </h1>
          <p className="text-lg text-blue-100">
            {t("subtitle")}
          </p>
        </div>
      </section>

      <section className="py-12 lg:py-20">
        <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Coordonnées */}
            <div className="space-y-4">
              <ContactCard
                icon={<MapPin className="h-5 w-5 text-lifac-gold-500" />}
                title={t("addressTitle")}
                content={
                  <>
                    Abomey-Calavi
                    <br />
                    {t("benin")}
                  </>
                }
              />
              <ContactCard
                icon={<Phone className="h-5 w-5 text-lifac-gold-500" />}
                title={t("phoneTitle")}
                content={
                  <a
                    href="tel:+22999000000"
                    className="hover:text-lifac-blue-900"
                  >
                    +229 99 00 00 00
                  </a>
                }
              />
              <ContactCard
                icon={<Mail className="h-5 w-5 text-lifac-gold-500" />}
                title={t("emailTitle")}
                content={
                  <a
                    href="mailto:contact@lifac.org"
                    className="hover:text-lifac-blue-900"
                  >
                    contact@lifac.org
                  </a>
                }
              />
              <ContactCard
                icon={<Clock className="h-5 w-5 text-lifac-gold-500" />}
                title={t("hoursTitle")}
                content={
                  <>
                    {t("hoursWeek")}
                    <br />
                    {t("hoursSat")}
                  </>
                }
              />
            </div>

            {/* Formulaire */}
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-6 lg:p-8">
                  <h2 className="font-display text-2xl font-bold text-lifac-blue-900 mb-6">
                    {t("sendMessage")}
                  </h2>
                  <ContactForm />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ContactCard({
  icon,
  title,
  content,
}: {
  icon: ReactNode;
  title: string;
  content: ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-5 flex items-start gap-3">
        <div className="h-10 w-10 rounded-lg bg-lifac-gold-50 flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">
            {title}
          </p>
          <p className="text-gray-800">{content}</p>
        </div>
      </CardContent>
    </Card>
  );
}
