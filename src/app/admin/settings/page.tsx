import { getCurrentAdminProfile } from "@/actions/admin-management-actions";
import SettingsPage from "./settings-client";

export default async function AdminSettingsPage() {
  const profile = await getCurrentAdminProfile();
  return <SettingsPage profile={profile} />;
}
