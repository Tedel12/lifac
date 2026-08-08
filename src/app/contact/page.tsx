import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ContactForm } from "@/components/forms/contact-form";

export default function ContactPage() {
  const t = useTranslations("contactPage");
  return (
    <div className="bg-white min-h-screen">
      <section className="bg-white py-16 lg:py-24 border-b border-gray-100">
        <div className="container mx-auto px-4 lg:px-8 text-center max-w-3xl">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 text-lifac-navy-900">
            {t("title")}
          </h1>
          <p className="text-lg text-lifac-navy-600">
            {t("subtitle")}
          </p>
        </div>
      </section>

      <section className="py-12 lg:py-20 bg-[#F4F5F7]">
        <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Coordonnées */}
            <div className="space-y-4">
              <ContactCard
                icon={<MapPin className="h-5 w-5 text-white" />}
                title={t("addressTitle")}
                content={
                  <>
                    Zopah, Abomey-Calavi
                    <br />
                    {t("benin")}
                  </>
                }
              />
              <ContactCard
                icon={<Phone className="h-5 w-5 text-white" />}
                title={t("phoneTitle")}
                content={
                  <a href="tel:+2290140131359" className="hover:text-lifac-red-600 transition-colors">
                    +229 01 40 13 13 59
                  </a>
                }
              />
              <ContactCard
                icon={<Mail className="h-5 w-5 text-white" />}
                title={t("emailTitle")}
                content={
                  <a href="mailto:info@lifac.org" className="hover:text-lifac-red-600 transition-colors break-all">
                    info@lifac.org
                  </a>
                }
              />
              <ContactCard
                icon={<Clock className="h-5 w-5 text-white" />}
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
              <Card className="border-none shadow-sm">
                <CardContent className="p-6 lg:p-8">
                  <h2 className="font-display text-2xl font-bold text-lifac-navy-900 mb-6">
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
    <Card className="border-none shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
      <CardContent className="p-5 flex items-start gap-3">
        <div className="h-10 w-10 rounded-lg bg-lifac-red-600 shadow-md shadow-lifac-red-600/30 flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">
            {title}
          </p>
          <p className="text-lifac-navy-800">{content}</p>
        </div>
      </CardContent>
    </Card>
  );
}
