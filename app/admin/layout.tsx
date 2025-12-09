import AdminLayout from "./Adminsidebar";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Guard all admin pages under /admin; centralized login lives at /login
export default async function Layout({ children }: { children: React.ReactNode }) {
  const store = await cookies();
  const role = store.get("admin-role")?.value;
  const auth = store.get("admin-auth")?.value;
  if (!auth || !role || (role !== "admin" && role !== "superadmin")) {
    redirect("/login");
  }
  return <AdminLayout version="base">{children}</AdminLayout>;
}
