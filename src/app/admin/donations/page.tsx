import { getDonations, getDonationStats } from "@/actions/admin-donations-actions";
import DonationsPage from "./donations-client";

export default async function AdminDonationsPage() {
  const [donations, stats] = await Promise.all([getDonations(), getDonationStats()]);

  const serialized = donations.map((d) => ({
    ...d,
    amount: Number(d.amount),
  }));

  return (
    <DonationsPage
      donations={serialized}
      stats={{
        totalApproved: Number(stats.totalApproved),
        pendingCount: stats.pendingCount,
        totalCount: stats.totalCount,
      }}
    />
  );
}
