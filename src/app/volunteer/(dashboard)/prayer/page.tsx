import { getPrayerWall } from "@/actions/volunteer-actions";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { PRAYER_CATEGORY_LABELS } from "@/lib/utils";
import { PrayerWallList } from "./prayer-wall-list";

export const dynamic = "force-dynamic";

export default async function VolunteerPrayerPage() {
  const requests = await getPrayerWall();

  const serialized = requests.map((r) => ({
    id: r.id,
    title: r.title,
    content: r.content,
    authorName: r.authorName,
    category: r.category,
    categoryLabel: PRAYER_CATEGORY_LABELS[r.category] ?? r.category,
    prayerCount: r.prayerCount,
    intercessions: r.intercessions.map((i) => i.intercessorName),
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <AdminPageHeader
        title="Mur de prière"
        description="Demandes de prière partagées par la communauté LiFAC — intercédez avec nous."
      />
      <PrayerWallList requests={serialized} />
    </div>
  );
}
