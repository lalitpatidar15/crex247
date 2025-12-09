import { redirect } from "next/navigation";

export default async function SuperAdminIndexPage() {
  // Centralized login is under /admin/login; redirect superadmins to a default page
  redirect("/superadmin/users");
}
