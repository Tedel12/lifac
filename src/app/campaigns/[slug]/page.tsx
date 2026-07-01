import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { calculateProgress, formatNumber, formatDate } from "@/lib/utils";
import { formatAmountXof } from "@/lib/fedapay";
import {
  Heart,
  MapPin,
  Users,
  Calendar,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";

export const revalidate = 300;
export const dynamic = "force-dynamic";

interface CampaignPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: CampaignPageProps): Promise<Metadata> {
  const { slug } = await params;
  const campaign = await prisma.campaign.findUnique({
    where: { slug },
    select: { title: true, shortDescription: true, coverImageUrl: true },
  });
  if (!campaign) return { title: "Campagne introuvable" };
  return {
    title: campaign.title,
    description: campaign.shortDescription,
    openGraph: {
      title: campaign.title,
      description: campaign.shortDescription,
      images: campaign.coverImageUrl ? [campaign.coverImageUrl] : undefined,
    },
  };
}

export default async function CampaignDetailPage({
  params,
}: CampaignPageProps) {
  const { slug } = await params;

  const campaign = await prisma.campaign.findUnique({
    where: { slug },
    include: {
      updates: {
        orderBy: { publishedAt: "desc" },
        take: 5,
      },
      _count: {
        select: { donations: { where: { status: "APPROVED" } } },
      },
    },
  });

  if (!campaign || campaign.status === "DRAFT" || campaign.status === "ARCHIVED") {
    notFound();
  }

  const progress = calculateProgress(campaign.currentAmount, campaign.goalAmount);
  const isClosed =
    campaign.status === "CLOSED" || campaign.status === "COMPLETED";

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-lifac-blue-700 to-lifac-blue-950 text-white">
        <div className="absolute inset-0 opacity-30">
          {campaign.coverImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={campaign.coverImageUrl}
              alt={campaign.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-lifac-blue-950 to-transparent" />
        </div>

        <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-20 relative">
          <Link
            href="/campaigns"
            className="inline-flex items-center gap-2 text-blue-200 hover:text-white mb-6 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Toutes les campagnes
          </Link>

          <div className="max-w-3xl">
            <div className="flex flex-wrap gap-2 mb-4">
              {campaign.isUrgent && (
                <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full uppercase tracking-wider shadow-md inline-flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Urgent
                </span>
              )}
              <span className="px-3 py-1 bg-white/90 text-lifac-blue-900 text-xs font-bold rounded-full uppercase tracking-wider">
                {campaignTypeLabel(campaign.type)}
              </span>
            </div>

            <h1 className="font-display text-3xl md:text-5xl font-bold mb-4 leading-tight">
              {campaign.title}
            </h1>
            <p className="text-lg text-blue-100 leading-relaxed">
              {campaign.shortDescription}
            </p>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <Card>
              <CardContent className="p-6 lg:p-8">
                <h2 className="font-display text-2xl font-bold text-lifac-blue-900 mb-4">
                  Notre projet
                </h2>
                <div className="prose prose-blue max-w-none whitespace-pre-line text-gray-700 leading-relaxed">
                  {campaign.description}
                </div>
              </CardContent>
            </Card>

            {/* Mises à jour */}
            {campaign.updates.length > 0 && (
              <Card>
                <CardContent className="p-6 lg:p-8">
                  <h2 className="font-display text-2xl font-bold text-lifac-blue-900 mb-6">
                    Mises à jour
                  </h2>
                  <ol className="space-y-6">
                    {campaign.updates.map((update) => (
                      <li
                        key={update.id}
                        className="border-l-2 border-lifac-gold-400 pl-4"
                      >
                        <p className="text-xs text-gray-500 uppercase tracking-wider">
                          {formatDate(update.publishedAt)}
                        </p>
                        <h3 className="font-bold text-lifac-blue-900 mt-1 mb-2">
                          {update.title}
                        </h3>
                        <p className="text-gray-700 whitespace-pre-line">
                          {update.content}
                        </p>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar : don */}
          <aside className="space-y-6 lg:sticky lg:top-24 self-start">
            <Card>
              <CardContent className="p-6 lg:p-8 space-y-5">
                {/* Progression */}
                <div>
                  <Progress
                    value={progress}
                    variant={campaign.isUrgent ? "blue" : "gold"}
                    size="lg"
                    showLabel
                  />
                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="font-display text-2xl font-bold text-lifac-blue-900">
                      {formatAmountXof(campaign.currentAmount)}
                    </span>
                    <span className="text-sm text-gray-500">
                      sur {formatAmountXof(campaign.goalAmount)}
                    </span>
                  </div>
                </div>

                {/* Métadonnées */}
                <div className="space-y-2.5 pt-4 border-t border-gray-100">
                  {campaign.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4 text-lifac-gold-500" />
                      <span>{campaign.location}</span>
                    </div>
                  )}
                  {campaign.beneficiariesCount && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="h-4 w-4 text-lifac-gold-500" />
                      <span>
                        {formatNumber(campaign.beneficiariesCount)} bénéficiaires
                      </span>
                    </div>
                  )}
                  {campaign.endDate && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4 text-lifac-gold-500" />
                      <span>Jusqu'au {formatDate(campaign.endDate)}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Heart className="h-4 w-4 text-lifac-gold-500" />
                    <span>{campaign._count.donations} donateurs</span>
                  </div>
                </div>

                {/* CTA */}
                {!isClosed ? (
                  <Link href={`/donate?campaign=${campaign.slug}`}>
                    <Button variant="default" size="lg" className="w-full">
                      <Heart className="h-5 w-5" />
                      Soutenir cette campagne
                    </Button>
                  </Link>
                ) : (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                    <p className="font-semibold text-emerald-700">
                      Campagne {campaign.status === "COMPLETED" ? "réussie" : "clôturée"}
                    </p>
                    <p className="text-sm text-emerald-600 mt-1">
                      Merci à tous les donateurs !
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}

function campaignTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    HUMANITARIAN: "Humanitaire",
    EVANGELISM: "Évangélisation",
    EMERGENCY: "Urgence",
    CONSTRUCTION: "Construction",
    EDUCATION: "Éducation",
  };
  return labels[type] || type;
}
