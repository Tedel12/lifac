import { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { calculateProgress, formatNumber, cn } from "@/lib/utils";
import { formatAmountXof } from "@/lib/fedapay";
import { MapPin, Users, Heart } from "lucide-react";

export const metadata: Metadata = {
  title: "Campagnes en cours",
  description:
    "Découvrez toutes les campagnes humanitaires et missionnaires actives de LiFAC. Soutenez celles qui vous parlent.",
};

export const revalidate = 300;
export const dynamic = "force-dynamic";

async function fetchCampaigns() {
  return prisma.campaign.findMany({
    where: { status: "ACTIVE" },
    orderBy: [
      { isUrgent: "desc" },
      { isFeatured: "desc" },
      { createdAt: "desc" },
    ],
    select: {
      id: true,
      slug: true,
      title: true,
      shortDescription: true,
      type: true,
      goalAmount: true,
      currentAmount: true,
      coverImageUrl: true,
      location: true,
      beneficiariesCount: true,
      isUrgent: true,
    },
  });
}

export default async function CampaignsPage() {
  let campaigns: Awaited<ReturnType<typeof fetchCampaigns>> = [];
  try {
    campaigns = await fetchCampaigns();
  } catch (e) {
    console.error("[CampaignsPage] Erreur DB :", e);
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-lifac-blue-900 to-lifac-blue-950 text-white py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8 text-center max-w-3xl">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Campagnes en cours
          </h1>
          <p className="text-lg text-blue-100">
            Soutenez les projets qui vous tiennent à cœur. Chaque don nous
            rapproche de notre mission de transformer des vies.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-16">
        {campaigns.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600 mb-6">
              Aucune campagne active pour le moment.
            </p>
            <Link href="/donate">
              <Button variant="default">Faire un don général</Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => {
              const progress = calculateProgress(
                campaign.currentAmount,
                campaign.goalAmount
              );
              return (
                <Card
                  key={campaign.id}
                  className="overflow-hidden flex flex-col group hover:-translate-y-1 transition-transform"
                >
                  <Link href={`/campaigns/${campaign.slug}`}>
                    <div className="relative aspect-[16/10] bg-gradient-to-br from-lifac-blue-700 to-lifac-blue-900 overflow-hidden">
                      {campaign.coverImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={campaign.coverImageUrl}
                          alt={campaign.title}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <div
                          className={cn(
                            "absolute inset-0 flex items-center justify-center",
                            placeholderColor(campaign.type)
                          )}
                        >
                          <Heart className="h-16 w-16 text-white/30" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                        {campaign.isUrgent && (
                          <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full uppercase tracking-wider shadow-md">
                            Urgent
                          </span>
                        )}
                        <span className="px-3 py-1 bg-white/90 backdrop-blur text-lifac-blue-900 text-xs font-bold rounded-full uppercase tracking-wider">
                          {campaignTypeLabel(campaign.type)}
                        </span>
                      </div>
                    </div>
                  </Link>

                  <CardContent className="flex-1 flex flex-col p-6">
                    <Link href={`/campaigns/${campaign.slug}`}>
                      <h3 className="font-display text-xl font-bold text-lifac-blue-900 mb-2 group-hover:text-lifac-gold-600 transition-colors line-clamp-2">
                        {campaign.title}
                      </h3>
                    </Link>
                    <p className="text-sm text-gray-600 line-clamp-3 mb-4 flex-1">
                      {campaign.shortDescription}
                    </p>

                    <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-4">
                      {campaign.location && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {campaign.location}
                        </span>
                      )}
                      {campaign.beneficiariesCount && (
                        <span className="inline-flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {formatNumber(campaign.beneficiariesCount)} bénéficiaires
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 mb-4">
                      <Progress
                        value={progress}
                        variant={campaign.isUrgent ? "blue" : "gold"}
                        size="md"
                        showLabel
                      />
                      <div className="flex items-baseline justify-between text-sm">
                        <span className="font-bold text-lifac-blue-900">
                          {formatAmountXof(campaign.currentAmount)}
                        </span>
                        <span className="text-gray-500 text-xs">
                          sur {formatAmountXof(campaign.goalAmount)}
                        </span>
                      </div>
                    </div>

                    <Link href={`/donate?campaign=${campaign.slug}`}>
                      <Button variant="default" size="default" className="w-full">
                        Faire un don
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
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

function placeholderColor(type: string): string {
  const colors: Record<string, string> = {
    HUMANITARIAN: "bg-gradient-to-br from-emerald-500 to-teal-700",
    EVANGELISM: "bg-gradient-to-br from-lifac-blue-700 to-lifac-blue-900",
    EMERGENCY: "bg-gradient-to-br from-red-500 to-orange-700",
    CONSTRUCTION: "bg-gradient-to-br from-amber-500 to-orange-700",
    EDUCATION: "bg-gradient-to-br from-blue-500 to-indigo-700",
  };
  return colors[type] || "bg-gradient-to-br from-gray-500 to-gray-700";
}
