import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const auth = req.cookies.get("admin-auth")?.value;
  const adminVersion = req.cookies.get("admin-version")?.value;
  const adminRole = req.cookies.get("admin-role")?.value;
  const { pathname } = req.nextUrl;

  // Allow login page and API login only
  const isLoginPath = pathname.startsWith("/login") || pathname.startsWith("/api/admin/login");

  const isAdminPath =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/v1/admin") ||
    pathname.startsWith("/v2/admin") ||
    pathname.startsWith("/v3/admin") ||
    pathname.startsWith("/v4/admin");

  const isSuperadminPath = pathname.startsWith("/superadmin");

  const requestedVersion = pathname.startsWith("/v1/")
    ? "v1"
    : pathname.startsWith("/v2/")
    ? "v2"
    : pathname.startsWith("/v3/")
    ? "v3"
    : pathname.startsWith("/v4/")
    ? "v4"
    : undefined;

  // Protect admin pages across versions
  if (!auth && isAdminPath && !isLoginPath) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Protect superadmin pages
  if (!auth && isSuperadminPath && !isLoginPath) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Enforce version-specific access: if logged in but accessing a different version's admin, redirect
  if (
    auth && adminRole !== "superadmin" && isAdminPath && adminVersion && requestedVersion && adminVersion !== requestedVersion
  ) {
    const url = req.nextUrl.clone();
    url.pathname = `/${adminVersion}/admin`;
    return NextResponse.redirect(url);
  }

  // If logged in and visiting base /admin with a stored version, send to that version's admin
  if (auth && pathname === "/admin" && adminVersion && adminRole !== "superadmin") {
    const url = req.nextUrl.clone();
    url.pathname = `/${adminVersion}/admin`;
    return NextResponse.redirect(url);
  }

  // Protect mutating admin APIs (POST/PATCH/DELETE)
  const isMutating = ["POST", "PATCH", "DELETE"].includes(req.method);
  const protectedApi = pathname.startsWith("/api/whatsapp") ||
    pathname.startsWith("/api/dice-reward") ||
    pathname.startsWith("/api/admin/whatsapp") ||
    pathname.startsWith("/api/admin/users");

  if (isMutating && protectedApi && !auth && !isLoginPath) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/v1/admin/:path*",
    "/v2/admin/:path*",
    "/v3/admin/:path*",
    "/v4/admin/:path*",
    "/api/:path*",
  ],
};
