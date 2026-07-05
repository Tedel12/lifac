import { getSchools } from "@/actions/school-actions";
import SchoolsPage from "./schools-client";

export default async function AdminSchoolsPage() {
  const schools = await getSchools();
  return <SchoolsPage schools={schools} />;
}
