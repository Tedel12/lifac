import { getCommunityUsers } from "@/actions/admin-users-actions";
import UsersPage from "./users-client";

export default async function AdminUsersPage() {
  const users = await getCommunityUsers();
  return <UsersPage users={users} />;
}
