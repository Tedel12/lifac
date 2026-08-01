import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  GraduationCap,
  Megaphone,
  HeartHandshake,
  FileText,
  Quote,
  ArrowRight,
} from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("resourcesPage");
  return { title: t("metaTitle"), description: t("metaDesc") };
}

const GALLERY_IMAGES = [
  "/activities/crusade.jpg",
  "/activities/youth-crusade.jpg",
  "/activities/pop-up-crusade.jpg",
  "/activities/market-outreach.jpg",
  "/activities/personal-evangelism.jpg",
  "/activities/night-of-hope.jpg",
  "/activities/humanitarian-action.jpg",
  "/activities/evangelism-training.jpg",
];

export default async function ResourcesPage() {
  const [media, testimonies] = await Promise.all([
    prisma.media.findMany({ orderBy: { uploadedAt: "desc" }, take: 8 }),
    prisma.testimony.findMany({
      where: { isApproved: true },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { authorName: true, authorRole: true, content: true },
    }),
  ]);
  const galleryImages = media.length > 0 ? media.map((m) => m.url) : GALLERY_IMAGES;

  return (
    <div>
      <Hero />
      <MediaGallery images={galleryImages} />
      <Testimonies testimonies={testimonies} />
      <SupportResources />
      <FinalCta />
    </div>
  );
}

async function Hero() {
  const t = await getTranslations("resourcesPage");
  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-24 text-center text-white overflow-hidden">
      <div className="absolute inset-0">
        <Image src="/activities/evangelism-training.jpg" alt="" fill priority className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/70 to-black" />
      </div>
      <div className="container mx-auto px-4 lg:px-6 relative">
        <p className="text-xs tracking-[0.3em] text-white/60 uppercase mb-4">{t("heroKicker")}</p>
        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-5 tracking-tight max-w-3xl mx-auto">
          {t("heroTitle")}
        </h1>
        <p className="text-white/80 max-w-2xl mx-auto">{t("heroSubtitle")}</p>
        <div className="mt-8 w-24 h-1 bg-lifac-red-600 mx-auto rounded-full" />
      </div>
    </section>
  );
}

async function MediaGallery({ images }: { images: string[] }) {
  const t = await getTranslations("resourcesPage");
  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="text-center mb-12">
          <div className="inline-block text-[11px] font-bold tracking-[0.25em] text-lifac-red-600 mb-3 uppercase">
            {t("galleryKicker")}
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-extrabold text-lifac-navy-900 max-w-2xl mx-auto">
            {t("galleryTitle")}
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4">
          {images.map((src, i) => (
            <div
              key={src + i}
              className="group relative aspect-square rounded-2xl overflow-hidden shadow-sm"
            >
              <Image
                src={src}
                alt=""
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

async function Testimonies({
  testimonies,
}: {
  testimonies: { authorName: string; authorRole: string | null; content: string }[];
}) {
  const t = await getTranslations("resourcesPage");
  const tt = await getTranslations("testimonies");
  const list = testimonies.length > 0 ? testimonies : [{ authorName: "Marie K.", authorRole: null, content: tt("quote") }];

  return (
    <section className="bg-[#F4F5F7] py-16 lg:py-20">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="h-8 w-1 bg-lifac-red-600 rounded-full" />
          <h2 className="font-display text-2xl lg:text-3xl font-extrabold text-lifac-navy-900">
            {t("testimoniesTitle")}
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {list.map((tst, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm flex flex-col">
              <Quote className="h-7 w-7 text-lifac-red-500/40 mb-3" />
              <p className="text-sm text-lifac-navy-700 leading-relaxed italic flex-1">« {tst.content} »</p>
              <div className="mt-5 pt-4 border-t border-gray-100">
                <p className="font-bold text-lifac-navy-900 text-sm">{tst.authorName}</p>
                {tst.authorRole && <p className="text-xs text-lifac-navy-500">{tst.authorRole}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

async function SupportResources() {
  const t = await getTranslations("resourcesPage");
  const items = [
    {
      icon: Megaphone,
      title: t("resEvangelismTitle"),
      desc: t("resEvangelismDesc"),
      href: "/activities/type/croisade-evangelisation",
    },
    {
      icon: GraduationCap,
      title: t("resTrainingTitle"),
      desc: t("resTrainingDesc"),
      href: "/activities/type/formation-evangelisation",
    },
    {
      icon: HeartHandshake,
      title: t("resHumanitarianTitle"),
      desc: t("resHumanitarianDesc"),
      href: "/activities/type/actions-humanitaires",
    },
    {
      icon: FileText,
      title: t("resOrganizeTitle"),
      desc: t("resOrganizeDesc"),
      href: "/activities/type/pop-up-crusade",
    },
    {
      icon: BookOpen,
      title: t("resBibleTitle"),
      desc: t("resBibleDesc"),
      href: "/prayer",
    },
  ];

  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="text-center mb-12">
          <div className="inline-block text-[11px] font-bold tracking-[0.25em] text-lifac-red-600 mb-3 uppercase">
            {t("resKicker")}
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-extrabold text-lifac-navy-900 max-w-2xl mx-auto">
            {t("resTitle")}
          </h2>
          <p className="text-lifac-navy-600 max-w-2xl mx-auto mt-3">{t("resSubtitle")}</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="group flex flex-col bg-[#F4F5F7] rounded-2xl p-6 border border-transparent hover:border-lifac-red-600/30 hover:shadow-md transition-all duration-300"
            >
              <div className="h-12 w-12 rounded-full bg-lifac-red-600 flex items-center justify-center mb-4 shadow-md shadow-lifac-red-600/30">
                <item.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-display font-bold text-lifac-navy-900 mb-2">{item.title}</h3>
              <p className="text-lifac-navy-600 text-sm leading-relaxed mb-4 flex-1">{item.desc}</p>
              <span className="inline-flex items-center gap-1.5 text-lifac-red-600 text-sm font-bold uppercase tracking-wide">
                {t("resLearnMore")}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

async function FinalCta() {
  const t = await getTranslations("resourcesPage");
  return (
    <section className="bg-white py-20 text-center border-t border-gray-100">
      <div className="container mx-auto px-4 lg:px-6 max-w-2xl">
        <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-5 text-lifac-navy-900">
          {t("ctaTitle")}
        </h2>
        <p className="text-lifac-navy-600 mb-8">{t("ctaDesc")}</p>
        <Link href="/contact">
          <Button variant="default" size="xl" className="uppercase tracking-wider">
            {t("ctaButton")}
          </Button>
        </Link>
      </div>
    </section>
  );
}
