import Link from "next/link";
import { ArrowRight, Users, MapPin, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { calculateProgress, formatNumber } from "@/lib/utils";
import { formatAmountXof } from "@/lib/fedapay";
import { cn } from "@/lib/utils";

interface Campaign {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  type: string;
  goalAmount: bigint;
  currentAmount: bigint;
  coverImageUrl: string | null;
  location: string | null;
  beneficiariesCount: number | null;
  isUrgent: boolean;
}

interface CampaignsSectionProps {
  campaigns: Campaign[];
}

export function CampaignsSection({ campaigns }: CampaignsSectionProps) {
  if (campaigns.length === 0) return null;

  return (
    <section className="py-20 lg:py-24 bg-gray-50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-12">
          <div>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-lifac-blue-900 mb-3">
              Campagnes en cours
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl">
              Soutenez nos projets humanitaires et missionnaires actifs.
              Chaque don compte.
            </p>
          </div>
          <Link href="/campaigns">
            <Button variant="outline" size="lg">
              Voir toutes les campagnes
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

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
                {/* Image / illustration */}
                <Link href={`/campaigns/${campaign.slug}`} className="block">
                  <div className="relative aspect-[16/10] bg-gradient-to-br from-lifac-blue-700 to-lifac-blue-900 overflow-hidden">
                    {campaign.coverImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={campaign.coverImageUrl}
                        alt={campaign.title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <CampaignPlaceholder type={campaign.type} />
                    )}

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                      {campaign.isUrgent && (
                        <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full uppercase tracking-wider shadow-md animate-pulse">
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

                  {/* Métadonnées */}
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

                  {/* Progression */}
                  <div className="space-y-2 mb-4">
                    <Progress
                      value={progress}
                      variant={campaign.isUrgent ? "blue" : "gold"}
                      size="md"
                    />
                    <div className="flex items-baseline justify-between text-sm">
                      <span className="font-bold text-lifac-blue-900">
                        {formatAmountXof(campaign.currentAmount)}
                      </span>
                      <span className="text-gray-500">
                        sur {formatAmountXof(campaign.goalAmount)}
                      </span>
                    </div>
                  </div>

                  <Link href={`/donate?campaign=${campaign.slug}`}>
                    <Button
                      variant="default"
                      size="default"
                      className="w-full"
                    >
                      Faire un don
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
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

function CampaignPlaceholder({ type }: { type: string }) {
  const colors: Record<string, string> = {
    HUMANITARIAN: "from-emerald-500 to-teal-700",
    EVANGELISM: "from-lifac-blue-700 to-lifac-blue-900",
    EMERGENCY: "from-red-500 to-orange-700",
    CONSTRUCTION: "from-amber-500 to-orange-700",
    EDUCATION: "from-blue-500 to-indigo-700",
  };
  return (
    <div
      className={cn(
        "absolute inset-0 bg-gradient-to-br flex items-center justify-center",
        colors[type] || "from-gray-500 to-gray-700"
      )}
    >
      <svg
        className="h-20 w-20 text-white/30"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    </div>
  );
}
