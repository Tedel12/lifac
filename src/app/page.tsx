import { prisma } from "@/lib/prisma";
import { Hero } from "@/components/sections/hero";
import { StatsBar } from "@/components/sections/stats-bar";
import { AboutSection } from "@/components/sections/about-section";
import { ActivitiesSection } from "@/components/sections/activities-section";
import { EventsTestimoniesSection } from "@/components/sections/events-testimonies-section";
import { CtaSection } from "@/components/sections/cta-section";

export const revalidate = 300;
export const dynamic = "force-dynamic";

const FALLBACK_STATS = {
  totalSoulsWon: 32500,
  schoolsVisited: 785,
  marketOutreach: 350,
  totalCrusades: 45,
};

async function getLandingData() {
  try {
    const [stats, testimonies, upcomingEvents] = await Promise.all([
      prisma.globalStats.findFirst({ orderBy: { updatedAt: "desc" } }),
      prisma.testimony.findMany({
        where: { isApproved: true, isFeatured: true },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          authorName: true,
          authorRole: true,
          authorAvatar: true,
          content: true,
        },
      }),
      prisma.event.findMany({
        where: { status: "UPCOMING", requiresRegistration: true },
        orderBy: { startDate: "asc" },
        take: 10,
        select: {
          id: true,
          title: true,
          type: true,
          location: true,
          city: true,
          startDate: true,
          endDate: true,
        },
      }),
    ]);

    return {
      stats: stats
        ? {
          totalSoulsWon: stats.totalSoulsWon,
          schoolsVisited: stats.schoolsVisited,
          marketOutreach: stats.marketOutreach,
          totalCrusades: stats.totalCrusades,
        }
        : FALLBACK_STATS,
      testimonies,
      upcomingEvents,
    };
  } catch (e) {
    console.error("[HomePage] Erreur de récupération des données :", e);
    return { stats: FALLBACK_STATS, testimonies: [], upcomingEvents: [] };
  }
}

export default async function HomePage() {
  const { stats, testimonies, upcomingEvents } = await getLandingData();

  return (
    <>
      <Hero events={upcomingEvents} />
      <StatsBar stats={stats} />
      <AboutSection />
      <ActivitiesSection />
      <EventsTestimoniesSection testimonies={testimonies} />
      <CtaSection />
    </>
  );
}
