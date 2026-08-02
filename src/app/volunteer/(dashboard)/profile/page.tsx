import { getMyProfile } from "@/actions/volunteer-actions";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import ProfileClient from "./profile-client";

export const dynamic = "force-dynamic";

export default async function VolunteerProfilePage() {
  const profile = await getMyProfile();

  return (
    <div className="space-y-6 animate-fade-in">
      <AdminPageHeader title="Mon profil" description="Vos informations personnelles et votre mot de passe." />
      <ProfileClient profile={profile} />
    </div>
  );
}
