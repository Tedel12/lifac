import { prisma } from "@/lib/prisma";
import { getPublicStats } from "@/lib/public-stats";
import { Hero } from "@/components/sections/hero";
import { StatsBar } from "@/components/sections/stats-bar";
import { AboutSection } from "@/components/sections/about-section";
import { ActivitiesSection } from "@/components/sections/activities-section";
import { EventsTestimoniesSection } from "@/components/sections/events-testimonies-section";
import { CtaSection } from "@/components/sections/cta-section";

export const revalidate = 300;
export const dynamic = "force-dynamic";

async function getLandingData() {
  try {
    const [stats, testimonies, upcomingEvents] = await Promise.all([
      getPublicStats(),
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

    return { stats, testimonies, upcomingEvents };
  } catch (e) {
    console.error("[HomePage] Erreur de récupération des données :", e);
    return { stats: await getPublicStats(), testimonies: [], upcomingEvents: [] };
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
