import { getCampaigns } from "@/actions/admin-campaigns-actions";
import CampaignsPage from "./campaigns-client";

export default async function AdminCampaignsPage() {
  const campaigns = await getCampaigns();
  const serialized = campaigns.map((c) => ({
    ...c,
    goalAmount: Number(c.goalAmount),
    currentAmount: Number(c.currentAmount),
  }));
  return <CampaignsPage campaigns={serialized} />;
}
