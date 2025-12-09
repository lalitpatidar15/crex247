import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const store = await cookies();
  const role = store.get("admin-role")?.value;
  const auth = store.get("admin-auth")?.value;
  if (!auth || role !== "superadmin") {
    redirect("/login");
  }

  const nav = [
    { href: "/superadmin/users", label: "Admins" },
    { href: "/superadmin/all-rolls", label: "All Rolls" },
    { href: "/superadmin/all-whatsapp", label: "All WhatsApp" },
    { href: "/superadmin/dicerewards", label: "Dice Rewards" },
  ];

  return (
    <div style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "240px 1fr" }}>
      <aside
        style={{
          borderRight: "1px solid #e9ecef",
          background: "#f8f9fa",
          padding: 16,
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 12 }}>Super Admin</div>
        <nav style={{ display: "grid", gap: 6 }}>
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                padding: "8px 10px",
                borderRadius: 8,
                textDecoration: "none",
                color: "#212529",
                border: "1px solid #dee2e6",
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main style={{ padding: 16 }}>{children}</main>
    </div>
  );
}
